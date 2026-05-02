import { Button } from "@adahiya/raga-design-system";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import SimpleTooltip from "../common/SimpleTooltip";
import styles from "./trackTable.module.scss";

export interface AnalyzeAllPlaylistTracksButtonProps {
  playlistId: string;
}

export default function AnalyzeAllPlaylistTracksButton({
  playlistId,
}: AnalyzeAllPlaylistTracksButtonProps) {
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const analyzerStatus = appStore.use.analyzerStatus();
  const analyzePlaylist = appStore.use.analyzePlaylist();
  const handleAnalyzeClick = useOperationCallback(
    function* () {
      yield* analyzePlaylist(playlistId);
    },
    [analyzePlaylist, playlistId],
  );
  const buttonDisabled = audioFilesServerStatus !== "started";
  const isAnalyzing = analyzerStatus === "busy";

  return (
    <SimpleTooltip
      label={buttonDisabled ? "Disconnected from audio files server" : ""}
      side="top"
    >
      <Button
        className={styles.analyzeAllButton}
        variant="ghost"
        size="sm"
        disabled={buttonDisabled || isAnalyzing}
        onClick={handleAnalyzeClick}
      >
        {isAnalyzing ? "Analyzing…" : "Analyze all"}
      </Button>
    </SimpleTooltip>
  );
}
