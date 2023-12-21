import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { useMemo } from "react";

import { appStore } from "../store/appStore";

export default function useSelectedTrackDef(): TrackDefinition | undefined {
  const library = appStore.use.library();
  const selectedTrackId = appStore.use.selectedTrackId();
  const getTrackDef = appStore.use.getTrackDef();

  return useMemo(() => {
    if (selectedTrackId === undefined) {
      return undefined;
    }
    return getTrackDef(selectedTrackId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library, selectedTrackId, getTrackDef]);
}
