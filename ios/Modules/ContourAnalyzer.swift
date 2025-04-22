import UIKit
import Vision

/// 세그멘테이션된 이미지에서 컨투어(윤곽) 추출 및 분석을 수행하는 클래스
class ContourAnalyzer: NSObject, ContourAnalyzing {
    private var lastContoursObservation: VNContoursObservation?
    
    /// 세그멘테이션 이미지에서 컨투어를 추출하고 필터링합니다.
    /// - Parameter segmentedImage: 세그멘테이션이 적용된 이미지
    /// - Returns: 유효한 컨투어 경로와 중심점 배열
    func extractContours(from segmentedImage: UIImage) -> [(path: UIBezierPath, center: CGPoint)] {
        // 원본 이미지를 그레이스케일로 변환
        guard let ciImage = CIImage(image: segmentedImage) else {
            print("CIImage 변환 실패")
            return []
        }
        
        // 그레이스케일 필터 적용
        let grayscaleFilter = CIFilter(name: "CIPhotoEffectMono")
        grayscaleFilter?.setValue(ciImage, forKey: kCIInputImageKey)
        
        guard let outputImage = grayscaleFilter?.outputImage else {
            print("그레이스케일 변환 실패")
            return []
        }
        
        // 이미지 컨투어 감지 요청
        let request = VNDetectContoursRequest()
        request.revision = VNDetectContourRequestRevision1
        request.contrastAdjustment = 1.0
        request.maximumImageDimension = 512
        
        // 요청 수행
        let handler = VNImageRequestHandler(ciImage: outputImage, options: [:])
        do {
            try handler.perform([request])
            
            guard let contoursObservation = request.results?.first as? VNContoursObservation else {
                print("컨투어 감지 실패")
                return []
            }
            
            // 이전 컨투어 결과 저장
            self.lastContoursObservation = contoursObservation
            
            // 컨투어 경로 추출
            let contourPaths = extractContourPaths(
                from: contoursObservation,
                imageSize: segmentedImage.size
            )
            
            // 유효한 컨투어만 필터링
            let validContours = filterValidContours(
                contourPaths,
                imageSize: segmentedImage.size
            )
            
            print("유효한 컨투어 개수: \(validContours.count)")
            return validContours
            
        } catch {
            print("컨투어 감지 에러: \(error)")
            return []
        }
    }
    
    // MARK: - 1단계: 컨투어 추출 및 필터링
    
    private func extractContourPaths(
        from contoursObservation: VNContoursObservation,
        imageSize: CGSize
    ) -> [UIBezierPath] {
        var contourPaths: [UIBezierPath] = []
        let imageWidth = imageSize.width
        let imageHeight = imageSize.height
        
        for index in 0..<contoursObservation.contourCount {
            if let contour = try? contoursObservation.contour(at: index) {
                let path = UIBezierPath()
                let points = contour.normalizedPoints.map { point -> CGPoint in
                    let x = CGFloat(point.x) * imageWidth
                    let y = (1 - CGFloat(point.y)) * imageHeight
                    return CGPoint(x: x, y: y)
                }
                
                if let firstPoint = points.first {
                    path.move(to: firstPoint)
                    for pt in points.dropFirst() {
                        path.addLine(to: pt)
                    }
                    path.close()
                    contourPaths.append(path)
                }
            }
        }
        print("전체 컨투어 개수: \(contourPaths.count)")
        return contourPaths
    }
    
    private func filterValidContours(
        _ contourPaths: [UIBezierPath],
        imageSize: CGSize
    ) -> [(path: UIBezierPath, center: CGPoint)] {
        var validContours: [(path: UIBezierPath, center: CGPoint)] = []
        let imageArea = imageSize.width * imageSize.height
        
        for (index, contour) in contourPaths.enumerated() {
            let bounds = contour.bounds
            let area = bounds.width * bounds.height
            let areaRatio = area / imageArea
            
            // 너무 큰 컨투어(배경) 제외
            if areaRatio > 0.3 {
                print("큰 컨투어 무시 (배경): \(index), 크기: \(bounds.width)x\(bounds.height), 면적 비율: \(areaRatio)")
                continue
            }
            // 너무 작은 컨투어(노이즈) 제외
            if area < 100 {
                continue
            }
            let centerPoint = CGPoint(x: bounds.midX, y: bounds.midY)
            validContours.append((path: contour, center: centerPoint))
            if area > 500 {
                print("유효한 컨투어 \(index): 크기 \(bounds.width)x\(bounds.height), 면적 \(area), 면적 비율: \(areaRatio), 중심: \(centerPoint)")
            }
        }
        return validContours
    }
}
