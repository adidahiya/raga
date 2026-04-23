import { TrackPropertySortKey } from "../../common/trackPropertySortKey";
import type { AppStoreSliceCreator } from "../zustandUtils";

export interface TrackTableSortState {
  sortKey: TrackPropertySortKey;
  reverse: boolean;
}

export interface TrackTableState {
  trackTableFilterVisible: boolean;
  trackTableSort: TrackTableSortState;
  /**
   * Multi-select set of track ids that's safe to read across slices. The track-table component
   * still owns its in-component selection state for click handling, but writes the resolved
   * selection here so the atlas (and other consumers) can stay in sync.
   */
  selectedTrackIds: Set<number>;
}

export interface TrackTableActions {
  setTrackTableFilterVisible: (isVisible: boolean) => void;
  setTrackTableSort: (sort: TrackTableSortState) => void;
  setSelectedTrackIds: (ids: Iterable<number>) => void;
  addSelectedTrackIds: (ids: Iterable<number>) => void;
  clearSelectedTrackIds: () => void;
}

export const createTrackTableSlice: AppStoreSliceCreator<TrackTableState & TrackTableActions> = (
  set,
  _get,
) => ({
  trackTableFilterVisible: false,
  trackTableSort: { sortKey: TrackPropertySortKey.INDEX, reverse: false },
  selectedTrackIds: new Set(),

  setTrackTableFilterVisible: (isVisible) => {
    set({ trackTableFilterVisible: isVisible });
  },
  setTrackTableSort: (newSort) => {
    set({ trackTableSort: newSort });
  },
  setSelectedTrackIds: (ids) => {
    set({ selectedTrackIds: new Set(ids) });
  },
  addSelectedTrackIds: (ids) => {
    set((state) => {
      for (const id of ids) state.selectedTrackIds.add(id);
    });
  },
  clearSelectedTrackIds: () => {
    set({ selectedTrackIds: new Set() });
  },
});
