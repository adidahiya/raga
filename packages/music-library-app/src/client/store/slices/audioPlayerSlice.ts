import { Roarr as log } from "roarr";
import type WaveSurfer from "wavesurfer.js";

import { AppStoreSliceCreator } from "../zustandUtils";

export interface AudioPlayerState {
  audioIsPlaying: boolean;
  audioVolume: number;
  audioCurrentTimeMs: number;
  audioDuration: number;
  audioPlaybackRate: number;
  waveSurfer: WaveSurfer | undefined;
}

export interface AudioPlayerActions {
  audioPlay: () => Promise<void>;
  audioPause: () => void;
  audioSeek: (seekMs: number) => void;
  setAudioVolume: (volume: number) => void;
  setAudioPlaybackRate: (tempoAdjustment: number) => void;
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
  audioPlaybackRate: 1,
  waveSurfer: undefined,

  setAudioVolume: (volume) => {
    const { waveSurfer } = get();
    if (waveSurfer === undefined) {
      return;
    }
    waveSurfer.setVolume(volume);
    set({ audioVolume: volume });
  },

  setAudioPlaybackRate: (audioPlaybackRate) => {
    const { waveSurfer } = get();
    if (waveSurfer === undefined) {
      return;
    }
    waveSurfer.setPlaybackRate(audioPlaybackRate);
    set({ audioPlaybackRate });
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

    set({
      audioIsPlaying: false,
      audioCurrentTimeMs: 0,
      audioDuration: selectedTrackDef?.["Total Time"],
      waveSurfer,
    });
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

  audioSeek: (seekMs: number) => {
    const { audioCurrentTimeMs, audioDuration, waveSurfer } = get();
    if (waveSurfer === undefined) {
      return;
    }

    let seekToProgress = (audioCurrentTimeMs + seekMs) / audioDuration;

    // clamp to [0, 1]
    seekToProgress = Math.min(seekToProgress, 1);
    seekToProgress = Math.max(0, seekToProgress);

    log.trace(`[client] seeking to ${Math.round(seekToProgress * 100)}% of track`);
    waveSurfer.seekTo(seekToProgress);
  },
});
