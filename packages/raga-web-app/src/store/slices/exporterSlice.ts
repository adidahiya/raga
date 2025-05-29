import type { AppStoreSliceCreator } from "../zustandUtils";

// TODO: bring libraryOutputFilepath over from librarySlice
export interface ExporterState {
  /** Placeholder for tracking progress of some export operation */
  exportProgress: number;
  /** IDs of playlists that have been selected for export to the output library */
  selectedPlaylistIdsForExport: string[];
}

export interface ExporterActions {
  /** Sets the current progress of an export operation */
  setExportProgress: (progress: number) => void;
  /** Updates the list of playlist IDs that should be included in the exported library */
  setSelectedPlaylistIdsForExport: (playlistIds: string[]) => void;
}

export const createExporterSlice: AppStoreSliceCreator<ExporterState & ExporterActions> = (
  set,
  _get,
) => ({
  exportProgress: 0,
  selectedPlaylistIdsForExport: [],

  setExportProgress: (progress) => {
    set({ exportProgress: progress });
  },

  setSelectedPlaylistIdsForExport: (playlistIds) => {
    set({ selectedPlaylistIdsForExport: playlistIds, libraryWriteState: "ready" });
  },
});
