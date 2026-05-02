import { IconButton, Slider } from "@adahiya/raga-design-system";
import { useCallback, useState } from "react";
import { IoPause, IoPlay, IoVolumeHigh, IoVolumeLow } from "react-icons/io5";

import { useOperationCallback } from "../../hooks";
import { useAudioPlayerControls } from "../../store/selectors/useAudioPlayerControls";
import styles from "./audioPlayerControls.module.scss";
import useAudioPlayerHotkeys from "./useAudioPlayerHotkeys";

export function AudioPlayerControls() {
  const { play, pause, isPlaying, setVolume } = useAudioPlayerControls();
  const [volumeSliderValue, setVolumeSliderValue] = useState(1);

  useAudioPlayerHotkeys();

  const handlePlay = useOperationCallback(play, [play]);
  const handlePause = pause;
  const handleVolumeChange = useCallback(
    (values: number[]) => {
      const value = values[0];
      setVolume(value);
      setVolumeSliderValue(value);
    },
    [setVolume, setVolumeSliderValue],
  );
  const handleVolumeOff = useCallback(() => {
    setVolume(0);
    setVolumeSliderValue(0);
  }, [setVolume, setVolumeSliderValue]);
  const handleVolumeFull = useCallback(() => {
    setVolume(1);
    setVolumeSliderValue(1);
  }, [setVolume, setVolumeSliderValue]);

  return (
    <div className="flex items-center gap-1.5">
      {isPlaying ? (
        <IconButton variant="ghost" size="sm" aria-label="Pause" onClick={handlePause}>
          <IoPause size={16} />
        </IconButton>
      ) : (
        <IconButton variant="ghost" size="sm" aria-label="Play" onClick={handlePlay}>
          <IoPlay size={16} />
        </IconButton>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Mute"
        onClick={handleVolumeOff}
      >
        <IoVolumeLow size={16} />
      </IconButton>
      <div className={styles.volumeSlider}>
        <Slider
          value={[volumeSliderValue]}
          onValueChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
        />
      </div>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Full volume"
        onClick={handleVolumeFull}
      >
        <IoVolumeHigh size={16} />
      </IconButton>
    </div>
  );
}
AudioPlayerControls.displayName = "AudioPlayerControls";
