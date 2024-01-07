import type { TrackDefinition } from "@adahiya/raga-lib";
import { Button, Classes, Slider } from "@blueprintjs/core";
import classNames from "classnames";
import { debounce } from "radash";
import { useCallback } from "react";
import { useBoolean } from "usehooks-ts";

import { appStore } from "../../store/appStore";
import AnalyzeSingleTrackButton from "../trackTable/analyzeSingleTrackButton";
import styles from "./trackBPMOverlay.module.scss";

export function TrackBPMOverlay({ trackDef }: { trackDef: TrackDefinition }) {
  const playbackRate = appStore.use.audioPlaybackRate();
  const setPlaybackRate = debounce({ delay: 5 }, appStore.use.setAudioPlaybackRate());
  const { value: isTempoSliderOpen, toggle: toggleTempoSlider } = useBoolean(false);

  const tempoSliderValue = roundToNearestTenth(playbackRate * 100 - 100);
  const handleTempoSliderChange = useCallback(
    (value: number) => {
      const roundedValue = roundToNearestTenth(value);
      const playbackRate = (roundedValue + 100) / 100;
      setPlaybackRate(playbackRate);
    },
    [setPlaybackRate],
  );
  const handleDoubleClick = useCallback(() => {
    // reset playback rate to 1
    setPlaybackRate(1);
  }, [setPlaybackRate]);

  return (
    <div className={styles.bpmOverlay}>
      <div className={styles.tempoSliderContainer} onDoubleClick={handleDoubleClick}>
        {isTempoSliderOpen ? (
          <>
            <Slider
              min={-10}
              max={10}
              stepSize={0.1}
              labelRenderer={renderTempoSliderLabel}
              labelValues={[-10, 0, 10]}
              value={tempoSliderValue}
              onChange={handleTempoSliderChange}
            />
            <Button
              className={styles.tempoSliderToggleButton}
              outlined={true}
              small={true}
              icon="caret-right"
              onClick={toggleTempoSlider}
            />
          </>
        ) : (
          <Button
            className={styles.tempoSliderToggleButton}
            outlined={true}
            small={true}
            icon="caret-left"
            onClick={toggleTempoSlider}
          />
        )}
      </div>
      <span className={Classes.TEXT_MUTED}>BPM: </span>
      {trackDef.BPM !== undefined ? (
        <span
          className={classNames(styles.bpmValue, {
            [styles.adjusted]: playbackRate !== 1,
          })}
        >
          {formatAdjustedBPM(trackDef.BPM, playbackRate)}
        </span>
      ) : (
        <AnalyzeSingleTrackButton trackDef={trackDef} />
      )}
    </div>
  );
}
TrackBPMOverlay.displayName = "TrackBPMOverlay";

const bpmFormatter = Intl.NumberFormat(undefined, {
  style: "decimal",
  minimumFractionDigits: 1,
});

function formatAdjustedBPM(bpm: number, playbackRate: number) {
  return bpmFormatter.format(roundToNearestTenth(bpm * playbackRate));
}

function renderTempoSliderLabel(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

function roundToNearestTenth(value: number) {
  return Math.round(value * 10) / 10;
}
