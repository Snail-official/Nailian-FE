import UIKit
import Vision

@objcMembers
class NailProcessor: NSObject, NailProcessing {
    static let shared = NailProcessor()
    
    private let handPoseDetector: HandPoseDetecting
    private let imageSegmenter: ImageSegmenting
    
    // 추가: 컨투어 및 손톱 메트릭스 분석 객체 (필요시 싱글톤 또는 인스턴스 생성)
    private let contourAnalyzer: ContourAnalyzing = ContourAnalyzer()
    private let nailMetricsAnalyzer: NailMetricsAnalyzing = NailMetricsAnalyzer()
    private let nailAssetProvider = NailAssetProvider.shared
    
    private(set) var lastProcessingTime: Double = 0
    
    private override init() {
        self.handPoseDetector = HandPoseDetector.shared
        self.imageSegmenter = ImageSegmenter.shared
        super.init()
    }
    
    // MARK: - NailProcessing 프로토콜 구현
    
    /// 원본 이미지에 네일 오버레이를 적용하는 최종 작업을 수행합니다.
    func processNailOverlay(for image: UIImage, completion: @escaping (UIImage?, Error?) -> Void) {
        let startTime = CACurrentMediaTime()
        
        // processImage 내부에서 세그멘테이션, 손 포즈 감지, 컨투어 추출 및 메트릭스 분석을 모두 진행
        processImage(image) { [weak self] segmentedImage, observations, error in
            guard let self = self else { return }
            if let error = error {
                print("[NailProcessor] 처리 에러: \(error)")
                completion(nil, error)
                return
            }
            guard let segmentedImage = segmentedImage,
                  let handObservations = observations, !handObservations.isEmpty else {
                let error = NSError(domain: "NailProcessor", code: -1, userInfo: [NSLocalizedDescriptionKey: "세그멘테이션 또는 손 포즈 감지 결과가 없습니다"])
                completion(nil, error)
                return
            }
            
            // 세그멘테이션 이미지를 원본 이미지 크기에 맞게 리사이즈
            print("[NailProcessor] 원본 이미지 크기: \(image.size), 세그멘테이션 이미지 크기: \(segmentedImage.size)")
            
            // UIGraphicsImageRenderer 사용
            let renderer = UIGraphicsImageRenderer(size: image.size)
            let resizedSegmentedImage = renderer.image { _ in
                segmentedImage.draw(in: CGRect(origin: .zero, size: image.size))
            }
            
            print("[NailProcessor] 리사이즈된 세그멘테이션 이미지 크기: \(resizedSegmentedImage.size)")
            
            // 컨투어 추출 (세그멘테이션 이미지가 필요)
            let contours = self.contourAnalyzer.extractContours(from: resizedSegmentedImage)
            if contours.isEmpty {
                let error = NSError(domain: "NailProcessor", code: -2, userInfo: [NSLocalizedDescriptionKey: "유효한 컨투어가 없습니다"])
                completion(nil, error)
                return
            }
            
            // 네일 이미지 생성 - 원본 이미지를 베이스로 사용
            let finalImage = self.composeFinalImage(
                originalImage: image,
                segmentedImage: resizedSegmentedImage,
                handObservations: handObservations,
                contours: contours
            )
            
            self.lastProcessingTime = (CACurrentMediaTime() - startTime) * 1000
            print("[NailProcessor] 총 처리 시간: \(self.lastProcessingTime) ms")
            completion(finalImage, nil)
        }
    }
    
    /// 이미지에서 세그멘테이션과 손 포즈 감지를 동시에 수행하고 결과를 반환합니다.
    func processImage(_ image: UIImage, completion: @escaping (UIImage?, [VNHumanHandPoseObservation]?, Error?) -> Void) {
        print("[NailProcessor] 이미지 프로세싱 시작")
        
        var isCompleted = false
        
        var segmentationResult: UIImage?
        var segmentationError: Error?
        let segmentationGroup = DispatchGroup()
        
        segmentationGroup.enter()
        imageSegmenter.processImage(image) { result, error in
            segmentationResult = result
            segmentationError = error
            segmentationGroup.leave()
        }
        
        var handPoseObservations: [VNHumanHandPoseObservation]?
        var handPoseError: Error?
        let handPoseGroup = DispatchGroup()
        
        handPoseGroup.enter()
        handPoseDetector.detectHandPose(on: image) { observations, error in
            handPoseObservations = observations
            handPoseError = error
            handPoseGroup.leave()
        }
        
        let processingQueue = DispatchQueue.global(qos: .userInitiated)
        
        let timeoutTimer = DispatchSource.makeTimerSource(queue: processingQueue)
        timeoutTimer.setEventHandler {
            if !isCompleted {
                isCompleted = true
                print("[NailProcessor] 처리 타임아웃")
                completion(nil, nil, NSError(domain: "NailProcessor", code: -3, userInfo: [NSLocalizedDescriptionKey: "처리 시간이 초과되었습니다"]))
            }
            timeoutTimer.cancel()
        }
        timeoutTimer.schedule(deadline: .now() + 10.0)
        timeoutTimer.resume()
        
        processingQueue.async {
            segmentationGroup.wait()
            handPoseGroup.wait()
            timeoutTimer.cancel()
            if isCompleted { return }
            isCompleted = true
            
            if let error = segmentationError {
                print("[NailProcessor] 세그멘테이션 에러: \(error)")
                completion(nil, nil, error)
                return
            }
            if let error = handPoseError {
                print("[NailProcessor] 손 포즈 감지 에러: \(error)")
                completion(nil, nil, error)
                return
            }
            print("[NailProcessor] 세그멘테이션 및 손 포즈 감지 완료")
            completion(segmentationResult, handPoseObservations, nil)
        }
    }
    
    /// 세그멘테이션, 손 포즈 감지, 컨투어와 메트릭스 분석 결과를 통합하여 최종 오버레이 이미지를 생성합니다.
    private func composeFinalImage(
        originalImage: UIImage,
        segmentedImage: UIImage,
        handObservations: [VNHumanHandPoseObservation],
        contours: [(path: UIBezierPath, center: CGPoint)]
    ) -> UIImage? {
        // 1. 먼저 네일 오버레이 이미지 생성 (세그멘테이션 + 손 포즈 + 컨투어 활용)
        let nailImages = prepareNailImages(
            handObservations: handObservations,
            contours: contours,
            displaySize: originalImage.size
        )
        
        // 2. 최종 이미지 렌더링 (원본 이미지 위에 네일 오버레이)
        let renderer = UIGraphicsImageRenderer(size: originalImage.size)
        let finalImage = renderer.image { context in
            // 원본 이미지 그리기
            originalImage.draw(in: CGRect(origin: .zero, size: originalImage.size))
            
            // 각 손가락에 대해 준비된 네일 이미지 그리기
            for nailImage in nailImages {
                nailImage.image?.draw(in: nailImage.rect)
            }
        }
        
        return finalImage
    }
    
    /// 네일 이미지를 준비하고 위치와 함께 반환합니다.
    private func prepareNailImages(
        handObservations: [VNHumanHandPoseObservation],
        contours: [(path: UIBezierPath, center: CGPoint)],
        displaySize: CGSize
    ) -> [(image: UIImage?, rect: CGRect)] {
        var nailImages: [(image: UIImage?, rect: CGRect)] = []
        let group = DispatchGroup()
        
        // 각 손 포즈 관측 결과에 대해 처리
        for observation in handObservations {
            // 메트릭스 계산
            let metrics = nailMetricsAnalyzer.calculateAllFingerMetrics(
                observation: observation,
                contours: contours,
                displaySize: displaySize
            )
            
            // 각 손가락에 대해 네일 이미지 준비
            for m in metrics {
                // 손가락 타입 결정
                var fingerType: NailAssetProvider.FingerType?
                switch m.fingerName {
                case "thumb": fingerType = .thumb
                case "index": fingerType = .index
                case "middle": fingerType = .middle
                case "ring": fingerType = .ring
                case "pinky": fingerType = .pinky
                default: continue
                }
                
                guard let fingerType = fingerType else { continue }
                
                group.enter()
                // 네일 이미지 로드 및 준비
                NailAssetProvider.shared.loadNailImage(
                    for: fingerType
                ) { nailImage in
                    defer { group.leave() }
                    
                    guard let nailImage = nailImage else { return }
                    
                    // 1. 손가락 너비에 맞춰 크기 조정 (네일 모양에 따라 비율 조정)
                    var widthRatio: CGFloat = 512/170
                    var heightRatio: CGFloat = 512/374
                    
                    // 네일 모양에 따라 크기 조정 비율 변경
                    if let nailInfo = NailAssetProvider.shared.getNailSetForFingerType(fingerType) {
                        switch nailInfo.shape {
                        case .square:
                            widthRatio = 512/174
                            heightRatio = 512/374
                        case .round:
                            widthRatio = 512/185
                            heightRatio = 512/373
                        case .almond:
                            widthRatio = 512/170
                            heightRatio = 512/376
                        case .ballerina:
                            widthRatio = 512/146
                            heightRatio = 512/374
                        case .stiletto:
                            widthRatio = 512/134
                            heightRatio = 512/377
                        }
                    }
                    
                    let scaledSize = CGSize(
                        width: m.width * widthRatio,
                        height: m.height * heightRatio
                    )
                    
                    // 2. 회전 및 크기가 조정된 이미지 생성
                    UIGraphicsBeginImageContextWithOptions(scaledSize, false, 0.0)
                    guard let imageContext = UIGraphicsGetCurrentContext() else {
                        UIGraphicsEndImageContext()
                        return
                    }
                    
                    // 3. 컨텍스트 회전 설정
                    let angle = m.angle * .pi / 180
                    imageContext.translateBy(x: scaledSize.width / 2, y: scaledSize.height / 2)
                    imageContext.rotate(by: angle)
                    imageContext.translateBy(x: -scaledSize.width / 2, y: -scaledSize.height / 2)
                    
                    // 4. 이미지 그리기
                    nailImage.draw(in: CGRect(origin: .zero, size: scaledSize))
                    
                    // 5. 회전된 이미지 생성
                    let processedImage = UIGraphicsGetImageFromCurrentImageContext()
                    UIGraphicsEndImageContext()
                    
                    // 6. 최종 이미지를 컨투어 중심에 그릴 위치 계산
                    let drawRect = CGRect(
                        x: m.contourCenter.x - scaledSize.width / 2,
                        y: m.contourCenter.y - scaledSize.height / 2,
                        width: scaledSize.width,
                        height: scaledSize.height
                    )
                    
                    // 7. 이미지와 위치 정보 저장
                    DispatchQueue.main.async {
                        nailImages.append((image: processedImage, rect: drawRect))
                    }
                }
            }
        }
        
        // 모든 네일 이미지 준비가 완료될 때까지 대기 (최대 5초)
        _ = group.wait(timeout: .now() + 5.0)
        
        return nailImages
    }
}
