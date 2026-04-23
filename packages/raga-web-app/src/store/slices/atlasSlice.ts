import type { LayoutResult } from "../../atlas/layout/strategies";
import type { AppStoreGet, AppStoreSliceCreator } from "../zustandUtils";

export type AtlasGroupAxis = "genre" | "decade" | "mood" | "key";
export type AtlasColorAxis = "genre" | "energy" | "decade" | "key";
export type AtlasSizeAxis = "playCount" | "totalTime" | "rating";

export interface AtlasViewportState {
  panX: number;
  panY: number;
  zoom: number;
}

export interface AtlasFilterSet {
  genres: Set<string>;
  decades: Set<number>;
  ratings: Set<number>;
  /** Free-text query (artist/title/tag substring match). */
  query: string;
}

export interface AtlasLayoutState {
  /** Hash of the layout currently in `layout`, or undefined when nothing is computed. */
  hash: string | undefined;
  layout: LayoutResult | undefined;
  /** Algorithm requested for the next computation. */
  requestedAlgo: "axis" | "pca" | "umap";
  /** Numeric params; meaning depends on `requestedAlgo`. */
  requestedParams: { xFeature?: number; yFeature?: number; nNeighbors?: number; minDist?: number };
  /** Whether a layout computation is in flight. */
  computing: boolean;
  /** Last computation error, if any. */
  error: string | undefined;
}

export interface AtlasState {
  atlasLayout: AtlasLayoutState;
  atlasGroupAxis: AtlasGroupAxis;
  atlasColorAxis: AtlasColorAxis;
  atlasSizeAxis: AtlasSizeAxis;
  atlasFilters: AtlasFilterSet;
  atlasHoveredAlbumId: string | undefined;
  /** Multi-select set of album persistent ids. */
  atlasSelectedAlbumIds: Set<string>;
  atlasViewport: AtlasViewportState;
  /** Whether UMAP layout is enabled (feature flag). */
  atlasEnableUMAP: boolean;
}

export interface AtlasActions {
  setAtlasGroupAxis: (axis: AtlasGroupAxis) => void;
  setAtlasColorAxis: (axis: AtlasColorAxis) => void;
  setAtlasSizeAxis: (axis: AtlasSizeAxis) => void;
  setAtlasViewport: (viewport: Partial<AtlasViewportState>) => void;
  setAtlasHoveredAlbumId: (id: string | undefined) => void;
  setAtlasFilterQuery: (q: string) => void;
  toggleAtlasGenreFilter: (genre: string) => void;
  toggleAtlasDecadeFilter: (decade: number) => void;
  toggleAtlasRatingFilter: (rating: number) => void;
  resetAtlasFilters: () => void;

  /** Replace the atlas selection with the given album ids. */
  setAtlasSelectedAlbumIds: (ids: Iterable<string>) => void;
  /** Toggle a single album's membership in the selection set. */
  toggleAtlasAlbumSelection: (id: string) => void;
  /** Add albums to the selection. */
  addAtlasAlbumsToSelection: (ids: Iterable<string>) => void;
  clearAtlasSelection: () => void;

  /** Update the layout request parameters. */
  setAtlasLayoutRequest: (
    algo: AtlasLayoutState["requestedAlgo"],
    params?: AtlasLayoutState["requestedParams"],
  ) => void;
  setAtlasLayoutComputing: (computing: boolean) => void;
  setAtlasLayoutResult: (hash: string, layout: LayoutResult) => void;
  setAtlasLayoutError: (error: string | undefined) => void;
  setAtlasEnableUMAP: (enabled: boolean) => void;
}

export const ATLAS_VIEWPORT_DEFAULTS: AtlasViewportState = {
  panX: 0,
  panY: 0,
  zoom: 1,
};

export const createAtlasSlice: AppStoreSliceCreator<AtlasState & AtlasActions> = (set, get) => ({
  atlasLayout: {
    hash: undefined,
    layout: undefined,
    requestedAlgo: "axis",
    requestedParams: { xFeature: 0, yFeature: 1 },
    computing: false,
    error: undefined,
  },
  atlasGroupAxis: "genre",
  atlasColorAxis: "genre",
  atlasSizeAxis: "playCount",
  atlasFilters: {
    genres: new Set(),
    decades: new Set(),
    ratings: new Set(),
    query: "",
  },
  atlasHoveredAlbumId: undefined,
  atlasSelectedAlbumIds: new Set(),
  atlasViewport: { ...ATLAS_VIEWPORT_DEFAULTS },
  atlasEnableUMAP: false,

  setAtlasGroupAxis: (axis) => {
    set({ atlasGroupAxis: axis });
  },
  setAtlasColorAxis: (axis) => {
    set({ atlasColorAxis: axis });
  },
  setAtlasSizeAxis: (axis) => {
    set({ atlasSizeAxis: axis });
  },
  setAtlasViewport: (viewport) => {
    set((state) => {
      Object.assign(state.atlasViewport, viewport);
    });
  },
  setAtlasHoveredAlbumId: (id) => {
    set({ atlasHoveredAlbumId: id });
  },
  setAtlasFilterQuery: (q) => {
    set((state) => {
      state.atlasFilters.query = q;
    });
  },
  toggleAtlasGenreFilter: (genre) => {
    set((state) => {
      if (state.atlasFilters.genres.has(genre)) state.atlasFilters.genres.delete(genre);
      else state.atlasFilters.genres.add(genre);
    });
  },
  toggleAtlasDecadeFilter: (decade) => {
    set((state) => {
      if (state.atlasFilters.decades.has(decade)) state.atlasFilters.decades.delete(decade);
      else state.atlasFilters.decades.add(decade);
    });
  },
  toggleAtlasRatingFilter: (rating) => {
    set((state) => {
      if (state.atlasFilters.ratings.has(rating)) state.atlasFilters.ratings.delete(rating);
      else state.atlasFilters.ratings.add(rating);
    });
  },
  resetAtlasFilters: () => {
    set((state) => {
      state.atlasFilters = {
        genres: new Set(),
        decades: new Set(),
        ratings: new Set(),
        query: "",
      };
    });
  },

  setAtlasSelectedAlbumIds: (ids) => {
    const next = new Set(ids);
    set({ atlasSelectedAlbumIds: next });
    syncTrackSelectionFromAlbums(next, get);
  },
  toggleAtlasAlbumSelection: (id) => {
    set((state) => {
      if (state.atlasSelectedAlbumIds.has(id)) state.atlasSelectedAlbumIds.delete(id);
      else state.atlasSelectedAlbumIds.add(id);
    });
    syncTrackSelectionFromAlbums(get().atlasSelectedAlbumIds, get);
  },
  addAtlasAlbumsToSelection: (ids) => {
    set((state) => {
      for (const id of ids) state.atlasSelectedAlbumIds.add(id);
    });
    syncTrackSelectionFromAlbums(get().atlasSelectedAlbumIds, get);
  },
  clearAtlasSelection: () => {
    set({ atlasSelectedAlbumIds: new Set() });
    syncTrackSelectionFromAlbums(new Set(), get);
  },

  setAtlasLayoutRequest: (algo, params) => {
    set((state) => {
      state.atlasLayout.requestedAlgo = algo;
      if (params !== undefined) state.atlasLayout.requestedParams = params;
    });
  },
  setAtlasLayoutComputing: (computing) => {
    set((state) => {
      state.atlasLayout.computing = computing;
    });
  },
  setAtlasLayoutResult: (hash, layout) => {
    set((state) => {
      state.atlasLayout.hash = hash;
      state.atlasLayout.layout = layout;
      state.atlasLayout.computing = false;
      state.atlasLayout.error = undefined;
    });
  },
  setAtlasLayoutError: (error) => {
    set((state) => {
      state.atlasLayout.error = error;
      state.atlasLayout.computing = false;
    });
  },
  setAtlasEnableUMAP: (enabled) => {
    set({ atlasEnableUMAP: enabled });
  },
});

/**
 * Bridge: when the atlas selection changes, also update the track table's selection set so
 * the two views stay in sync.
 */
function syncTrackSelectionFromAlbums(albumIds: ReadonlySet<string>, get: AppStoreGet) {
  const albums = get().getAlbums();
  if (albums === undefined) return;
  const trackIds = new Set<number>();
  for (const album of albums) {
    if (albumIds.has(album.persistentAlbumId)) {
      for (const id of album.trackIds) trackIds.add(id);
    }
  }
  get().setSelectedTrackIds(trackIds);
}
