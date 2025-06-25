import UIKit
import Vision

class NailMetricsAnalyzer: NailMetricsAnalyzing {
    
    // 손가락 관절 매핑 정보 (DIP 및 TIP 관절 정의)
    static let fingerJointMapping: [(name: String, dip: VNHumanHandPoseObservation.JointName, tip: VNHumanHandPoseObservation.JointName)] = [
        ("thumb", .thumbIP, .thumbTip),
        ("index", .indexDIP, .indexTip),
        ("middle", .middleDIP, .middleTip),
        ("ring", .ringDIP, .ringTip),
        ("pinky", .littleDIP, .littleTip)
    ]
    
    func calculateAllFingerMetrics(
        observation: VNHumanHandPoseObservation,
        contours: [(path: UIBezierPath, center: CGPoint)],
        displaySize: CGSize
    ) -> [NailMetrics] {
        var results: [NailMetrics] = []
        
        guard let recognizedPoints = try? observation.recognizedPoints(.all) else {
            print("인식된 관절 정보 없음")
            return []
        }
        
        for (name, dipJoint, tipJoint) in NailMetricsAnalyzer.fingerJointMapping {
            guard let dipPointValue = recognizedPoints[dipJoint],
                  let tipPointValue = recognizedPoints[tipJoint],
                  dipPointValue.confidence > 0.2,
                  tipPointValue.confidence > 0.2 else {
                print("\(name) 손가락 관절 정보 부족")
                continue
            }
            
            let dipPoint = CGPoint(
                x: dipPointValue.location.x * displaySize.width,
                y: (1 - dipPointValue.location.y) * displaySize.height
            )
            let tipPoint = CGPoint(
                x: tipPointValue.location.x * displaySize.width,
                y: (1 - tipPointValue.location.y) * displaySize.height
            )
            
            var closestContour: UIBezierPath?
            var closestCenter: CGPoint?
            var minDistance: CGFloat = CGFloat.greatestFiniteMagnitude
            
            for (contour, center) in contours {
                let distance = hypot(center.x - tipPoint.x, center.y - tipPoint.y)
                if distance < minDistance {
                    minDistance = distance
                    closestContour = contour
                    closestCenter = center
                }
            }
            
            guard let contour = closestContour, let center = closestCenter else {
                print("\(name) 손가락에 적합한 컨투어 없음")
                continue
            }
            
            let (angle, width, height) = Self.calculateNailMetrics(
                contour: contour,
                dipPoint: dipPoint,
                tipPoint: tipPoint
            )
            
            let metrics = NailMetrics(
                fingerName: name,
                contourCenter: center,
                angle: angle,
                width: width,
                height: height,
                dipPoint: dipPoint,
                tipPoint: tipPoint
            )
            results.append(metrics)
        }
        return results
    }
    
    static func calculateNailMetrics(
        contour: UIBezierPath,
        dipPoint: CGPoint,
        tipPoint: CGPoint
    ) -> (angle: CGFloat, width: CGFloat, height: CGFloat) {
        let center = CGPoint(x: contour.bounds.midX, y: contour.bounds.midY)
        let dx = tipPoint.x - dipPoint.x
        let dy = tipPoint.y - dipPoint.y
        
        let angle = atan2(dx, -dy)
        let degrees = angle * 180 / .pi
        
        let copy = contour.copy() as! UIBezierPath
        let translateTransform = CGAffineTransform(translationX: -center.x, y: -center.y)
        copy.apply(translateTransform)
        let rotateTransform = CGAffineTransform(rotationAngle: -angle)
        copy.apply(rotateTransform)
        let bounds = copy.bounds
        
        return (degrees, bounds.width, bounds.height)
    }
}
