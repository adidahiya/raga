import type { TrackDefinition } from "@adahiya/raga-types";
import { type CellClickedEventArgs } from "@glideapps/glide-data-grid";
import { useContextMenu } from "mantine-contextmenu";
import { useCallback } from "react";

import { TRACK_TABLE_FILTER_BAR_HEIGHT, TRACK_TABLE_HEADER_HEIGHT } from "../../common/constants";
import { appStore } from "../../store/appStore";
import TrackRowContextMenu from "./trackRowContextMenu";
import { getTableScrollingContainer } from "./trackTableDOMUtils";

export interface UseTrackTableContextMenuOptions {
  containerElement: React.RefObject<HTMLElement | null>;
  sortedTrackDefs: TrackDefinition[];
}

export interface UseTrackTableContextMenuReturnValue {
  handleContextMenu: (args: CellClickedEventArgs) => void;
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
    (args: CellClickedEventArgs) => {
      const scrollingContainer = getTableScrollingContainer(containerElement.current);
      if (containerElement.current == null || scrollingContainer == null) {
        // should be an unreachable case
        return;
      }

      // locate the click within the virtual table list
      const containerTopOffset = containerElement.current.getBoundingClientRect().top;
      const topOffsetInList =
        scrollingContainer.scrollTop +
        args.localEventY -
        containerTopOffset -
        TRACK_TABLE_HEADER_HEIGHT -
        (isTableFilterVisible ? TRACK_TABLE_FILTER_BAR_HEIGHT : 0);
      const [_, rowIndex] = args.location;

      const newActiveTrackDef = sortedTrackDefs[rowIndex] as TrackDefinition | undefined;

      setActiveTrackId(newActiveTrackDef?.["Track ID"]);

      if (newActiveTrackDef !== undefined) {
        const syntheticMouseEvent = {
          clientX: args.localEventX,
          clientY: topOffsetInList,
          bubbles: true,
          cancelable: true,
          view: window,
          button: 2,
          buttons: 2,
          relatedTarget: null,
          currentTarget: containerElement.current,
          target: containerElement.current,
          nativeEvent: new MouseEvent("contextmenu", {
            clientX: args.localEventX,
            clientY: topOffsetInList,
            bubbles: true,
            cancelable: true,
            view: window,
            button: 2,
            buttons: 2,
            relatedTarget: null,
          }),
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {},
          type: "contextmenu",
          timeStamp: Date.now(),
        } as unknown as React.MouseEvent;

        showContextMenu((close) => <TrackRowContextMenu track={newActiveTrackDef} close={close} />)(
          syntheticMouseEvent,
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
