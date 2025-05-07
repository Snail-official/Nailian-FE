import UIKit
import CoreML
import Vision
import Accelerate

/// CoreML을 사용한 이미지 세그멘테이션 서비스 클래스
@objcMembers class ImageSegmenter: NSObject, ImageSegmenting {
    /// 싱글톤 인스턴스
    static let shared = ImageSegmenter()
    
    // 모델 파일 정보
    private let modelName = "segmentation_model"
    private let modelExt = "mlpackage"
    
    /// 마지막 처리 시간 (선택적 프로토콜 요구사항)
    private(set) var lastProcessingTime: TimeInterval = 0
    
    /// 미리 로드된 모델 변수
    private var modelLoaded = false
    private var model: MLModel?
    
    /// 현재 모델이 로드되어 있는지 확인합니다.
    func isModelLoaded() -> Bool {
        return modelLoaded && model != nil
    }
    
    /// 현재 모델을 로드 중인지 확인합니다.
    private var _isLoading = false
    
    /// 현재 모델 로드 작업이 진행 중인지 여부
    func isCurrentlyLoadingModel() -> Bool {
        return _isLoading
    }
    
    /// 모델을 백그라운드에서 로드합니다 (비동기 호출용)
    func preloadModelInBackground() {
        if modelLoaded || _isLoading {
            return
        }
        
        _isLoading = true
        DispatchQueue.global(qos: .background).async {
            self.loadSegmentationModel { _ in
                self._isLoading = false
            }
        }
    }
    
    private override init() {
        super.init()
    }
    
    // 로컬에 다운로드된 모델 URL 확인
  private func localModelURL() -> URL? {
            let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
            
            let modelsDirectory = documentsDirectory.appendingPathComponent("Models/segmentation", isDirectory: true)
            
            // 모델 디렉토리 존재 확인
            if !FileManager.default.fileExists(atPath: modelsDirectory.path) {
              // 디렉토리 구조 확인
              let modelParentDir = documentsDirectory.appendingPathComponent("Models", isDirectory: true)
              if FileManager.default.fileExists(atPath: modelParentDir.path) {
                  do {
                      let contents = try FileManager.default.contentsOfDirectory(at: modelParentDir, includingPropertiesForKeys: nil)
                  } catch {
                      print("Models 디렉토리 내용 읽기 실패: \(error.localizedDescription)")
                  }
              }
          }
          
          let modelURL = modelsDirectory.appendingPathComponent("\(modelName).\(modelExt)")
          
          if FileManager.default.fileExists(atPath: modelURL.path) {
              return modelURL
          }
          
          // Models 내 다른 디렉토리 확인 (iOS vs android)
          let rootModelsDir = documentsDirectory.appendingPathComponent("Models", isDirectory: true)
          if FileManager.default.fileExists(atPath: rootModelsDir.path) {
              do {
                  let contents = try FileManager.default.contentsOfDirectory(at: rootModelsDir, includingPropertiesForKeys: nil)
                  
                  // 각 하위 디렉토리의 내용도 확인
                  for item in contents {
                      if item.hasDirectoryPath {
                          do {
                              let subContents = try FileManager.default.contentsOfDirectory(at: item, includingPropertiesForKeys: nil)
                          } catch {
                              print("하위 디렉토리 '\(item.lastPathComponent)' 내용 읽기 실패: \(error.localizedDescription)")
                          }
                      }
                  }
              } catch {
                  print("Models 루트 디렉토리 내용 읽기 실패: \(error.localizedDescription)")
              }
          }
          
          return nil
      }
      
      // 모델 미리 로드
      func loadSegmentationModel(completion: ((Bool) -> Void)? = nil) {
          // 이미 로드되어 있으면 바로 성공 반환
          if modelLoaded && model != nil {
              completion?(true)
              return
          }
          
          // 이미 로드 중이면 중복 로드 방지
          if _isLoading {
              completion?(false)
              return
          }
          
          _isLoading = true
          
          DispatchQueue.global(qos: .background).async {
              do {
                  let config = MLModelConfiguration()
                  config.computeUnits = .all
                  
                  // 로컬에 모델 파일이 있는지 확인
                  guard let modelURL = self.localModelURL() else {
                      self.modelLoaded = false
                      self._isLoading = false
                      completion?(false)
                      return
                  }
                  
                  // MLModel.compileModel(at:)를 사용해 모델 컴파일
                  let compiledModelURL = try MLModel.compileModel(at: modelURL)
                  
                  self.model = try MLModel(contentsOf: compiledModelURL, configuration: config)
                  self.modelLoaded = true
                  self._isLoading = false
                  completion?(true)
              } catch {
                  self.modelLoaded = false
                  self._isLoading = false
                  completion?(false)
              }
          }
      }
    
    // MARK: - ImageSegmenting 프로토콜 구현
    
    /// 이미지 세그멘테이션 처리를 수행합니다.
    /// - Parameters:
    ///   - image: 세그멘테이션할 원본 이미지
    ///   - completion: 결과 이미지와 에러를 전달하는 콜백
    func processImage(_ image: UIImage, completion: @escaping (UIImage?, Error?) -> Void) {
        let totalStartTime = CACurrentMediaTime()
        
        // 디스플레이용 이미지 리사이즈
        let displayImage = ImageResizer.shared.resizeImageForDisplay(image)
        
        // 모델이 로드되지 않았다면 자동으로 로드 시도
        if !modelLoaded || model == nil {
            print("모델이 로드되지 않았습니다. 자동으로 로드를 시도합니다.")
            
            // 동기적으로 모델 로드 시도
            let semaphore = DispatchSemaphore(value: 0)
            var loadSuccess = false
            
            self.loadSegmentationModel { success in
                loadSuccess = success
                semaphore.signal()
            }
            
            // 최대 5초간 대기
            _ = semaphore.wait(timeout: .now() + 5.0)
            
            if !loadSuccess {
                print("자동 모델 로드 실패")
                completion(nil, NSError(domain: "SegmentationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "모델 로드에 실패했습니다. 모델 파일이 있는지 확인해주세요."]))
                return
            }
            
            print("자동 모델 로드 성공")
        }
        
        // 모델이 여전히 로드되지 않았다면 오류 반환
        guard modelLoaded, let modelToUse = model else {
            completion(nil, NSError(domain: "SegmentationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "모델 로드 후에도 모델이 로드되지 않았습니다."]))
            return
        }
        
        // 모델 입력 처리
        guard let inputDesc = modelToUse.modelDescription.inputDescriptionsByName["input_image"] else {
            completion(nil, NSError(domain: "SegmentationError", code: -99, userInfo: [NSLocalizedDescriptionKey: "모델 입력 피처 'input_image' 없음"]))
            return
        }
        
        var inputFeature: MLFeatureValue
        do {
            if inputDesc.type == .multiArray {
                let multiArray = try convertImageToMultiArray(image)
                inputFeature = MLFeatureValue(multiArray: multiArray)
            } else if inputDesc.type == .image {
                let pixelBuffer = try createPixelBuffer(from: image)
                inputFeature = MLFeatureValue(pixelBuffer: pixelBuffer)
            } else {
                throw NSError(domain: "SegmentationError", code: -99, userInfo: [NSLocalizedDescriptionKey: "지원하지 않는 입력 타입입니다"])
            }
        } catch {
            completion(nil, error)
            return
        }
        
        // 모델 추론
        let inputProvider: MLDictionaryFeatureProvider
        do {
            inputProvider = try MLDictionaryFeatureProvider(dictionary: ["input_image": inputFeature])
        } catch {
            completion(nil, error)
            return
        }
        
        let output: MLFeatureProvider
        do {
            output = try modelToUse.prediction(from: inputProvider)
        } catch {
            completion(nil, error)
            return
        }
        
        // 세그멘테이션 마스크 추출
        guard let segmentationMask = output.featureValue(for: "segmentation_mask")?.multiArrayValue else {
            completion(nil, NSError(domain: "SegmentationError", code: -3, userInfo: [NSLocalizedDescriptionKey: "세그멘테이션 마스크 생성 실패"]))
            return
        }
        
        // 백그라운드에서 후처리 수행
        DispatchQueue.global(qos: .userInitiated).async {
            autoreleasepool {
                let modelInputSize = ImageResizer.shared.modelInputSize
                let width = Int(modelInputSize.width)
                let height = Int(modelInputSize.height)
                
                // 바이너리 마스크 생성
                guard let heatmapImage = self.createBinaryMaskFromMultiArray(segmentationMask, width: width, height: height) else {
                    DispatchQueue.main.async {
                        completion(nil, NSError(domain: "SegmentationError", code: -4, userInfo: [NSLocalizedDescriptionKey: "바이너리 마스크 생성 실패"]))
                    }
                    return
                }
                
                // 결과 이미지 오버레이
                UIGraphicsBeginImageContextWithOptions(displayImage.size, false, 0.0)
                displayImage.draw(in: CGRect(origin: .zero, size: displayImage.size))
                heatmapImage.draw(in: CGRect(origin: .zero, size: displayImage.size),
                                  blendMode: .normal,
                                  alpha: 0.6)
                
                // 처리 시간 계산
                let totalTime = CACurrentMediaTime() - totalStartTime
                self.lastProcessingTime = totalTime
                
                // 처리 시간 텍스트 오버레이
                let timeText = String(format: "처리 시간: %.3f초", totalTime)
                let paragraphStyle = NSMutableParagraphStyle()
                paragraphStyle.alignment = .center
                let attributes: [NSAttributedString.Key: Any] = [
                    .font: UIFont.systemFont(ofSize: 14, weight: .bold),
                    .foregroundColor: UIColor.white,
                    .paragraphStyle: paragraphStyle,
                    .strokeColor: UIColor.black,
                    .strokeWidth: -2.0
                ]
                let textRect = CGRect(x: 10, y: 30, width: displayImage.size.width - 20, height: 30)
                timeText.draw(in: textRect, withAttributes: attributes)
                
                let resultImage = UIGraphicsGetImageFromCurrentImageContext()
                UIGraphicsEndImageContext()
                
                DispatchQueue.main.async {
                    completion(resultImage, nil)
                }
            }
        }
    }
    
    // MARK: - 내부 유틸리티 메서드
    
    /// MLMultiArray로 변환된 이미지로부터 바이너리 마스크를 생성합니다.
    private func createBinaryMaskFromMultiArray(_ multiArray: MLMultiArray, width: Int, height: Int) -> UIImage? {
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let bytesPerPixel = 4
        let bytesPerRow = width * bytesPerPixel
        let totalBytes = height * bytesPerRow
        
        let bitmapData = UnsafeMutablePointer<UInt8>.allocate(capacity: totalBytes)
        defer { bitmapData.deallocate() }
        
        // 각 픽셀에 대해 임계값 0.5 기준 이진화 처리 (배경: 투명, 전경: 흰색)
        for y in 0..<height {
            for x in 0..<width {
                let index = y * width + x
                let pixelOffset = y * bytesPerRow + x * bytesPerPixel
                if index < multiArray.count {
                    let value = multiArray[index].doubleValue
                    if value > 0.5 {
                        // 전경: 흰색 (불투명)
                        bitmapData[pixelOffset + 0] = 255  // R
                        bitmapData[pixelOffset + 1] = 255  // G
                        bitmapData[pixelOffset + 2] = 255  // B
                        bitmapData[pixelOffset + 3] = 255  // A
                    } else {
                        // 배경: 투명
                        bitmapData[pixelOffset + 0] = 0    // R
                        bitmapData[pixelOffset + 1] = 0    // G
                        bitmapData[pixelOffset + 2] = 0    // B
                        bitmapData[pixelOffset + 3] = 255    // A
                    }
                } else {
                    // 범위 밖: 투명 처리
                    bitmapData[pixelOffset + 0] = 0
                    bitmapData[pixelOffset + 1] = 0
                    bitmapData[pixelOffset + 2] = 0
                    bitmapData[pixelOffset + 3] = 255
                }
            }
        }
        
        guard let context = CGContext(data: bitmapData,
                                      width: width,
                                      height: height,
                                      bitsPerComponent: 8,
                                      bytesPerRow: bytesPerRow,
                                      space: colorSpace,
                                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return nil }
        guard let cgImage = context.makeImage() else { return nil }
        return UIImage(cgImage: cgImage)
    }
    
    /// UIImage를 MLMultiArray로 변환합니다.
    private func convertImageToMultiArray(_ image: UIImage) throws -> MLMultiArray {
        let modelInputSize = ImageResizer.shared.modelInputSize
        let resizedImage = ImageResizer.shared.resizeImageForModel(image, preserveAspectRatio: false)
        guard let cgImage = resizedImage.cgImage else {
            throw NSError(domain: "SegmentationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "CGImage 변환 실패"])
        }
        let width = Int(modelInputSize.width)
        let height = Int(modelInputSize.height)
        let shape: [NSNumber] = [1, 3, NSNumber(value: height), NSNumber(value: width)]
        let multiArray = try MLMultiArray(shape: shape, dataType: .float32)
        
        var rawData = [UInt8](repeating: 0, count: width * height * 4)
        let bytesPerPixel = 4
        let bytesPerRow = bytesPerPixel * width
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        
        guard let context = CGContext(data: &rawData,
                                      width: width,
                                      height: height,
                                      bitsPerComponent: 8,
                                      bytesPerRow: bytesPerRow,
                                      space: colorSpace,
                                      bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
        else {
            throw NSError(domain: "SegmentationError", code: -2, userInfo: [NSLocalizedDescriptionKey: "컨텍스트 생성 실패"])
        }
        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        for y in 0..<height {
            for x in 0..<width {
                let offset = (y * width + x) * 4
                let r = Float(rawData[offset]) / 255.0
                let g = Float(rawData[offset + 1]) / 255.0
                let b = Float(rawData[offset + 2]) / 255.0
                
                multiArray[[0, 0, y, x] as [NSNumber]] = NSNumber(value: r)
                multiArray[[0, 1, y, x] as [NSNumber]] = NSNumber(value: g)
                multiArray[[0, 2, y, x] as [NSNumber]] = NSNumber(value: b)
            }
        }
        return multiArray
    }
    
    /// UIImage를 CVPixelBuffer로 변환합니다.
    private func createPixelBuffer(from image: UIImage) throws -> CVPixelBuffer {
        let modelInputSize = ImageResizer.shared.modelInputSize
        let width = Int(modelInputSize.width)
        let height = Int(modelInputSize.height)
        let resizedImage = ImageResizer.shared.resizeImageForModel(image, preserveAspectRatio: false)
        guard let cgImage = resizedImage.cgImage else {
            throw NSError(domain: "SegmentationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "CGImage 변환 실패"])
        }
        var pixelBuffer: CVPixelBuffer?
        let attrs = [kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
                     kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue] as CFDictionary
        let status = CVPixelBufferCreate(kCFAllocatorDefault,
                                         width,
                                         height,
                                         kCVPixelFormatType_32BGRA,
                                         attrs,
                                         &pixelBuffer)
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            throw NSError(domain: "SegmentationError", code: -2, userInfo: [NSLocalizedDescriptionKey: "PixelBuffer 생성 실패"])
        }
        
        CVPixelBufferLockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0))
        defer { CVPixelBufferUnlockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0)) }
        
        guard let context = CGContext(data: CVPixelBufferGetBaseAddress(buffer),
                                      width: width,
                                      height: height,
                                      bitsPerComponent: 8,
                                      bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
                                      space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
        else {
            throw NSError(domain: "SegmentationError", code: -3, userInfo: [NSLocalizedDescriptionKey: "CGContext 생성 실패"])
        }
        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        return buffer
    }
}
