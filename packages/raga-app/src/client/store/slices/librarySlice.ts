import type {
  PlaylistDefinition,
  SwinsianLibraryPlist,
  SwinsianTrackDefinition,
} from "@adahiya/raga-lib";
import { call, type Operation } from "effection";
import { Roarr as log } from "roarr";

import {
  DEBUG,
  LOAD_SWINSIAN_LIBRARY_TIMEOUT,
  WRITE_MODIFIED_LIBRARY_TIMEOUT,
} from "../../../common/constants";
import { ClientErrors } from "../../../common/errorMessages";
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
  /** A track may be "active" in the table through right-click (context menu) or arrow key interactions */
  activeTrackId: number | undefined;
  library: SwinsianLibraryPlist | undefined;
  libraryLoadingState: LibraryLoadingState;
  libraryWriteState: libraryWriteState;
  /** Augmentation of MusicLibraryPlaylist which keeps a record of Playlist persistent ID -> definition */
  libraryPlaylists: PartialRecord<string, PlaylistDefinition> | undefined;
  /** Augmentation of MusicLibraryPlaylist which keeps a record of track ID -> list of playlists IDs in which it appears */
  libraryPlaylistsContainingTrack: PartialRecord<number, string[]>;
  libraryInputFilepath: string | undefined;
  libraryOutputFilepath: string | undefined;
  selectedPlaylistId: string | undefined;
  /** A track may be "selected" by left-clicking on it */
  selectedTrackId: number | undefined;
}

export interface LibraryActions {
  // actions - complex
  loadSwinsianLibrary: (options: LoadSwinsianLibraryOptions) => Operation<void>;
  writeModiifedLibrary: () => Operation<void>;
  unloadSwinsianLibrary: () => void;

  // actions - simple getters
  getPlaylistTrackDefs: (playlistId: string) => SwinsianTrackDefinition[] | undefined;
  getPlaylistTrackIds: (playlistId: string) => number[] | undefined;
  getTrackDef: (id: number) => SwinsianTrackDefinition | undefined;
  getSelectedTrackDef: () => SwinsianTrackDefinition | undefined;

  // actions - simple setters
  setActiveTrackId: (activeTrackId: number | undefined) => void;
  setLibraryPlist: (libraryPlist: SwinsianLibraryPlist | undefined) => void;
  setLibraryInputFilepath: (libraryFilepath: string | undefined) => void;
  setLibraryOutputFilepath: (libraryFilepath: string | undefined) => void;
  setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => void;
  setSelectedTrackId: (selectedTrackId: number | undefined) => void;
  setTrackRating: (trackId: number, rating: number) => Operation<void>;
}

export const createLibrarySlice: AppStoreSliceCreator<LibraryState & LibraryActions> = (
  set,
  get,
) => ({
  activeTrackId: undefined,
  library: undefined,
  libraryInputFilepath: undefined,
  libraryOutputFilepath: undefined,
  libraryLoadingState: "none",
  libraryPlaylists: undefined,
  libraryPlaylistsContainingTrack: {},
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
  setActiveTrackId: (activeTrackId) => {
    set({ activeTrackId });
  },
  setSelectedPlaylistId: (selectedPlaylistId: string | undefined) => {
    set({ selectedPlaylistId });
  },
  setLibraryPlist: (libraryPlist) => {
    set({ library: libraryPlist });
  },
  setLibraryInputFilepath: (newInputFilepath) => {
    set((state) => {
      state.libraryInputFilepath = newInputFilepath;

      if (state.libraryOutputFilepath === undefined && newInputFilepath !== undefined) {
        // place the output adjacent to the input file by default
        const inputFolder = newInputFilepath.split("/").slice(0, -1).join("/");
        state.libraryOutputFilepath = `${inputFolder}/ModifiedLibrary.xml`;
      }
    });

    if (newInputFilepath !== undefined) {
      // Important: don't call other state-mutating functions inside a producer, otherwise we may
      // persist stale state to localStorage
      get().saveCurrentLibraryPath(newInputFilepath);
    }
  },
  setLibraryOutputFilepath: (newOutputFilepath) => {
    set({ libraryOutputFilepath: newOutputFilepath });
  },
  setSelectedTrackId: (selectedTrackId) => {
    // TODO: figure out the right time to unload the old wavesurfer instance... if we do it too
    // soon (like right here), there's a noticeable delay in UI responsiveness while the React tree
    // re-renders (I think?), but if we keep the old waveform around too long, it feels stale.
    // get().unloadWaveSurfer();
    set({ selectedTrackId });
  },
  setTrackRating: function* (trackID, ratingOutOf100) {
    const { getTrackDef, writeAudioFileTag } = get();
    const trackDef = getTrackDef(trackID);

    if (trackDef === undefined) {
      log.error(ClientErrors.libraryNoTrackDefFound(trackID));
      return;
    }

    yield* writeAudioFileTag(trackDef, "Rating", ratingOutOf100);

    log.info(`[client] completed updating Rating for track ${trackID.toString()}`);

    set((state) => {
      state.library!.Tracks[trackID].Rating = ratingOutOf100;
      state.libraryWriteState = "ready"; // needs to be written to disk
    });
  },

  // complex actions
  loadSwinsianLibrary: function* (options: LoadSwinsianLibraryOptions): Operation<void> {
    set({ libraryLoadingState: "loading" });

    window.api.send(ClientEventChannel.LOAD_SWINSIAN_LIBRARY, options);

    try {
      const data = yield* call(
        window.api.waitForResponse<LoadedSwinsianLibraryEventPayload>(
          ServerEventChannel.LOADED_SWINSIAN_LIBRARY,
          LOAD_SWINSIAN_LIBRARY_TIMEOUT,
        ),
      );
      log.trace("[client] got loaded library");
      if (DEBUG) {
        console.log(data);
      }

      // validate that the currently selected track ID (possibly loaded from local storage) exists in the newly loaded library
      const { selectedTrackId } = get();
      if (selectedTrackId !== undefined) {
        const trackDef = data!.library.Tracks[selectedTrackId];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (trackDef === undefined) {
          log.trace(
            `[client] previous selectedTrackId '${selectedTrackId.toString()}' does not exist in current library`,
          );
          set({ selectedTrackId: undefined });
        }
      }

      set((state) => {
        const { longestCommonAudioFilePath } = data!.libraryMeta;
        if (longestCommonAudioFilePath !== "") {
          log.debug(`[client] setting audio tracks root folder to ${longestCommonAudioFilePath}`);
          state.audioFilesRootFolder = longestCommonAudioFilePath;
        }
        state.startAudioFilesServer();
        state.libraryLoadingState = "loaded";
        state.library = data!.library;
        state.libraryPlaylists = getLibraryPlaylists(data!.library);
        state.libraryPlaylistsContainingTrack = getLibraryPlaylistsContainingTrack(data!.library);
      });
    } catch (e) {
      set({ libraryLoadingState: "error" });
      log.error(ClientErrors.libraryFailedToLoad(e as Error));
    }
  },

  writeModiifedLibrary: function* (): Operation<void> {
    const { library, libraryInputFilepath, libraryOutputFilepath, libraryWriteState } = get();

    if (library === undefined) {
      log.error(ClientErrors.LIBRARY_NOT_LOADED);
      return;
    } else if (libraryWriteState !== "ready") {
      log.info(`[client] No library modifications to write to disk`);
      return;
    } else if (libraryInputFilepath === undefined || libraryOutputFilepath === undefined) {
      log.error(ClientErrors.LIBRARY_WRITE_NO_OUTPUT_FILEPATH);
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

    try {
      yield* call(
        window.api.waitForResponse(
          ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE,
          WRITE_MODIFIED_LIBRARY_TIMEOUT,
        ),
      );
      set({ libraryWriteState: "none" });
    } catch (e) {
      log.error(ClientErrors.LIBRARY_WRITE_TIMED_OUT);
      set({ libraryWriteState: "ready" });
    } finally {
      set({ analyzerStatus: "ready" });
    }
  },

  unloadSwinsianLibrary: () => {
    set({
      library: undefined,
      libraryInputFilepath: undefined,
      libraryOutputFilepath: undefined,
      libraryPlaylists: undefined,
      libraryLoadingState: "none",
      selectedPlaylistId: undefined,
      selectedTrackId: undefined,
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

function getLibraryPlaylistsContainingTrack(
  libraryPlist: SwinsianLibraryPlist,
): PartialRecord<number, string[]> {
  const libraryPlaylistsContainingTrack: PartialRecord<number, string[]> = {};
  for (const playlist of libraryPlist.Playlists) {
    if (playlist.Master === true || playlist.Name === "Music") {
      // skip master playlists
      continue;
    }

    for (const item of playlist["Playlist Items"]) {
      const trackID = item["Track ID"];
      if (libraryPlaylistsContainingTrack[trackID] === undefined) {
        libraryPlaylistsContainingTrack[trackID] = [];
      }
      libraryPlaylistsContainingTrack[trackID]!.push(playlist["Playlist Persistent ID"]);
    }
  }
  return libraryPlaylistsContainingTrack;
}
