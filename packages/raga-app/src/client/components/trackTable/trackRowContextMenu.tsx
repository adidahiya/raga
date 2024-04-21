import type { TrackDefinition } from "@adahiya/raga-lib";
import { Menu, MenuDivider, MenuItem, Text } from "@blueprintjs/core";
import { Property } from "@blueprintjs/icons";
import { useCallback, useEffect, useRef } from "react";
import { Roarr as log } from "roarr";

import { ClientEventChannel } from "../../../common/events";
import { appStore } from "../../store/appStore";
import styles from "./trackRowContextMenu.module.scss";

export default function TrackRowContextMenu({ track }: { track: TrackDefinition | undefined }) {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  const libraryPlaylistsContainingTrack = appStore.use.libraryPlaylistsContainingTrack();
  const selectedPlaylistId = appStore.use.selectedPlaylistId();

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

  if (track === undefined || libraryPlaylists === undefined) {
    return undefined;
  }

  const playlistsContainingThisTrack = libraryPlaylistsContainingTrack[track["Track ID"]];
  const showInPlaylistItems =
    playlistsContainingThisTrack === undefined ||
    playlistsContainingThisTrack.size === 0 ? undefined : (
      <MenuItem text="Show in playlist" icon={<Property />}>
        {[...playlistsContainingThisTrack]
          .filter((playlistID) => playlistID !== selectedPlaylistId)
          .map((playlistID) => (
            <ShowTrackInPlaylistMenuItem key={playlistID} playlistID={playlistID} />
          ))}
      </MenuItem>
    );

  return (
    <Menu tabIndex={0} ulRef={containerElement}>
      <Text className={styles.trackName} ellipsize={true}>
        <em>{track.Artist}</em>
        {"  "}&ndash;{"  "}
        <em>{track.Name}</em>
      </Text>
      <MenuDivider />
      {showInPlaylistItems}
      <MenuItem icon="folder-open" text="Reveal in Finder" onClick={handleOpenFile} />
    </Menu>
  );
}

interface ShowTrackInPlaylistMenuItemProps {
  playlistID: string;
}

function ShowTrackInPlaylistMenuItem({ playlistID }: ShowTrackInPlaylistMenuItemProps) {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();

  const playlist = libraryPlaylists![playlistID];

  const handleClick = useCallback(() => {
    setSelectedPlaylistId(playlistID);
    // TODO: consider selecting this track in the newly selected playlist?
  }, [playlistID, setSelectedPlaylistId]);

  return <MenuItem text={playlist?.Name} onClick={handleClick} />;
}
