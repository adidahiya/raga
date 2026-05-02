import { Card, IconButton, Slider } from "@adahiya/raga-design-system";
import type { TrackDefinition } from "@adahiya/raga-types";
import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { debounce } from "radash";
import { useCallback } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useBoolean } from "usehooks-ts";

import { appStore } from "../../store/appStore";
import SimpleTooltip from "../common/SimpleTooltip";
import AnalyzeSingleTrackButton from "../trackTable/analyzeSingleTrackButton";
import styles from "./trackBPMOverlay.module.scss";

const SLIDER_TRANSITION = { type: "tween" as const, duration: 0.2, ease: "easeInOut" as const };

export function TrackBPMOverlay({ trackDef }: { trackDef: TrackDefinition }) {
  const playbackRate = appStore.use.audioPlaybackRate();
  const setPlaybackRate = debounce({ delay: 5 }, appStore.use.setAudioPlaybackRate());
  const { value: isTempoSliderOpen, toggle: toggleTempoSlider } = useBoolean(false);

  const handleDoubleClick = useCallback(() => {
    // reset playback rate to 1
    setPlaybackRate(1);
  }, [setPlaybackRate]);

  return (
    <Card className={`${styles.bpmOverlay} rounded-none`}>
      <motion.div
        className={classNames(styles.tempoSliderContainer, {
          [styles.open]: isTempoSliderOpen,
        })}
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
      <SimpleTooltip
        label={isTempoSliderOpen ? "Hide BPM slider" : "Show BPM adjustment slider"}
        side="bottom"
      >
        <IconButton
          className={styles.tempoSliderToggleButton}
          variant="ghost"
          size="sm"
          aria-label={isTempoSliderOpen ? "Hide BPM slider" : "Show BPM slider"}
          onClick={toggleTempoSlider}
        >
          <motion.div
            className={styles.tempoSliderToggleButtonIcon}
            animate={{ rotate: isTempoSliderOpen ? 180 : 0 }}
          >
            <IoChevronBack size={16} />
          </motion.div>
        </IconButton>
      </SimpleTooltip>
      <span className="text-text-muted">BPM: </span>
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
    </Card>
  );
}
TrackBPMOverlay.displayName = "TrackBPMOverlay";

const TEMPO_MARKS = [
  { value: -10, label: "-10%" },
  { value: 0, label: "0%" },
  { value: 10, label: "10%" },
];

function TrackTempoSlider() {
  const playbackRate = appStore.use.audioPlaybackRate();
  const setPlaybackRate = debounce({ delay: 5 }, appStore.use.setAudioPlaybackRate());

  const tempoSliderValue = roundToNearestTenth(playbackRate * 100 - 100);
  const handleTempoSliderChange = useCallback(
    (values: number[]) => {
      const roundedValue = roundToNearestTenth(values[0]);
      const playbackRate = (roundedValue + 100) / 100;
      setPlaybackRate(playbackRate);
    },
    [setPlaybackRate],
  );

  return (
    <div className={styles.tempoSliderWrapper}>
      <Slider
        className={styles.tempoSlider}
        min={-10}
        max={10}
        step={0.1}
        value={[tempoSliderValue]}
        onValueChange={handleTempoSliderChange}
      />
      {/* DS Slider does not ship a marks API, so we render the tick labels
          manually beneath the track. */}
      <div className="mt-1 flex justify-between text-micro text-text-muted">
        {TEMPO_MARKS.map((mark) => (
          <span key={mark.value}>{mark.label}</span>
        ))}
      </div>
    </div>
  );
}

const bpmFormatter = Intl.NumberFormat(undefined, {
  style: "decimal",
  minimumFractionDigits: 1,
});

function formatAdjustedBPM(bpm: number, playbackRate: number) {
  return bpmFormatter.format(roundToNearestTenth(bpm * playbackRate));
}

function roundToNearestTenth(value: number) {
  return Math.round(value * 10) / 10;
}
