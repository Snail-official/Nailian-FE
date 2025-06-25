import UIKit
import Vision

/// Vision API를 사용하여 손 포즈(관절) 감지 기능을 제공하는 클래스
@objcMembers class HandPoseDetector: NSObject, HandPoseDetecting {
    /// 싱글톤 인스턴스
    static let shared = HandPoseDetector()
    
    /// 마지막 처리 시간 (밀리초)
    private(set) var lastProcessingTime: Double = 0
    
    private override init() {
        super.init()
    }
    
    // MARK: - HandPoseDetecting 프로토콜 구현
    
    /// 이미지에서 손 포즈(관절)를 감지합니다.
    ///
    /// - Parameters:
    ///   - image: 분석할 원본 이미지
    ///   - completion: 감지된 손 포즈 관측 결과와 에러를 전달하는 콜백
    func detectHandPose(on image: UIImage, completion: @escaping ([VNHumanHandPoseObservation]?, Error?) -> Void) {
        print("[HandPoseDetector] 손 포즈 감지 시작.")
        
        // 모델 입력용으로 필요한 경우 이미지 리사이즈
        let resizedImage = ImageResizer.shared.resizeImageForModel(image, preserveAspectRatio: true)
        print("[HandPoseDetector] 이미지 리사이즈 완료.")
        
        guard let cgImage = resizedImage.cgImage else {
            print("[HandPoseDetector] 에러: CGImage 변환 실패")
            completion(nil, NSError(domain: "HandPoseDetector", code: -2, userInfo: [NSLocalizedDescriptionKey: "CGImage 변환 실패"]))
            return
        }
        print("[HandPoseDetector] CGImage 변환 완료.")
        
        // Vision 내장 손 포즈 감지 요청 생성
        let handPoseRequest = VNDetectHumanHandPoseRequest()
        handPoseRequest.maximumHandCount = 2  // 최대 2개 손 감지
        
        // 추론 시작 시각 기록
        let startTime = CFAbsoluteTimeGetCurrent()
        
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([handPoseRequest])
            
            // 추론 종료 시각 기록 및 소요 시간 계산 (밀리초 단위)
            self.lastProcessingTime = (CFAbsoluteTimeGetCurrent() - startTime) * 1000
            print("[HandPoseDetector] 추론 시간: \(self.lastProcessingTime) ms")
            
            print("[HandPoseDetector] 손 포즈 감지 성공.")
            let observations = handPoseRequest.results as? [VNHumanHandPoseObservation] ?? []
            print("[HandPoseDetector] 감지된 손 개수: \(observations.count)")
            
            if observations.isEmpty {
                print("[HandPoseDetector] 감지된 손이 없습니다.")
                completion([], nil)
                return
            }
            
            // 최대 2개 손으로 제한
            let limitedObservations = Array(observations.prefix(2))
            print("[HandPoseDetector] 처리할 손 개수: \(limitedObservations.count)")
            completion(limitedObservations, nil)
        } catch {
            print("[HandPoseDetector] 손 포즈 감지 에러: \(error)")
            completion(nil, error)
        }
    }
} 
