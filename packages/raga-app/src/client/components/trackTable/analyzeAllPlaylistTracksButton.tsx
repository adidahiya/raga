import { Tooltip } from "@blueprintjs/core";
import { Button } from "@mantine/core";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
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

  return (
    <Tooltip
      compact={true}
      content={buttonDisabled ? "Disconnected from audio files server" : undefined}
      disabled={!buttonDisabled}
      fill={true}
      hoverOpenDelay={300}
      placement="top"
    >
      <Button
        className={styles.analyzeAllButton}
        disabled={buttonDisabled}
        variant="subtle"
        size="compact-sm"
        fullWidth={true}
        loading={analyzerStatus === "busy"}
        onClick={handleAnalyzeClick}
      >
        Analyze all
      </Button>
    </Tooltip>
  );
}
