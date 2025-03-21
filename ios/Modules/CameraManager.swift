import UIKit
import AVFoundation

class CameraManager: NSObject {
    static let shared = CameraManager()
    
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    
    private override init() {
        super.init()
    }
    
    // 지정된 뷰 내에서 카메라 미리보기를 설정합니다.
    func setupCamera(in view: UIView) {
        checkCameraPermission { [weak self] granted in
            guard let self = self else { return }
            if granted {
                self.configureSession(in: view)
            } else {
                DispatchQueue.main.async {
                    let label = UILabel(frame: view.bounds)
                    label.textAlignment = .center
                    label.text = "카메라 접근 권한이 필요합니다."
                    label.textColor = .white
                    label.backgroundColor = .red
                    view.addSubview(label)
                }
            }
        }
    }
    
    // 카메라 권한 확인 및 요청
    private func checkCameraPermission(completion: @escaping (Bool) -> Void) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            completion(true)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                completion(granted)
            }
        default:
            completion(false)
        }
    }
    
    // 카메라 세션 구성 및 미리보기 레이어 추가
    private func configureSession(in view: UIView) {
        captureSession = AVCaptureSession()
        guard let captureSession = captureSession else { return }
        captureSession.sessionPreset = .high
        
        // 후면 카메라 선택
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera,
                                                     for: .video,
                                                     position: .back) else {
            print("사용 가능한 카메라가 없습니다.")
            return
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: camera)
            if captureSession.canAddInput(input) {
                captureSession.addInput(input)
            } else {
                print("카메라 입력을 추가할 수 없습니다.")
                return
            }
        } catch {
            print("카메라 입력 생성 오류: \(error)")
            return
        }
        
        // 미리보기 레이어 생성
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer?.videoGravity = .resizeAspectFill
        
        DispatchQueue.main.async {
            if let previewLayer = self.previewLayer {
                previewLayer.frame = view.bounds
                view.layer.insertSublayer(previewLayer, at: 0)
            }
        }
        
        captureSession.startRunning()
    }
    
    // 미리보기 레이어 반환
    func getPreviewLayer() -> AVCaptureVideoPreviewLayer? {
        return previewLayer
    }
    
    // 카메라 세션 정지
    func stopCamera() {
        captureSession?.stopRunning()
    }
}
