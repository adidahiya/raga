import { Classes, Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useMemo } from "react";

import { formatAudioDuration } from "../../../common/format";
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

  const formattedCurrentTime = useMemo(() => formatAudioDuration(currentTime), [currentTime]);
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
      <div>
        <TrackRatingStars trackID={selectedTrack["Track ID"]} rating={selectedTrack.Rating} />
      </div>
      <div className={classNames(styles.timeProgress, Classes.TEXT_MUTED)}>
        {formattedCurrentTime} / {formattedDuration}
      </div>
    </div>
  );
}
AudioPlayerNowPlaying.displayName = "AudioPlayerNowPlaying";
