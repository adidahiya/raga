import type { TrackDefinition } from "@adahiya/raga-types";
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
    <div className="flex items-center gap-5">
      <span className={styles.nowPlaying} title={selectedTrack.Artist}>
        <strong>{selectedTrack.Artist}</strong>
        <span className="text-text-muted"> &ndash; </span>
        <strong>{selectedTrack.Name}</strong>
      </span>
      <div>
        <TrackRatingStars trackID={selectedTrack["Track ID"]} rating={selectedTrack.Rating} />
      </div>
      <span className={`${styles.timeProgress} text-text-muted`}>
        <NumberFlow value={minutes} format={{ minimumIntegerDigits: 1 }} locales="en-US" />
        {":"}
        <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} locales="en-US" />
        {" / "}
        {formattedDuration}
      </span>
    </div>
  );
}
AudioPlayerNowPlaying.displayName = "AudioPlayerNowPlaying";
