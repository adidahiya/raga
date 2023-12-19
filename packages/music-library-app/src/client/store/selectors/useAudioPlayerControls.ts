import { useAppStore } from "../appStore";
import type { AudioPlayerActions, AudioPlayerState } from "../slices/audioPlayerSlice";

export interface AudioPlayerControls {
    isPlaying: AudioPlayerState["audioIsPlaying"];
    currentTime: AudioPlayerState["audioCurrentTimeMs"];
    duration: AudioPlayerState["audioDuration"];
    pause: AudioPlayerActions["audioPause"];
    play: AudioPlayerActions["audioPlay"];
    setVolume: AudioPlayerActions["setAudioVolume"];
    volume: AudioPlayerState["audioVolume"];
}

export const useAudioPlayerControls: () => AudioPlayerControls = () =>
    useAppStore((state) => ({
        isPlaying: state.audioIsPlaying,
        currentTime: state.audioCurrentTimeMs,
        duration: state.audioDuration,
        pause: state.audioPause,
        play: state.audioPlay,
        setVolume: state.setAudioVolume,
        volume: state.audioVolume,
    }));
