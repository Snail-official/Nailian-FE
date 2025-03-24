import Foundation
import React

@objc(CameraViewManager)
class CameraViewManager: RCTViewManager {
    
    override func view() -> UIView! {
        return CameraView()
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
