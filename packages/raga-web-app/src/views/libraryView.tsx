import { Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { useCallback } from "react";
import { IoList } from "react-icons/io5";
import { Panel, PanelGroup } from "react-resizable-panels";

import { formatStatNumber } from "../common/format";
import { AudioPlayer } from "../components/audioPlayer/audioPlayer";
import { AudioPlayerControls } from "../components/audioPlayer/audioPlayerControls";
import { AudioPlayerNowPlaying } from "../components/audioPlayer/audioPlayerNowPlaying";
import { ResizeHandle } from "../components/common";
import EmptyState from "../components/common/emptyState";
import AudioAnalyzerStatus from "../components/library/audioAnalyzerStatus";
import AudioFilesServerControls from "../components/library/audioFilesServerControls";
import PlaylistTable from "../components/playlistTable/playlistTable";
import TrackTable from "../components/trackTable/trackTable";
import { useMasterPlaylist } from "../hooks";
import { appStore } from "../store/appStore";
import styles from "./libraryView.module.scss";

export default function LibraryView() {
  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const getSelectedTrackDef = appStore.use.getSelectedTrackDef();
  const selectedTrack = getSelectedTrackDef();
  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();

  const handlePlaylistSelect = useCallback(
    (playlistIds: string[]) => {
      if (playlistIds.length === 0) {
        setSelectedPlaylistId(undefined);
      } else {
        setSelectedPlaylistId(playlistIds[0]);
      }
    },
    [setSelectedPlaylistId],
  );

  return (
    <Paper shadow="sm" withBorder={true} radius="sm" className={styles.library}>
      <Stack gap={0} className={styles.libraryStack}>
        <Group justify="space-between" p={5}>
          {selectedTrack === undefined ? null : (
            <AudioPlayerNowPlaying selectedTrack={selectedTrack} />
          )}
          <AudioPlayerControls />
        </Group>
        <Divider orientation="horizontal" />
        <AudioPlayer />
        <Divider orientation="horizontal" />
        <PanelGroup direction="horizontal">
          <Panel className={styles.librarySidebar} defaultSize={20} minSize={20} maxSize={40}>
            <PlaylistTable selectionMode="single" onSelect={handlePlaylistSelect} pb={87} />
            <LibrarySidebarFooter />
          </Panel>
          <ResizeHandle />
          <Panel minSize={30}>
            {selectedPlaylistId === undefined ? (
              <EmptyState
                className={styles.emptyState}
                title="Playlist tracks"
                description="Select a playlist to view tracks"
                icon={<IoList size={48} />}
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
      <Box className={styles.sidebarFooterItem}>
        <AudioFilesServerControls />
      </Box>
      <Divider orientation="horizontal" />
      <Box className={styles.sidebarFooterItem}>
        <AudioAnalyzerStatus />
      </Box>
      <Divider orientation="horizontal" />
      <Box className={styles.sidebarFooterItem}>
        <Group align="center" justify="space-between">
          <Text component="span" truncate={true} size="sm" c="dimmed">
            Total # tracks
          </Text>
          <Text component="span" truncate={true} size="sm">
            {formatStatNumber(masterPlaylist["Playlist Items"].length)}
          </Text>
        </Group>
      </Box>
    </Box>
  );
}
LibrarySidebarFooter.displayName = "LibrarySidebarFooter";
