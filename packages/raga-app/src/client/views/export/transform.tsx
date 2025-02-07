import { Text } from "@mantine/core";
import pluralize from "pluralize";
import { useCallback } from "react";

import PlaylistTable from "../../components/playlistTable/playlistTable";
import { appStore } from "../../store/appStore";

export function Transform() {
  const selectedPlaylistIdsForExport = appStore.use.selectedPlaylistIdsForExport();
  const setSelectedPlaylistIdsForExport = appStore.use.setSelectedPlaylistIdsForExport();

  const handlePlaylistsSelected = useCallback(
    (nodeIds: string[]) => {
      setSelectedPlaylistIdsForExport(nodeIds);
    },
    [setSelectedPlaylistIdsForExport],
  );

  const hasSelectedAnyPlaylists = selectedPlaylistIdsForExport.length > 0;

  return (
    <>
      {hasSelectedAnyPlaylists ? (
        <Text>
          {selectedPlaylistIdsForExport.length}{" "}
          {pluralize("playlist", selectedPlaylistIdsForExport.length)} selected for export
        </Text>
      ) : (
        <Text>All playlists will be exported</Text>
      )}
      <PlaylistTable
        collapsible={false}
        showHeader={false}
        selectionMode="multiple"
        onSelect={handlePlaylistsSelected}
      />
    </>
  );
}
