#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(CameraViewManager, RCTViewManager)

RCT_EXTERN_METHOD(setNailSet:(nonnull NSNumber *)node
                  nailSetDict:(nonnull NSDictionary *)nailSetDict)

RCT_EXTERN_METHOD(capturePhoto:(nonnull NSNumber *)node
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearOverlay:(nonnull NSNumber *)node)

@end
