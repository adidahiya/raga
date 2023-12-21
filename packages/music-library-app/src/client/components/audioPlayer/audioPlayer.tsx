import { Button, Classes, NonIdealState } from "@blueprintjs/core";
import { lazy, Suspense } from "react";

import { useSelectedTrackFileURL } from "../../hooks";
import useSelectedTrackDef from "../../hooks/useSelectedTrackDef";
import { appStore } from "../../store/appStore";
import styles from "./audioPlayer.module.scss";
import { TrackBPMOverlay } from "./trackBPMOverlay";

const AudioWaveform = lazy(() => import("./audioWaveform"));

export function AudioPlayer() {
  const selectedTrack = useSelectedTrackDef();
  const hasSelectedTrack = selectedTrack !== undefined;
  const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
  const selectedFileURL = useSelectedTrackFileURL();
  const fallback = <div className={Classes.SKELETON} />;

  return (
    <div className={styles.container}>
      {isAudioFilesServerReady ? (
        hasSelectedTrack ? (
          <div className={styles.waveformContainer}>
            <Suspense fallback={fallback}>
              <AudioWaveform mediaURL={selectedFileURL} />
            </Suspense>
            <TrackBPMOverlay trackDef={selectedTrack} />
          </div>
        ) : (
          <NonIdealState className={styles.nonIdealState} description="No track selected" />
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
