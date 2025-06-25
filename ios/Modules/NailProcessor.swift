import UIKit
import Vision

@objcMembers
class NailProcessor: NSObject, NailProcessing {
    static let shared = NailProcessor()
    
    private let handPoseDetector: HandPoseDetecting
    private let imageSegmenter: ImageSegmenting
    
    // 추가: 컨투어 및 손톱 메트릭스 분석 객체 (필요시 싱글톤 또는 인스턴스 생성)
    private let contourAnalyzer: ContourAnalyzing = ContourAnalyzer()
    private let nailMetricsAnalyzer: NailMetricsAnalyzing = NailMetricsAnalyzer()
    private let nailAssetProvider = NailAssetProvider.shared
    
    private(set) var lastProcessingTime: Double = 0
    
    // 로드 상태 추적
    private var areNailImagesLoaded = false
    private var isHandPoseModelLoaded = false
    private var isSegmentationModelLoaded = false
    
    // 로드 상태 변경 콜백 (React Native에서 사용)
    var onResourceLoadStatusChanged: ((Bool) -> Void)?
    
    private override init() {
        self.handPoseDetector = HandPoseDetector.shared
        self.imageSegmenter = ImageSegmenter.shared
        super.init()
        
        // 앱 시작 시 이미지를 미리 로드
        preloadNailImages()
        
        // 모델 로드 상태 모니터링 시작
        startMonitoringModelLoadStatus()
    }
    
    // 모든 네일 이미지를 미리 로드하는 메서드
    private func preloadNailImages() {
        let fingerTypes = NailAssetProvider.FingerType.allCases
        let dispatchGroup = DispatchGroup()
        
        for fingerType in fingerTypes {
            dispatchGroup.enter()
            nailAssetProvider.loadNailImage(for: fingerType) { _ in
                dispatchGroup.leave()
            }
        }
        
        dispatchGroup.notify(queue: .main) { [weak self] in
            guard let self = self else { return }
            
            print("[NailProcessor] 모든 네일 이미지 로드 완료")
            self.areNailImagesLoaded = true
            
            // 명시적으로 리소스 상태 재확인
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.checkResourceLoadStatus()
                
                // 만약 이미 세그멘테이션 모델도 로드되었다면 강제로 상태 업데이트
                if self.isSegmentationModelLoaded && self.areNailImagesLoaded {
                    print("[NailProcessor] 네일 이미지와 세그멘테이션 모델 모두 로드 완료, 강제 이벤트 발송")
                    let allLoaded = self.areAllResourcesLoaded()
                    print("[NailProcessor] 모든 리소스 로드 완료 여부: \(allLoaded)")
                    self.onResourceLoadStatusChanged?(allLoaded)
                }
            }
        }
    }
    
    // 모델 로드 상태 모니터링
    private func startMonitoringModelLoadStatus() {
        // 즉시 한 번 확인
        updateModelLoadStatus()
        
        // 주기적으로 모델 로드 상태 확인 (0.5초 간격)
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] timer in
            guard let self = self else {
                timer.invalidate()
                return
            }
            
            // 이미 모든 리소스가 로드되었으면 타이머 중지
            if self.areAllResourcesLoaded() {
                print("[NailProcessor] 모든 리소스 로드 완료, 모니터링 중지")
                timer.invalidate()
                return
            }
            
            self.updateModelLoadStatus()
        }
    }
    
    // 모델 로드 상태 업데이트
    private func updateModelLoadStatus() {
        // HandPose 모델 로드 상태 확인
        if !self.isHandPoseModelLoaded {
            // 여기서는 단순히 모델이 사용 가능한지 확인합니다
            self.isHandPoseModelLoaded = true // 현재는 항상 사용 가능하다고 가정
            print("[NailProcessor] 손 포즈 모델 로드 상태: \(self.isHandPoseModelLoaded)")
        }
        
        // 세그멘테이션 모델 로드 상태 확인
        if !self.isSegmentationModelLoaded {
            let segmentationLoaded = self.imageSegmenter.isModelLoaded()
            if segmentationLoaded {
                self.isSegmentationModelLoaded = true
                print("[NailProcessor] 세그멘테이션 모델 로드됨")
                
                // 세그멘테이션 모델이 로드되었고, 네일 이미지도 로드되었다면 강제로 상태 업데이트
                if self.areNailImagesLoaded {
                    print("[NailProcessor] 세그멘테이션 모델 로드 완료 후 네일 이미지도 확인됨, 강제 이벤트 발송")
                    
                    // 약간 지연시켜 다른 작업이 완료될 시간을 줌
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                        let allLoaded = self.areAllResourcesLoaded()
                        print("[NailProcessor] 모든 리소스 로드 완료 여부(세그멘테이션 후): \(allLoaded)")
                        self.onResourceLoadStatusChanged?(allLoaded)
                    }
                }
            }
        }
        
        self.checkResourceLoadStatus()
    }
    
    // 세그멘테이션 모델 상태를 외부에서 직접 업데이트하는 메서드
    func updateSegmentationModelStatus(_ isLoaded: Bool) {
        // 이전 상태와 비교
        let previousState = self.isSegmentationModelLoaded
        
        // 상태 업데이트
        self.isSegmentationModelLoaded = isLoaded
        
        print("[NailProcessor] 세그멘테이션 모델 상태 직접 업데이트: \(isLoaded) (이전: \(previousState))")
        
        // 상태가 변경된 경우에만 리소스 로드 상태 재확인
        if previousState != isLoaded {
            DispatchQueue.main.async {
                self.checkResourceLoadStatus()
            }
        }
    }
    
    // 모든 리소스 로드 상태 확인
    private func checkResourceLoadStatus() {
        let isLoaded = areAllResourcesLoaded()
        print("[NailProcessor] 리소스 로드 상태 확인: \(isLoaded)")
        
        // 상태가 변경되었을 때만 콜백 호출
        DispatchQueue.main.async {
            print("[NailProcessor] 리소스 로드 상태 변경 이벤트 발송: \(isLoaded)")
            self.onResourceLoadStatusChanged?(isLoaded)
        }
    }
    
    // 모든 리소스가 로드되었는지 확인
    func areAllResourcesLoaded() -> Bool {
        let nailsLoaded = areNailImagesLoaded
        let handPoseLoaded = isHandPoseModelLoaded
        let segmentationLoaded = isSegmentationModelLoaded
        
        print("[NailProcessor] 리소스 상태 - 네일: \(nailsLoaded), 손포즈: \(handPoseLoaded), 세그멘테이션: \(segmentationLoaded)")
        
        return nailsLoaded && handPoseLoaded && segmentationLoaded
    }
    
    // MARK: - NailProcessing 프로토콜 구현
    
    /// 원본 이미지에 네일 오버레이를 적용하는 최종 작업을 수행합니다.
    func processNailOverlay(for image: UIImage, completion: @escaping (UIImage?, Error?) -> Void) {
        let startTime = CACurrentMediaTime()
        
        // processImage 내부에서 세그멘테이션, 손 포즈 감지, 컨투어 추출 및 메트릭스 분석을 모두 진행
        processImage(image) { [weak self] segmentedImage, observations, error in
            guard let self = self else { return }
            if let error = error {
                print("[NailProcessor] 처리 에러: \(error)")
                completion(nil, error)
                return
            }
            guard let segmentedImage = segmentedImage,
                  let handObservations = observations, !handObservations.isEmpty else {
                let error = NSError(domain: "NailProcessor", code: -1, userInfo: [NSLocalizedDescriptionKey: "세그멘테이션 또는 손 포즈 감지 결과가 없습니다"])
                completion(nil, error)
                return
            }
            
            // 세그멘테이션 이미지를 원본 이미지 크기에 맞게 리사이즈
            print("[NailProcessor] 원본 이미지 크기: \(image.size), 세그멘테이션 이미지 크기: \(segmentedImage.size)")
            
            // UIGraphicsImageRenderer 사용
            let renderer = UIGraphicsImageRenderer(size: image.size)
            let resizedSegmentedImage = renderer.image { _ in
                segmentedImage.draw(in: CGRect(origin: .zero, size: image.size))
            }
            
            print("[NailProcessor] 리사이즈된 세그멘테이션 이미지 크기: \(resizedSegmentedImage.size)")
            
            // 컨투어 추출 (세그멘테이션 이미지가 필요)
            let contours = self.contourAnalyzer.extractContours(from: resizedSegmentedImage)
            if contours.isEmpty {
                let error = NSError(domain: "NailProcessor", code: -2, userInfo: [NSLocalizedDescriptionKey: "유효한 컨투어가 없습니다"])
                completion(nil, error)
                return
            }
            
            // 네일 이미지 생성 - 원본 이미지와 세그멘테이션 마스크를 함께 사용
            let finalImage = self.composeFinalImage(
                originalImage: image,
                segmentedImage: resizedSegmentedImage,
                handObservations: handObservations,
                contours: contours
            )
            
            self.lastProcessingTime = (CACurrentMediaTime() - startTime) * 1000
            print("[NailProcessor] 총 처리 시간: \(self.lastProcessingTime) ms")
            completion(finalImage, nil)
        }
    }
    
    /// 이미지에서 세그멘테이션과 손 포즈 감지를 동시에 수행하고 결과를 반환합니다.
    func processImage(_ image: UIImage, completion: @escaping (UIImage?, [VNHumanHandPoseObservation]?, Error?) -> Void) {
        print("[NailProcessor] 이미지 프로세싱 시작")
        
        var isCompleted = false
        
        var segmentationResult: UIImage?
        var segmentationError: Error?
        let segmentationGroup = DispatchGroup()
        
        segmentationGroup.enter()
        imageSegmenter.processImage(image) { result, error in
            segmentationResult = result
            segmentationError = error
            segmentationGroup.leave()
        }
        
        var handPoseObservations: [VNHumanHandPoseObservation]?
        var handPoseError: Error?
        let handPoseGroup = DispatchGroup()
        
        handPoseGroup.enter()
        handPoseDetector.detectHandPose(on: image) { observations, error in
            handPoseObservations = observations
            handPoseError = error
            handPoseGroup.leave()
        }
        
        let processingQueue = DispatchQueue.global(qos: .userInitiated)
        
        let timeoutTimer = DispatchSource.makeTimerSource(queue: processingQueue)
        timeoutTimer.setEventHandler {
            if !isCompleted {
                isCompleted = true
                print("[NailProcessor] 처리 타임아웃")
                completion(nil, nil, NSError(domain: "NailProcessor", code: -3, userInfo: [NSLocalizedDescriptionKey: "처리 시간이 초과되었습니다"]))
            }
            timeoutTimer.cancel()
        }
        timeoutTimer.schedule(deadline: .now() + 10.0)
        timeoutTimer.resume()
        
        processingQueue.async {
            segmentationGroup.wait()
            handPoseGroup.wait()
            timeoutTimer.cancel()
            if isCompleted { return }
            isCompleted = true
            
            if let error = segmentationError {
                print("[NailProcessor] 세그멘테이션 에러: \(error)")
                completion(nil, nil, error)
                return
            }
            if let error = handPoseError {
                print("[NailProcessor] 손 포즈 감지 에러: \(error)")
                completion(nil, nil, error)
                return
            }
            print("[NailProcessor] 세그멘테이션 및 손 포즈 감지 완료")
            completion(segmentationResult, handPoseObservations, nil)
        }
    }
    
    /// 세그멘테이션, 손 포즈 감지, 컨투어와 메트릭스 분석 결과를 통합하여 최종 오버레이 이미지를 생성합니다.
    private func composeFinalImage(
        originalImage: UIImage,
        segmentedImage: UIImage,
        handObservations: [VNHumanHandPoseObservation],
        contours: [(path: UIBezierPath, center: CGPoint)]
    ) -> UIImage? {
        // 1. 먼저 네일 오버레이 이미지 생성 (세그멘테이션 + 손 포즈 + 컨투어 활용)
        let nailImages = prepareNailImages(
            handObservations: handObservations,
            segmentedImage: segmentedImage,
            contours: contours,
            displaySize: originalImage.size
        )
        
        print("[NailProcessor] 네일 이미지 준비 완료, 개수: \(nailImages.count)")
        
        // 2. 최종 이미지 렌더링 (원본 이미지 위에 네일 이미지만 오버레이)
        let renderer = UIGraphicsImageRenderer(size: originalImage.size)
        let finalImage = renderer.image { context in
            // 원본 이미지 그리기
            originalImage.draw(in: CGRect(origin: .zero, size: originalImage.size))
            
            // 각 손가락에 대해 준비된 네일 이미지 그리기
            for (i, nailImage) in nailImages.enumerated() {
                print("[NailProcessor] 네일 이미지 \(i) 그리기 - 위치: \(nailImage.rect), 이미지 유무: \(nailImage.image != nil)")
                nailImage.image?.draw(in: nailImage.rect)
            }
        }
        
        return finalImage
    }
    
    /// 네일 이미지를 준비하고 위치와 함께 반환합니다.
    private func prepareNailImages(
        handObservations: [VNHumanHandPoseObservation],
        segmentedImage: UIImage,
        contours: [(path: UIBezierPath, center: CGPoint)],
        displaySize: CGSize
    ) -> [(image: UIImage?, rect: CGRect)] {
        var nailImages: [(image: UIImage?, rect: CGRect)] = []
        
        print("[NailProcessor] prepareNailImages 시작 - 손 관측 개수: \(handObservations.count), 컨투어 개수: \(contours.count)")
        
        // 각 손 포즈 관측 결과에 대해 처리
        for (handIndex, observation) in handObservations.enumerated() {
            print("[NailProcessor] 손 #\(handIndex) 처리 시작")
            
            // 메트릭스 계산
            let metrics = nailMetricsAnalyzer.calculateAllFingerMetrics(
                observation: observation,
                contours: contours,
                displaySize: displaySize
            )
            
            print("[NailProcessor] 손 #\(handIndex)의 메트릭스 계산 결과 - 손가락 개수: \(metrics.count)")
            
            // 각 손가락에 대해 네일 이미지 준비
            for (fingerIndex, m) in metrics.enumerated() {
                print("[NailProcessor] 손가락 #\(fingerIndex) (\(m.fingerName)) 처리 시작 - 중심점: \(m.contourCenter), 각도: \(m.angle)°, 크기: \(m.width)x\(m.height)")
                
                // 손가락 타입 결정
                var fingerType: NailAssetProvider.FingerType?
                switch m.fingerName {
                case "thumb": fingerType = .thumb
                case "index": fingerType = .index
                case "middle": fingerType = .middle
                case "ring": fingerType = .ring
                case "pinky": fingerType = .pinky
                default: continue
                }
                
                guard let fingerType = fingerType else { continue }
                
                print("[NailProcessor] 손가락 타입: \(fingerType)")
                
                // 네일 정보 및 이미지 가져오기
                guard let nailInfo = nailAssetProvider.getNailSetForFingerType(fingerType) else {
                    print("[NailProcessor] \(fingerType) 네일 정보 없음")
                    continue
                }
                
                // 저장된 이미지가 있으면 바로 사용
                if let savedImage = nailInfo.image {
                    print("[NailProcessor] 저장된 \(fingerType) 네일 이미지 사용")
                    processNailImage(
                        savedImage, 
                        fingerType: fingerType,
                        metrics: m,
                        contours: contours,
                        displaySize: displaySize,
                        nailImages: &nailImages,
                        metrics: metrics
                    )
                    continue
                }
                
                // 저장된 이미지가 없으면 로드 (비동기식 -> 세마포어로 동기화)
                let semaphore = DispatchSemaphore(value: 0)
                var loadedImage: UIImage?
                
                nailAssetProvider.loadNailImage(for: fingerType) { nailImage in
                    loadedImage = nailImage
                    semaphore.signal()
                }
                
                // 최대 1초 대기 (이미 캐시에 있거나 preload 되었을 가능성이 높음)
                let waitResult = semaphore.wait(timeout: .now() + 1.0)
                
                if waitResult == .timedOut {
                    print("[NailProcessor] \(fingerType) 네일 이미지 로드 시간 초과")
                    continue
                }
                
                guard let nailImage = loadedImage else {
                    print("[NailProcessor] \(fingerType) 네일 이미지 로드 실패")
                    continue
                }
                
                processNailImage(
                    nailImage, 
                    fingerType: fingerType,
                    metrics: m,
                    contours: contours,
                    displaySize: displaySize,
                    nailImages: &nailImages,
                    metrics: metrics
                )
            }
        }
        
        print("[NailProcessor] 네일 이미지 준비 완료 - 개수: \(nailImages.count)")
        
        return nailImages
    }
    
    /// 네일 이미지 처리 로직을 별도 메서드로 분리
    private func processNailImage(
        _ nailImage: UIImage,
        fingerType: NailAssetProvider.FingerType,
        metrics m: NailMetrics,
        contours: [(path: UIBezierPath, center: CGPoint)],
        displaySize: CGSize,
        nailImages: inout [(image: UIImage?, rect: CGRect)],
        metrics: [NailMetrics] = []
    ) {
        print("[NailProcessor] \(fingerType) 네일 이미지 처리 - 크기: \(nailImage.size)")
        
        // 1. 손가락 너비에 맞춰 크기 조정 (네일 모양에 따라 비율 조정)
        var widthRatio: CGFloat = 512/170
        var heightRatio: CGFloat = 512/374
        
        // 네일 모양에 따라 크기 조정 비율 변경
        if let nailInfo = nailAssetProvider.getNailSetForFingerType(fingerType) {
            switch nailInfo.shape {
            case .square:
                widthRatio = 512/194  // 512/174
                heightRatio = 512/374
            case .round:
                widthRatio = 512/195  // 512/185
                heightRatio = 512/373
            case .almond:
                widthRatio = 512/190  // 512/170
                heightRatio = 512/376
            case .ballerina:
                widthRatio = 512/146  // 512/146
                heightRatio = 512/374
            case .stiletto:
                widthRatio = 512/134   // 512/134
                heightRatio = 512/377
            }
            
            print("[NailProcessor] 네일 모양: \(nailInfo.shape), 비율 조정: \(widthRatio)x\(heightRatio)")
        }
        
        // 엄지 크기 보정 - 엄지일 경우 특별 처리
        var adjustedWidth = m.width
        var adjustedHeight = m.height
        
        if fingerType == .thumb {
            // 엄지와 검지의 크기 비교를 위해 검지 메트릭스 찾기
            var indexMetrics: NailMetrics?
            for metric in metrics {
                if metric.fingerName == "index" {
                    indexMetrics = metric
                    break
                }
            }
            
            // 검지가 있고, 엄지가 검지보다 40% 이상 작다면 검지 크기 사용
            if let indexMetrics = indexMetrics {
                let thumbWidth = m.width
                let thumbHeight = m.height
                let indexWidth = indexMetrics.width
                let indexHeight = indexMetrics.height
                
                let widthDiff = abs(thumbWidth - indexWidth) / max(thumbWidth, indexWidth)
                let heightDiff = abs(thumbHeight - indexHeight) / max(thumbHeight, indexHeight)
                
                if (thumbWidth < indexWidth && widthDiff > 0.4) || (thumbHeight < indexHeight && heightDiff > 0.4) {
                    print("[NailProcessor] 엄지 크기 보정 적용 - 원본: \(thumbWidth)x\(thumbHeight), 보정: \(indexWidth)x\(indexHeight)")
                    adjustedWidth = indexMetrics.width
                    adjustedHeight = indexMetrics.height
                }
            }
        }
        
        let scaledSize = CGSize(
            width: adjustedWidth * widthRatio,
            height: adjustedHeight * heightRatio
        )
        
        print("[NailProcessor] 조정된 크기: \(scaledSize)")
        
        // 2. 높이 기준으로 최대 크기 제한
        let maxHeight: CGFloat
        
        // 네일 모양에 따라 최대 높이 조정
        if let nailInfo = nailAssetProvider.getNailSetForFingerType(fingerType) {
            let baseHeight: CGFloat
            switch nailInfo.shape {
            case .square:
                baseHeight = 374
            case .round:
                baseHeight = 373
            case .almond:
                baseHeight = 376
            case .ballerina:
                baseHeight = 374
            case .stiletto:
                baseHeight = 377
            }
            
            // 원본 이미지 크기(512) 대비 실제 네일 높이의 비율로 최대 높이 계산
            let scaleFactor = baseHeight / 512.0
            maxHeight = displaySize.height * scaleFactor * 1.1  // 10% 여유 추가
        } else {
            // 기본값 설정 (엄지 기준)
            maxHeight = displaySize.height * (374.0 / 512.0) * 1.1
        }
        
        // 높이 제한 적용 후 너비는 비율에 맞게 조정
        let limitedHeight = min(scaledSize.height, maxHeight)
        let finalWidth = limitedHeight * (scaledSize.width / scaledSize.height)
        
        let finalScaledSize = CGSize(width: finalWidth, height: limitedHeight)
        
        // 3. 해당 컨투어 찾기
        guard let fingertipContour = findContourForFingertip(metrics: m, contours: contours) else {
            print("[NailProcessor] 해당 손가락에 맞는 컨투어를 찾을 수 없습니다")
            return
        }
        
        // 4. 네일 이미지를 적용할 영역 계산
        let imageRect = CGRect(
            x: m.contourCenter.x - finalScaledSize.width / 2,
            y: m.contourCenter.y - finalScaledSize.height / 2,
            width: finalScaledSize.width,
            height: finalScaledSize.height > finalScaledSize.width * 1.5 ? finalScaledSize.width * 1.2 : finalScaledSize.height
        )
        
        // 5. 회전된 네일 이미지 생성
        UIGraphicsBeginImageContextWithOptions(finalScaledSize, false, 0.0)
        guard let rotationContext = UIGraphicsGetCurrentContext() else {
            print("[NailProcessor] 회전 컨텍스트 생성 실패")
            return
        }
        
        // 회전 적용
        let angle = m.angle * .pi / 180
        rotationContext.translateBy(x: finalScaledSize.width / 2, y: finalScaledSize.height / 2)
        rotationContext.rotate(by: angle)
        rotationContext.translateBy(x: -finalScaledSize.width / 2, y: -finalScaledSize.height / 2)
        
        // 네일 이미지 그리기
        nailImage.draw(in: CGRect(origin: .zero, size: finalScaledSize))
        
        // 회전된 이미지 가져오기
        guard let rotatedNailImage = UIGraphicsGetImageFromCurrentImageContext() else {
            print("[NailProcessor] 회전된 이미지 생성 실패")
            UIGraphicsEndImageContext()
            return
        }
        UIGraphicsEndImageContext()
        
        // 6. 컨투어를 마스크로 사용하여 네일 이미지 적용
        UIGraphicsBeginImageContextWithOptions(displaySize, false, 0.0)
        guard let maskContext = UIGraphicsGetCurrentContext() else {
            print("[NailProcessor] 마스크 컨텍스트 생성 실패")
            return
        }
        
        // 마스크 영역 생성 (투명 배경)
        maskContext.setFillColor(UIColor.clear.cgColor)
        maskContext.fill(CGRect(origin: .zero, size: displaySize))
        
        // 컨투어 영역 채우기 (클리핑 마스크로 사용)
        maskContext.saveGState()
        maskContext.addPath(fingertipContour.path.cgPath)
        maskContext.clip()
        
        // 회전된 네일 이미지 그리기
        rotatedNailImage.draw(in: imageRect)
        maskContext.restoreGState()
        
        // 최종 마스킹된 이미지 생성
        guard let maskedImage = UIGraphicsGetImageFromCurrentImageContext() else {
            print("[NailProcessor] 마스킹된 이미지 생성 실패")
            UIGraphicsEndImageContext()
            return
        }
        UIGraphicsEndImageContext()
        
        // 7. 최종 이미지와 위치 정보를 배열에 추가
        nailImages.append((image: maskedImage, rect: CGRect(origin: .zero, size: displaySize)))
        print("[NailProcessor] 네일 이미지 추가 완료 - 총 \(nailImages.count)개")
    }
    
    /// 특정 손가락 끝에 맞는 컨투어를 찾습니다.
    private func findContourForFingertip(metrics: NailMetrics, contours: [(path: UIBezierPath, center: CGPoint)]) -> (path: UIBezierPath, center: CGPoint)? {
        // 이미 메트릭스 계산 시 가장 가까운 컨투어를 찾아 중심점을 계산하므로
        // 중심점이 가장 가까운 컨투어를 반환
        
        var closestContour: (path: UIBezierPath, center: CGPoint)?
        var minDistance: CGFloat = CGFloat.greatestFiniteMagnitude
        
        for contour in contours {
            let distance = hypot(contour.center.x - metrics.contourCenter.x, contour.center.y - metrics.contourCenter.y)
            if distance < minDistance {
                minDistance = distance
                closestContour = contour
            }
        }
        
        // 거리가 너무 멀면 유효하지 않은 것으로 판단
        if minDistance > 50 {
            return nil
        }
        
        return closestContour
    }
}
