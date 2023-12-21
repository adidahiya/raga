import { useMemo } from "react";

import { isSupportedWebAudioFileFormat } from "../../common/webAudioUtils";
import { appStore } from "../store/appStore";

export function useIsTrackReadyForAnalysis(trackID: number): boolean {
  const audioConvertedFileURLs = appStore.use.audioConvertedFileURLs();
  const getTrackDef = appStore.use.getTrackDef();
  return useMemo(() => {
    const trackDef = getTrackDef(trackID);
    const needsConversion = !isSupportedWebAudioFileFormat(trackDef?.Location);
    return (needsConversion ? audioConvertedFileURLs[trackID] : trackDef?.Location) !== undefined;
  }, [audioConvertedFileURLs, getTrackDef, trackID]);
}
