package com.emmy.morsewedavideoeditor

import android.content.Context
import androidx.compose.ui.platform.ComposeView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import org.emmy.media_editor.App

/**
 * Expo view that hosts the full Morse Weda Compose editor.
 */
class MorseWedaVideoEditorView(
    context: Context,
    appContext: AppContext
) : ExpoView(context, appContext) {

    init {
        addView(
            ComposeView(context).apply {
                setContent {
                    App()
                }
            }
        )
    }
}
