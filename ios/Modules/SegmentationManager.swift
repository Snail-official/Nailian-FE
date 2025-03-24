import UIKit
import CoreML
import Vision
import Accelerate

@objc class SegmentationManager: NSObject {
    static let shared = SegmentationManager()
    private let maxImageDimension: CGFloat = 1024.0
    private let modelInputSize = CGSize(width: 800, height: 800)  // 모델 입력 크기
    private var modelLoaded = false
    private var model: MLModel?
    
    // 모델 파일 정보
    private let modelName = "segmentation_model"
    private let modelExt = "mlpackage"
    
    // 처리 시간 측정용 변수
    private var lastProcessingTime: TimeInterval = 0

    private override init() {
        super.init()
        preloadModel()
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
      private func preloadModel() {
          DispatchQueue.global(qos: .background).async {
              do {
                  let config = MLModelConfiguration()
                  config.computeUnits = .all
                  
                  // 로컬에 모델 파일이 있는지 확인
                  guard let modelURL = self.localModelURL() else {
                      self.modelLoaded = false
                      return
                  }
                  
                  // MLModel.compileModel(at:)를 사용해 모델 컴파일
                  let compiledModelURL = try MLModel.compileModel(at: modelURL)
                  
                  self.model = try MLModel(contentsOf: compiledModelURL, configuration: config)
                  self.modelLoaded = true
              } catch {
                  self.modelLoaded = false
                  print("모델 로드 실패: \(error.localizedDescription)")
              }
          }
      }
    
    // 모델 입력용 리사이즈
    private func resizeImageForModel(_ image: UIImage) -> UIImage {
        UIGraphicsBeginImageContextWithOptions(modelInputSize, false, 0.0)
        image.draw(in: CGRect(origin: .zero, size: modelInputSize))
        let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return resizedImage ?? image
    }
    
    // 디스플레이용 리사이즈
    private func resizeImageForDisplay(_ image: UIImage) -> UIImage {
        let size = image.size
        let widthRatio = maxImageDimension / size.width
        let heightRatio = maxImageDimension / size.height
        let scale = min(widthRatio, heightRatio)
        if scale >= 1.0 { return image }
        let newSize = CGSize(width: size.width * scale, height: size.height * scale)
        UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0)
        image.draw(in: CGRect(origin: .zero, size: newSize))
        let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return resizedImage ?? image
    }

    // MLMultiArray로부터 바이너리 마스크 이미지를 생성하는 함수
    private func createHeatmapFromMultiArray(_ multiArray: MLMultiArray, width: Int, height: Int) -> UIImage? {
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let bytesPerPixel = 4
        let bytesPerRow = width * bytesPerPixel
        let totalBytes = height * bytesPerRow

        let bitmapData = UnsafeMutablePointer<UInt8>.allocate(capacity: totalBytes)
        defer { bitmapData.deallocate() }

        for y in 0..<height {
            for x in 0..<width {
                let index = y * width + x
                let pixelOffset = y * bytesPerRow + x * bytesPerPixel
                
                if index < multiArray.count {
                    let value = multiArray[index].doubleValue
                    if value > 0.5 {
                        bitmapData[pixelOffset + 0] = 0    // R
                        bitmapData[pixelOffset + 1] = 0    // G
                        bitmapData[pixelOffset + 2] = 0    // B
                        bitmapData[pixelOffset + 3] = 0    // A (투명) 
                        
                    } else {
                        bitmapData[pixelOffset + 0] = 255  // R (빨간색)
                        bitmapData[pixelOffset + 1] = 0    // G
                        bitmapData[pixelOffset + 2] = 0    // B
                        bitmapData[pixelOffset + 3] = 255  // A (불투명)
                    }
                } else {
                    bitmapData[pixelOffset + 0] = 0
                    bitmapData[pixelOffset + 1] = 0
                    bitmapData[pixelOffset + 2] = 0
                    bitmapData[pixelOffset + 3] = 0
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
    
    // UIImage를 MLMultiArray로 변환 (모델 입력이 MLMultiArray인 경우)
    private func convertImageToMultiArray(_ image: UIImage) throws -> MLMultiArray {
        let resizedImage = resizeImageForModel(image)
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
    
    // UIImage를 CVPixelBuffer로 변환 (모델 입력이 이미지 타입인 경우)
    // 여기서는 CGImage를 이용하여 픽셀 버퍼를 생성합니다.
    private func createPixelBuffer(from image: UIImage) throws -> CVPixelBuffer {
        let width = Int(modelInputSize.width)
        let height = Int(modelInputSize.height)
        let resizedImage = resizeImageForModel(image)
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
    
    // 모델의 입력 피처 타입에 따라 자동으로 변환을 수행하여 모델 추론을 진행합니다.
    @objc func processImage(_ image: UIImage, completion: @escaping (UIImage?, Error?) -> Void) {
        let totalStartTime = CACurrentMediaTime()
        
        let displayImage = resizeImageForDisplay(image)
        let resizeTime = CACurrentMediaTime() - totalStartTime
        
        // 모델이 로드되었는지 확인
        guard modelLoaded, let modelToUse = model else {
            completion(nil, NSError(domain: "SegmentationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "모델이 로드되지 않았습니다. 먼저 모델을 다운로드해야 합니다."])) 
            return
        }
        
        let modelLoadTime = CACurrentMediaTime() - totalStartTime - resizeTime
        
        do {
            let convertStartTime = CACurrentMediaTime()
            var inputFeature: MLFeatureValue
            // 모델 입력 피처 타입에 따라 변환 수행
            guard let inputDesc = modelToUse.modelDescription.inputDescriptionsByName["input_image"] else {
                throw NSError(domain: "SegmentationError", code: -99, userInfo: [NSLocalizedDescriptionKey: "모델 입력 피처 'input_image' 없음"])
            }
            if inputDesc.type == .multiArray {
                let multiArray = try convertImageToMultiArray(image)
                inputFeature = MLFeatureValue(multiArray: multiArray)
            } else if inputDesc.type == .image {
                let pixelBuffer = try createPixelBuffer(from: image)
                inputFeature = MLFeatureValue(pixelBuffer: pixelBuffer)
            } else {
                throw NSError(domain: "SegmentationError", code: -99, userInfo: [NSLocalizedDescriptionKey: "지원하지 않는 입력 타입입니다"])
            }
            let convertTime = CACurrentMediaTime() - convertStartTime
            
            let inferenceStartTime = CACurrentMediaTime()
            let input = try MLDictionaryFeatureProvider(dictionary: ["input_image": inputFeature])
            let output = try modelToUse.prediction(from: input)
            let inferenceTime = CACurrentMediaTime() - inferenceStartTime
            
            guard let segmentationMask = output.featureValue(for: "segmentation_mask")?.multiArrayValue else {
                throw NSError(domain: "SegmentationError", code: -3, userInfo: [NSLocalizedDescriptionKey: "세그멘테이션 마스크 생성 실패"])
            }
            
            DispatchQueue.global(qos: .userInitiated).async {
                autoreleasepool {
                    let heatmapStartTime = CACurrentMediaTime()
                    let width = Int(self.modelInputSize.width)
                    let height = Int(self.modelInputSize.height)
                    guard let heatmapImage = self.createHeatmapFromMultiArray(segmentationMask, width: width, height: height) else {
                        DispatchQueue.main.async {
                            completion(nil, NSError(domain: "SegmentationError", code: -4, userInfo: [NSLocalizedDescriptionKey: "히트맵 이미지 생성 실패"]))
                        }
                        return
                    }
                    let heatmapTime = CACurrentMediaTime() - heatmapStartTime
                    
                    let overlayStartTime = CACurrentMediaTime()
                    UIGraphicsBeginImageContextWithOptions(displayImage.size, false, 0.0)
                    displayImage.draw(in: CGRect(origin: .zero, size: displayImage.size))
                    heatmapImage.draw(in: CGRect(origin: .zero, size: displayImage.size), blendMode: .normal, alpha: 0.6)
                    
                    // 처리 시간 텍스트 오버레이
                    let totalEndTime = CACurrentMediaTime()
                    self.lastProcessingTime = totalEndTime - totalStartTime
                    let timeText = String(format: "처리 시간: %.3f초", self.lastProcessingTime)
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
                    let overlayTime = CACurrentMediaTime() - overlayStartTime
                    
                    _ = resizeTime + modelLoadTime + convertTime + inferenceTime + heatmapTime + overlayTime
                    
                    DispatchQueue.main.async {
                        completion(resultImage, nil)
                    }
                }
            }
        } catch {
            completion(nil, error)
        }
    }
}
