import { enableMapSet } from "immer";
import { Roarr as log } from "roarr";
import type { PersistStorage, StorageValue } from "zustand/middleware";

import type { AppState, AppStore } from "./appStore";

// HACK: global side-effect to enable immer support for Map and Set
// see https://immerjs.github.io/immer/map-set
enableMapSet();

const OMIT_FROM_PERSISTENCE: (keyof AppState)[] = [
  "audioCurrentTimeMs",
  "audioDuration",
  "audioIsPlaying",
  "audioPlaybackRate",
  "analyzerStatus",
  "audioFilesServerStatus",
  "libraryLoadingState",
  "libraryWriteState",
  "library",
  "toaster",
  "waveSurfer",
];

const MAP_PROPERTIES: (keyof AppState)[] = [
  // none for now
];

const SET_PROPERTIES: (keyof AppState)[] = ["previouslyUsedLibraries"];

/**
 * Instrument logging for store rehydration.
 */
export function onRehydrateStorage(state: AppStore | undefined) {
  if (state == null) {
    log.debug(`[client] no app state found in localStorage to rehydrate`);
  } else {
    log.debug(
      `[client] rehydrated app store from localStorage with properties: ${JSON.stringify(
        Object.keys(state),
      )}`,
    );
  }
}

/**
 * Filter out properties that should not be persisted to localStorage
 */
export function partialize(state: AppStore) {
  return Object.fromEntries(
    Object.entries(state).filter(([key]) => !OMIT_FROM_PERSISTENCE.includes(key as keyof AppState)),
  ) as Omit<AppStore, keyof typeof OMIT_FROM_PERSISTENCE>;
}

/**
 * Custom storage implementation to support Map and Set objects.
 *
 * N.B. AppActions are not persisted, since functions cannot be JSON-encoded.
 *
 * @see https://docs.pmnd.rs/zustand/integrations/persisting-store-data#how-do-i-use-it-with-map-and-set
 */
export const storage: PersistStorage<AppStore> = {
  /** Get our store from LocalStorage */
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (str == null) {
      return null;
    }

    const { state } = JSON.parse(str);
    const parsedMapAndSetEntries: Record<string, Map<unknown, unknown> | Set<unknown>> = {};

    for (const key of MAP_PROPERTIES) {
      parsedMapAndSetEntries[key] = new Map(Object.entries(state[key]));
    }

    for (const key of SET_PROPERTIES) {
      parsedMapAndSetEntries[key] = new Set(state[key]);
    }

    return {
      state: {
        ...state,
        ...parsedMapAndSetEntries,
      },
    };
  },

  /** Write our store to LocalStorage */
  setItem: (name: string, newValue: StorageValue<AppStore>) => {
    const encodedMapAndSetEntries: Record<string, unknown[] | Record<string, unknown>> = {};

    // iterate through all storage entries, converting any Maps and Sets we find to objects and
    // arrays, respectively
    for (const [key, value] of Object.entries(newValue.state)) {
      if (value instanceof Map) {
        encodedMapAndSetEntries[key] = Object.fromEntries(value.entries());
      } else if (value instanceof Set) {
        encodedMapAndSetEntries[key] = Array.from(value);
      }
    }

    const str = JSON.stringify({
      state: {
        ...newValue.state,
        ...encodedMapAndSetEntries,
      },
    });
    localStorage.setItem(name, str);
  },

  /** Remove our store from LocalStorage */
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};
