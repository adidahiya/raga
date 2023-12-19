import { Classes, Divider, H4 } from "@blueprintjs/core";
import classNames from "classnames";

import styles from "./app.module.scss";
import AppSettingsDialog from "./components/settings/appSettingsDialog";
import AudioFilesServerControls from "./components/audioFilesServerControls";
import { AudioPlayerControls } from "./components/audioPlayer/audioPlayerControls";
import LibraryView from "./libraryView";

export default function App() {
    return (
        <div className={classNames(Classes.DARK, styles.app)}>
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
            <LibraryView />
        </div>
    );
}
App.displayName = "App";
