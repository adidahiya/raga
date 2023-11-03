import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { create } from "zustand";
import { createSelectors } from "./createSelectors";

export interface AppState {
    libraryPlist: MusicLibraryPlist | undefined;
    selectedPlaylistId: string | undefined;
}

export interface AppAction {
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
    setLibraryPlist: (libraryPlist: MusicLibraryPlist | undefined) => void;
}

export const useAppStore = create<AppState & AppAction>()((set) => ({
    selectedPlaylistId: undefined,
    libraryPlist: undefined,
    setSelectedPlaylistId: (selectedPlaylistId) => set({ selectedPlaylistId }),
    setLibraryPlist: (libraryPlist) => set({ libraryPlist }),
}));

export const appStore = createSelectors(useAppStore);
