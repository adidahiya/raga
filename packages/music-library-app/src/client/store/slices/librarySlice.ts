import type {
  PlaylistDefinition,
  SwinsianLibraryPlist,
  SwinsianTrackDefinition,
} from "@adahiya/music-library-tools-lib";
import { tryit } from "radash";
import { Roarr as log } from "roarr";
import { serializeError } from "serialize-error";

import {
  DEBUG,
  LOAD_SWINSIAN_LIBRARY_TIMEOUT,
  WRITE_MODIFIED_LIBRARY_TIMEOUT,
} from "../../../common/constants";
import {
  ClientEventChannel,
  type LoadedSwinsianLibraryEventPayload,
  type LoadSwinsianLibraryOptions,
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
  libraryInputFilepath: string | undefined;
  libraryOutputFilepath: string | undefined;
  selectedPlaylistId: string | undefined;
  selectedTrackId: number | undefined;
}

export interface LibraryActions {
  // actions - complex
  loadSwinsianLibrary: (options: LoadSwinsianLibraryOptions) => Promise<void>;
  writeModiifedLibrary: () => Promise<void>;
  unloadSwinsianLibrary: () => void;

  // actions - simple getters
  getPlaylistTrackDefs: (playlistId: string) => SwinsianTrackDefinition[] | undefined;
  getPlaylistTrackIds: (playlistId: string) => number[] | undefined;
  getTrackDef: (id: number) => SwinsianTrackDefinition | undefined;
  getSelectedTrackDef: () => SwinsianTrackDefinition | undefined;

  // actions - simple setters
  setLibraryPlist: (libraryPlist: SwinsianLibraryPlist | undefined) => void;
  setLibraryInputFilepath: (libraryFilepath: string | undefined) => void;
  setLibraryOutputFilepath: (libraryFilepath: string | undefined) => void;
  setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
  setSelectedTrackId: (selectedTrackId: number | undefined) => void;
}

export const createLibrarySlice: AppStoreSliceCreator<LibraryState & LibraryActions> = (
  set,
  get,
) => ({
  library: undefined,
  libraryInputFilepath: undefined,
  libraryOutputFilepath: undefined,
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
  setLibraryInputFilepath: (libraryFilepath) => {
    set((state) => {
      state.libraryInputFilepath = libraryFilepath;
      if (state.libraryOutputFilepath === undefined) {
        // place the output adjacent to the input file by default
        const inputFolder = libraryFilepath?.split("/").slice(0, -1).join("/");
        state.libraryOutputFilepath = `${inputFolder}/ModifiedLibrary.xml`;
      }
    });
  },
  setLibraryOutputFilepath: (libraryFilepath) => {
    set({ libraryOutputFilepath: libraryFilepath });
  },
  setSelectedTrackId: (selectedTrackId) => {
    // TODO: figure out the right time to unload the old wavesurfer instance... if we do it too
    // soon (like right here), there's a noticeable delay in UI responsiveness while the React tree
    // re-renders (I think?), but if we keep the old waveform around too long, it feels stale.
    // get().unloadWaveSurfer();
    set({ selectedTrackId });
  },

  // complex actions
  loadSwinsianLibrary: async (options: LoadSwinsianLibraryOptions) => {
    set({ libraryLoadingState: "loading" });

    window.api.send(ClientEventChannel.LOAD_SWINSIAN_LIBRARY, options);

    const [err, data] = await tryit(window.api.waitForResponse)<LoadedSwinsianLibraryEventPayload>(
      ServerEventChannel.LOADED_SWINSIAN_LIBRARY,
      LOAD_SWINSIAN_LIBRARY_TIMEOUT,
    );

    if (data === undefined) {
      set({ libraryLoadingState: "error" });
      log.error(`[client] failed to load Swinsian library: ${JSON.stringify(serializeError(err))}`);
      return;
    }

    log.trace("[renderer] got loaded library");
    if (DEBUG) {
      console.log(data);
    }

    set((state) => {
      state.startAudioFilesServer();
      state.libraryLoadingState = "loaded";
      state.library = data.library;
      state.libraryPlaylists = getLibraryPlaylists(data.library);
    });
  },

  writeModiifedLibrary: async () => {
    const { library, libraryInputFilepath, libraryOutputFilepath, libraryWriteState } = get();

    if (library === undefined) {
      log.error("[client] No library loaded");
      return;
    } else if (libraryWriteState !== "ready") {
      log.info(`[client] No library modifications to write to disk`);
      return;
    } else if (libraryInputFilepath === undefined || libraryOutputFilepath === undefined) {
      log.error("[client] No output filepath specified");
      return;
    }

    log.trace(`[client] Writing modified library to disk...`);

    // lock up the analyzer while writing to disk, for simplicity's sake
    set({ analyzerStatus: "busy", libraryWriteState: "busy" });

    window.api.send(ClientEventChannel.WRITE_MODIFIED_LIBRARY, {
      library,
      inputFilepath: libraryInputFilepath,
      outputFilepath: libraryOutputFilepath,
    });

    const [err] = await tryit(window.api.waitForResponse)(
      ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE,
      WRITE_MODIFIED_LIBRARY_TIMEOUT,
    );

    if (err !== undefined) {
      log.error(`[client] timed out writing modified library to disk`);
    }

    set({ libraryWriteState: "ready" });
  },

  unloadSwinsianLibrary: () => {
    set({
      library: undefined,
      libraryInputFilepath: undefined,
      libraryOutputFilepath: undefined,
      libraryPlaylists: undefined,
      libraryLoadingState: "none",
    });
    get().stopAudioFilesServer();
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
