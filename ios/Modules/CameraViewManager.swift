import Foundation
import React

@objc(CameraViewManager)
class CameraViewManager: RCTViewManager {
    
    // 네일 세트 데이터 관리
    private var nailSetData: [String: Any] = [:]
    private var nailAssetProvider: any NailAssetProviding {
        return NailAssetProvider.shared
    }
    
    private var cameraService: any CameraCapturable {
        return CameraService.shared
    }
    
    private var imageSegmenter: any ImageSegmenting {
        return ImageSegmenter.shared
    }
    
    private var nailProcessor: any NailProcessing {
        return NailProcessor.shared
    }
    
    override func view() -> UIView! {
        return CameraView()
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // 네일 세트 설정 메서드 (React Native에서 호출)
    @objc func setNailSet(_ node: NSNumber, nailSetDict: NSDictionary) -> Void {
        nailSetData = nailSetDict as? [String: Any] ?? [:]
        print("[CameraViewManager] 네일 세트 데이터 저장: \(nailSetData)")
        nailAssetProvider.setNailSet(nailSetData)
    }
    
    @objc func capturePhoto(_ node: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        // 캡처 전에 네일 세트 정보 확인 및 재설정
        if !nailSetData.isEmpty {
            print("[CameraViewManager] 캡처 전 네일 세트 데이터 재설정")
            nailAssetProvider.setNailSet(nailSetData)
        } else {
            print("[CameraViewManager] 네일 세트 데이터가 비어 있습니다.")
        }
        
        DispatchQueue.main.async {
            guard let view = self.bridge.uiManager.view(forReactTag: node) as? CameraView else {
                rejecter("ERROR", "Invalid view reference", nil)
                return
            }
            
            // Promise 상태 추적용 플래그
            var isPromiseHandled = false
            
            // 안전하게 Promise를 처리하는 함수들
            let safeResolve: (Any) -> Void = { result in
                DispatchQueue.main.async {
                    if !isPromiseHandled {
                        isPromiseHandled = true
                        resolver(result)
                    }
                }
            }
            
            let safeReject: (String, String, Error?) -> Void = { code, message, error in
                DispatchQueue.main.async {
                    if !isPromiseHandled {
                        isPromiseHandled = true
                        rejecter(code, message, error)
                    }
                }
            }
            
            // 이미지 캡처 요청 (카메라가 실행 중인 상태에서)
            self.cameraService.capturePhoto { [weak self] image in
                guard let self = self else { return }
                
                // 이미지가 없는 경우 오류 반환
                guard let image = image else {
                    view.startCameraSession() // 카메라 세션 재시작
                    safeReject("ERROR", "Failed to capture image", nil)
                    return
                }
                
                // 이미지 캡처 완료 후 카메라 세션 중지
                view.stopCameraSession()
                
                // 네일 프로세서를 사용하여 이미지 처리
                self.nailProcessor.processNailOverlay(for: image) { resultImage, error in
                    if let error = error {
                        view.startCameraSession() // 오류 발생 시 카메라 세션 재시작
                        safeReject("ERROR", error.localizedDescription, error)
                        return
                    }
                    
                    guard let resultImage = resultImage else {
                        view.startCameraSession() // 결과 이미지가 없는 경우 카메라 세션 재시작
                        safeReject("ERROR", "Failed to process image", nil)
                        return
                    }
                    
                    // 결과 이미지를 오버레이로 표시
                    view.showSegmentationResult(resultImage)
                    
                    // 이벤트 발생
                    if let onCaptureComplete = view.onCaptureComplete {
                        let eventBody: [String: Any] = ["success": true]
                        onCaptureComplete(eventBody)
                    }
                    
                    safeResolve(true) // Promise 안전하게 해결
                }
            }
        }
    }
    
    @objc func clearOverlay(_ node: NSNumber) {
        DispatchQueue.main.async {
            guard let view = self.bridge.uiManager.view(forReactTag: node) as? CameraView else { return }
            view.clearOverlay()
            
            // 카메라 세션 재시작
            view.startCameraSession()
        }
    }
} 
