import UIKit

/// 네일 에셋 제공 서비스를 위한 프로토콜
protocol NailAssetProviding {
    /// 손가락 타입 (enum 타입은 프로토콜에서 직접 정의할 수 없어 연관 타입으로 선언)
    associatedtype FingerTypeEnum: RawRepresentable & Hashable where FingerTypeEnum.RawValue == Int
    
    /// 네일 형태 타입 (enum 타입은 프로토콜에서 직접 정의할 수 없어 연관 타입으로 선언)
    associatedtype NailShapeEnum: RawRepresentable where NailShapeEnum.RawValue == Int
    
    /// 네일 정보 구조체 타입
    associatedtype NailInfoType
    
    /// 네일 세트 정보를 저장하는 딕셔너리
    var nailSets: [FingerTypeEnum: NailInfoType] { get set }
    
    /// 네일 세트 데이터 설정
    func setNailSet(_ nailSetDict: [String: Any])
    
    /// 특정 손가락 타입의 네일 정보 반환
    func getNailSetForFingerType(_ fingerType: FingerTypeEnum) -> NailInfoType?
    
    /// 네일 이미지 로딩 (비동기식)
    func loadNailImage(for fingerType: FingerTypeEnum, completion: @escaping (UIImage?) -> Void)
    
    /// 네일 이미지 다운로드 (정적 메서드)
    static func downloadImage(from urlString: String, completion: @escaping (UIImage?) -> Void)
} 
