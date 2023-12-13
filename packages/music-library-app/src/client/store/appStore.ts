import {
    SwinsianLibraryPlist,
    PlaylistDefinition,
    SwinsianTrackDefinition,
} from "@adahiya/music-library-tools-lib";
import type { IpcRendererEvent } from "electron";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

import { createSelectors } from "./createSelectors";
import {
    ANALYZE_AUDIO_FILE_TIMEOUT,
    DEBUG,
    DEFAULT_AUDIO_FILES_ROOT_FOLDER,
    LOAD_SWINSIAN_LIBRARY_TIMEOUT,
    LOCAL_STORAGE_KEY,
    WRITE_AUDIO_FILE_TAG_TIMEOUT,
    WRITE_MODIFIED_LIBRARY_TIMEOUT,
} from "../../common/constants";
import {
    ClientEventChannel,
    LoadSwinsianLibraryOptions,
    LoadedSwinsianLibraryEventPayload,
    ServerEventChannel,
} from "../../common/events";
import { loadAudioBuffer } from "../audio/buffer";
import { analyzeBPM } from "../audio/bpm";
import { isSupportedWebAudioFileFormat } from "../audio/webAudioUtils";

export type LibraryLoadingState = "none" | "loading" | "loaded" | "error";
export type libraryWriteState = "none" | "ready" | "busy";
export type AudioFilesServerState = "stopped" | "starting" | "started" | "failed";
export type AudioAnalyzerState = "ready" | "busy";

export interface AppState {
    analyzeBPMPerTrack: boolean;
    analyzerState: AudioAnalyzerState;

    audioFilesRootFolder: string;
    audioFilesServerState: AudioFilesServerState;

    library: SwinsianLibraryPlist | undefined;
    libraryLoadingState: LibraryLoadingState;
    libraryWriteState: libraryWriteState;
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
    loadSwinsianLibrary: (options?: LoadSwinsianLibraryOptions) => Promise<void>;
    startAudioFilesServer: () => void;
    analyzeTrack: (trackId: number) => Promise<void>;
    analyzePlaylist: (playlistId: string) => Promise<void>;
    writeModiifedLibrary: () => Promise<void>;

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
                // audio analyzer
                analyzeBPMPerTrack: false,
                analyzerState: "ready",

                // audio files server
                audioFilesRootFolder: DEFAULT_AUDIO_FILES_ROOT_FOLDER,
                audioFilesServerState: "stopped",

                library: undefined,
                libraryFilepath: undefined,
                libraryPlaylists: undefined,

                // LibraryView
                libraryLoadingState: "none",
                libraryWriteState: "none",
                selectedPlaylistId: undefined,

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
                    new Promise((resolve, reject) => {
                        set({ libraryLoadingState: "loading" });

                        const loadSwinsianLibraryTimeout = setTimeout(() => {
                            console.error(`[client] timed out loading Swinsian library`);
                            reject();
                        }, LOAD_SWINSIAN_LIBRARY_TIMEOUT);
                        window.api.send("loadSwinsianLibrary", options);

                        window.api.handleOnce(
                            "loadedSwinsianLibrary",
                            (event: IpcRendererEvent, data: LoadedSwinsianLibraryEventPayload) => {
                                clearTimeout(loadSwinsianLibraryTimeout);

                                if (DEBUG) {
                                    console.log("[renderer] got loaded library", event, data);
                                }

                                set((state) => {
                                    if (data.library == null) {
                                        state.libraryLoadingState = "error";
                                        reject();
                                    } else {
                                        state.libraryLoadingState = "loaded";
                                        state.library = data.library;
                                        state.libraryFilepath = data.filepath;
                                        state.libraryPlaylists = getLibraryPlaylists(data.library);
                                        resolve();
                                    }
                                });
                            },
                        );
                    }),

                writeModiifedLibrary: () => {
                    const { library, libraryFilepath, libraryWriteState } = get();

                    if (library === undefined) {
                        console.error("[client] Unable to write modified library");
                        return;
                    } else if (libraryWriteState !== "ready") {
                        console.info(`[client] No library modifications to write to disk`);
                        return;
                    }

                    set({ libraryWriteState: "busy" });
                    window.api.send(ClientEventChannel.WRITE_MODIFIED_LIBRARY, {
                        library,
                        filepath: libraryFilepath,
                    });

                    return new Promise((resolve, reject) => {
                        const writeModifiedLibraryTimeout = setTimeout(() => {
                            console.error(`[client] timed out writing modified library to disk`);
                            set({ libraryWriteState: "ready" });
                            reject();
                        }, WRITE_MODIFIED_LIBRARY_TIMEOUT);

                        window.api.handleOnce(
                            ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE,
                            () => {
                                clearTimeout(writeModifiedLibraryTimeout);
                                set({ libraryWriteState: "none" });
                                resolve();
                            },
                        );
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

                /** @throws */
                analyzeTrack: async (trackId: number) => {
                    const trackDef = get().getTrackDef(trackId);

                    if (trackDef === undefined) {
                        console.error(`[client] Unable to analyze track ${trackId}`);
                        return;
                    }

                    const fileLocation = trackDef?.Location;
                    const canAnalyzeFileFormat = isSupportedWebAudioFileFormat(trackDef);

                    if (trackDef?.BPM !== undefined || !canAnalyzeFileFormat) {
                        if (DEBUG) {
                            console.info(`[client] skipping analysis of track ${trackId}`);
                        }
                        return;
                    }

                    return new Promise(async (resolve, reject) => {
                        set({ analyzerState: "busy" });
                        const analyzeAudioTimeout = setTimeout(() => {
                            console.error(
                                `[client] failed or timed out while analyzing track ${trackId}, is the audio files server running? file location: ${fileLocation})`,
                            );
                            set({ analyzerState: "ready" });
                            reject();
                        }, ANALYZE_AUDIO_FILE_TIMEOUT);

                        const trackAudio = await loadAudioBuffer(fileLocation);
                        const bpm = Math.round(await analyzeBPM(trackAudio));
                        clearTimeout(analyzeAudioTimeout);

                        window.api.send(ClientEventChannel.WRITE_AUDIO_FILE_TAG, {
                            fileLocation,
                            tagName: "BPM",
                            value: bpm,
                        });

                        const writeTagTimeout = setTimeout(() => {
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
                                    state.libraryWriteState = "ready"; // needs to be written to disk
                                    state.analyzerState = "ready";
                                });
                                clearTimeout(writeTagTimeout);
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
                        try {
                            await analyzeTrack(trackId);
                        } catch (e) {
                            console.error(
                                `[client] error analyzing track ${trackId} in playlist ${playlistId}`,
                                e,
                            );
                            continue;
                        }
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
