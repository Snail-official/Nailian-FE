import UIKit
import CoreML

/// 이미지 세그멘테이션 기능을 정의하는 프로토콜
@objc public protocol ImageSegmenting {
    /// 이미지 세그멘테이션 처리를 수행합니다.
    ///
    /// - Parameters:
    ///   - image: 세그멘테이션할 원본 이미지
    ///   - completion: 결과 이미지와 에러를 전달하는 콜백
    func processImage(_ image: UIImage, completion: @escaping (UIImage?, Error?) -> Void)
    
    /// 모델을 미리 로드합니다. (선택적 구현)
    @objc optional func preloadModel()
    
    /// 마지막 처리 시간을 반환합니다. (선택적 구현)
    @objc optional var lastProcessingTime: TimeInterval { get }
    
    /// 모델이 로드되었는지 확인합니다.
    func isModelLoaded() -> Bool
}
