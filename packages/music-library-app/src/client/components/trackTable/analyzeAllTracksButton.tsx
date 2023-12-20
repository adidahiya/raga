import { Button, Tooltip } from "@blueprintjs/core";

import { useVoidCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export function AnalyzeAllTracksInSelectedPlaylistButton() {
    const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
    const analyzerStatus = appStore.use.analyzerStatus();
    const analyzePlaylist = appStore.use.analyzePlaylist();
    const selectedPlaylistId = appStore.use.selectedPlaylistId();
    const handleAnalyzeClick = useVoidCallback(
        () => analyzePlaylist(selectedPlaylistId!),
        [analyzePlaylist, selectedPlaylistId],
    );
    const buttonDisabled = audioFilesServerStatus !== "started";

    return (
        <Tooltip
            compact={true}
            disabled={!buttonDisabled}
            placement="top"
            content={buttonDisabled ? "Disconnected from audio files server" : undefined}
            hoverOpenDelay={300}
        >
            <Button
                className={styles.analyzeAllButton}
                disabled={buttonDisabled}
                ellipsizeText={true}
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
