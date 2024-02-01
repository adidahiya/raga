import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

import styles from "./app.module.scss";
import AppChrome from "./components/chrome/appChrome";
import { appStore } from "./store/appStore";
import LibraryView from "./views/libraryView";

export default function App() {
  const fontWeight = appStore.use.fontWeight();

  return (
    <div
      className={classNames(Classes.DARK, styles.app, {
        [styles.fontWeightLight]: fontWeight === "light",
        [styles.fontWeightRegular]: fontWeight === "regular",
      })}
    >
      <AppChrome />
      <LibraryView />
    </div>
  );
}
App.displayName = "App";
