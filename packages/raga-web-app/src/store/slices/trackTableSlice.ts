import { TrackPropertySortKey } from "../../common/trackPropertySortKey";
import type { AppStoreSliceCreator } from "../zustandUtils";

export interface TrackTableSortState {
  sortKey: TrackPropertySortKey;
  reverse: boolean;
}

export interface TrackTableState {
  trackTableFilterVisible: boolean;
  trackTableSort: TrackTableSortState;
}

export interface TrackTableActions {
  setTrackTableFilterVisible: (isVisible: boolean) => void;
  setTrackTableSort: (sort: TrackTableSortState) => void;
}

export const createTrackTableSlice: AppStoreSliceCreator<TrackTableState & TrackTableActions> = (
  set,
  _get,
) => ({
  trackTableFilterVisible: false,

  trackTableSort: { sortKey: TrackPropertySortKey.INDEX, reverse: false },

  setTrackTableFilterVisible: (isVisible) => {
    set({ trackTableFilterVisible: isVisible });
  },

  setTrackTableSort: (newSort) => {
    set({ trackTableSort: newSort });
  },
});
