import { Group, Text } from "@mantine/core";

import { appStore } from "../../store/appStore";
import AudioFilesServerControls from "./audioFilesServerControls";
import styles from "./statusBar.module.scss";

interface StatusBarProps {
  totalTracks?: string;
}

export default function StatusBar({ totalTracks }: StatusBarProps) {
  const analyzerStatus = appStore.use.analyzerStatus();

  return (
    <footer className={styles.statusBar}>
      <Group gap="md" wrap="nowrap" className={styles.statusGroup}>
        <span className={styles.statusItem}>
          <span className={styles.dot} data-state="info" />
          <Text component="span" className={styles.statusText}>
            Library: {totalTracks ?? "—"}
          </Text>
        </span>
        <span className={styles.divider} />
        <span className={styles.statusItem}>
          <span
            className={styles.dot}
            data-state={analyzerStatus === "busy" ? "busy" : "ok"}
          />
          <Text component="span" className={styles.statusText}>
            Analyzer: {analyzerStatus === "busy" ? "busy" : "idle"}
          </Text>
        </span>
        <span className={styles.divider} />
        <div className={styles.serverControls}>
          <AudioFilesServerControls />
        </div>
      </Group>

      {/* Shortcut chips reflect actually-registered hotkeys:
          - mod+f / mod+l from useTrackTableHotkeys
          - Space + arrows from useAudioPlayerHotkeys
          - mod+i opens the global hotkeys dialog
          - mod+k opens this command palette */}
      <Group gap="md" wrap="nowrap" className={styles.statusGroupRight}>
        <Hotkey label="play" keys={["Space"]} />
        <Hotkey label="seek" keys={["←", "→"]} />
        <Hotkey label="filter" keys={["⌘F"]} />
        <Hotkey label="locate" keys={["⌘L"]} />
        <Hotkey label="help" keys={["⌘I"]} />
        <Hotkey label="palette" keys={["⌘K"]} accent />
      </Group>
    </footer>
  );
}
StatusBar.displayName = "StatusBar";

function Hotkey({
  keys,
  label,
  accent = false,
}: {
  keys: string[];
  label: string;
  accent?: boolean;
}) {
  return (
    <span className={styles.hotkey}>
      {keys.map((k) => (
        <kbd key={k} className={accent ? styles.kbdAccent : styles.kbd}>
          {k}
        </kbd>
      ))}
      <span className={styles.hotkeyLabel}>{label}</span>
    </span>
  );
}
