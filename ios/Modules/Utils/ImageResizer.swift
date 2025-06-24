//
//  ImageResizer.swift
//  ArExample
//
//  Created by Dnckd0903 on 4/9/25.
//

import UIKit

@objcMembers
class ImageResizer: NSObject {
    static let shared = ImageResizer()
    
    /// 기본 모델 입력 크기
    let modelInputSize = CGSize(width: 800, height: 800)
    
    /// 모델 입력용 이미지 리사이즈 함수.
    ///
    /// - Parameters:
    ///   - image: 원본 UIImage
    ///   - targetSize: 원하는 크기 (기본값: modelInputSize)
    ///   - preserveAspectRatio: 이미지의 원본 비율을 유지할지 여부
    ///     - true: Detection 모듈에서 요구하는 비율 유지 (800×800 이하로 축소)
    ///     - false: Segmentation 모듈에서 요구하는 강제 리사이즈
    /// - Returns: 리사이즈된 UIImage (실패 시 원본 이미지 반환)
    func resizeImageForModel(_ image: UIImage,
                             targetSize: CGSize? = nil,
                             preserveAspectRatio: Bool = true) -> UIImage {
        let size = targetSize ?? modelInputSize
        
        if preserveAspectRatio {
            let originalSize = image.size
            let widthRatio = size.width / originalSize.width
            let heightRatio = size.height / originalSize.height
            let scaleFactor = min(widthRatio, heightRatio)
            let newSize = CGSize(width: originalSize.width * scaleFactor,
                                 height: originalSize.height * scaleFactor)
            UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0)
            defer { UIGraphicsEndImageContext() }
            image.draw(in: CGRect(origin: .zero, size: newSize))
            if let resizedImage = UIGraphicsGetImageFromCurrentImageContext() {
                return resizedImage
            }
            return image
        } else {
            UIGraphicsBeginImageContextWithOptions(size, false, 0.0)
            defer { UIGraphicsEndImageContext() }
            image.draw(in: CGRect(origin: .zero, size: size))
            if let resizedImage = UIGraphicsGetImageFromCurrentImageContext() {
                return resizedImage
            }
            return image
        }
    }
    
    /// 디스플레이용 이미지 리사이즈 함수.
    ///
    /// - Parameters:
    ///   - image: 원본 UIImage
    ///   - maxDimension: 최대 치수 (기본값: 1024)
    /// - Returns: 리사이즈된 UIImage (실패 시 원본 이미지 반환)
    func resizeImageForDisplay(_ image: UIImage, maxDimension: CGFloat = 1024.0) -> UIImage {
        let originalSize = image.size
        let widthRatio = maxDimension / originalSize.width
        let heightRatio = maxDimension / originalSize.height
        let scale = min(widthRatio, heightRatio)
        if scale >= 1.0 { return image }
        let newSize = CGSize(width: originalSize.width * scale, height: originalSize.height * scale)
        UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0)
        defer { UIGraphicsEndImageContext() }
        image.draw(in: CGRect(origin: .zero, size: newSize))
        if let resizedImage = UIGraphicsGetImageFromCurrentImageContext() {
            return resizedImage
        }
        return image
    }
}

