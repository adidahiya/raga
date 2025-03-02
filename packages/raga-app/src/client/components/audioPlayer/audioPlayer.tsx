import { Box, Button, Center, Skeleton } from "@mantine/core";
import { lazy, Suspense } from "react";
import { IoPlay } from "react-icons/io5";

import { useSelectedTrackFileURL } from "../../hooks";
import useSelectedTrackDef from "../../hooks/useSelectedTrackDef";
import { appStore } from "../../store/appStore";
import EmptyState from "../common/emptyState";
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
      <Center bd={{ base: 1, dark: 0 }} h={90}>
        <EmptyState description="Audio files server is not running">
          <StartAudioFilesServerButton />
        </EmptyState>
      </Center>
    );
  }

  if (!hasSelectedTrack) {
    return (
      <Center bd={{ base: 1, dark: 0 }} h={110}>
        <EmptyState description="No track selected" />
      </Center>
    );
  }

  return (
    <Box pos="relative" h={90}>
      <Suspense fallback={<Skeleton width="100%" height="100%" />}>
        <AudioWaveform mediaURL={selectedFileURL} />
      </Suspense>
      <TrackBPMOverlay trackDef={selectedTrack} />
    </Box>
  );
}
AudioPlayer.displayName = "AudioPlayer";

function StartAudioFilesServerButton() {
  const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
  const startAudioFilesServer = appStore.use.startAudioFilesServer();

  return (
    <Button variant="outline" leftSection={<IoPlay />} onClick={startAudioFilesServer}>
      Start serving files from {audioFilesRootFolder}
    </Button>
  );
}
