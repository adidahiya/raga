import { Button, ButtonGroup, ControlGroup, Slider } from "@blueprintjs/core";
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
          <Button minimal={true} icon="pause" onClick={handlePause} />
        ) : (
          <Button minimal={true} icon="play" onClick={handlePlay} disabled={isPlaying} />
        )}
      </ButtonGroup>
      <ControlGroup>
        <Button minimal={true} icon="volume-off" onClick={handleVolumeOff} />
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
        <Button minimal={true} icon="volume-up" onClick={handleVolumeFull} />
      </ControlGroup>
    </div>
  );
}
AudioPlayerControls.displayName = "AudioPlayerControls";
