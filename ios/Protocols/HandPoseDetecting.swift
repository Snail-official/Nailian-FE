import UIKit
import Vision

/// 손 포즈(관절) 감지 기능을 정의하는 프로토콜
@objc public protocol HandPoseDetecting {
    /// 이미지에서 손 포즈(관절)를 감지합니다.
    ///
    /// - Parameters:
    ///   - image: 분석할 원본 이미지
    ///   - completion: 감지된 손 포즈 관측 결과와 에러를 전달하는 콜백
    func detectHandPose(on image: UIImage, completion: @escaping ([VNHumanHandPoseObservation]?, Error?) -> Void)
} 