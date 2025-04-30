import UIKit
import Vision

protocol ContourAnalyzing {
    /// Segmentation 마스크 이미지로부터 유효한 컨투어(경로와 중심점)를 추출합니다.
    func extractContours(from segmentedImage: UIImage) -> [(path: UIBezierPath, center: CGPoint)]
}
 
