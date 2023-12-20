import { Divider, H4 } from "@blueprintjs/core";

import { appStore } from "../../store/appStore";
import { AudioPlayerControls } from "../audioPlayer/audioPlayerControls";
// import AppSettingsDialog from "../settings/appSettingsDialog";
import styles from "./appChrome.module.scss";
import AudioAnalyzerStatus from "./audioAnalyzerStatus";
import AudioFilesServerControls from "./audioFilesServerControls";

export default function AppChrome() {
    const audioFilesServerStatus = appStore.use.audioFilesServerStatus();

    return (
        <div className={styles.appChrome}>
            <div className={styles.appChromeLeft}>
                <H4>Music Library App</H4>
                <Divider />
                <AudioFilesServerControls />
                {audioFilesServerStatus === "started" && (
                    <>
                        <Divider />
                        <AudioAnalyzerStatus />
                    </>
                )}
                {/* TODO: restore when we have more settings available */}
                {/* <Divider /> */}
                {/* <AppSettingsDialog /> */}
            </div>
            <AudioPlayerControls />
        </div>
    );
}
