package com.emmy.morsewedavideoeditor

import com.app.editor.LicenseGate
import com.app.editor.NativeVideoBridge
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.emmy.media_editor.src.video_editor.export.AndroidExportEngine
import org.emmy.media_editor.src.video_editor.export.ExportProgressListener
import org.emmy.media_editor.src.video_editor.export.ExportRenderRequest

/**
 * Expo module exposing the Morse Weda video editor to React Native.
 *
 * Route 1: drop-in UI via [MorseWedaVideoEditorView].
 * Route 2: headless hooks (initialize, license controls, exportVideo).
 */
class MorseWedaVideoEditorModule : Module() {

    private val ioScope = CoroutineScope(Dispatchers.IO)
    private var nativeBridge: NativeVideoBridge? = null
    private var exportEngine: AndroidExportEngine? = null

    override fun definition() = ModuleDefinition {
        Name("MorseWedaVideoEditor")

        Events(
            "onExportProgress",
            "onExportComplete",
            "onExportError"
        )

        View(MorseWedaVideoEditorView::class) {
            Prop("licenseKey") { view: MorseWedaVideoEditorView, key: String? ->
                key?.let { LicenseGate.setLicenseKey(it) }
            }
        }

        Function("setLicenseCheckEnabled") { enabled: Boolean ->
            LicenseGate.setLicenseCheckEnabled(enabled)
        }

        Function("setLicenseKey") { key: String ->
            LicenseGate.setLicenseKey(key)
        }

        AsyncFunction("initialize") { options: Map<String, Any?>, promise: Promise ->
            try {
                val licenseKey = options["licenseKey"] as? String ?: ""
                val canCheckLicense = options["canCheckLicense"] as? Boolean ?: false

                LicenseGate.setLicenseCheckEnabled(canCheckLicense)
                if (licenseKey.isNotEmpty()) {
                    LicenseGate.setLicenseKey(licenseKey)
                }

                nativeBridge = NativeVideoBridge()
                exportEngine = AndroidExportEngine()

                if (canCheckLicense) {
                    val valid = LicenseGate.checkLicense()
                    if (!valid) {
                        promise.reject(CodedException("LICENSE_INVALID", "License validation failed", null))
                        return@AsyncFunction
                    }
                }

                promise.resolve(null)
            } catch (e: Throwable) {
                promise.reject(CodedException("INIT_ERROR", e.message ?: "Unknown error", e))
            }
        }

        AsyncFunction("checkLicense") { promise: Promise ->
            val valid = LicenseGate.checkLicense()
            promise.resolve(valid)
        }

        AsyncFunction("exportVideo") { timelineJson: String, outputPath: String, options: Map<String, Any?>, promise: Promise ->
            val engine = exportEngine ?: run {
                promise.reject(CodedException("NOT_INITIALIZED", "Call initialize() first", null))
                return@AsyncFunction
            }

            val request = ExportRenderRequest(
                timelineJson = timelineJson,
                outputPath = outputPath,
                format = options["format"] as? String ?: "mp4",
                width = (options["width"] as? Number)?.toInt() ?: 1280,
                height = (options["height"] as? Number)?.toInt() ?: 720,
                fps = (options["fps"] as? Number)?.toInt() ?: 30,
                bitrateMbps = (options["bitrateMbps"] as? Number)?.toFloat() ?: 8f,
                isAudioMuted = options["isAudioMuted"] as? Boolean ?: false,
                audioCodec = options["audioCodec"] as? String ?: "aac",
                audioBitrateKbps = (options["audioBitrateKbps"] as? Number)?.toInt() ?: 128
            )

            ioScope.launch {
                try {
                    engine.startExport(request, object : ExportProgressListener {
                        override fun onProgress(currentFrame: Int, totalFrames: Int) {
                            appContext.mainQueue.launch {
                                this@MorseWedaVideoEditorModule.sendEvent("onExportProgress", mapOf(
                                    "currentFrame" to currentFrame,
                                    "totalFrames" to totalFrames,
                                    "progress" to if (totalFrames > 0) currentFrame.toFloat() / totalFrames else 0f
                                ))
                            }
                        }

                        override fun onError(errorCode: Int, errorMessage: String) {
                            appContext.mainQueue.launch {
                                this@MorseWedaVideoEditorModule.sendEvent("onExportError", mapOf(
                                    "code" to errorCode,
                                    "message" to errorMessage
                                ))
                                promise.reject(CodedException("EXPORT_ERROR", errorMessage, null))
                            }
                        }

                        override fun onComplete(outputPath: String) {
                            appContext.mainQueue.launch {
                                this@MorseWedaVideoEditorModule.sendEvent("onExportComplete", mapOf(
                                    "outputPath" to outputPath
                                ))
                                promise.resolve(outputPath)
                            }
                        }
                    })
                } catch (e: Throwable) {
                    appContext.mainQueue.launch {
                        promise.reject(CodedException("EXPORT_ERROR", e.message ?: "Export failed", e))
                    }
                }
            }
        }
    }
}
