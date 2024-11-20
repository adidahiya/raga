import type { TrackDefinition } from "@adahiya/raga-lib";
import { ChevronRight, FolderOpen, Property } from "@blueprintjs/icons";
import { Button, Divider, Menu, Stack, Text } from "@mantine/core";
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
  // TODO: fix clicking on submenu items
  const showInPlaylistItems =
    playlistsContainingThisTrack === undefined ||
    playlistsContainingThisTrack.size === 0 ? undefined : (
      <Menu trigger="hover" position="right-start" closeDelay={500}>
        <Menu.Target>
          <Button
            size="compact-sm"
            m={5}
            justify="flex-start"
            variant="subtle"
            color="gray"
            leftSection={<Property />}
            rightSection={<ChevronRight />}
            classNames={{ label: styles.buttonLabel }}
          >
            Show in playlist
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {[...playlistsContainingThisTrack]
            .filter((playlistID) => playlistID !== selectedPlaylistId)
            .map((playlistID) => (
              <ShowTrackInPlaylistMenuItem key={playlistID} playlistID={playlistID} close={close} />
            ))}
        </Menu.Dropdown>
      </Menu>
    );

  return (
    <Stack tabIndex={0} gap={0}>
      <Text component="span" className={styles.trackName} truncate={true}>
        <em>{track.Artist}</em>
        {"  "}&ndash;{"  "}
        <em>{track.Name}</em>
      </Text>
      <Divider orientation="horizontal" />
      {showInPlaylistItems}
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

  return <Menu.Item onClick={handleClick}>{playlist?.Name}</Menu.Item>;
}
