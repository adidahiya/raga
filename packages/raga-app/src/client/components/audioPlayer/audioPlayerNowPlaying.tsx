import { Group, Text } from "@mantine/core";
import NumberFlow from "@number-flow/react";
import { useMemo } from "react";

import { formatAudioDuration, getAudioMinutesAndSeconds } from "../../../common/format";
import { appStore } from "../../store/appStore";
import { useAudioPlayerControls } from "../../store/selectors/useAudioPlayerControls";
import TrackRatingStars from "../trackTable/trackRatingStars";
import styles from "./audioPlayerNowPlaying.module.scss";
import useAudioPlayerHotkeys from "./useAudioPlayerHotkeys";

export function AudioPlayerNowPlaying() {
  const { currentTime, duration } = useAudioPlayerControls();
  const waveSurfer = appStore.use.waveSurfer();
  const getSelectedTrackDef = appStore.use.getSelectedTrackDef();

  useAudioPlayerHotkeys();

  const selectedTrack = getSelectedTrackDef();

  const { minutes, seconds } = useMemo(() => getAudioMinutesAndSeconds(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatAudioDuration(duration), [duration]);

  if (waveSurfer === undefined || selectedTrack === undefined) {
    return undefined;
  }

  return (
    <Group gap={20} align="center">
      <Text component="span" className={styles.nowPlaying} title={selectedTrack.Artist}>
        <strong>{selectedTrack.Artist}</strong>
        <Text component="span" c="dimmed">
          {" "}
          &ndash;{" "}
        </Text>
        <strong>{selectedTrack.Name}</strong>
      </Text>
      <div>
        <TrackRatingStars trackID={selectedTrack["Track ID"]} rating={selectedTrack.Rating} />
      </div>
      <Text c="dimmed" className={styles.timeProgress}>
        <NumberFlow value={minutes} format={{ minimumIntegerDigits: 1 }} locales="en-US" />
        {":"}
        <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} locales="en-US" />
        {" / "}
        {formattedDuration}
      </Text>
    </Group>
  );
}
AudioPlayerNowPlaying.displayName = "AudioPlayerNowPlaying";
