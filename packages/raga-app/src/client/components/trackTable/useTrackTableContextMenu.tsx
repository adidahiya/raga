import type { TrackDefinition } from "@adahiya/raga-lib";
import { ContextMenuPopover, Menu, MenuItem } from "@blueprintjs/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Roarr as log } from "roarr";
import { useBoolean } from "usehooks-ts";

import { TRACK_TABLE_HEADER_HEIGHT, TRACK_TABLE_ROW_HEIGHT } from "../../../common/constants";
import { ClientEventChannel } from "../../../common/events";
import type { Offset } from "../../common/types";
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

  const contextMenuPopover = (
    <ContextMenuPopover
      content={<TrackRowContextMenu track={activeTrackDef} />}
      isOpen={isContextMenuOpen.value}
      targetOffset={targetOffset}
      onClose={isContextMenuOpen.setFalse}
      isDarkTheme={true}
    />
  );

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
      setActiveTrackDef(sortedTrackDefs[trackIndex]);

      isContextMenuOpen.setTrue();
      setTargetOffset({
        left: event.clientX,
        top: event.clientY,
      });
    },
    [containerElement, isContextMenuOpen, sortedTrackDefs],
  );

  return {
    handleContextMenu,
    contextMenuPopover,
  };
}

function TrackRowContextMenu({ track }: { track: TrackDefinition | undefined }) {
  const handleOpenFile = useCallback(() => {
    if (track === undefined) {
      return;
    }

    const filepath = decodeURIComponent(track.Location.replace("file://", ""));
    log.debug(`[client] Opening file at path: '${filepath}'`);
    window.api.send(ClientEventChannel.OPEN_FILE_LOCATION, { filepath });
  }, [track]);

  // we manually implement autoFocus here ContextMenuPopover does not support the `autoFocus` prop
  const containerElement = useRef<HTMLUListElement>(null);
  useEffect(() => {
    containerElement.current?.focus();
  });

  return (
    <Menu tabIndex={0} ulRef={containerElement}>
      <MenuItem text="Reveal in Finder" onClick={handleOpenFile} />
    </Menu>
  );
}
