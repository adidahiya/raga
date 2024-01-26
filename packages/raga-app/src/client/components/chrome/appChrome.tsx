import { Divider, H4, OverlayToaster } from "@blueprintjs/core";
import { call } from "effection";
import { createRoot } from "react-dom/client";

import { useTaskEffect } from "../../hooks";
import { appStore } from "../../store/appStore";
import { AudioPlayerControls } from "../audioPlayer/audioPlayerControls";
import UserSettingsDropdown from "../settings/userSettingsDropdown";
import styles from "./appChrome.module.scss";
import AudioAnalyzerStatus from "./audioAnalyzerStatus";
import AudioFilesServerControls from "./audioFilesServerControls";

export default function AppChrome() {
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const isLibraryLoaded = appStore.use.libraryLoadingState() === "loaded";
  const setToaster = appStore.use.setToaster();

  useTaskEffect(function* () {
    const newToaster = yield* call(
      OverlayToaster.createAsync(
        {
          position: "bottom",
          canEscapeKeyClear: true,
          autoFocus: false,
          usePortal: true,
        },
        {
          // Use createRoot() instead of ReactDOM.render(). This can be deleted after
          // a future Blueprint version uses createRoot() for Toasters by default.
          domRenderer: (toaster, containerElement) => {
            createRoot(containerElement).render(toaster);
          },
        },
      ),
    );
    setToaster(newToaster);
    return () => {
      newToaster.clear();
    };
  }, []);

  return (
    <div className={styles.appChrome}>
      <div className={styles.appChromeLeft}>
        <H4>Music Library App</H4>
        {isLibraryLoaded && (
          <>
            <Divider />
            <AudioFilesServerControls />
          </>
        )}
        {audioFilesServerStatus === "started" && (
          <>
            <Divider />
            <AudioAnalyzerStatus />
          </>
        )}
        <Divider />
        <UserSettingsDropdown />
      </div>
      <AudioPlayerControls />
    </div>
  );
}
