import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { Button, Tooltip } from "@blueprintjs/core";
import { useMemo } from "react";

import { isSupportedWebAudioFileFormat } from "../../audio/webAudioUtils";
import { useVoidCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export function AnalyzeSingleTrackButton({ trackDef }: { trackDef: TrackDefinition }) {
    const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
    const trackId = trackDef["Track ID"];

    const analyzeTrack = appStore.use.analyzeTrack();
    const handleAnalyzeBPM = useVoidCallback(() => analyzeTrack(trackId), [analyzeTrack, trackId]);

    const isUnsupportedFileFormat = useMemo(
        () => !isSupportedWebAudioFileFormat(trackDef),
        [trackDef],
    );
    const tooltipContent = useMemo(
        () =>
            isUnsupportedFileFormat
                ? "Unsupported audio file format"
                : !isAudioFilesServerReady
                  ? "Disconnected from audio files server"
                  : undefined,
        [isAudioFilesServerReady, isUnsupportedFileFormat],
    );
    const buttonDisabled = !isAudioFilesServerReady || isUnsupportedFileFormat;

    return (
        <Tooltip
            compact={true}
            disabled={!buttonDisabled}
            placement="top"
            content={tooltipContent}
            hoverOpenDelay={300}
            fill={true}
        >
            <Button
                className={styles.analyzeTrackButton}
                disabled={buttonDisabled}
                outlined={true}
                small={true}
                text="Analyze"
                onClick={handleAnalyzeBPM}
            />
        </Tooltip>
    );
}
AnalyzeSingleTrackButton.displayName = "AnalyzeSingleTrackButton";
