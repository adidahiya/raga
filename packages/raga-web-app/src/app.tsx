import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "mantine-contextmenu/styles.layer.css";
import "@adahiya/raga-design-system/styles/global.css";
import "./common/mantine-overrides.scss";

import { TooltipProvider } from "@adahiya/raga-design-system";
import { createTheme, MantineProvider } from "@mantine/core";
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

const KITCHEN_SINK_PATH = "/__kitchen-sink";

// Lazy-loaded, dev-only kitchen sink route. The conditional ensures the
// dynamic import (and its Tailwind CSS) is dead code in production builds.
const KitchenSinkRoute = import.meta.env.DEV
  ? React.lazy(() => import("./components/devTools/kitchenSink/KitchenSinkRoute"))
  : null;

function isKitchenSinkPath(): boolean {
  return typeof window !== "undefined" && window.location.pathname === KITCHEN_SINK_PATH;
}

// Minimal Mantine theme: focus ring is the only knob the held-over Mantine
// surfaces (Modal, Menu, Spotlight, Notifications, mantine-contextmenu,
// FileInput, Rating, Progress, Loader, SegmentedControl, Collapse) care
// about — every other visual is themed via design-system tokens (see
// `./common/mantine-overrides.scss` and the DS `data-theme` attribute on
// <html>). We do not duplicate fontFamily / radius / fontSizes here; the DS
// tokens own those.
const theme = createTheme({
  focusRing: "never",
});

interface AppProps {
  useMockData?: boolean;
}

function resolveColorScheme(preference: "auto" | "light" | "dark"): "light" | "dark" {
  if (preference !== "auto") {
    return preference;
  }
  if (typeof window === "undefined") {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App({ useMockData = false }: AppProps) {
  const fontWeight = appStore.use.fontWeight();
  const userThemePreference = appStore.use.userThemePreference();
  const workspaceMode = appStore.use.workspaceMode();
  const setUseMockData = appStore.use.setUseMockData();

  const [resolvedScheme, setResolvedScheme] = React.useState<"light" | "dark">(() =>
    resolveColorScheme(userThemePreference),
  );

  // Set mock data configuration on mount
  React.useEffect(() => {
    setUseMockData(useMockData);
  }, [useMockData, setUseMockData]);

  // Single source of truth for the resolved color scheme. Both the design
  // system (`<html data-theme>`) and Mantine (`forceColorScheme` below) read
  // from the same value so DS-styled chrome and held-over Mantine surfaces
  // can never disagree about which theme is active. Resolves "auto" against
  // `prefers-color-scheme` and listens for system changes.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const next = resolveColorScheme(userThemePreference);
      setResolvedScheme(next);
      document.documentElement.dataset.theme = next;
    };

    apply();

    if (userThemePreference === "auto") {
      mq.addEventListener("change", apply);
      return () => {
        mq.removeEventListener("change", apply);
      };
    }
    return undefined;
  }, [userThemePreference]);

  // Dev-only kitchen sink takeover. In production builds, KitchenSinkRoute is
  // null and this branch is dead code, so the route falls through to the
  // normal app and the kitchen sink module is excluded from the bundle.
  if (KitchenSinkRoute !== null && isKitchenSinkPath()) {
    return (
      <React.Suspense fallback={null}>
        <KitchenSinkRoute />
      </React.Suspense>
    );
  }

  return (
    <MantineProvider theme={theme} forceColorScheme={resolvedScheme}>
      <TooltipProvider delayDuration={300}>
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
      </TooltipProvider>
    </MantineProvider>
  );
}
App.displayName = "App";
