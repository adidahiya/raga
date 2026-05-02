import { Button, Separator } from "@adahiya/raga-design-system";
import { ClientEventChannel, type TrackDefinition } from "@adahiya/raga-types";
import { useCallback } from "react";
import { IoFolderOpen } from "react-icons/io5";
import { Roarr as log } from "roarr";

import { appStore } from "../../store/appStore";
import styles from "./trackRowContextMenu.module.scss";

export default function TrackRowContextMenu({
  track,
  close,
}: {
  track: TrackDefinition | undefined;
  close: () => void;
}) {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  const libraryPlaylistsContainingTrack = appStore.use.libraryPlaylistsContainingTrack();
  const selectedPlaylistId = appStore.use.selectedPlaylistId();

  const handleOpenFile = () => {
    if (track === undefined) {
      close();
      return;
    }

    const filepath = decodeURIComponent(track.Location.replace("file://", ""));
    log.debug(`[client] Opening file at path: '${filepath}'`);
    window.api.send(ClientEventChannel.OPEN_FILE_LOCATION, { filepath });
    close();
  };

  if (track === undefined || libraryPlaylists === undefined) {
    return undefined;
  }

  const playlistsContainingThisTrack = libraryPlaylistsContainingTrack[track["Track ID"]];
  const showInPlaylistItems =
    playlistsContainingThisTrack === undefined ||
    playlistsContainingThisTrack.size === 0 ? undefined : (
      <>
        <Separator />
        <span className={`${styles.trackName} truncate`}>Show in playlist</span>
        <div className={`${styles.playlistLinksMenuSection} flex items-center`}>
          <ul className={`${styles.playlistLinksList} flex flex-col gap-0`}>
            {/* TODO: nest playlists according to depth */}
            {[...playlistsContainingThisTrack]
              .filter((playlistID) => playlistID !== selectedPlaylistId)
              .map((playlistID) => (
                <ShowTrackInPlaylistMenuItem
                  key={playlistID}
                  playlistID={playlistID}
                  close={close}
                />
              ))}
          </ul>
        </div>
      </>
    );

  return (
    <div tabIndex={0} className="flex flex-col gap-0">
      <span className={`${styles.trackName} truncate`}>
        <em>{track.Artist}</em>
        {"  "}&ndash;{"  "}
        <em>{track.Name}</em>
      </span>
      <Separator />
      <Button
        size="sm"
        variant="ghost"
        className={`${styles.contextMenuButton} m-1.5 justify-start`}
        onClick={handleOpenFile}
      >
        <span className="inline-flex items-center gap-2">
          <IoFolderOpen />
          Reveal in Finder
        </span>
      </Button>
      {showInPlaylistItems}
    </div>
  );
}

interface ShowTrackInPlaylistMenuItemProps {
  playlistID: string;
  close: () => void;
}

function ShowTrackInPlaylistMenuItem({ playlistID, close }: ShowTrackInPlaylistMenuItemProps) {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();

  const playlist = libraryPlaylists![playlistID];

  const handleClick = useCallback(() => {
    setSelectedPlaylistId(playlistID);
    close();
    // TODO: consider selecting this track in the newly selected playlist?
  }, [playlistID, setSelectedPlaylistId, close]);

  return (
    <li onClick={handleClick} className={styles.playlistLinkListItem}>
      {playlist?.Name}
    </li>
  );
}
