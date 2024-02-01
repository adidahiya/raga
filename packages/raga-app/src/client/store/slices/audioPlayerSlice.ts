import { call, type Operation } from "effection";
import { throttle } from "radash";
import { Roarr as log } from "roarr";
import type WaveSurfer from "wavesurfer.js";

import { type AppStoreSliceCreator } from "../zustandUtils";

export interface AudioPlayerState {
  audioIsPlaying: boolean;
  /** range: [0, 1] */
  audioVolume: number;
  /** milliseconds */
  audioCurrentTimeMs: number;
  /** milliseconds */
  audioDuration: number;
  /** range: [0, 1] */
  audioPlaybackRate: number;
  waveSurfer: WaveSurfer | undefined;
}

export interface AudioPlayerActions {
  audioPlay: () => Operation<void>;
  audioPause: () => void;
  audioSeek: (seekMs: number) => void;
  setAudioVolume: (volume: number) => void;
  setAudioPlaybackRate: (tempoAdjustment: number) => void;
  setWaveSurfer: (waveSurfer: WaveSurfer) => void;
  unloadWaveSurfer: () => void;
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

  unloadWaveSurfer: () => {
    const { waveSurfer: oldWaveSurfer } = get();

    if (oldWaveSurfer !== undefined) {
      oldWaveSurfer.unAll();
      oldWaveSurfer.destroy();
      set({ waveSurfer: undefined });
    }
  },

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

    const audioDuration = selectedTrackDef?.["Total Time"];

    // throttle the "timeupdate" event handler so we don't spam the store with updates
    waveSurfer.on(
      "timeupdate",
      throttle({ interval: 100 }, (currentTimeSeconds: number) => {
        const audioCurrentTimeMs = Math.trunc(currentTimeSeconds * 1000);
        set({ audioCurrentTimeMs });

        const audioCompletionThresholdMs = 100;
        if (
          audioDuration !== undefined &&
          Math.abs(audioCurrentTimeMs - audioDuration) < audioCompletionThresholdMs
        ) {
          // be kind, rewind
          set({ audioCurrentTimeMs: 0, audioIsPlaying: false });
          waveSurfer.stop();
          waveSurfer.seekTo(0);
        }
      }),
    );

    set({
      audioIsPlaying: false,
      audioCurrentTimeMs: 0,
      audioDuration,
      waveSurfer,
    });
  },

  audioPlay: function* (): Operation<void> {
    const { waveSurfer } = get();
    if (waveSurfer === undefined) {
      return;
    }
    yield* call(waveSurfer.play());
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
