import { ListDetailView } from "@blueprintjs/icons";
import { Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { Panel, PanelGroup } from "react-resizable-panels";

import { formatStatNumber } from "../../common/format";
import { AudioPlayer } from "../components/audioPlayer/audioPlayer";
import { AudioPlayerControls } from "../components/audioPlayer/audioPlayerControls";
import { AudioPlayerNowPlaying } from "../components/audioPlayer/audioPlayerNowPlaying";
import { ResizeHandle } from "../components/common";
import EmptyState from "../components/common/emptyState";
import PlaylistTable from "../components/playlistTable/playlistTable";
import TrackTable from "../components/trackTable/trackTable";
import { useMasterPlaylist } from "../hooks";
import { appStore } from "../store/appStore";
import styles from "./libraryView.module.scss";

export default function LibraryView() {
  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const waveSurfer = appStore.use.waveSurfer();
  const getSelectedTrackDef = appStore.use.getSelectedTrackDef();
  const selectedTrack = getSelectedTrackDef();

  return (
    <Paper w="100%" h="100%" shadow="sm" withBorder={true} radius="sm" className={styles.library}>
      <Stack gap={0} w="100%" h="100%">
        {selectedTrack === undefined || waveSurfer === undefined ? null : (
          <>
            <Group justify="space-between" p={5}>
              <AudioPlayerNowPlaying selectedTrack={selectedTrack} />
              <AudioPlayerControls />
            </Group>
            <Divider orientation="horizontal" />
          </>
        )}
        <AudioPlayer />
        <Divider orientation="horizontal" />
        <PanelGroup direction="horizontal">
          <Panel className={styles.librarySidebar} defaultSize={20} minSize={20} maxSize={40}>
            <PlaylistTable />
            <LibrarySidebarFooter />
          </Panel>
          <ResizeHandle />
          <Panel minSize={30}>
            {selectedPlaylistId === undefined ? (
              <EmptyState
                className={styles.emptyState}
                title="Playlist tracks"
                description="Select a playlist to view tracks"
                icon={<ListDetailView size={48} />}
              />
            ) : (
              <TrackTable playlistId={selectedPlaylistId} />
            )}
          </Panel>
        </PanelGroup>
      </Stack>
    </Paper>
  );
}
LibraryView.displayName = "LibraryView";

function LibrarySidebarFooter() {
  const masterPlaylist = useMasterPlaylist();

  if (masterPlaylist === undefined) {
    return undefined;
  }

  return (
    <Box className={styles.librarySidebarFooter}>
      <Divider orientation="horizontal" />
      <Box py={5} px={7}>
        <Text component="span" truncate={true}>
          Total # tracks: {formatStatNumber(masterPlaylist["Playlist Items"].length)}
        </Text>
      </Box>
    </Box>
  );
}
