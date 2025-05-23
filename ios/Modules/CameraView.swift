import UIKit
import AVFoundation
import React

@objc(CameraView)
class CameraView: UIView {
    private var overlayImageView: UIImageView?
    
    // 이벤트 콜백
    @objc var onCaptureComplete: RCTDirectEventBlock?
    @objc var onError: RCTDirectEventBlock?
    
    // 카메라 서비스 (명시적으로 의존성 주입)
    private var cameraService: CameraCapturable
    
    override init(frame: CGRect) {
        self.cameraService = CameraService.shared
        super.init(frame: frame)
        setupCameraView()
        setupOverlayView()
    }
    
    required init?(coder: NSCoder) {
        self.cameraService = CameraService.shared
        super.init(coder: coder)
        setupCameraView()
        setupOverlayView()
    }
    
    /// 카메라 미리보기 설정
    private func setupCameraView() {
        cameraService.setupCamera(in: self)
    }
    
    /// 오버레이 이미지 뷰 설정
    private func setupOverlayView() {
        overlayImageView = UIImageView(frame: bounds)
        overlayImageView?.contentMode = .scaleAspectFill
        overlayImageView?.alpha = 0 // 초기에는 숨김 상태
        if let overlayImageView = overlayImageView {
            addSubview(overlayImageView)
        }
    }
    
    /// 세그멘테이션 결과 이미지 표시
    func showSegmentationResult(_ image: UIImage) {
        DispatchQueue.main.async { [weak self] in
            self?.overlayImageView?.image = image
            
            // 페이드 인 애니메이션 - 더 불투명하게
            UIView.animate(withDuration: 0.3) {
                self?.overlayImageView?.alpha = 1.0
            }
        }
    }
    
    /// 오버레이 이미지 제거
    func clearOverlay() {
        DispatchQueue.main.async { [weak self] in
            // 완전히 투명하게 만들어 숨김
            UIView.animate(withDuration: 0.3) {
                self?.overlayImageView?.alpha = 0
            } completion: { _ in
                self?.overlayImageView?.image = nil
            }
        }
    }
    
    /// 카메라 세션 시작
    func startCameraSession() {
        cameraService.startCamera()
    }
    
    /// 카메라 세션 중지
    func stopCameraSession() {
        cameraService.stopCamera()
    }
    
    /// 사진 캡처
    func capturePhoto(completion: @escaping (UIImage?) -> Void) {
        cameraService.capturePhoto { [weak self] image in
            if image == nil, let self = self, let onError = self.onError {
                // 에러 이벤트 발생
                onError(["error": "Failed to capture image"])
            }
            completion(image)
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        // 뷰 크기에 맞게 미리보기 레이어 프레임을 업데이트
        if let previewLayer = cameraService.getPreviewLayer() {
            previewLayer.frame = self.bounds
        }
        overlayImageView?.frame = bounds
    }
    
    deinit {
        cameraService.stopCamera()
    }
} 
