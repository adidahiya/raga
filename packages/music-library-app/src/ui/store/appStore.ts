import { MusicLibraryPlist, TrackDefinition } from "@adahiya/music-library-tools-lib";
import type { IpcRendererEvent } from "electron";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";

import { createSelectors } from "./createSelectors";
import { DEBUG, DEFAULT_AUDIO_FILES_ROOT_FOLDER, LOCAL_STORAGE_KEY } from "../../common/constants";
import {
    ClientEventChannel,
    LoadSwinsianLibraryOptions,
    LoadedSwinsianLibraryEventPayload,
    ServerEventChannel,
} from "../../events";

export type LibraryLoadingState = "none" | "loading" | "loaded" | "error";
export type AudioFilesServerState = "stopped" | "starting" | "started" | "failed";

export interface AppState {
    audioFilesRootFolder: string;
    audioFilesServerState: AudioFilesServerState;
    libraryLoadingState: LibraryLoadingState;
    libraryPlist: MusicLibraryPlist | undefined;
    libraryFilepath: string | undefined;
    selectedPlaylistId: string | undefined;
}

export interface AppAction {
    // complex actions with side effects
    loadSwinsianLibrary: (options?: LoadSwinsianLibraryOptions) => void;
    startAudioFilesServer: () => void;

    // simple setters
    setAudioTracksRootFolder: (audioFilesRootFolder: string) => void;
    setLibraryPlist: (libraryPlist: MusicLibraryPlist | undefined) => void;
    setLibraryFilepath: (libraryFilepath: string | undefined) => void;
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
    setTrackBPM: (id: number, bpm: number) => void;
}

export const useAppStore = create<AppState & AppAction>()(
    devtools(
        // persist app store to localStorage, see https://docs.pmnd.rs/zustand/integrations/persisting-store-data
        persist(
            // use immer for immutable updates, see https://docs.pmnd.rs/zustand/integrations/immer-middleware
            immer((set) => {
                // TODO: extract into a standalone function (requires explicit typdef for `set()` which is not easily exposed by zustand or immer)
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

                    libraryLoadingState: "none",
                    libraryFilepath: undefined,
                    libraryPlist: undefined,

                    setAudioTracksRootFolder: (audioFilesRootFolder: string) =>
                        set({ audioFilesRootFolder }),

                    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) =>
                        set({ selectedPlaylistId }),

                    setLibraryPlist: (libraryPlist) => set({ libraryPlist }),

                    setLibraryFilepath: (libraryFilepath) => set({ libraryFilepath }),

                    setTrackBPM: (id, bpm) => {
                        set((state) => {
                            if (state.libraryPlist === undefined) {
                                return;
                            }
                            // HACKHACK: type cast
                            (state.libraryPlist.Tracks[id] as TrackDefinition).BPM = bpm;
                        });
                    },

                    loadSwinsianLibrary: (options: LoadSwinsianLibraryOptions = {}) =>
                        set((state) => {
                            state.libraryLoadingState = "loading";
                            window.api.send("loadSwinsianLibrary", options);
                            window.api.handle(
                                "loadedSwinsianLibrary",
                                (
                                    event: IpcRendererEvent,
                                    data: LoadedSwinsianLibraryEventPayload,
                                ) => {
                                    if (DEBUG) {
                                        console.log("[renderer] got loaded library", event, data);
                                    }

                                    if (data.library == null) {
                                        set((state) => {
                                            state.libraryLoadingState = "error";
                                        });
                                    } else {
                                        set((state) => {
                                            state.libraryLoadingState = "loaded";
                                            state.libraryPlist = data.library;
                                            state.libraryFilepath = data.filepath;
                                        });
                                    }
                                },
                            );
                        }),

                    startAudioFilesServer: () =>
                        set((state) => {
                            if (state.audioFilesServerState === "started") {
                                window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
                                window.api.handle(
                                    ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART,
                                    () => {
                                        if (DEBUG) {
                                            console.info(
                                                "[client] restarting audio files server...",
                                            );
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
            {
                name: `${LOCAL_STORAGE_KEY}-appStore`,
                version: 0,
                getStorage: () => localStorage,
                onRehydrateStorage: (state) => {
                    if (DEBUG) {
                        console.info("[client] rehydrated app store from localStorage", state);
                    }
                },
            },
        ),
    ),
);

export const appStore = createSelectors(useAppStore);
