import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { useEffect } from "react";

import styles from "./app.module.scss";
import AppChrome from "./components/chrome/appChrome";
import { usePrefersDarkTheme } from "./hooks/usePrefersDarkTheme";
import { appStore } from "./store/appStore";
import LibraryView from "./views/libraryView";

export default function App() {
  const fontWeight = appStore.use.fontWeight();
  const userThemePreference = appStore.use.userThemePreference();
  const setSystemThemePreference = appStore.use.setSystemThemePreference();
  const systemThemePreference = appStore.use.systemThemePreference();
  const systemPrefersDarkTheme = usePrefersDarkTheme();

  useEffect(
    function syncDarkThemePreferenceToStore() {
      setSystemThemePreference(systemPrefersDarkTheme ? "dark" : "light");
    },
    [systemPrefersDarkTheme, setSystemThemePreference],
  );

  const useDarkTheme =
    userThemePreference === "dark" ||
    (userThemePreference === "system" && systemThemePreference === "dark");

  return (
    <div
      className={classNames(styles.app, {
        [styles.fontWeightLight]: fontWeight === "light",
        [styles.fontWeightRegular]: fontWeight === "regular",
        [Classes.DARK]: useDarkTheme,
      })}
    >
      <AppChrome />
      <LibraryView />
    </div>
  );
}
App.displayName = "App";
