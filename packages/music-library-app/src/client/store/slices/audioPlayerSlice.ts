import { Roarr as log } from "roarr";
import type WaveSurfer from "wavesurfer.js";

import { AppStoreSliceCreator } from "../zustandUtils";

export interface AudioPlayerState {
    audioIsPlaying: boolean;
    audioVolume: number;
    audioCurrentTimeMs: number;
    audioDuration: number;
    waveSurfer: WaveSurfer | undefined;
}

export interface AudioPlayerActions {
    audioPlay: () => Promise<void>;
    audioPause: () => void;
    setAudioVolume: (volume: number) => void;
    setWaveSurfer: (waveSurfer: WaveSurfer) => void;
}

export const createAudioPlayerSlice: AppStoreSliceCreator<AudioPlayerState & AudioPlayerActions> = (
    set,
    get,
) => ({
    audioIsPlaying: false,
    audioVolume: 1,
    audioCurrentTimeMs: 0,
    audioDuration: 0,
    waveSurfer: undefined,

    setAudioVolume: (volume) => {
        const { waveSurfer } = get();
        if (waveSurfer === undefined) {
            return;
        }
        waveSurfer.setVolume(volume);
        set({ audioVolume: volume });
    },

    setWaveSurfer: (waveSurfer) => {
        const { getSelectedTrackDef, waveSurfer: oldWaveSurfer } = get();
        const selectedTrackDef = getSelectedTrackDef();

        if (oldWaveSurfer !== undefined) {
            oldWaveSurfer.unAll();
            oldWaveSurfer.destroy();
        }

        if (selectedTrackDef !== undefined) {
            log.debug(
                `[client] created new waveSurfer instance for track ${selectedTrackDef["Track ID"]} (location: ${selectedTrackDef.Location}))`,
            );
        }

        waveSurfer.on("timeupdate", (currentTimeSeconds: number) => {
            set({ audioCurrentTimeMs: Math.floor(currentTimeSeconds * 1000) });
        });

        set({ audioCurrentTimeMs: 0, audioDuration: selectedTrackDef?.["Total Time"], waveSurfer });
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
