import UIKit
import Vision

/// 네일 오버레이 처리를 위한 프로토콜
@objc protocol NailProcessing {
    /// 이미지에 네일 오버레이 처리를 수행합니다.
    ///
    /// - Parameters:
    ///   - image: 처리할 원본 이미지
    ///   - completion: 처리된 이미지와 에러를 전달하는 콜백
    func processNailOverlay(for image: UIImage, completion: @escaping (UIImage?, Error?) -> Void)
    
    /// 이미지에서 세그멘테이션과 손 포즈 감지를 수행합니다.
    ///
    /// - Parameters:
    ///   - image: 처리할 원본 이미지
    ///   - completion: 세그멘테이션 결과, 손 포즈 감지 결과, 에러를 전달하는 콜백
    func processImage(_ image: UIImage, completion: @escaping (UIImage?, [VNHumanHandPoseObservation]?, Error?) -> Void)
}
