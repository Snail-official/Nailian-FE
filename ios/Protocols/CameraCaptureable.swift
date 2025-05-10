import UIKit
import AVFoundation

/// 카메라 캡처 기능에 대한 인터페이스를 정의하는 프로토콜
@objc public protocol CameraCapturable {
    /// 지정된 뷰에 카메라 미리보기를 설정합니다.
    ///
    /// - Parameter view: 카메라 미리보기가 추가될 뷰
    func setupCamera(in view: UIView)
    
    /// 카메라 세션을 시작합니다.
    func startCamera()
    
    /// 카메라 세션을 중지합니다.
    func stopCamera()
    
    /// 사진을 캡처합니다.
    ///
    /// - Parameter completion: 캡처된 이미지를 전달하는 콜백
    func capturePhoto(completion: @escaping (UIImage?) -> Void)
    
    /// 카메라 미리보기 레이어를 반환합니다.
    ///
    /// - Returns: 미리보기를 표시하는 AVCaptureVideoPreviewLayer 객체
    func getPreviewLayer() -> AVCaptureVideoPreviewLayer?
}
