import { Classes, H4 } from "@blueprintjs/core";
import classNames from "classnames";

import styles from "./app.module.scss";
import { AudioPlayerControls } from "./components/audioPlayerControls";
import LibraryView from "./libraryView";

export default function App() {
    return (
        <div className={classNames(Classes.DARK, styles.app)}>
            <div className={styles.appChrome}>
                <div>
                    <H4>Music Library App</H4>
                </div>
                <AudioPlayerControls />
            </div>
            <LibraryView />
        </div>
    );
}
App.displayName = "App";
