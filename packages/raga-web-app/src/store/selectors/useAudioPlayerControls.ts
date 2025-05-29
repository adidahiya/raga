import { useShallow } from "zustand/react/shallow";

import { useAppStore } from "../appStore";
import type { AudioPlayerActions, AudioPlayerState } from "../slices/audioPlayerSlice";

export interface AudioPlayerControls {
  isPlaying: AudioPlayerState["audioIsPlaying"];
  currentTime: AudioPlayerState["audioCurrentTimeMs"];
  duration: AudioPlayerState["audioDuration"];
  pause: AudioPlayerActions["audioPause"];
  play: AudioPlayerActions["audioPlay"];
  seek: AudioPlayerActions["audioSeek"];
  setVolume: AudioPlayerActions["setAudioVolume"];
}

export const useAudioPlayerControls: () => AudioPlayerControls = () =>
  useAppStore(
    useShallow((state) => ({
      isPlaying: state.audioIsPlaying,
      currentTime: state.audioCurrentTimeMs,
      duration: state.audioDuration,
      pause: state.audioPause,
      play: state.audioPlay,
      seek: state.audioSeek,
      setVolume: state.setAudioVolume,
    })),
  );
