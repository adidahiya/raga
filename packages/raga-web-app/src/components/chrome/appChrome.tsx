import { Group } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import classNames from "classnames";
import { IoSearchOutline } from "react-icons/io5";

import { appStore } from "../../store/appStore";
import UserSettingsDropdown from "../settings/userSettingsDropdown";
import styles from "./appChrome.module.scss";
import LibraryControls from "./libraryControls";
import WorkspaceModeControl from "./workspaceModeControl";

export default function AppChrome() {
  const isLibraryLoaded = appStore.use.libraryLoadingState() === "loaded";
  const isMacOS = window.api.platform === "darwin";
  const isWindows = window.api.platform === "win32";
  // use left padding on macOS to account for window traffic light buttons
  const leftPadding = isMacOS ? 75 : 12;
  // use right padding on Windows to account for window buttons
  const rightPadding = isWindows ? 100 : 12;

  return (
    <Group
      pl={leftPadding}
      pr={rightPadding}
      justify="space-between"
      wrap="nowrap"
      gap="md"
      className={classNames(styles.appChromeDraggable, styles.appChrome)}
    >
      <div className={styles.brand}>
        <div className={styles.logoMark}>R</div>
      </div>

      {isLibraryLoaded && (
        <div className={styles.modeControl}>
          <WorkspaceModeControl />
        </div>
      )}

      <button
        type="button"
        className={styles.commandTrigger}
        onClick={() => {
          spotlight.open();
        }}
        aria-label="Open command palette"
      >
        <IoSearchOutline size={14} className={styles.commandTriggerIcon} />
        <span className={styles.commandTriggerText}>
          Search playlists, tracks, or run a command…
        </span>
        <span className={styles.commandTriggerHint}>⌘K</span>
      </button>

      <Group className={styles.appChromeGroup} gap="xs" wrap="nowrap">
        {isLibraryLoaded && <LibraryControls />}
        <UserSettingsDropdown />
      </Group>
    </Group>
  );
}
