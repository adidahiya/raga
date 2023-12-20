import { Roarr as log } from "roarr";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { LOCAL_STORAGE_KEY } from "../../common/constants";
import {
    AudioAnalyzerActions,
    AudioAnalyzerState,
    createAudioAnalyzerSlice,
} from "./slices/audioAnalyzerSlice";
import {
    AudioFilesServerActions,
    AudioFilesServerState,
    createAudioFilesServerSlice,
} from "./slices/audioFilesServerSlice";
import {
    AudioPlayerActions,
    AudioPlayerState,
    createAudioPlayerSlice,
} from "./slices/audioPlayerSlice";
import { createLibrarySlice, LibraryActions, LibraryState } from "./slices/librarySlice";
import { createSelectors } from "./zustandUtils";

type AppState = AudioFilesServerState & LibraryState & AudioAnalyzerState & AudioPlayerState;
type AppActions = AudioFilesServerActions &
    LibraryActions &
    AudioAnalyzerActions &
    AudioPlayerActions;
export type AppStore = AppState & AppActions;

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
    "selectedTrackId",
    "waveSurfer",
];

export const useAppStore = create<AppStore>()(
    // persist app store to localStorage, see https://docs.pmnd.rs/zustand/integrations/persisting-store-data
    persist(
        immer((...args) => ({
            // store is split into slices, see https://docs.pmnd.rs/zustand/guides/slices-pattern
            ...createAudioFilesServerSlice(...args),
            ...createLibrarySlice(...args),
            ...createAudioAnalyzerSlice(...args),
            ...createAudioPlayerSlice(...args),
        })),
        {
            name: `${LOCAL_STORAGE_KEY}-appStore`,
            version: 0,
            getStorage: () => localStorage,
            onRehydrateStorage: (state) => {
                // HACKHACK: zustand types are wrong here, the state may be undefined
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (state == null) {
                    log.debug(`[client] no app state found in localStorage to rehydrate`);
                } else {
                    log.debug(
                        `[client] rehydrated app store from localStorage with properties: ${JSON.stringify(
                            Object.keys(state),
                        )}`,
                    );
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

export const appStore = createSelectors(useAppStore);
