import { TrackPropertySortKey } from "../../common/trackPropertySortKey";
import type { AppStoreSliceCreator } from "../zustandUtils";

export interface TrackTableSortState {
  sortKey: TrackPropertySortKey;
  reverse: boolean;
}

export interface TrackTableState {
  trackTableSort: TrackTableSortState;
}

export interface TrackTableActions {
  setTrackTableSort: (sort: TrackTableSortState) => void;
}

export const createTrackTableSlice: AppStoreSliceCreator<TrackTableState & TrackTableActions> = (
  set,
  _get,
) => ({
  trackTableSort: { sortKey: TrackPropertySortKey.INDEX, reverse: false },

  setTrackTableSort: (newSort) => {
    set({ trackTableSort: newSort });
  },
});
