import { Stack, Switch, Text } from "@mantine/core";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";

export function AnalyzerSettings() {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const setAnalyzeBPMPerTrack = appStore.use.setAnalyzeBPMPerTrack();

  const handleToggleAnalyzeBPMPerTrack = useCallback(() => {
    setAnalyzeBPMPerTrack(!analyzeBPMPerTrack);
  }, [analyzeBPMPerTrack, setAnalyzeBPMPerTrack]);

  return (
    <Stack gap="xs" p="xs">
      <Text>Analysis settings</Text>
      <Switch
        label="Analyze BPM per track"
        onChange={handleToggleAnalyzeBPMPerTrack}
        checked={analyzeBPMPerTrack}
      />
    </Stack>
  );
}
