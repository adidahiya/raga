import { Divider, H4 } from "@blueprintjs/core";

import styles from "./appChrome.module.scss";
import AudioFilesServerControls from "./audioFilesServerControls";
import { AudioPlayerControls } from "./audioPlayer/audioPlayerControls";
import AppSettingsDialog from "./settings/appSettingsDialog";

export default function AppChrome() {
    return (
        <div className={styles.appChrome}>
            <div className={styles.appChromeLeft}>
                <H4>Music Library App</H4>
                <Divider />
                <AudioFilesServerControls />
                <Divider />
                <AppSettingsDialog />
            </div>
            <AudioPlayerControls />
        </div>
    );
}
