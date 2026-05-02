import { IoClose, IoStop } from "react-icons/io5";

import { appStore } from "../../store/appStore";
import SimpleTooltip from "../common/SimpleTooltip";
import styles from "./statusBar.module.scss";

export default function AnalyzerProgressIndicator() {
  const analyzerProgress = appStore.use.analyzerProgress();
  const analyzerStatus = appStore.use.analyzerStatus();
  const analyzerCancelRequested = appStore.use.analyzerCancelRequested();
  const cancelAnalysisQueue = appStore.use.cancelAnalysisQueue();
  const clearAnalysisQueue = appStore.use.clearAnalysisQueue();
  const getTrackDef = appStore.use.getTrackDef();

  if (analyzerProgress === undefined) return null;

  const currentTrackId = analyzerProgress.currentTrackId;
  const currentTrackName =
    currentTrackId !== undefined
      ? (getTrackDef(currentTrackId)?.Name ?? undefined)
      : undefined;

  const isRunning =
    analyzerStatus === "busy" || analyzerProgress.currentTrackId !== undefined;
  const finished = analyzerProgress.completed + analyzerProgress.failed;
  const total = analyzerProgress.total;
  const pct = total > 0 ? Math.min(100, (finished / total) * 100) : 0;

  if (!isRunning && finished === 0) {
    return null;
  }

  const stateLabel = isRunning
    ? "Analyzing"
    : analyzerCancelRequested
      ? "Cancelled"
      : "Done";

  const counterText = `${finished.toString()}/${total.toString()}`;
  const failedText =
    analyzerProgress.failed > 0
      ? ` · ${analyzerProgress.failed.toString()} failed`
      : "";
  const etaText =
    isRunning &&
    analyzerProgress.etaMs !== undefined &&
    analyzerProgress.etaMs > 0
      ? ` · ETA ${formatEta(analyzerProgress.etaMs)}`
      : "";

  const tooltipLabel = isRunning
    ? currentTrackName !== undefined
      ? `Analyzing "${currentTrackName}" (${counterText}${etaText})`
      : `Analyzing (${counterText}${etaText})`
    : analyzerCancelRequested
      ? `Run cancelled · ${analyzerProgress.completed.toString()} analyzed${failedText}`
      : `Run complete · ${analyzerProgress.completed.toString()} analyzed${failedText}`;

  return (
    <>
      <span className={styles.divider} />
      <SimpleTooltip label={tooltipLabel}>
        <span
          className={styles.analyzerProgress}
          data-state={isRunning ? "running" : analyzerProgress.failed > 0 ? "warn" : "done"}
        >
          <span className={styles.statusText}>{stateLabel}</span>
          <span className={styles.analyzerBar} aria-hidden="true">
            <span
              className={styles.analyzerBarFill}
              style={{ width: `${pct.toString()}%` }}
            />
          </span>
          <span className={styles.analyzerCount}>
            {counterText}
            {failedText}
            {etaText}
          </span>
          {isRunning ? (
            <SimpleTooltip
              label={analyzerCancelRequested ? "Cancelling…" : "Cancel analysis"}
            >
              <button
                type="button"
                className={styles.analyzerAction}
                onClick={cancelAnalysisQueue}
                disabled={analyzerCancelRequested}
                aria-label="Cancel analysis"
              >
                <IoStop size={11} />
              </button>
            </SimpleTooltip>
          ) : (
            <SimpleTooltip label="Dismiss">
              <button
                type="button"
                className={styles.analyzerAction}
                onClick={clearAnalysisQueue}
                aria-label="Dismiss analysis result"
              >
                <IoClose size={11} />
              </button>
            </SimpleTooltip>
          )}
        </span>
      </SimpleTooltip>
    </>
  );
}
AnalyzerProgressIndicator.displayName = "AnalyzerProgressIndicator";

function formatEta(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds.toString()}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString()}m ${s.toString().padStart(2, "0")}s`;
}
