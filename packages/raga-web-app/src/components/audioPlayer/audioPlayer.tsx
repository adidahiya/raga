import { Button } from "@adahiya/raga-design-system";
import { lazy, Suspense } from "react";
import { IoPlay } from "react-icons/io5";

import { useSelectedTrackFileURL } from "../../hooks";
import useSelectedTrackDef from "../../hooks/useSelectedTrackDef";
import { appStore } from "../../store/appStore";
import EmptyState from "../common/emptyState";
import styles from "./audioPlayer.module.scss";
import { TrackBPMOverlay } from "./trackBPMOverlay";

// TODO: reconsider if this lazy-loading is worth it...
const AudioWaveform = lazy(() => import("./audioWaveform"));

export function AudioPlayer() {
  const selectedTrack = useSelectedTrackDef();
  const hasSelectedTrack = selectedTrack !== undefined;
  const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
  const selectedFileURL = useSelectedTrackFileURL();

  if (!isAudioFilesServerReady) {
    return (
      <div className="flex h-[90px] items-center justify-center">
        <EmptyState description="Audio files server is not running">
          <StartAudioFilesServerButton />
        </EmptyState>
      </div>
    );
  }

  if (!hasSelectedTrack) {
    return (
      <div className="flex h-[110px] items-center justify-center">
        <EmptyState description="No track selected" />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Suspense
        fallback={<div className="h-full w-full animate-pulse bg-surface-3" />}
      >
        <AudioWaveform mediaURL={selectedFileURL} />
      </Suspense>
      <TrackBPMOverlay trackDef={selectedTrack} />
    </div>
  );
}
AudioPlayer.displayName = "AudioPlayer";

function StartAudioFilesServerButton() {
  const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
  const startAudioFilesServer = appStore.use.startAudioFilesServer();

  return (
    <Button variant="secondary" onClick={startAudioFilesServer}>
      <span className="inline-flex items-center gap-2">
        <IoPlay />
        Start serving files from {audioFilesRootFolder}
      </span>
    </Button>
  );
}
