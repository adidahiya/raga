import { MusicLibraryPlist, TrackDefinition } from "@adahiya/music-library-tools-lib";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { createSelectors } from "./createSelectors";
import { DEBUG, DEFAULT_AUDIO_FILES_ROOT_FOLDER } from "../../common/constants";
import { startAudioFilesServer } from "../../audio/audioFilesServer";
import { ClientEventChannel, ServerEventChannel } from "../../events";

export interface AppState {
    audioFilesRootFolder: string;
    audioFilesServerState: "stopped" | "starting" | "started" | "failed";
    libraryPlist: MusicLibraryPlist | undefined;
    selectedPlaylistId: string | undefined;
    startAudioFilesServer: () => void;
}

export interface AppAction {
    setAudioTracksRootFolder: (audioFilesRootFolder: string) => void;
    setLibraryPlist: (libraryPlist: MusicLibraryPlist | undefined) => void;
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
    setTrackBPM: (id: number, bpm: number) => void;
}

export const useAppStore = create<AppState & AppAction>()(
    immer((set) => {
        function initAudioFilesServerWithStore() {
            set((state) => {
                window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_START, {
                    audioFilesRootFolder: state.audioFilesRootFolder,
                });
                state.audioFilesServerState = "starting";

                window.api.handle(ServerEventChannel.AUDIO_FILES_SERVER_STARTED, () => {
                    set((state) => {
                        state.audioFilesServerState = "started";
                    });
                });

                window.api.handle(ServerEventChannel.AUDIO_FILES_SERVER_ERROR, () => {
                    set((state) => {
                        state.audioFilesServerState = "failed";
                    });
                });
            });
        }

        return {
            audioFilesRootFolder: DEFAULT_AUDIO_FILES_ROOT_FOLDER,
            audioFilesServerState: "stopped",
            selectedPlaylistId: undefined,
            libraryPlist: undefined,

            setAudioTracksRootFolder: (audioFilesRootFolder: string) =>
                set({ audioFilesRootFolder }),

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
                });
            },

            startAudioFilesServer: () =>
                set((state) => {
                    if (state.audioFilesServerState === "started") {
                        window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
                        window.api.handle(
                            ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART,
                            () => {
                                if (DEBUG) {
                                    console.info("[client] restarting audio files server...");
                                }
                                initAudioFilesServerWithStore();
                            },
                        );
                    } else {
                        if (DEBUG) {
                            console.info("[client] starting audio files server...");
                        }
                        initAudioFilesServerWithStore();
                    }
                }),
        };
    }),
);

export const appStore = createSelectors(useAppStore);
