import { Pause, Play, VolumeOff, VolumeUp } from "@blueprintjs/icons";
import { ActionIcon, ButtonGroup, Group, Slider } from "@mantine/core";
import { useCallback, useState } from "react";

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
    (value: number) => {
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
    <Group gap={5} align="center">
      <ButtonGroup>
        {isPlaying ? (
          <ActionIcon variant="subtle" color="gray" onClick={handlePause}>
            <Pause />
          </ActionIcon>
        ) : (
          <ActionIcon variant="subtle" color="gray" onClick={handlePlay}>
            <Play />
          </ActionIcon>
        )}
      </ButtonGroup>
      <ActionIcon variant="subtle" color="gray" onClick={handleVolumeOff}>
        <VolumeOff />
      </ActionIcon>
      <div className={styles.volumeSlider}>
        <Slider
          value={volumeSliderValue}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          label={null}
        />
      </div>
      <ActionIcon variant="subtle" color="gray" onClick={handleVolumeFull}>
        <VolumeUp />
      </ActionIcon>
    </Group>
  );
}
AudioPlayerControls.displayName = "AudioPlayerControls";
