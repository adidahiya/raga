import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import classNames from "classnames";

import styles from "./app.module.scss";
import AppChrome from "./components/chrome/appChrome";
import { appStore } from "./store/appStore";
import LibraryView from "./views/libraryView";

const theme = createTheme({
  fontFamily: "Archivo, sans-serif",
  defaultRadius: "md",
  focusRing: "never",
  fontSizes: {
    xs: "10px",
    sm: "12px",
    md: "14px",
    lg: "16px",
  },
  radius: {
    xs: "1px",
    sm: "2px",
    md: "4px",
    lg: "8px",
  },
});

export default function App() {
  const fontWeight = appStore.use.fontWeight();
  const userThemePreference = appStore.use.userThemePreference();

  return (
    <MantineProvider theme={theme} defaultColorScheme={userThemePreference}>
      <div
        className={classNames(styles.app, {
          [styles.fontWeightLight]: fontWeight === "light",
          [styles.fontWeightRegular]: fontWeight === "regular",
        })}
      >
        <AppChrome />
        <LibraryView />
      </div>
    </MantineProvider>
  );
}
App.displayName = "App";
