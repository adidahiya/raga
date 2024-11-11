import type { TrackDefinition } from "@adahiya/raga-lib";
import { Tooltip } from "@blueprintjs/core";
import { Button } from "@mantine/core";

import { useOperationCallback } from "../../hooks";
import { useIsTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export default function AnalyzeSingleTrackButton({ trackDef }: { trackDef: TrackDefinition }) {
  const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
  const isAnalyzerBusy = appStore.use.analyzerStatus() === "busy";
  const audioFilesConverterIsBusy = appStore.use.audioFilesConverterIsBusy();
  const analyzeTrack = appStore.use.analyzeTrack();
  const convertTrackToMP3 = appStore.use.convertTrackToMP3();

  const trackID = trackDef["Track ID"];
  const isTrackReadyForAnalysis = useIsTrackReadyForAnalysis(trackID);

  // analyze the track if it's ready for analysis, otherwise convert it to a compatible format first
  const handleAnalyzeBPM = useOperationCallback(
    function* () {
      if (!isTrackReadyForAnalysis) {
        yield* convertTrackToMP3(trackDef);
      }
      yield* analyzeTrack(trackID);
    },
    [analyzeTrack, convertTrackToMP3, isTrackReadyForAnalysis, trackDef, trackID],
  );

  const isConvertingThisFile = !isTrackReadyForAnalysis && audioFilesConverterIsBusy;
  const buttonDisabled = !isAudioFilesServerReady || isAnalyzerBusy || isConvertingThisFile;
  const tooltipText = !isAudioFilesServerReady
    ? "Disconnected from audio files server"
    : isConvertingThisFile
      ? "Converting to compatible audio format for analysis..."
      : undefined;

  return (
    <Tooltip
      compact={true}
      disabled={!buttonDisabled}
      placement="top"
      content={tooltipText}
      hoverOpenDelay={300}
      fill={true}
    >
      <Button
        className={styles.smallOutlinedButton}
        disabled={buttonDisabled}
        variant="outline"
        color="gray"
        size="compact-sm"
        fullWidth={true}
        onClick={handleAnalyzeBPM}
      >
        Analyze
      </Button>
    </Tooltip>
  );
}
AnalyzeSingleTrackButton.displayName = "AnalyzeSingleTrackButton";
