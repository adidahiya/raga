import type { TrackDefinition } from "@adahiya/raga-lib";
import { useContextMenu } from "mantine-contextmenu";
import { useCallback } from "react";

import {
  TRACK_TABLE_FILTER_BAR_HEIGHT,
  TRACK_TABLE_HEADER_HEIGHT,
  TRACK_TABLE_ROW_HEIGHT,
} from "../../../common/constants";
import { appStore } from "../../store/appStore";
import TrackRowContextMenu from "./trackRowContextMenu";
import { getTableScrollingContainer } from "./trackTableDOMUtils";

export interface UseTrackTableContextMenuOptions {
  containerElement: React.RefObject<HTMLElement>;
  sortedTrackDefs: TrackDefinition[];
}

export interface UseTrackTableContextMenuReturnValue {
  handleContextMenu: React.MouseEventHandler<HTMLElement>;
  isContextMenuOpen: boolean;
}

export default function useTrackTableContextMenu({
  containerElement,
  sortedTrackDefs,
}: UseTrackTableContextMenuOptions): UseTrackTableContextMenuReturnValue {
  const isTableFilterVisible = appStore.use.trackTableFilterVisible();
  const setActiveTrackId = appStore.use.setActiveTrackId();
  const { showContextMenu, isContextMenuVisible } = useContextMenu();

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      const scrollingContainer = getTableScrollingContainer(containerElement.current);
      if (containerElement.current == null || scrollingContainer == null) {
        // should be an unreachable case
        return;
      }

      // locate the click within the virtual table list
      const containerTopOffset = containerElement.current.getBoundingClientRect().top;
      const topOffsetInList =
        scrollingContainer.scrollTop +
        event.clientY -
        containerTopOffset -
        TRACK_TABLE_HEADER_HEIGHT -
        (isTableFilterVisible ? TRACK_TABLE_FILTER_BAR_HEIGHT : 0);
      const trackIndex = Math.floor(topOffsetInList / TRACK_TABLE_ROW_HEIGHT);
      const newActiveTrackDef = sortedTrackDefs[trackIndex] as TrackDefinition | undefined;

      setActiveTrackId(newActiveTrackDef?.["Track ID"]);
      // isContextMenuOpen.setValue(newActiveTrackDef !== undefined);

      if (newActiveTrackDef !== undefined) {
        showContextMenu((close) => <TrackRowContextMenu track={newActiveTrackDef} close={close} />)(
          event,
        );
      }
    },
    [containerElement, isTableFilterVisible, setActiveTrackId, showContextMenu, sortedTrackDefs],
  );

  return {
    handleContextMenu,
    isContextMenuOpen: isContextMenuVisible,
  };
}
