import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { create } from "zustand";

export interface AppStore {
    libraryPlist: MusicLibraryPlist | undefined;
    selectedPlaylistId: string | undefined;
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
    setLibraryPlist: (libraryPlist: MusicLibraryPlist | undefined) => void;
}

export const useAppStore = create<AppStore>()((set) => ({
    selectedPlaylistId: undefined,
    libraryPlist: undefined,
    setSelectedPlaylistId: (selectedPlaylistId) => set({ selectedPlaylistId }),
    setLibraryPlist: (libraryPlist) => set({ libraryPlist }),
}));
