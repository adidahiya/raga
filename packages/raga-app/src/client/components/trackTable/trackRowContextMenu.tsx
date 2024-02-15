import type { TrackDefinition } from "@adahiya/raga-lib";
import { Menu, MenuDivider, MenuItem, Text } from "@blueprintjs/core";
import { useCallback, useEffect, useRef } from "react";
import { Roarr as log } from "roarr";

import { ClientEventChannel } from "../../../common/events";
import styles from "./trackRowContextMenu.module.scss";

export default function TrackRowContextMenu({ track }: { track: TrackDefinition | undefined }) {
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

  if (track === undefined) {
    return undefined;
  }

  return (
    <Menu tabIndex={0} ulRef={containerElement}>
      <Text className={styles.trackName} ellipsize={true}>
        <em>{track.Artist}</em>
        {"  "}&ndash;{"  "}
        <em>{track.Name}</em>
      </Text>
      <MenuDivider />
      <MenuItem icon="folder-open" text="Reveal in Finder" onClick={handleOpenFile} />
    </Menu>
  );
}
