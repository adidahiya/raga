import { Divider, H4 } from "@blueprintjs/core";

import { appStore } from "../../store/appStore";
import { AudioPlayerControls } from "../audioPlayer/audioPlayerControls";
import UserSettingsDropdown from "../settings/userSettingsDropdown";
import styles from "./appChrome.module.scss";
import AudioAnalyzerStatus from "./audioAnalyzerStatus";
import AudioFilesServerControls from "./audioFilesServerControls";

export default function AppChrome() {
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const isLibraryLoaded = appStore.use.libraryLoadingState() === "loaded";

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
