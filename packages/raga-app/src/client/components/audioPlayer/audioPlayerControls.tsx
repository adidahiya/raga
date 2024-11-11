import { ControlGroup, Slider } from "@blueprintjs/core";
import { Pause, Play, VolumeOff, VolumeUp } from "@blueprintjs/icons";
import { ActionIcon, ButtonGroup } from "@mantine/core";
import { useCallback, useState } from "react";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import { useAudioPlayerControls } from "../../store/selectors/useAudioPlayerControls";
import styles from "./audioPlayerControls.module.scss";
import useAudioPlayerHotkeys from "./useAudioPlayerHotkeys";

export function AudioPlayerControls() {
  const { play, pause, isPlaying, setVolume } = useAudioPlayerControls();
  const waveSurfer = appStore.use.waveSurfer();
  const getSelectedTrackDef = appStore.use.getSelectedTrackDef();
  const [volumeSliderValue, setVolumeSliderValue] = useState(1);

  useAudioPlayerHotkeys();

  const selectedTrack = getSelectedTrackDef();
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

  if (waveSurfer === undefined || selectedTrack === undefined) {
    return undefined;
  }

  return (
    <div className={styles.container}>
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
      <ControlGroup>
        <ActionIcon variant="subtle" color="gray" onClick={handleVolumeOff}>
          <VolumeOff />
        </ActionIcon>
        <div className={styles.volumeSlider}>
          <Slider
            value={volumeSliderValue}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            stepSize={0.01}
            labelRenderer={false}
          />
        </div>
        <ActionIcon variant="subtle" color="gray" onClick={handleVolumeFull}>
          <VolumeUp />
        </ActionIcon>
      </ControlGroup>
    </div>
  );
}
AudioPlayerControls.displayName = "AudioPlayerControls";
