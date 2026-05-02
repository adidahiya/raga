import pluralize from "pluralize";

import PlaylistTable from "../../components/playlistTable/playlistTable";
import { appStore } from "../../store/appStore";

export function Transform() {
  const selectedPlaylistIdsForExport = appStore.use.selectedPlaylistIdsForExport();
  const setSelectedPlaylistIdsForExport = appStore.use.setSelectedPlaylistIdsForExport();

  const hasSelectedAnyPlaylists = selectedPlaylistIdsForExport.length > 0;

  return (
    <>
      {hasSelectedAnyPlaylists ? (
        <span>
          {selectedPlaylistIdsForExport.length}{" "}
          {pluralize("playlist", selectedPlaylistIdsForExport.length)} selected for export
        </span>
      ) : (
        <span>All playlists will be exported</span>
      )}
      <PlaylistTable
        showHeader={false}
        selectionMode="multiple"
        onSelect={setSelectedPlaylistIdsForExport}
      />
    </>
  );
}
