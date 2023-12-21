import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

import styles from "./app.module.scss";
import AppChrome from "./components/chrome/appChrome";
import LibraryView from "./views/libraryView";

export default function App() {
  return (
    <div className={classNames(Classes.DARK, styles.app)}>
      <AppChrome />
      <LibraryView />
    </div>
  );
}
App.displayName = "App";
