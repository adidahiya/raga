import {
    PlaylistDefinition,
    SwinsianLibraryPlist,
    SwinsianTrackDefinition,
} from "@adahiya/music-library-tools-lib";
import { Roarr as log } from "roarr";
import { serializeError } from "serialize-error";

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
    selectedTrackId: number | undefined;
}

export interface LibraryActions {
    // actions - complex
    loadSwinsianLibrary: (options?: LoadSwinsianLibraryOptions) => Promise<void>;
    writeModiifedLibrary: () => Promise<void>;

    // actions - simple getters
    getPlaylistTrackDefs: (playlistId: string) => SwinsianTrackDefinition[] | undefined;
    getPlaylistTrackIds: (playlistId: string) => number[] | undefined;
    getTrackDef: (id: number) => SwinsianTrackDefinition | undefined;
    getSelectedTrackDef: () => SwinsianTrackDefinition | undefined;

    // actions - simple setters
    setLibraryPlist: (libraryPlist: SwinsianLibraryPlist | undefined) => void;
    setLibraryFilepath: (libraryFilepath: string | undefined) => void;
    setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
    setSelectedTrackId: (selectedTrackId: number | undefined) => void;
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
    selectedTrackId: undefined,

    // simple getters
    getTrackDef: (id) => get().library?.Tracks[id],
    getPlaylistTrackIds: (playlistId: string) =>
        get().libraryPlaylists?.[playlistId]?.["Playlist Items"].map((item) => item["Track ID"]),
    getPlaylistTrackDefs: (playlistId: string) => {
        const { getPlaylistTrackIds, getTrackDef } = get();
        return getPlaylistTrackIds(playlistId)?.map((trackId: number) => getTrackDef(trackId)!);
    },
    getSelectedTrackDef: () => {
        const { getTrackDef, selectedTrackId } = get();
        return selectedTrackId === undefined ? undefined : getTrackDef(selectedTrackId);
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
    setSelectedTrackId: (selectedTrackId) => {
        set({ selectedTrackId });
    },

    // complex actions
    loadSwinsianLibrary: async (options: LoadSwinsianLibraryOptions = {}) => {
        set({ libraryLoadingState: "loading" });

        window.api.send(ClientEventChannel.LOAD_SWINSIAN_LIBRARY, options);
        try {
            const data = await window.api.waitForResponse<LoadedSwinsianLibraryEventPayload>(
                ServerEventChannel.LOADED_SWINSIAN_LIBRARY,
                LOAD_SWINSIAN_LIBRARY_TIMEOUT,
            );

            if (data === undefined) {
                set({ libraryLoadingState: "error" });
                throw new Error("unknown error");
            }

            log.trace("[renderer] got loaded library");
            if (DEBUG) {
                console.log(data);
            }

            set((state) => {
                state.libraryLoadingState = "loaded";
                state.library = data.library;
                state.libraryFilepath = data.filepath;
                state.libraryPlaylists = getLibraryPlaylists(data.library);
            });
        } catch (e) {
            set({ libraryLoadingState: "error" });
            log.error(
                `[client] failed to load Swinsian library: ${JSON.stringify(serializeError(e))}`,
            );
        }
    },

    writeModiifedLibrary: async () => {
        const { library, libraryFilepath, libraryWriteState } = get();

        if (library === undefined) {
            log.error("[client] No library loaded");
            return;
        } else if (libraryWriteState !== "ready") {
            log.info(`[client] No library modifications to write to disk`);
            return;
        }

        log.trace(`[client] Writing modified library to disk...`);
        set({ libraryWriteState: "busy" });
        window.api.send(ClientEventChannel.WRITE_MODIFIED_LIBRARY, {
            library,
            filepath: libraryFilepath,
        });

        try {
            await window.api.waitForResponse(
                ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE,
                WRITE_MODIFIED_LIBRARY_TIMEOUT,
            );
            set({ libraryWriteState: "none" });
        } catch (e) {
            log.error(`[client] timed out writing modified library to disk`);
            set({ libraryWriteState: "ready" });
        }
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
