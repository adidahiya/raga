import type { AppStoreSliceCreator } from "../zustandUtils";

export interface SidebarState {
  isPlaylistTreeExpanded: boolean;
}

export interface SidebarActions {
  togglePlaylistTreeExpanded: () => void;
}

export const createSidebarSlice: AppStoreSliceCreator<SidebarState & SidebarActions> = (
  set,
  get,
) => ({
  isPlaylistTreeExpanded: true,

  togglePlaylistTreeExpanded: () => {
    const { isPlaylistTreeExpanded } = get();
    set({ isPlaylistTreeExpanded: !isPlaylistTreeExpanded });
  },
});
