import { Button, ButtonGroup, Classes, ControlGroup, Slider, Text } from "@blueprintjs/core";
import classNames from "classnames";
import { debounce } from "radash";
import { useCallback, useMemo } from "react";

import { formatAudioDuration } from "../../../common/format";
import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import { useAudioPlayerControls } from "../../store/selectors/useAudioPlayerControls";
import styles from "./audioPlayerControls.module.scss";
import useAudioPlayerHotkeys from "./useAudioPlayerHotkeys";

export function AudioPlayerControls() {
  const { currentTime, duration, play, pause, isPlaying, volume, setVolume } =
    useAudioPlayerControls();
  const waveSurfer = appStore.use.waveSurfer();
  const getSelectedTrackDef = appStore.use.getSelectedTrackDef();

  useAudioPlayerHotkeys();

  const selectedTrack = getSelectedTrackDef();
  const handlePlay = useOperationCallback(play, [play]);
  const handlePause = pause;
  const handleVolumeOff = useCallback(() => {
    setVolume(0);
  }, [setVolume]);
  const handleVolumeChange = debounce({ delay: 100 }, setVolume);
  const handleVolumeFull = useCallback(() => {
    setVolume(1);
  }, [setVolume]);

  const formattedCurrentTime = useMemo(() => {
    return formatAudioDuration(currentTime);
  }, [currentTime]);
  const formattedDuration = useMemo(() => formatAudioDuration(duration), [duration]);

  if (waveSurfer === undefined || selectedTrack === undefined) {
    return undefined;
  }

  return (
    <div className={styles.container}>
      <Text className={styles.nowPlaying} ellipsize={true} title={selectedTrack.Artist}>
        <strong>{selectedTrack.Artist}</strong>
        <span className={Classes.TEXT_MUTED}> &ndash; </span>
        <strong>{selectedTrack.Name}</strong>
      </Text>
      <div className={classNames(styles.timeProgress, Classes.TEXT_MUTED)}>
        {formattedCurrentTime} / {formattedDuration}
      </div>
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
            value={volume}
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
