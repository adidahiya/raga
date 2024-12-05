import type { TrackDefinition } from "@adahiya/raga-lib";
import { FolderOpen } from "@blueprintjs/icons";
import { Button, Divider, Group, Stack, Text } from "@mantine/core";
import { useCallback } from "react";
import { Roarr as log } from "roarr";

import { ClientEventChannel } from "../../../common/events";
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

  const handleOpenFile = useCallback(() => {
    if (track === undefined) {
      close();
      return;
    }

    const filepath = decodeURIComponent(track.Location.replace("file://", ""));
    log.debug(`[client] Opening file at path: '${filepath}'`);
    window.api.send(ClientEventChannel.OPEN_FILE_LOCATION, { filepath });
    close();
  }, [track, close]);

  // TODO: check if autofocus still works with Mantine context menu
  // we manually implement autoFocus here ContextMenuPopover does not support the `autoFocus` prop
  // const containerElement = useRef<HTMLUListElement>(null);
  // useEffect(() => {
  //   containerElement.current?.focus();
  // });

  if (track === undefined || libraryPlaylists === undefined) {
    return undefined;
  }

  const playlistsContainingThisTrack = libraryPlaylistsContainingTrack[track["Track ID"]];
  const showInPlaylistItems =
    playlistsContainingThisTrack === undefined ||
    playlistsContainingThisTrack.size === 0 ? undefined : (
      <>
        <Divider orientation="horizontal" />
        <Text component="span" className={styles.trackName} truncate={true}>
          Show in playlist
        </Text>
        <Group className={styles.playlistLinksMenuSection}>
          <Stack component="ul" gap={0} className={styles.playlistLinksList}>
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
          </Stack>
        </Group>
      </>
    );

  return (
    <Stack tabIndex={0} gap={0}>
      <Text component="span" className={styles.trackName} truncate={true}>
        <em>{track.Artist}</em>
        {"  "}&ndash;{"  "}
        <em>{track.Name}</em>
      </Text>
      <Divider orientation="horizontal" />
      <Button
        size="compact-sm"
        variant="subtle"
        justify="flex-start"
        color="gray"
        m={5}
        leftSection={<FolderOpen />}
        onClick={handleOpenFile}
        classNames={{ label: styles.buttonLabel }}
      >
        Reveal in Finder
      </Button>
      {showInPlaylistItems}
    </Stack>
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
