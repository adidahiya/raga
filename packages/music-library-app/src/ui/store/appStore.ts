import {
    SwinsianLibraryPlist,
    PlaylistDefinition,
    SwinsianTrackDefinition,
    convertSwinsianToItunesXmlLibrary,
    serializeLibraryPlist,
    getOutputLibraryPath,
} from "@adahiya/music-library-tools-lib";
import type { IpcRendererEvent } from "electron";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

import { createSelectors } from "./createSelectors";
import {
    DEBUG,
    DEFAULT_AUDIO_FILES_ROOT_FOLDER,
    LOCAL_STORAGE_KEY,
    WRITE_AUDIO_FILE_TAG_TIMEOUT,
} from "../../common/constants";
import {
    ClientEventChannel,
    LoadSwinsianLibraryOptions,
    LoadedSwinsianLibraryEventPayload,
    ServerEventChannel,
} from "../../events";
import { loadAudioBuffer } from "../../audio/buffer";
import { analyzeBPM } from "../../audio/bpm";

export type LibraryLoadingState = "none" | "loading" | "loaded" | "error";
export type AudioFilesServerState = "stopped" | "starting" | "started" | "failed";
export type AudioAnalyzerState = "ready" | "busy";

export interface AppState {
    analyzeBPMPerTrack: boolean;
    analyzerState: AudioAnalyzerState;

    audioFilesRootFolder: string;
    audioFilesServerState: AudioFilesServerState;

    libraryLoadingState: LibraryLoadingState;
    library: SwinsianLibraryPlist | undefined;
    /** Augmentation of MusicLibraryPlaylist which keeps a record of Playlist persistent ID -> definition */
    libraryPlaylists: Record<string, PlaylistDefinition> | undefined;
    libraryFilepath: string | undefined;

    selectedPlaylistId: string | undefined;
}

const OMIT_FROM_PERSISTENCE: (keyof AppState)[] = [
    "analyzerState",
    "audioFilesServerState",
    "libraryLoadingState",
    "library",
];

export interface AppAction {
    // complex actions with side effects
    loadSwinsianLibrary: (options?: LoadSwinsianLibraryOptions) => void;
    startAudioFilesServer: () => void;
    analyzeTrack: (trackId: number) => Promise<void>;
    analyzePlaylist: (playlistId: string) => Promise<void>;
    writeModiifedLibrary: () => void;

    // simple getters
    getPlaylistTrackIds: (playlistId: string) => number[] | undefined;
    getPlaylistTrackDefs: (playlistId: string) => SwinsianTrackDefinition[] | undefined;
    getTrackDef: (id: number) => SwinsianTrackDefinition | undefined;

    // simple setters
    setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => void;
    setAudioTracksRootFolder: (audioFilesRootFolder: string) => void;
    setLibraryPlist: (libraryPlist: SwinsianLibraryPlist | undefined) => void;
    setLibraryFilepath: (libraryFilepath: string | undefined) => void;
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
}

export const useAppStore = create<AppState & AppAction>()(
    // persist app store to localStorage, see https://docs.pmnd.rs/zustand/integrations/persisting-store-data
    persist(
        // use immer for immutable updates, see https://docs.pmnd.rs/zustand/integrations/immer-middleware
        immer((set, get) => {
            // TODO: extract into a standalone function (requires explicit typdef for `set()` which is not easily exposed by zustand or immer)
            function initAudioFilesServerWithStore() {
                set((state) => {
                    window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_START, {
                        audioFilesRootFolder: state.audioFilesRootFolder,
                    });
                    state.audioFilesServerState = "starting";

                    window.api.handleOnce(ServerEventChannel.AUDIO_FILES_SERVER_STARTED, () => {
                        set((state) => {
                            state.audioFilesServerState = "started";
                        });
                    });

                    window.api.handleOnce(ServerEventChannel.AUDIO_FILES_SERVER_ERROR, () => {
                        set((state) => {
                            state.audioFilesServerState = "failed";
                        });
                    });
                });
            }

            return {
                analyzeBPMPerTrack: false,
                analyzerState: "ready",

                audioFilesRootFolder: DEFAULT_AUDIO_FILES_ROOT_FOLDER,
                audioFilesServerState: "stopped",
                selectedPlaylistId: undefined,

                libraryLoadingState: "none",
                libraryFilepath: undefined,
                library: undefined,
                libraryPlaylists: undefined,

                // simple getters
                getTrackDef: (id) => get().library?.Tracks?.[id],
                getPlaylistTrackIds: (playlistId: string) =>
                    get().libraryPlaylists?.[playlistId]["Playlist Items"].map(
                        (item) => item["Track ID"],
                    ),
                getPlaylistTrackDefs: (playlistId: string) => {
                    const { getPlaylistTrackIds, getTrackDef } = get();
                    return getPlaylistTrackIds(playlistId)?.map(getTrackDef);
                },

                // simple setters
                setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => set({ analyzeBPMPerTrack }),
                setAudioTracksRootFolder: (audioFilesRootFolder: string) =>
                    set({ audioFilesRootFolder }),
                setSelectedPlaylistId: (selectedPlaylistId: string | undefined) =>
                    set({ selectedPlaylistId }),
                setLibraryPlist: (libraryPlist) => set({ library: libraryPlist }),
                setLibraryFilepath: (libraryFilepath) => set({ libraryFilepath }),

                // complex actions
                loadSwinsianLibrary: (options: LoadSwinsianLibraryOptions = {}) =>
                    set((state) => {
                        state.libraryLoadingState = "loading";
                        window.api.send("loadSwinsianLibrary", options);
                        window.api.handleOnce(
                            "loadedSwinsianLibrary",
                            (event: IpcRendererEvent, data: LoadedSwinsianLibraryEventPayload) => {
                                if (DEBUG) {
                                    console.log("[renderer] got loaded library", event, data);
                                }

                                set((state) => {
                                    if (data.library == null) {
                                        state.libraryLoadingState = "error";
                                    } else {
                                        state.libraryLoadingState = "loaded";
                                        state.library = data.library;
                                        state.libraryFilepath = data.filepath;
                                        state.libraryPlaylists = getLibraryPlaylists(data.library);
                                    }
                                });
                            },
                        );
                    }),

                writeModiifedLibrary: () => {
                    const { library, libraryFilepath } = get();

                    if (library === undefined) {
                        console.error("[client] Unable to write modified library");
                        return;
                    }

                    window.api.send(ClientEventChannel.WRITE_MODIFIED_LIBRARY, {
                        library,
                        filepath: libraryFilepath,
                    });
                },

                startAudioFilesServer: () =>
                    set((state) => {
                        if (state.audioFilesServerState === "started") {
                            window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
                            window.api.handleOnce(
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

                analyzeTrack: async (trackId: number) => {
                    const trackDef = get().getTrackDef(trackId);

                    const fileLocation = trackDef?.Location;
                    if (fileLocation === undefined) {
                        console.error(`[client] Unable to analyze track ${trackId}`);
                        return;
                    }

                    set({ analyzerState: "busy" });

                    const trackAudio = await loadAudioBuffer(fileLocation);
                    const bpm = Math.round(await analyzeBPM(trackAudio));

                    return new Promise((resolve, reject) => {
                        window.api.send(ClientEventChannel.WRITE_AUDIO_FILE_TAG, {
                            fileLocation,
                            tagName: "BPM",
                            value: bpm,
                        });

                        const timeout = setTimeout(() => {
                            console.error(
                                `[client] timed out writing BPM tag for track ${trackId}`,
                            );
                            reject();
                        }, WRITE_AUDIO_FILE_TAG_TIMEOUT);

                        window.api.handleOnce(
                            ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
                            () => {
                                console.info(
                                    `[client] completed updating BPM for track ${trackId}`,
                                );
                                set((state) => {
                                    state.library!.Tracks![trackId].BPM = bpm;
                                    state.analyzerState = "ready";
                                });
                                clearTimeout(timeout);
                                resolve();
                            },
                        );
                    });
                },

                analyzePlaylist: async (playlistId: string) => {
                    const { libraryPlaylists, analyzeTrack } = get();

                    if (libraryPlaylists === undefined) {
                        console.error(
                            `[client] Unable to analyze playlist ${playlistId}, libraryPlaylists is undefined`,
                        );
                        return;
                    }

                    const playlistDef = libraryPlaylists![playlistId];
                    if (playlistDef === undefined) {
                        console.error(
                            `[client] Unable to analyze playlist ${playlistId}, could not find it in the library`,
                        );
                        return;
                    }

                    if (DEBUG) {
                        console.info(
                            `[client] analyzing playlist '${playlistDef.Name}' (ID: ${playlistId})...`,
                        );
                    }

                    const trackIds = playlistDef["Playlist Items"].map((item) => item["Track ID"]);

                    for (const trackId of trackIds) {
                        await analyzeTrack(trackId);
                    }
                },
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
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(
                        ([key]) => !OMIT_FROM_PERSISTENCE.includes(key as keyof AppState),
                    ),
                ),
        },
    ),
);

// TODO: move to a separate module, refactor to deal with playlist updates
function getLibraryPlaylists(
    libraryPlist: SwinsianLibraryPlist,
): Record<string, PlaylistDefinition> {
    const libraryPlaylists: Record<string, PlaylistDefinition> = {};
    for (const playlist of libraryPlist.Playlists) {
        libraryPlaylists[playlist["Playlist Persistent ID"]] = playlist;
    }
    return libraryPlaylists;
}

export const appStore = createSelectors(useAppStore);
