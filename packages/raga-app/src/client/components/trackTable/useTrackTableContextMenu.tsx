import type { TrackDefinition } from "@adahiya/raga-lib";
import { ContextMenuPopover } from "@blueprintjs/core";
import { useCallback, useState } from "react";
import { useBoolean } from "usehooks-ts";

import { TRACK_TABLE_HEADER_HEIGHT, TRACK_TABLE_ROW_HEIGHT } from "../../../common/constants";
import type { Offset } from "../../common/types";
import { appStore } from "../../store/appStore";
import TrackRowContextMenu from "./trackRowContextMenu";
import { getTableScrollingContainer } from "./trackTableDOMUtils";

export interface UseTrackTableContextMenuOptions {
  containerElement: React.RefObject<HTMLElement>;
  sortedTrackDefs: TrackDefinition[];
}

export interface UseTrackTableContextMenuReturnValue {
  handleContextMenu: React.MouseEventHandler<HTMLElement>;
  contextMenuPopover: React.ReactElement;
}

export default function useTrackTableContextMenu({
  containerElement,
  sortedTrackDefs,
}: UseTrackTableContextMenuOptions): UseTrackTableContextMenuReturnValue {
  const isContextMenuOpen = useBoolean(false);
  const [targetOffset, setTargetOffset] = useState<Offset>({ left: 0, top: 0 });
  // "active" for the context menu means the track that was right-clicked
  const [activeTrackDef, setActiveTrackDef] = useState<TrackDefinition | undefined>(undefined);
  const setActiveTrackId = appStore.use.setActiveTrackId();

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
        TRACK_TABLE_HEADER_HEIGHT;
      const trackIndex = Math.floor(topOffsetInList / TRACK_TABLE_ROW_HEIGHT);
      const newActiveTrackDef = sortedTrackDefs[trackIndex] as TrackDefinition | undefined;

      setActiveTrackDef(newActiveTrackDef);
      setActiveTrackId(newActiveTrackDef?.["Track ID"]);
      isContextMenuOpen.setValue(newActiveTrackDef !== undefined);
      setTargetOffset({
        left: event.clientX,
        top: event.clientY,
      });
    },
    [containerElement, isContextMenuOpen, setActiveTrackId, sortedTrackDefs],
  );

  const handleClose = useCallback(() => {
    isContextMenuOpen.setFalse();
    setActiveTrackId(undefined);
  }, [isContextMenuOpen, setActiveTrackId]);

  const contextMenuPopover = (
    <ContextMenuPopover
      content={<TrackRowContextMenu track={activeTrackDef} />}
      isOpen={isContextMenuOpen.value}
      targetOffset={targetOffset}
      onClose={handleClose}
      isDarkTheme={true}
    />
  );

  return {
    handleContextMenu,
    contextMenuPopover,
  };
}
