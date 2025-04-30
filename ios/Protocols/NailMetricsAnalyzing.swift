import UIKit

// 전역 또는 별도 파일에 정의된 NailMetrics 타입
struct NailMetrics {
    let fingerName: String          // 예: "thumb", "index", etc.
    let contourCenter: CGPoint      // 컨투어 중심점
    let angle: CGFloat              // DIP→TIP 방향의 각도 (도 단위)
    let width: CGFloat              // 컨투어의 너비
    let height: CGFloat             // 컨투어의 높이
    let dipPoint: CGPoint           // DIP 관절 위치
    let tipPoint: CGPoint           // TIP 관절 위치
}

import Vision

protocol NailMetricsAnalyzing {
    func calculateAllFingerMetrics(
        observation: VNHumanHandPoseObservation,
        contours: [(path: UIBezierPath, center: CGPoint)],
        displaySize: CGSize
    ) -> [NailMetrics]
}
