import UIKit
import AVFoundation
import React

@objc(CameraView)
class CameraView: UIView {
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupCameraView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupCameraView()
    }
    
    /// 카메라 미리보기 설정
    private func setupCameraView() {
        CameraManager.shared.setupCamera(in: self)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        // 뷰 크기에 맞게 미리보기 레이어 프레임을 업데이트
        if let previewLayer = CameraManager.shared.getPreviewLayer() {
            previewLayer.frame = self.bounds
        }
    }
    
    deinit {
        CameraManager.shared.stopCamera()
    }
}

