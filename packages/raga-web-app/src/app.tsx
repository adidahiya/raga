import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "mantine-contextmenu/styles.layer.css";
import "./common/mantine-overrides.scss";

import { createTheme, MantineProvider, Switch } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import classNames from "classnames";
import { ContextMenuProvider } from "mantine-contextmenu";
import React from "react";

import styles from "./app.module.scss";
import AppChrome from "./components/chrome/appChrome";
import CommandPalette from "./components/chrome/commandPalette";
import DesignSystemLink from "./components/devTools/DesignSystemLink";
import GlobalHotkeysDialog from "./components/globalHotkeysDialog";
import LibraryLoader from "./components/library/libraryLoader";
import { appStore } from "./store/appStore";
import ExportView from "./views/export";
import LibraryView from "./views/libraryView";

const MONO_FONT_FAMILY =
  "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace";

const theme = createTheme({
  fontFamily: "Archivo, Inter, sans-serif",
  fontFamilyMonospace: MONO_FONT_FAMILY,
  defaultRadius: "sm",
  focusRing: "never",
  primaryColor: "blue",
  fontSizes: {
    xs: "10px",
    sm: "12px",
    md: "13px",
    lg: "15px",
  },
  radius: {
    xs: "1px",
    sm: "2px",
    md: "3px",
    lg: "6px",
  },
  primaryShade: { light: 6, dark: 5 },
  components: {
    Switch: Switch.extend({
      defaultProps: {
        withThumbIndicator: false,
      },
    }),
  },
});

interface AppProps {
  useMockData?: boolean;
}

export default function App({ useMockData = false }: AppProps) {
  const fontWeight = appStore.use.fontWeight();
  const userThemePreference = appStore.use.userThemePreference();
  const workspaceMode = appStore.use.workspaceMode();
  const setUseMockData = appStore.use.setUseMockData();

  // Set mock data configuration on mount
  React.useEffect(() => {
    setUseMockData(useMockData);
  }, [useMockData, setUseMockData]);

  // Default the user's effective scheme to "dark" so the docked CommandBar look applies
  const effectiveScheme = userThemePreference === "auto" ? "dark" : userThemePreference;

  return (
    <MantineProvider theme={theme} defaultColorScheme={effectiveScheme}>
      <Notifications />
      <ContextMenuProvider>
        <div
          className={classNames(styles.app, {
            [styles.fontWeightLight]: fontWeight === "light",
            [styles.fontWeightRegular]: fontWeight === "regular",
          })}
        >
          <AppChrome />
          <LibraryLoader>
            {workspaceMode === "tracks" ? <LibraryView /> : <ExportView />}
          </LibraryLoader>
          <GlobalHotkeysDialog />
          <CommandPalette />
          {import.meta.env.DEV && <DesignSystemLink />}
        </div>
      </ContextMenuProvider>
    </MantineProvider>
  );
}
App.displayName = "App";
