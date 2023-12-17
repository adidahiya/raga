import {
    PlaylistDefinition,
    SwinsianLibraryPlist,
    SwinsianTrackDefinition,
} from "@adahiya/music-library-tools-lib";
import type { IpcRendererEvent } from "electron";
import { Roarr as log } from "roarr";

import {
    DEBUG,
    LOAD_SWINSIAN_LIBRARY_TIMEOUT,
    WRITE_MODIFIED_LIBRARY_TIMEOUT,
} from "../../../common/constants";
import {
    ClientEventChannel,
    LoadedSwinsianLibraryEventPayload,
    LoadSwinsianLibraryOptions,
    ServerEventChannel,
} from "../../../common/events";
import type { AppStoreSliceCreator } from "../zustandUtils";

export type LibraryLoadingState = "none" | "loading" | "loaded" | "error";
export type libraryWriteState = "none" | "ready" | "busy";

export interface LibraryState {
    library: SwinsianLibraryPlist | undefined;
    libraryLoadingState: LibraryLoadingState;
    libraryWriteState: libraryWriteState;
    /** Augmentation of MusicLibraryPlaylist which keeps a record of Playlist persistent ID -> definition */
    libraryPlaylists: PartialRecord<string, PlaylistDefinition> | undefined;
    libraryFilepath: string | undefined;
    selectedPlaylistId: string | undefined;
}

export interface LibraryActions {
    // actions - complex
    loadSwinsianLibrary: (options?: LoadSwinsianLibraryOptions) => Promise<void>;
    writeModiifedLibrary: () => Promise<void>;

    // actions - simple getters
    getPlaylistTrackDefs: (playlistId: string) => SwinsianTrackDefinition[] | undefined;
    getPlaylistTrackIds: (playlistId: string) => number[] | undefined;
    getTrackDef: (id: number) => SwinsianTrackDefinition | undefined;

    // actions - simple setters
    setLibraryPlist: (libraryPlist: SwinsianLibraryPlist | undefined) => void;
    setLibraryFilepath: (libraryFilepath: string | undefined) => void;
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
}

export const createLibrarySlice: AppStoreSliceCreator<LibraryState & LibraryActions> = (
    set,
    get,
) => ({
    library: undefined,
    libraryFilepath: undefined,
    libraryLoadingState: "none",
    libraryPlaylists: undefined,
    libraryWriteState: "none",
    selectedPlaylistId: undefined,

    // simple getters
    getTrackDef: (id) => get().library?.Tracks[id],
    getPlaylistTrackIds: (playlistId: string) =>
        get().libraryPlaylists?.[playlistId]?.["Playlist Items"].map((item) => item["Track ID"]),
    getPlaylistTrackDefs: (playlistId: string) => {
        const { getPlaylistTrackIds, getTrackDef } = get();
        return getPlaylistTrackIds(playlistId)?.map((trackId: number) => getTrackDef(trackId)!);
    },

    // simple setters
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => {
        set({ selectedPlaylistId });
    },
    setLibraryPlist: (libraryPlist) => {
        set({ library: libraryPlist });
    },
    setLibraryFilepath: (libraryFilepath) => {
        set({ libraryFilepath });
    },

    // complex actions
    loadSwinsianLibrary: (options: LoadSwinsianLibraryOptions = {}) =>
        new Promise((resolve, reject) => {
            set({ libraryLoadingState: "loading" });

            const loadSwinsianLibraryTimeout = setTimeout(() => {
                log.error(`[client] timed out loading Swinsian library`);
                set({ libraryLoadingState: "error" });
                reject();
            }, LOAD_SWINSIAN_LIBRARY_TIMEOUT);
            window.api.send("loadSwinsianLibrary", options);

            window.api.handleOnce(
                "loadedSwinsianLibrary",
                (_event: IpcRendererEvent, data?: LoadedSwinsianLibraryEventPayload) => {
                    clearTimeout(loadSwinsianLibraryTimeout);

                    log.trace("[renderer] got loaded library");
                    if (DEBUG) {
                        console.log(data);
                    }

                    set((state) => {
                        if (data === undefined) {
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
            log.error("[client] No library loaded");
            return Promise.reject();
        } else if (libraryWriteState !== "ready") {
            log.info(`[client] No library modifications to write to disk`);
            return Promise.resolve();
        }

        log.trace(`[client] Writing modified library to disk...`);
        set({ libraryWriteState: "busy" });
        window.api.send(ClientEventChannel.WRITE_MODIFIED_LIBRARY, {
            library,
            filepath: libraryFilepath,
        });

        return new Promise((resolve, reject) => {
            const writeModifiedLibraryTimeout = setTimeout(() => {
                log.error(`[client] timed out writing modified library to disk`);
                set({ libraryWriteState: "ready" });
                reject();
            }, WRITE_MODIFIED_LIBRARY_TIMEOUT);

            window.api.handleOnce(ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE, () => {
                clearTimeout(writeModifiedLibraryTimeout);
                log.trace(`[client] Done writing modified library to disk.`);
                set({ libraryWriteState: "none" });
                resolve();
            });
        });
    },
});

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
