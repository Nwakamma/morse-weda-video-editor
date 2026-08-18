import ExpoModulesCore

// Expect the :app:shared Kotlin/Native framework to be available in the example app.
// On macOS, run ./gradlew :app:shared:assembleSharedReleaseFrameworkIosArm64 (or simulator)
// and embed the produced Shared.framework in the example app.
#if canImport(Shared)
import Shared
#endif

public class MorseWedaVideoEditorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MorseWedaVideoEditor")

    Events(
      "onExportProgress",
      "onExportComplete",
      "onExportError"
    )

    View(MorseWedaVideoEditorView.self) {
      Prop("licenseKey") { (view: MorseWedaVideoEditorView, key: String?) in
        #if canImport(Shared)
        if let key = key {
          LicenseGate.shared.setLicenseKey(key: key)
        }
        #endif
      }
    }

    Function("setLicenseCheckEnabled") { (enabled: Bool) in
      #if canImport(Shared)
      LicenseGate.shared.setLicenseCheckEnabled(enabled: enabled)
      #endif
    }

    Function("setLicenseKey") { (key: String) in
      #if canImport(Shared)
      LicenseGate.shared.setLicenseKey(key: key)
      #endif
    }

    AsyncFunction("initialize") { (options: [String: Any]) -> Void in
      #if canImport(Shared)
      let licenseKey = options["licenseKey"] as? String ?? ""
      let canCheckLicense = options["canCheckLicense"] as? Bool ?? false

      LicenseGate.shared.setLicenseCheckEnabled(enabled: canCheckLicense)
      if !licenseKey.isEmpty {
        LicenseGate.shared.setLicenseKey(key: licenseKey)
      }

      if canCheckLicense {
        let valid = LicenseGate.shared.checkLicense()
        if !valid {
          throw LicenseInvalidException()
        }
      }
      #else
      throw ModuleNotLinkedException()
      #endif
    }

    AsyncFunction("checkLicense") { () -> Bool in
      #if canImport(Shared)
      return LicenseGate.shared.checkLicense()
      #else
      return false
      #endif
    }

    AsyncFunction("exportVideo") { (timelineJson: String, outputPath: String, options: [String: Any]) -> String in
      #if canImport(Shared)
      let engine = ExportEngineKt.createExportEngine()
      let request = ExportRenderRequest(
        timelineJson: timelineJson,
        outputPath: outputPath,
        format: options["format"] as? String ?? "mp4",
        width: Int32((options["width"] as? NSNumber)?.intValue ?? 1280),
        height: Int32((options["height"] as? NSNumber)?.intValue ?? 720),
        fps: Int32((options["fps"] as? NSNumber)?.intValue ?? 30),
        bitrateMbps: Float((options["bitrateMbps"] as? NSNumber)?.floatValue ?? 8.0),
        isAudioMuted: (options["isAudioMuted"] as? Bool ?? false) ? 1 : 0,
        audioCodec: options["audioCodec"] as? String ?? "aac",
        audioBitrateKbps: Int32((options["audioBitrateKbps"] as? NSNumber)?.intValue ?? 128)
      )

      return try await withCheckedThrowingContinuation { continuation in
        let listener = ExportProgressListenerWrapper { current, total in
          self.sendEvent("onExportProgress", [
            "currentFrame": current,
            "totalFrames": total,
            "progress": total > 0 ? Float(current) / Float(total) : 0.0
          ])
        } onError: { code, message in
          self.sendEvent("onExportError", ["code": code, "message": message])
          continuation.resume(throwing: ExportException(message: message))
        } onComplete: { path in
          self.sendEvent("onExportComplete", ["outputPath": path])
          continuation.resume(returning: path)
        }

        guard let handle = engine.startExport(request: request, listener: listener), handle.isValid else {
          continuation.resume(throwing: ExportException(message: "Failed to start export"))
          return
        }
      }
      #else
      throw ModuleNotLinkedException()
      #endif
    }
  }
}

#if canImport(Shared)
class ExportProgressListenerWrapper: NSObject, ExportProgressListener {
  let onProgress: (Int32, Int32) -> Void
  let onError: (Int32, String) -> Void
  let onComplete: (String) -> Void

  init(onProgress: @escaping (Int32, Int32) -> Void, onError: @escaping (Int32, String) -> Void, onComplete: @escaping (String) -> Void) {
    self.onProgress = onProgress
    self.onError = onError
    self.onComplete = onComplete
  }

  func onProgress(currentFrame: Int32, totalFrames: Int32) {
    onProgress(currentFrame, totalFrames)
  }

  func onError(errorCode: Int32, errorMessage: String) {
    onError(errorCode, errorMessage)
  }

  func onComplete(outputPath: String) {
    onComplete(outputPath)
  }
}
#endif

class LicenseInvalidException: Exception {
  override var reason: String { "License validation failed" }
}

class ExportException: Exception {
  let message: String
  init(message: String) { self.message = message }
  override var reason: String { message }
}

class ModuleNotLinkedException: Exception {
  override var reason: String { "Morse Weda shared framework is not linked in this build" }
}
