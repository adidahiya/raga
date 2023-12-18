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
        get().waveSurfer?.destroy();
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
