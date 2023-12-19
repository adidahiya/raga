import { Roarr as log } from "roarr";
import type WaveSurfer from "wavesurfer.js";

import { AppStoreSliceCreator } from "../zustandUtils";

export interface AudioPlayerState {
    waveSurfer: WaveSurfer | undefined;
}

export interface AudioPlayerActions {
    audioPlay: () => Promise<void>;
    audioPause: () => void;
    setWaveSurfer: (waveSurfer: WaveSurfer) => void;
    audioIsPlaying: boolean;
}

export const createAudioPlayerSlice: AppStoreSliceCreator<AudioPlayerState & AudioPlayerActions> = (
    set,
    get,
) => ({
    audioIsPlaying: false,
    waveSurfer: undefined,

    setWaveSurfer: (waveSurfer) => {
        const { getSelectedTrackDef, waveSurfer: oldWaveSurfer } = get();
        const selectedTrackDef = getSelectedTrackDef();

        if (oldWaveSurfer !== undefined) {
            oldWaveSurfer.destroy();
        }

        if (selectedTrackDef !== undefined) {
            log.debug(
                `[client] created new waveSurfer instance for track ${selectedTrackDef["Track ID"]} (location: ${selectedTrackDef.Location}))`,
            );
        }

        set({ waveSurfer });
    },

    audioPlay: async () => {
        const { waveSurfer } = get();
        if (waveSurfer === undefined) {
            return;
        }
        await waveSurfer.play();
        set({ audioIsPlaying: true });
    },

    audioPause: () => {
        const { waveSurfer } = get();
        if (waveSurfer === undefined) {
            return;
        }
        waveSurfer.pause();
        set({ audioIsPlaying: false });
    },
});
