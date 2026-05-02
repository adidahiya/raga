import { StatusPill } from "@adahiya/raga-design-system";

import { appStore } from "../../store/appStore";

export default function AudioAnalyzerStatus() {
  const status = appStore.use.analyzerStatus();
  const isBusy = status === "busy";

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-body-sm text-text-muted">Analyzer</span>
      <StatusPill tone={isBusy ? "info" : "success"} label={isBusy ? "Busy…" : "Ready"} />
    </div>
  );
}
AudioAnalyzerStatus.displayName = "AudioAnalyzerStatus";
