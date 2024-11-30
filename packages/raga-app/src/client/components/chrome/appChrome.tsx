import { Divider, Group, Title } from "@mantine/core";

import { appStore } from "../../store/appStore";
import UserSettingsDropdown from "../settings/userSettingsDropdown";
import AudioAnalyzerStatus from "./audioAnalyzerStatus";
import AudioFilesServerControls from "./audioFilesServerControls";
import LibraryControls from "./libraryControls";

export default function AppChrome() {
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const isLibraryLoaded = appStore.use.libraryLoadingState() === "loaded";

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
