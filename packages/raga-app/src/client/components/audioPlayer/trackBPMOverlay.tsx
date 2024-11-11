import type { TrackDefinition } from "@adahiya/raga-lib";
import { Slider, Tooltip } from "@blueprintjs/core";
import { CaretLeft } from "@blueprintjs/icons";
import { ActionIcon, Text } from "@mantine/core";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "radash";
import { useCallback } from "react";
import { useBoolean } from "usehooks-ts";

import { appStore } from "../../store/appStore";
import AnalyzeSingleTrackButton from "../trackTable/analyzeSingleTrackButton";
import styles from "./trackBPMOverlay.module.scss";

const SLIDER_TRANSITION = { type: "tween", duration: 0.2, ease: "easeInOut" };

export function TrackBPMOverlay({ trackDef }: { trackDef: TrackDefinition }) {
  const playbackRate = appStore.use.audioPlaybackRate();
  const setPlaybackRate = debounce({ delay: 5 }, appStore.use.setAudioPlaybackRate());
  const { value: isTempoSliderOpen, toggle: toggleTempoSlider } = useBoolean(false);

  const handleDoubleClick = useCallback(() => {
    // reset playback rate to 1
    setPlaybackRate(1);
  }, [setPlaybackRate]);

  return (
    <div className={styles.bpmOverlay}>
      <motion.div
        className={styles.tempoSliderContainer}
        onDoubleClick={handleDoubleClick}
        animate={{ opacity: 1, width: isTempoSliderOpen ? "auto" : 0 }}
        initial={{ opacity: 0 }}
        transition={SLIDER_TRANSITION}
        layout={true}
      >
        <AnimatePresence>
          {isTempoSliderOpen && (
            <motion.div
              className={styles.tempoSlider}
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.5, transition: { delay: 0, duration: 0.1 } }}
              transition={{ ...SLIDER_TRANSITION, delay: 0.05 }}
            >
              <TrackTempoSlider />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <Tooltip
        compact={true}
        content={isTempoSliderOpen ? "Hide BPM slider" : "Show BPM adjustment slider"}
        hoverOpenDelay={500}
        placement="bottom"
      >
        <ActionIcon
          className={styles.tempoSliderToggleButton}
          variant="outline"
          color="gray"
          size="sm"
          onClick={toggleTempoSlider}
        >
          <motion.span animate={{ rotate: isTempoSliderOpen ? 180 : 0 }}>
            <CaretLeft />
          </motion.span>
        </ActionIcon>
      </Tooltip>
      <Text component="span" c="dimmed">
        BPM:{" "}
      </Text>
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

function TrackTempoSlider() {
  const playbackRate = appStore.use.audioPlaybackRate();
  const setPlaybackRate = debounce({ delay: 5 }, appStore.use.setAudioPlaybackRate());

  const tempoSliderValue = roundToNearestTenth(playbackRate * 100 - 100);
  const handleTempoSliderChange = useCallback(
    (value: number) => {
      const roundedValue = roundToNearestTenth(value);
      const playbackRate = (roundedValue + 100) / 100;
      setPlaybackRate(playbackRate);
    },
    [setPlaybackRate],
  );

  return (
    <Slider
      min={-10}
      max={10}
      stepSize={0.1}
      labelRenderer={renderTempoSliderLabel}
      labelValues={[-10, 0, 10]}
      value={tempoSliderValue}
      onChange={handleTempoSliderChange}
    />
  );
}

const bpmFormatter = Intl.NumberFormat(undefined, {
  style: "decimal",
  minimumFractionDigits: 1,
});

function formatAdjustedBPM(bpm: number, playbackRate: number) {
  return bpmFormatter.format(roundToNearestTenth(bpm * playbackRate));
}

function renderTempoSliderLabel(value: number) {
  return `${value > 0 ? "+" : ""}${value.toString()}%`;
}

function roundToNearestTenth(value: number) {
  return Math.round(value * 10) / 10;
}
