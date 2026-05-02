import { Switch } from "@adahiya/raga-design-system";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";

export function AnalyzerSettings() {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const setAnalyzeBPMPerTrack = appStore.use.setAnalyzeBPMPerTrack();

  const handleToggleAnalyzeBPMPerTrack = useCallback(
    (checked: boolean) => {
      setAnalyzeBPMPerTrack(checked);
    },
    [setAnalyzeBPMPerTrack],
  );

  return (
    <div className="flex flex-col gap-2">
      <span>Analysis</span>
      <label className="flex cursor-pointer items-center gap-2">
        <Switch
          checked={analyzeBPMPerTrack}
          onCheckedChange={handleToggleAnalyzeBPMPerTrack}
        />
        <span>Analyze BPM per track</span>
      </label>
    </div>
  );
}
