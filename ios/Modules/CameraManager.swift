import UIKit
import AVFoundation

class CameraManager: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    static let shared = CameraManager()
    
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var isProcessingFrame = false
    private var realTimeProcessingEnabled = false
    private var frameCount: Int = 0
    
    // 실시간 처리 콜백
    var realTimeFrameCallback: ((UIImage) -> Void)?
    
    // 세그멘테이션 결과 표시용 이미지 레이어
    private var resultImageLayer: CALayer?
    
    // 세그멘테이션 처리 주기 (프레임 단위)
    private let processingInterval: Int = 1 // 매 프레임마다 처리
    
    private override init() {
        super.init()
    }
    
    // 지정된 뷰 내에서 카메라 미리보기를 설정합니다.
    func setupCamera(in view: UIView) {
        checkCameraPermission { [weak self] granted in
            guard let self = self else { return }
            if granted {
                self.configureSession(in: view)
                
                // 결과 이미지 레이어 초기화
                self.resultImageLayer = CALayer()
                self.resultImageLayer?.frame = view.bounds
                if let resultImageLayer = self.resultImageLayer {
                    view.layer.insertSublayer(resultImageLayer, at: 1) // 카메라 프리뷰 위에 추가
                }
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
    
    // 실시간 처리 활성화/비활성화
    func setRealTimeProcessing(enabled: Bool) {
        realTimeProcessingEnabled = enabled
        
        // 활성화되면 첫 프레임 처리 시작
        if enabled && !isProcessingFrame {
            // 다음 프레임을 기다림
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
            return
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: camera)
            if captureSession.canAddInput(input) {
                captureSession.addInput(input)
            } else {
                return
            }
            
            // 비디오 출력 설정
            let videoOutput = AVCaptureVideoDataOutput()
            videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue.main)
            
            if captureSession.canAddOutput(videoOutput) {
                captureSession.addOutput(videoOutput)
            }
            
            // 비디오 연결 설정 - 출력이 추가된 후에 해야 함
            if let connection = videoOutput.connection(with: .video) {
                // 비디오 방향 설정
                if connection.isVideoOrientationSupported {
                    connection.videoOrientation = .portrait
                }
                // 비디오 미러링 설정
                if connection.isVideoMirroringSupported {
                    connection.isVideoMirrored = false
                }
            }
            
        } catch {
            return
        }
        
        // 미리보기 레이어 생성
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer?.videoGravity = .resizeAspectFill
        previewLayer?.opacity = 0 // 원본 카메라 프리뷰는 숨김
        
        DispatchQueue.main.async {
            if let previewLayer = self.previewLayer {
                previewLayer.frame = view.bounds
                // 미리보기 레이어 방향 설정
                previewLayer.connection?.videoOrientation = .portrait
                view.layer.insertSublayer(previewLayer, at: 0)
            }
        }
        
        // 실시간 처리 활성화
        setRealTimeProcessing(enabled: true)
        
        DispatchQueue.global(qos: .userInitiated).async {
            captureSession.startRunning()
        }
    }
    
    // 미리보기 레이어 반환
    func getPreviewLayer() -> AVCaptureVideoPreviewLayer? {
        return previewLayer
    }
    
    // 카메라 세션 정지
    func stopCamera() {
        captureSession?.stopRunning()
    }
    
    // 이미지 방향 수정
    private func fixImageOrientation(_ image: UIImage) -> UIImage {
        // 현재 디바이스 방향에 따라 이미지 회전
        let currentOrientation = UIDevice.current.orientation
        var imageOrientation: UIImage.Orientation
        
        imageOrientation = .up
        
        // 새 방향으로 이미지 생성
        if let cgImage = image.cgImage {
            return UIImage(cgImage: cgImage, scale: image.scale, orientation: imageOrientation)
        }
        
        return image
    }
    
    // 결과 이미지 업데이트
    private func updateResultImage(_ image: UIImage) {
        DispatchQueue.main.async {
            // 이미지를 CALayer의 contents로 설정
            self.resultImageLayer?.contents = image.cgImage
        }
    }
    
    // AVCaptureVideoDataOutputSampleBufferDelegate
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        frameCount += 1
        
        // 실시간 처리가 활성화되어 있고 현재 처리 중이 아닌 경우에만 새 프레임 처리
        if realTimeProcessingEnabled && !isProcessingFrame && frameCount % processingInterval == 0 {
            isProcessingFrame = true
            
            // 세그멘테이션 처리 시작 - 미리보기 업데이트는 세그멘테이션 결과에서만 수행
            processFrameForRealTime(sampleBuffer)
        }
    }
    
    // 프레임 처리
    private func processFrame(_ sampleBuffer: CMSampleBuffer) -> UIImage? {
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            return nil
        }
        
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let context = CIContext()
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
            return nil
        }
        
        // 기본 이미지 생성
        let image = UIImage(cgImage: cgImage)
        
        // 이미지 방향 수정
        return fixImageOrientation(image)
    }
    
    // 프레임 처리 (실시간용)
    private func processFrameForRealTime(_ sampleBuffer: CMSampleBuffer) {
        guard let image = processFrame(sampleBuffer), let callback = realTimeFrameCallback else {
            isProcessingFrame = false
            return
        }
        
        // 세그멘테이션 처리
        SegmentationManager.shared.processImage(image) { [weak self] resultImage, error in
            guard let self = self else { return }
            
            if let error = error {
                // 오류 발생 시 원본 이미지 표시
                DispatchQueue.main.async {
                    self.updateResultImage(image)
                    callback(image)
                }
                self.isProcessingFrame = false
                return
            }
            
            if let resultImage = resultImage {
                DispatchQueue.main.async {
                    // 세그멘테이션 결과 이미지로 레이어 업데이트
                    self.updateResultImage(resultImage)
                    callback(resultImage)
                    
                    // 세그멘테이션 완료 후 처리 상태 초기화
                    self.isProcessingFrame = false
                }
            } else {
                // 결과가 없을 경우 원본 이미지 표시
                DispatchQueue.main.async {
                    self.updateResultImage(image)
                    callback(image)
                }
                self.isProcessingFrame = false
            }
        }
    }
} 
