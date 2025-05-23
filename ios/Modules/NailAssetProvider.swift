import UIKit

class NailAssetProvider: NailAssetProviding {
    // 타입 별칭으로 프로토콜의 관련 타입 정의
    typealias FingerTypeEnum = FingerType
    typealias NailShapeEnum = NailShape
    typealias NailInfoType = NailInfo
    
    // 싱글톤 인스턴스
    static let shared = NailAssetProvider()
    
    // 손가락 타입 정의
    enum FingerType: Int, CaseIterable {
        case thumb = 0
        case index = 1
        case middle = 2
        case ring = 3
        case pinky = 4
        
        func toString() -> String {
            switch self {
            case .thumb: return "thumb"
            case .index: return "index"
            case .middle: return "middle"
            case .ring: return "ring"
            case .pinky: return "pinky"
            }
        }
    }
    
    // 네일 모양 타입 정의
    enum NailShape: Int {
        case square = 0
        case round = 1
        case almond = 2
        case ballerina = 3
        case stiletto = 4
        
        func toString() -> String {
            switch self {
            case .square: return "SQUARE"
            case .round: return "ROUND"
            case .almond: return "ALMOND"
            case .ballerina: return "BALLERINA"
            case .stiletto: return "STILETTO"
            }
        }
        
        static func fromString(_ string: String) -> NailShape {
            switch string.uppercased() {
            case "SQUARE": return .square
            case "ROUND": return .round
            case "ALMOND": return .almond
            case "BALLERINA": return .ballerina
            case "STILETTO": return .stiletto
            default: return .round
            }
        }
    }
    
    // 네일 세트 정보 구조체
    struct NailInfo {
        let imageUrl: String
        let shape: NailShape
        var image: UIImage?
    }
    
    // 각 손가락 타입별 네일 정보 저장
    var nailSets: [FingerType: NailInfo] = [:]
    
    // 이미지 캐시
    private let imageCache = NSCache<NSString, UIImage>()
    
    private init() {
        // 초기화 코드
    }
    
    // 네일 세트 데이터 설정
    func setNailSet(_ nailSetDict: [String: Any]) {
        for (fingerKey, fingerData) in nailSetDict {
            if let fingerDict = fingerData as? [String: Any],
               let imageUrl = fingerDict["imageUrl"] as? String,
               let shapeStr = fingerDict["shape"] as? String {
                
                let fingerType: FingerType
                switch fingerKey {
                case "thumb": fingerType = .thumb
                case "index": fingerType = .index
                case "middle": fingerType = .middle
                case "ring": fingerType = .ring
                case "pinky": fingerType = .pinky
                default: continue
                }
                
                nailSets[fingerType] = NailInfo(
                    imageUrl: imageUrl,
                    shape: NailShape.fromString(shapeStr)
                )
            }
        }
        
        print("네일 세트 설정 완료: \(nailSets)")
    }
    
    // 특정 손가락 타입의 네일 정보 반환
    func getNailSetForFingerType(_ fingerType: FingerType) -> NailInfo? {
        return nailSets[fingerType]
    }
    
    // 손가락 타입 이름 반환
    func fingerName(_ fingerType: FingerType) -> String {
        switch fingerType {
        case .thumb: return "엄지"
        case .index: return "검지"
        case .middle: return "중지"
        case .ring: return "약지"
        case .pinky: return "소지"
        }
    }
    
    // 네일 모양 이름 반환
    func shapeName(_ shape: NailShape) -> String {
        switch shape {
        case .square: return "스퀘어"
        case .round: return "라운드"
        case .almond: return "아몬드"
        case .ballerina: return "발레리나"
        case .stiletto: return "스틸레토"
        }
    }
    
    // 네일 이미지 다운로드
    static func downloadImage(from urlString: String, completion: @escaping (UIImage?) -> Void) {
        // 캐시된 이미지가 있는지 확인
        let cacheKey = NSString(string: urlString)
        if let cachedImage = shared.imageCache.object(forKey: cacheKey) {
            print("캐시에서 이미지 로드: \(urlString)")
            completion(cachedImage)
            return
        }
        
        // URL 생성
        guard let url = URL(string: urlString) else {
            print("유효하지 않은 URL: \(urlString)")
            completion(nil)
            return
        }
        
        // 네트워크 요청
        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("이미지 다운로드 실패: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion(nil)
                }
                return
            }
            
            guard let data = data, let image = UIImage(data: data) else {
                print("이미지 데이터 변환 실패")
                DispatchQueue.main.async {
                    completion(nil)
                }
                return
            }
            
            // 캐시에 저장
            shared.imageCache.setObject(image, forKey: cacheKey)
            print("이미지 다운로드 및 캐시 성공: \(urlString)")
            
            DispatchQueue.main.async {
                completion(image)
            }
        }
        
        print("이미지 다운로드 시작: \(urlString)")
        task.resume()
    }
    
    // 네일 이미지 로딩 (비동기식 버전 - 캐시 또는 네트워크에서 로드)
    func loadNailImage(for fingerType: FingerType, completion: @escaping (UIImage?) -> Void) {
        // 해당 손가락의 네일 정보 가져오기
        guard let nailInfo = getNailSetForFingerType(fingerType) else {
            print("\(fingerName(fingerType)) 손가락의 네일 정보가 없습니다.")
            completion(nil)
            return
        }
        
        // 캐시된 이미지가 있는지 확인
        let cacheKey = NSString(string: nailInfo.imageUrl)
        if let cachedImage = imageCache.object(forKey: cacheKey) {
            print("캐시에서 이미지 로드: \(nailInfo.imageUrl)")
            completion(cachedImage)
            return
        }
        
        // 네트워크에서 이미지 다운로드
        print("\(fingerName(fingerType)) 손가락 이미지 다운로드 시작")
        NailAssetProvider.downloadImage(from: nailInfo.imageUrl) { image in
            completion(image)
        }
    }
    
    // 네일 이미지 선행 로드 (백그라운드에서 캐시 미리 채우기)
    func preloadNailImages() {
        print("네일 이미지 프리로드 시작")
        
        for fingerType in FingerType.allCases {
            if let nailInfo = getNailSetForFingerType(fingerType) {
                print("\(fingerName(fingerType)) 손가락 이미지 프리로드 시작")
                
                // 이미 캐시에 있는지 확인
                let cacheKey = NSString(string: nailInfo.imageUrl)
                if imageCache.object(forKey: cacheKey) != nil {
                    print("\(fingerName(fingerType)) 손가락 이미지 이미 캐시에 있음")
                    continue
                }
                
                // 비동기 로드 메소드 사용
                loadNailImage(for: fingerType) { image in
                    if image != nil {
                        print("\(self.fingerName(fingerType)) 손가락 이미지 프리로드 성공")
                    } else {
                        print("\(self.fingerName(fingerType)) 손가락 이미지 프리로드 실패")
                    }
                }
            }
        }
    }
}
