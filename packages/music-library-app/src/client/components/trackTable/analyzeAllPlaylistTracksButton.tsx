import { Button, Tooltip } from "@blueprintjs/core";

import { useVoidCallback } from "../../hooks";
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
  const handleAnalyzeClick = useVoidCallback(
    () => analyzePlaylist(playlistId),
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
        ellipsizeText={true}
        fill={true}
        intent="primary"
        loading={analyzerStatus === "busy"}
        minimal={true}
        onClick={handleAnalyzeClick}
        small={true}
        text="Analyze all"
      />
    </Tooltip>
  );
}
