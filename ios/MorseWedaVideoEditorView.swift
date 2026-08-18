import ExpoModulesCore
import UIKit

#if canImport(Shared)
import Shared
#endif

// Expo view that hosts the Morse Weda Compose editor.
class MorseWedaVideoEditorView: ExpoView {
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    backgroundColor = .black

    #if canImport(Shared)
    let composeController = MainViewControllerKt.MainViewController()
    addSubview(composeController.view)
    composeController.view.translatesAutoresizingMaskIntoConstraints = false
    composeController.view.backgroundColor = .black
    NSLayoutConstraint.activate([
      composeController.view.topAnchor.constraint(equalTo: topAnchor),
      composeController.view.bottomAnchor.constraint(equalTo: bottomAnchor),
      composeController.view.leadingAnchor.constraint(equalTo: leadingAnchor),
      composeController.view.trailingAnchor.constraint(equalTo: trailingAnchor)
    ])
    #else
    let label = UILabel()
    label.text = "Morse Weda shared framework not linked. Build :app:shared on macOS and embed Shared.framework."
    label.textAlignment = .center
    label.numberOfLines = 0
    label.textColor = .white
    label.translatesAutoresizingMaskIntoConstraints = false
    addSubview(label)
    NSLayoutConstraint.activate([
      label.centerXAnchor.constraint(equalTo: centerXAnchor),
      label.centerYAnchor.constraint(equalTo: centerYAnchor),
      label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
      label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20)
    ])
    #endif
  }
}
