import type { TrackDefinition } from "@adahiya/raga-types";
import { type CellClickedEventArgs } from "@glideapps/glide-data-grid";
import { useContextMenu } from "mantine-contextmenu";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";
import TrackRowContextMenu from "./trackRowContextMenu";

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
  const setActiveTrackId = appStore.use.setActiveTrackId();
  const { showContextMenu, isContextMenuVisible } = useContextMenu();

  const handleContextMenu = useCallback(
    (args: CellClickedEventArgs) => {
      const [_, rowIndex] = args.location;

      const newActiveTrackDef = sortedTrackDefs[rowIndex] as TrackDefinition | undefined;

      setActiveTrackId(newActiveTrackDef?.["Track ID"]);

      if (newActiveTrackDef !== undefined) {
        // Calculate viewport coordinates: bounds gives absolute cell position, localEvent gives offset within cell
        const clientX = args.bounds.x + args.localEventX;
        const clientY = args.bounds.y + args.localEventY;

        const syntheticMouseEvent = {
          clientX,
          clientY,
          bubbles: true,
          cancelable: true,
          view: window,
          button: 2,
          buttons: 2,
          relatedTarget: null,
          currentTarget: containerElement.current,
          target: containerElement.current,
          nativeEvent: new MouseEvent("contextmenu", {
            clientX,
            clientY,
            bubbles: true,
            cancelable: true,
            view: window,
            button: 2,
            buttons: 2,
            relatedTarget: null,
          }),
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          persist: () => {
            // do nothing
          },
          preventDefault: () => {
            // do nothing
          },
          stopPropagation: () => {
            // do nothing
          },
          type: "contextmenu",
          timeStamp: Date.now(),
        } as unknown as React.MouseEvent;

        showContextMenu((close) => <TrackRowContextMenu track={newActiveTrackDef} close={close} />)(
          syntheticMouseEvent,
        );
      }
    },
    [containerElement, setActiveTrackId, showContextMenu, sortedTrackDefs],
  );

  return {
    handleContextMenu,
    isContextMenuOpen: isContextMenuVisible,
  };
}
