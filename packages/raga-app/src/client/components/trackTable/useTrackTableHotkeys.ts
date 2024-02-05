import { useHotkeys } from "@blueprintjs/core";
import { useCallback, useMemo } from "react";

import { TRACK_TABLE_ROW_HEIGHT } from "../../../common/constants";
import { appStore } from "../../store/appStore";
import { getTableScrollingContainer } from "./trackTableDOMUtils";

export interface UseTrackTableHotkeysOptions {
  containerElement: React.RefObject<HTMLElement>;
  sortedTrackIds: number[];
}

// we should have a bit of buffer from the top and bottom of the table body when bringing the selected track into view
const VERTICAL_SCROLL_BUFFER = 40;

export default function useTrackTableHotkeys({
  containerElement,
  sortedTrackIds,
}: UseTrackTableHotkeysOptions) {
  const selectedTrackId = appStore.use.selectedTrackId();

  // N.B. it would be nice to use `Element.scrollIntoView()` here, but that doesn't work nicely with virtualized lists
  // see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
  const handleScrollToSelectedTrack = useCallback(() => {
    if (selectedTrackId === undefined || containerElement.current === null) {
      return;
    }

    const indexOfTrackInPlaylist = sortedTrackIds.indexOf(selectedTrackId);
    const scrollingContainer = getTableScrollingContainer(containerElement.current);
    if (scrollingContainer == null || indexOfTrackInPlaylist < 0) {
      return;
    }

    const minHeightToViewSelectedTrack = indexOfTrackInPlaylist * TRACK_TABLE_ROW_HEIGHT;
    const isTrackAboveViewableWindow =
      scrollingContainer.scrollTop > minHeightToViewSelectedTrack - VERTICAL_SCROLL_BUFFER;
    const isTrackBelowViewableWindow =
      scrollingContainer.scrollTop + scrollingContainer.clientHeight <
      minHeightToViewSelectedTrack - VERTICAL_SCROLL_BUFFER;

    if (isTrackAboveViewableWindow || isTrackBelowViewableWindow) {
      scrollingContainer.scrollTo({
        top: minHeightToViewSelectedTrack - VERTICAL_SCROLL_BUFFER,
        behavior: "smooth",
      });
    }
  }, [containerElement, sortedTrackIds, selectedTrackId]);

  const hotkeyConfig = useMemo(
    () => [
      {
        global: true,
        group: "Track Browser",
        combo: "cmd+l",
        label: "Scroll to selected track",
        onKeyDown: handleScrollToSelectedTrack,
      },
    ],
    [handleScrollToSelectedTrack],
  );

  return useHotkeys(hotkeyConfig);
}
