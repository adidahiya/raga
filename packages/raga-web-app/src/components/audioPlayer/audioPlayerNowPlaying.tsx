import type { TrackDefinition } from "@adahiya/raga-types";
import { Group, Text } from "@mantine/core";
import NumberFlow from "@number-flow/react";
import { useMemo } from "react";

import { formatAudioDuration, getAudioMinutesAndSeconds } from "../../common/format";
import { useAudioPlayerControls } from "../../store/selectors/useAudioPlayerControls";
import TrackRatingStars from "../trackTable/trackRatingStars";
import styles from "./audioPlayerNowPlaying.module.scss";
import useAudioPlayerHotkeys from "./useAudioPlayerHotkeys";

export function AudioPlayerNowPlaying({ selectedTrack }: { selectedTrack: TrackDefinition }) {
  const { currentTime, duration } = useAudioPlayerControls();
  useAudioPlayerHotkeys();

  const { minutes, seconds } = useMemo(() => getAudioMinutesAndSeconds(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatAudioDuration(duration), [duration]);

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
