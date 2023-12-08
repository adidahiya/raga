import { MusicLibraryPlist, TrackDefinition } from "@adahiya/music-library-tools-lib";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { createSelectors } from "./createSelectors";

export interface AppState {
    libraryPlist: MusicLibraryPlist | undefined;
    selectedPlaylistId: string | undefined;
}

export interface AppAction {
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
    setLibraryPlist: (libraryPlist: MusicLibraryPlist | undefined) => void;
    setTrackBPM: (id: number, bpm: number) => void;
}

export const useAppStore = create<AppState & AppAction>()(
    immer((set) => ({
        selectedPlaylistId: undefined,
        libraryPlist: undefined,

        setSelectedPlaylistId: (selectedPlaylistId: string | undefined) =>
            set({ selectedPlaylistId }),

        setLibraryPlist: (libraryPlist) => set({ libraryPlist }),

        setTrackBPM: (id, bpm) => {
            set((state) => {
                if (state.libraryPlist === undefined) {
                    return;
                }
                // HACKHACK: type cast
                (state.libraryPlist.Tracks[id] as TrackDefinition).BPM = bpm;
                console.info("****** updated BPM", id, bpm);
            });
        },
    })),
);

export const appStore = createSelectors(useAppStore);
