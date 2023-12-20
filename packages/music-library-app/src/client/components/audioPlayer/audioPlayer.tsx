import { Button, Classes, NonIdealState } from "@blueprintjs/core";
import { lazy, Suspense } from "react";

import { appStore } from "../../store/appStore";
import styles from "./audioPlayer.module.scss";

const AudioWaveform = lazy(() => import("./audioWaveform"));

export function AudioPlayer() {
    const hasSelectedTrack = appStore.use.selectedTrackId() !== undefined;
    const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
    const fallback = <div className={Classes.SKELETON} />;

    return (
        <div className={styles.container}>
            {isAudioFilesServerReady ? (
                hasSelectedTrack ? (
                    <Suspense fallback={fallback}>
                        <AudioWaveform />
                    </Suspense>
                ) : (
                    <NonIdealState
                        className={styles.nonIdealState}
                        description="No track selected"
                    />
                )
            ) : (
                <NonIdealState
                    className={styles.nonIdealState}
                    description="Audio files server is not running"
                    action={<StartAudioFilesServerButton />}
                />
            )}
        </div>
    );
}
AudioPlayer.displayName = "AudioPlayer";

function StartAudioFilesServerButton() {
    const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
    const startAudioFilesServer = appStore.use.startAudioFilesServer();

    return (
        <Button
            outlined={true}
            ellipsizeText={true}
            intent="primary"
            text={`Start serving files from ${audioFilesRootFolder}`}
            icon="play"
            onClick={startAudioFilesServer}
        />
    );
}
