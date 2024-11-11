import { Classes, NonIdealState } from "@blueprintjs/core";
import { Play } from "@blueprintjs/icons";
import { Button } from "@mantine/core";
import { lazy, Suspense } from "react";

import { useSelectedTrackFileURL } from "../../hooks";
import useSelectedTrackDef from "../../hooks/useSelectedTrackDef";
import { appStore } from "../../store/appStore";
import styles from "./audioPlayer.module.scss";
import { TrackBPMOverlay } from "./trackBPMOverlay";

// TODO: reconsider if this lazy-loading is worth it...
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
          <NonIdealState
            className={styles.nonIdealState}
            description={<em>No track selected</em>}
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
    <Button variant="outline" leftSection={<Play />} onClick={startAudioFilesServer}>
      Start serving files from {audioFilesRootFolder}
    </Button>
  );
}
