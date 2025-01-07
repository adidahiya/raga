import { Divider, Group, Title } from "@mantine/core";
import classNames from "classnames";

import { appStore } from "../../store/appStore";
import UserSettingsDropdown from "../settings/userSettingsDropdown";
import styles from "./appChrome.module.scss";
import AudioAnalyzerStatus from "./audioAnalyzerStatus";
import AudioFilesServerControls from "./audioFilesServerControls";
import LibraryControls from "./libraryControls";

export default function AppChrome() {
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const isLibraryLoaded = appStore.use.libraryLoadingState() === "loaded";
  const isMacOS = window.api.platform === "darwin";
  const isWindows = window.api.platform === "win32";
  // use left padding on macOS to account for window traffic light buttons
  const leftPadding = isMacOS ? 75 : undefined;
  // use right padding on Windows to account for window buttons
  const rightPadding = isWindows ? 100 : undefined;

  return (
    <Group
      pl={leftPadding}
      pr={rightPadding}
      justify="space-between"
      wrap="nowrap"
      className={classNames(styles.appChromeDraggable, styles.appChrome)}
    >
      <Group
        h={30}
        p={5}
        wrap="nowrap"
        preventGrowOverflow={true}
        gap="sm"
        className={styles.appChromeGroup}
      >
        <Title order={4} className={styles.appChromeDraggable}>
          Raga
        </Title>
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
      <Group className={styles.appChromeGroup} p={5}>
        <LibraryControls />
      </Group>
    </Group>
  );
}
