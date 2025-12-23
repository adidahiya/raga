import type { TrackDefinition } from "@adahiya/raga-types";
import { useCallback, useMemo } from "react";

import { isSupportedWebAudioFileFormat } from "../common/webAudioUtils";
import { appStore } from "../store/appStore";
import { type AudioFilesServerState } from "../store/slices/audioFilesServerSlice";

export function useGetIsTrackReadyForAnalysis() {
  const audioConvertedFileURLs = appStore.use.audioConvertedFileURLs();
  const getTrackDef = appStore.use.getTrackDef();

  return useCallback(
    (trackID: number) => {
      const trackDef = getTrackDef(trackID);
      return isTrackReadyForAnalysis(trackDef, audioConvertedFileURLs);
    },
    [audioConvertedFileURLs, getTrackDef],
  );
}

export function useIsTrackReadyForAnalysis(trackID: number): boolean {
  const audioConvertedFileURLs = appStore.use.audioConvertedFileURLs();
  const getTrackDef = appStore.use.getTrackDef();
  return useMemo(() => {
    const trackDef = getTrackDef(trackID);
    return isTrackReadyForAnalysis(trackDef, audioConvertedFileURLs);
  }, [audioConvertedFileURLs, getTrackDef, trackID]);
}

export function isTrackReadyForAnalysis(
  trackDef: TrackDefinition | undefined,
  convertedFileURLs: AudioFilesServerState["audioConvertedFileURLs"],
): boolean {
  if (trackDef === undefined) {
    return false;
  }

  const trackID = trackDef["Track ID"];
  const needsConversion = !isSupportedWebAudioFileFormat(trackDef.Location);
  return (needsConversion ? convertedFileURLs[trackID] : trackDef.Location) !== undefined;
}
