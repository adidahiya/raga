import { NonIdealState } from "@blueprintjs/core";
import { Box, Progress, Text } from "@mantine/core";
import classNames from "classnames";
import { Panel, PanelGroup } from "react-resizable-panels";

import { formatStatNumber } from "../../common/format";
import { AudioPlayer } from "../components/audioPlayer/audioPlayer";
import { ResizeHandle } from "../components/common";
import { LibraryHeaderSection, LoadLibraryForm } from "../components/library";
import PlaylistTable from "../components/playlistTable/playlistTable";
import TrackTable from "../components/trackTable/trackTable";
import { useMasterPlaylist, useTaskEffect } from "../hooks";
import { appStore } from "../store/appStore";
import styles from "./libraryView.module.scss";

export default function LibraryView() {
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const libraryState = appStore.use.libraryLoadingState();
  const loadLibrary = appStore.use.loadSwinsianLibrary();

  useTaskEffect(
    function* () {
      if (libraryInputFilepath !== undefined) {
        yield* loadLibrary({ filepath: libraryInputFilepath });
      }
    },
    [libraryInputFilepath, loadLibrary],
  );

  return (
    <Box className={styles.container}>
      {libraryState === "none" ? (
        <NonIdealState
          title="Select a Swinsian library"
          icon="music"
          action={<LoadLibraryForm />}
        />
      ) : libraryState === "loading" ? (
        <NonIdealState
          title="Loading Swinsian library..."
          icon="music"
          action={<Progress size="sm" color="blue" animated={true} value={100} />}
        />
      ) : libraryState === "error" ? (
        <NonIdealState title="Error loading Swinsian library" icon="error" />
      ) : (
        <div className={styles.libraryLoaded}>
          <Library />
        </div>
      )}
    </Box>
  );
}

function Library() {
  const selectedPlaylistId = appStore.use.selectedPlaylistId();

  return (
    <div className={classNames("flex-column", styles.library)}>
      <div className={styles.libraryHeader}>
        <LibraryHeaderSection className={styles.libraryHeaderSection} />
      </div>
      <div className={styles.audioPlayer}>
        <AudioPlayer />
      </div>
      <PanelGroup direction="horizontal">
        <Panel className={styles.librarySidebar} defaultSize={20} minSize={20} maxSize={40}>
          <PlaylistTable />
          <LibrarySidebarFooter />
        </Panel>
        <ResizeHandle />
        <Panel minSize={30}>
          {selectedPlaylistId === undefined ? (
            <NonIdealState
              title="Playlist tracks"
              description="Select a playlist to view tracks"
              icon="list-detail-view"
            />
          ) : (
            <TrackTable playlistId={selectedPlaylistId} />
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}
LibraryView.displayName = "LibraryView";

function LibrarySidebarFooter() {
  const masterPlaylist = useMasterPlaylist();

  if (masterPlaylist === undefined) {
    return undefined;
  }

  return (
    <div className={styles.librarySidebarFooter}>
      <Text component="span" truncate={true}>
        Total # tracks: {formatStatNumber(masterPlaylist["Playlist Items"].length)}
      </Text>
    </div>
  );
}
