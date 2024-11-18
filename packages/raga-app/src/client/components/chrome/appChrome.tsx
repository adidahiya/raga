import { OverlayToaster } from "@blueprintjs/core";
import { Divider, Group, Title } from "@mantine/core";
import { call } from "effection";
import { createRoot } from "react-dom/client";

import { useTaskEffect } from "../../hooks";
import { appStore } from "../../store/appStore";
import UserSettingsDropdown from "../settings/userSettingsDropdown";
import AudioAnalyzerStatus from "./audioAnalyzerStatus";
import AudioFilesServerControls from "./audioFilesServerControls";
import LibraryControls from "./libraryControls";

export default function AppChrome() {
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const isLibraryLoaded = appStore.use.libraryLoadingState() === "loaded";
  const setToaster = appStore.use.setToaster();

  useTaskEffect(function* () {
    const newToaster = yield* call(
      OverlayToaster.createAsync(
        {
          position: "bottom",
          canEscapeKeyClear: true,
          autoFocus: false,
          usePortal: true,
        },
        {
          // Use createRoot() instead of ReactDOM.render(). This can be deleted after
          // a future Blueprint version uses createRoot() for Toasters by default.
          domRenderer: (toaster, containerElement) => {
            createRoot(containerElement).render(toaster);
          },
        },
      ),
    );
    setToaster(newToaster);
    return () => {
      newToaster.clear();
    };
  }, []);

  return (
    <Group mb={5} justify="space-between" wrap="nowrap">
      <Group h={30} wrap="nowrap" preventGrowOverflow={true} gap="sm">
        <Title order={4}>Raga</Title>
        {isLibraryLoaded && (
          <>
            <Divider orientation="vertical" />
            <AudioFilesServerControls />
          </>
        )}
        {audioFilesServerStatus === "started" && (
          <>
            <Divider orientation="vertical" />
            <AudioAnalyzerStatus />
          </>
        )}
        <Divider orientation="vertical" />
        <UserSettingsDropdown />
      </Group>
      <Group>
        <LibraryControls />
      </Group>
    </Group>
  );
}
