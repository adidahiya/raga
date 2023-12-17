import { Classes, H4 } from "@blueprintjs/core";
import classNames from "classnames";

import styles from "./app.module.scss";
import LibraryView from "./libraryView";

export default function App() {
    return (
        <div className={classNames(Classes.DARK, styles.app)}>
            <H4>Music Library App</H4>
            <LibraryView />
        </div>
    );
}
App.displayName = "App";
