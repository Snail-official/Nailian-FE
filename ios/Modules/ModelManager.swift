import Foundation
import React
import ZIPFoundation

@objc(ModelManager)
class ModelManager: RCTEventEmitter {
    
    // 현재 다운로드 중인 작업 관리를 위한 Dictionary
    private var downloadTasks: [String: URLSessionDownloadTask] = [:]
    
    // 모델 저장 경로
    private let modelBaseDirectory: URL
    
    // 초기화
    override init() {
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        modelBaseDirectory = documentsDirectory.appendingPathComponent("Models", isDirectory: true)
        
        super.init()
        
        do {
            try FileManager.default.createDirectory(at: modelBaseDirectory, withIntermediateDirectories: true)
        } catch {
            print("Models 디렉토리 생성 실패: \(error)")
        }
    }
    
    // 모델 타입에 따른 모델 디렉토리 경로 반환
    private func modelDirectory(for modelType: String) -> URL {
        return modelBaseDirectory.appendingPathComponent(modelType, isDirectory: true)
    }
    
    // 모델 타입에 따른 ZIP 파일 경로 반환
    private func zipFilePath(for modelType: String) -> URL {
        return modelBaseDirectory.appendingPathComponent("\(modelType).zip")
    }
    
    // 브릿지에서 필요한 메소드 - 항상 메인 큐에서 초기화
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // 지원하는 이벤트 목록
    override func supportedEvents() -> [String]! {
        return ["ModelDownloadProgress", "ModelDownloadComplete", "ModelDownloadError"]
    }
    
    // 모델 파일이 존재하는지 확인
    private func isModelDownloaded(modelType: String) -> Bool {
        let modelDir = modelDirectory(for: modelType)
        if !FileManager.default.fileExists(atPath: modelDir.path) {
            return false
        }
        let directoryContents = try? FileManager.default.contentsOfDirectory(at: modelDir, includingPropertiesForKeys: nil)
        return (directoryContents?.count ?? 0) > 0
    }
    
    /**
     * 디렉토리 내의 모든 파일과 하위 디렉토리를 재귀적으로 찾는 함수
     */
    private func findAllFiles(in directory: URL) throws -> [URL] {
        let fileManager = FileManager.default
        let resourceKeys: [URLResourceKey] = [.isDirectoryKey]
        
        let directoryContents = try fileManager.contentsOfDirectory(
            at: directory,
            includingPropertiesForKeys: resourceKeys,
            options: .skipsHiddenFiles
        )
        
        var result: [URL] = []
        
        for fileURL in directoryContents {
            result.append(fileURL)
            
            // 디렉토리인지 확인
            let resourceValues = try fileURL.resourceValues(forKeys: Set(resourceKeys))
            if resourceValues.isDirectory == true {
                // 재귀적으로 하위 디렉토리 탐색
                let subDirFiles = try findAllFiles(in: fileURL)
                result.append(contentsOf: subDirFiles)
            }
        }
        
        return result
    }
    
    /**
     * 모델 다운로드 및 설치
     *
     * @param modelUrl 모델 다운로드 URL
     * @param modelType 모델 타입 (segmentation, detection 등)
     */
    @objc func preloadModel(_ modelUrl: String, modelType: String,
                         resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let url = URL(string: modelUrl) else {
            rejecter("INVALID_URL", "유효하지 않은 URL입니다: \(modelUrl)", nil)
            return
        }
        
        if downloadTasks[modelType] != nil {
            rejecter("DOWNLOAD_IN_PROGRESS", "이미 \(modelType) 모델 다운로드가 진행 중입니다", nil)
            return
        }
        
        let zipFilePath = self.zipFilePath(for: modelType)
        let config = URLSessionConfiguration.default
        let session = URLSession(configuration: config, delegate: self, delegateQueue: OperationQueue.main)
        
        let downloadTask = session.downloadTask(with: url) { [weak self] (tempLocalUrl, response, error) in
            guard let self = self else { return }
            self.downloadTasks.removeValue(forKey: modelType)
            
            if let error = error {
                self.sendEvent(withName: "ModelDownloadError", body: ["modelType": modelType, "error": error.localizedDescription])
                rejecter("DOWNLOAD_FAILED", "모델 다운로드에 실패했습니다: \(error.localizedDescription)", error)
                return
            }
            
            guard let tempLocalUrl = tempLocalUrl, let response = response as? HTTPURLResponse else {
                self.sendEvent(withName: "ModelDownloadError", body: ["modelType": modelType, "error": "Invalid response"])
                rejecter("INVALID_RESPONSE", "유효하지 않은 응답", nil)
                return
            }
            
            if response.statusCode != 200 {
                self.sendEvent(withName: "ModelDownloadError", body: ["modelType": modelType, "error": "HTTP status: \(response.statusCode)"])
                rejecter("HTTP_ERROR", "HTTP 오류: \(response.statusCode)", nil)
                return
            }
            
            do {
                try FileManager.default.moveItem(at: tempLocalUrl, to: zipFilePath)
                try self.extractModel(zipFilePath: zipFilePath, modelType: modelType)
                try FileManager.default.removeItem(at: zipFilePath)
                self.sendEvent(withName: "ModelDownloadComplete", body: ["modelType": modelType, "success": true])
                resolver(true)
            } catch {
                self.sendEvent(withName: "ModelDownloadError", body: ["modelType": modelType, "error": error.localizedDescription])
                rejecter("INSTALL_FAILED", "모델 설치에 실패했습니다: \(error.localizedDescription)", error)
            }
        }
        
        downloadTask.resume()
        downloadTasks[modelType] = downloadTask
    }
    
    /**
     * ZIP 파일에서 모델 압축 해제 및 구조 검증/조정
     */
    private func extractModel(zipFilePath: URL, modelType: String) throws {
        let modelDir = modelDirectory(for: modelType)
        let fileManager = FileManager.default
        
        if fileManager.fileExists(atPath: modelDir.path) {
            try fileManager.removeItem(at: modelDir)
        }
        
        try fileManager.createDirectory(at: modelDir, withIntermediateDirectories: true)
        let mlpakageName = "\(modelType)_model.mlpackage"
        let mlpakagePath = modelDir.appendingPathComponent(mlpakageName)
        
        if !fileManager.fileExists(atPath: mlpakagePath.path) {
            try fileManager.createDirectory(at: mlpakagePath, withIntermediateDirectories: true)
        }
        
        let tmpExtractDir = modelDir.appendingPathComponent("_tmp_extract")
        if fileManager.fileExists(atPath: tmpExtractDir.path) {
            try fileManager.removeItem(at: tmpExtractDir)
        }
        try fileManager.createDirectory(at: tmpExtractDir, withIntermediateDirectories: true)
        
        try fileManager.unzipItem(at: zipFilePath, to: tmpExtractDir)
        let allFiles = try findAllFiles(in: tmpExtractDir)
        
        // 복잡한 표현식을 분해
        var manifestFiles: [URL] = []
        var dataFolders: [URL] = []
        var mlpakagePackages: [URL] = []
        
        for fileURL in allFiles {
            let lastPathComponent = fileURL.lastPathComponent
            let pathExtension = fileURL.pathExtension.lowercased()
            let resourceValues = try? fileURL.resourceValues(forKeys: [.isDirectoryKey])
            let isDirectory = resourceValues?.isDirectory ?? false
            
            if lastPathComponent == "Manifest.json" {
                manifestFiles.append(fileURL)
            }
            
            if lastPathComponent == "Data" && isDirectory {
                dataFolders.append(fileURL)
            }
            
            if pathExtension == "mlpakage" && isDirectory {
                mlpakagePackages.append(fileURL)
            }
        }
        
        if !mlpakagePackages.isEmpty {
            let sourcePackage = mlpakagePackages.first!
            let packageContents = try fileManager.contentsOfDirectory(at: sourcePackage, includingPropertiesForKeys: nil)
            
            // 복잡한 표현식을 분해
            var hasManifest = false
            var hasDataFolder = false
            
            for item in packageContents {
                let lastPathComponent = item.lastPathComponent
                let resourceValues = try? item.resourceValues(forKeys: [.isDirectoryKey])
                let isDirectory = resourceValues?.isDirectory ?? false
                
                if lastPathComponent == "Manifest.json" {
                    hasManifest = true
                }
                
                if lastPathComponent == "Data" && isDirectory {
                    hasDataFolder = true
                }
            }
            
            if hasManifest && hasDataFolder {
                if fileManager.fileExists(atPath: mlpakagePath.path) {
                    try fileManager.removeItem(at: mlpakagePath)
                }
                try fileManager.copyItem(at: sourcePackage, to: mlpakagePath)
            } else {
                try constructModelPackage(
                    manifestFiles: manifestFiles,
                    dataFolders: dataFolders,
                    destinationPath: mlpakagePath
                )
            }
        } else {
            try constructModelPackage(
                manifestFiles: manifestFiles,
                dataFolders: dataFolders,
                destinationPath: mlpakagePath
            )
        }
        
        try fileManager.removeItem(at: tmpExtractDir)
        
        if fileManager.fileExists(atPath: mlpakagePath.path) {
            let contents = try fileManager.contentsOfDirectory(at: mlpakagePath, includingPropertiesForKeys: nil)
            
            // 복잡한 표현식을 분해
            var hasManifest = false
            var hasDataFolder = false
            
            for item in contents {
                let lastPathComponent = item.lastPathComponent
                let resourceValues = try? item.resourceValues(forKeys: [.isDirectoryKey])
                let isDirectory = resourceValues?.isDirectory ?? false
                
                if lastPathComponent == "Manifest.json" {
                    hasManifest = true
                }
                
                if lastPathComponent == "Data" && isDirectory {
                    hasDataFolder = true
                }
            }
            
            if !(hasManifest && hasDataFolder) {
                throw NSError(domain: "ModelInstallError", code: 1001, userInfo: [
                    NSLocalizedDescriptionKey: "모델 패키지 구조가 올바르지 않습니다."
                ])
            }
        } else {
            throw NSError(domain: "ModelInstallError", code: 1002, userInfo: [
                NSLocalizedDescriptionKey: "모델 패키지를 생성하지 못했습니다."
            ])
        }
    }
    
    /**
     * 분산된 구성 요소로 .mlpakage 패키지 구성
     */
    private func constructModelPackage(manifestFiles: [URL], dataFolders: [URL], destinationPath: URL) throws {
        let fileManager = FileManager.default
        
        if !fileManager.fileExists(atPath: destinationPath.path) {
            try fileManager.createDirectory(at: destinationPath, withIntermediateDirectories: true)
        }
        
        if let manifestFile = manifestFiles.first {
            let destManifestPath = destinationPath.appendingPathComponent("Manifest.json")
            try fileManager.copyItem(at: manifestFile, to: destManifestPath)
        } else {
            let basicManifest = """
            {
                "modelType": "MLModel",
                "author": "Nailian App",
                "license": "Proprietary",
                "version": "1.0",
                "shortDescription": "Auto-generated manifest",
                "inputDescriptions": {},
                "outputDescriptions": {}
            }
            """
            let destManifestPath = destinationPath.appendingPathComponent("Manifest.json")
            try basicManifest.write(to: destManifestPath, atomically: true, encoding: .utf8)
        }
        
        if let dataFolder = dataFolders.first {
            let destDataPath = destinationPath.appendingPathComponent("Data", isDirectory: true)
            if fileManager.fileExists(atPath: destDataPath.path) {
                try fileManager.removeItem(at: destDataPath)
            }
            try fileManager.copyItem(at: dataFolder, to: destDataPath)
        } else {
            let destDataPath = destinationPath.appendingPathComponent("Data", isDirectory: true)
            try fileManager.createDirectory(at: destDataPath, withIntermediateDirectories: true)
        }
    }
    
    /**
     * 모델 로드 상태 확인
     */
    @objc func getModelLoadStatus(_ modelType: String,
                              resolver: @escaping RCTPromiseResolveBlock,
                              rejecter: @escaping RCTPromiseRejectBlock) {
        
        if downloadTasks[modelType] != nil {
            resolver("downloading")
            return
        }
        
        if isModelDownloaded(modelType: modelType) {
            resolver("loaded")
            return
        }
        
        resolver("not_loaded")
    }
    
    /**
     * 다운로드한 모델 파일의 경로 반환
     * Native 코드에서 모델을 로드할 때 이 경로를 사용
     */
    @objc func getModelPath(_ modelType: String,
                         resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        
        let modelDir = modelDirectory(for: modelType)
        
        if !isModelDownloaded(modelType: modelType) {
            rejecter("MODEL_NOT_FOUND", "모델 파일을 찾을 수 없습니다: \(modelType)", nil)
            return
        }
        
        do {
            let contents = try FileManager.default.contentsOfDirectory(
                at: modelDir,
                includingPropertiesForKeys: nil,
                options: [.skipsHiddenFiles]
            )
            
            for item in contents {
                let fileExtension = item.pathExtension.lowercased()
                if fileExtension == "mlpakage" || fileExtension == "mlmodel" || fileExtension == "bin" {
                    resolver(item.path)
                    return
                }
            }
            
            if !contents.isEmpty {
                resolver(contents[0].path)
                return
            }
            
            rejecter("MODEL_FILE_NOT_FOUND", "모델 디렉토리에 적합한 모델 파일이 없습니다", nil)
        } catch {
            rejecter("READ_ERROR", "모델 디렉토리 읽기 오류: \(error.localizedDescription)", error)
        }
    }
    
    /**
     * AsyncStorage에서 저장된 모델 정보 로드를 위한 디렉토리 확인
     */
    @objc func getDocumentsDirectory(_ resolver: @escaping RCTPromiseResolveBlock,
                                   _ rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let fileManager = FileManager.default
                let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
                
                print("📁 Documents 디렉토리 경로: \(documentsDirectory.path)")
                
                // 디렉토리 내용 가져오기
                let contents = try fileManager.contentsOfDirectory(at: documentsDirectory, includingPropertiesForKeys: [.isDirectoryKey])
                
                // 파일 이름만 추출
                var fileNames: [String] = []
                for item in contents {
                    fileNames.append(item.lastPathComponent)
                }
                
                // 결과 생성
                let result: [String: Any] = [
                    "path": documentsDirectory.path,
                    "contents": fileNames
                ]
                
                DispatchQueue.main.async {
                    resolver(result)
                }
            } catch {
                print("❌ Documents 디렉토리 조회 실패: \(error)")
                
                DispatchQueue.main.async {
                    rejecter("READ_ERROR", "Documents 디렉토리 조회 중 오류가 발생했습니다: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    /**
     * 지정된 경로의 디렉토리 내용을 가져옴
     */
    @objc func getDirectoryContents(_ path: String,
                                 resolver: @escaping RCTPromiseResolveBlock,
                                 rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let fileManager = FileManager.default
                let directoryURL = URL(fileURLWithPath: path)
                
                print("📁 디렉토리 조회: \(path)")
                
                // 경로가 존재하고 디렉토리인지 확인
                var isDirectory: ObjCBool = false
                if !fileManager.fileExists(atPath: path, isDirectory: &isDirectory) || !isDirectory.boolValue {
                    throw NSError(domain: "DirectoryError", code: 404, userInfo: [
                        NSLocalizedDescriptionKey: "지정된 경로가 존재하지 않거나 디렉토리가 아닙니다."
                    ])
                }
                
                // 디렉토리 내용 가져오기
                let contents = try fileManager.contentsOfDirectory(at: directoryURL, includingPropertiesForKeys: [.isDirectoryKey])
                
                // 파일 이름만 추출
                var fileNames: [String] = []
                for item in contents {
                    fileNames.append(item.lastPathComponent)
                }
                
                // 결과 생성
                let result: [String: Any] = [
                    "path": path,
                    "contents": fileNames
                ]
                
                DispatchQueue.main.async {
                    resolver(result)
                }
            } catch {
                print("❌ 디렉토리 조회 실패: \(error)")
                
                DispatchQueue.main.async {
                    rejecter("READ_ERROR", "디렉토리 조회 중 오류가 발생했습니다: \(error.localizedDescription)", error)
                }
            }
        }
    }
}

// URLSession 다운로드 진행 상황 처리
extension ModelManager: URLSessionDownloadDelegate {
    
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        // 다운로드 완료 처리 로직은 preloadModel의 completionHandler에서 처리됨
    }
    
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didWriteData bytesWritten: Int64, totalBytesWritten: Int64, totalBytesExpectedToWrite: Int64) {
        
        var modelType: String?
        for (type, task) in downloadTasks {
            if task == downloadTask {
                modelType = type
                break
            }
        }
        
        guard let modelType = modelType else { return }
        
        var progress: Int = 0
        if totalBytesExpectedToWrite > 0 {
            progress = Int((Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)) * 100)
        }
        
        self.sendEvent(withName: "ModelDownloadProgress", body: ["modelType": modelType, "progress": progress])
    }
}
