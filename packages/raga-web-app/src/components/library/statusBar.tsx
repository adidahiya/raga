import { appStore } from "../../store/appStore";
import AnalyzerProgressIndicator from "./analyzerProgressIndicator";
import AudioFilesServerControls from "./audioFilesServerControls";
import styles from "./statusBar.module.scss";

interface StatusBarProps {
  totalTracks?: string;
}

export default function StatusBar({ totalTracks }: StatusBarProps) {
  const analyzerStatus = appStore.use.analyzerStatus();

  return (
    <footer className={styles.statusBar}>
      <div className={`flex items-center gap-4 flex-nowrap ${styles.statusGroup}`}>
        <span className={styles.statusItem}>
          <span className={styles.dot} data-state="info" />
          <span className={styles.statusText}>Library: {totalTracks ?? "—"}</span>
        </span>
        <span className={styles.divider} />
        <span className={styles.statusItem}>
          <span
            className={styles.dot}
            data-state={analyzerStatus === "busy" ? "busy" : "ok"}
          />
          <span className={styles.statusText}>
            Analyzer: {analyzerStatus === "busy" ? "busy" : "idle"}
          </span>
        </span>
        <AnalyzerProgressIndicator />
        <span className={styles.divider} />
        <div className={styles.serverControls}>
          <AudioFilesServerControls />
        </div>
      </div>

      {/* Shortcut chips reflect actually-registered hotkeys:
          - mod+f / mod+l from useTrackTableHotkeys
          - Space + arrows from useAudioPlayerHotkeys
          - mod+i opens the global hotkeys dialog
          - mod+k opens this command palette */}
      <div className={`flex items-center gap-4 flex-nowrap ${styles.statusGroupRight}`}>
        <Hotkey label="play" keys={["Space"]} />
        <Hotkey label="seek" keys={["←", "→"]} />
        <Hotkey label="filter" keys={["⌘F"]} />
        <Hotkey label="locate" keys={["⌘L"]} />
        <Hotkey label="help" keys={["⌘I"]} />
        <Hotkey label="palette" keys={["⌘K"]} accent />
      </div>
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
