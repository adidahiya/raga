import { Progress, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useBoolean } from "usehooks-ts";
import WaveSurfer from "wavesurfer.js";

import { appStore } from "../../store/appStore";
import EmptyState from "../common/emptyState";
import InlineOverlay from "../common/inlineOverlay";
import styles from "./audioWaveform.module.scss";

export interface AudioWaveformProps {
  mediaURL: string | undefined;
}

/** It's recommended to lazy-load this component to defer loading the wavesurfer.js library. */
export default function AudioWaveform({ mediaURL }: AudioWaveformProps) {
  const audioFilesConverterIsBusy = appStore.use.audioFilesConverterIsBusy();
  const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
  const waveformElement = useRef<HTMLDivElement>(null);
  const setWaveSurfer = appStore.use.setWaveSurfer();

  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const {
    value: isWaveformReady,
    setTrue: handleWaveformReady,
    setFalse: resetWaveformReady,
  } = useBoolean(false);

  const theme = useMantineTheme();

  // initialize a new WaveSurfer instance when the selected track or audio server status changes
  useEffect(() => {
    if (isAudioFilesServerReady && waveformElement.current != null && mediaURL != undefined) {
      const height = waveformElement.current.clientHeight;
      const inst = WaveSurfer.create({
        container: waveformElement.current,
        height,
        url: mediaURL,
        waveColor: theme.colors.blue[5],
      });
      setWaveSurfer(inst);

      // these subscriptions are cleaned up in setWaveSurfer() by WaveSurfer.unAll()
      inst.on("loading", setLoadingPercentage);
      inst.on("ready", handleWaveformReady);
    }

    return () => {
      setLoadingPercentage(0);
      resetWaveformReady();
    };
  }, [
    mediaURL,
    handleWaveformReady,
    isAudioFilesServerReady,
    resetWaveformReady,
    setWaveSurfer,
    waveformElement,
    theme,
  ]);

  const showLoadingOverlay = audioFilesConverterIsBusy || !isWaveformReady;

  return (
    <div className={styles.container}>
      <div className={styles.waveform} ref={waveformElement} />
      {showLoadingOverlay && (
        <InlineOverlay className={styles.loadingOverlay}>
          <EmptyState
            description={
              audioFilesConverterIsBusy ? "Converting AIFF to MP3..." : "Loading track audio..."
            }
          >
            <Progress
              className={styles.progressBar}
              size="sm"
              color="blue"
              value={audioFilesConverterIsBusy ? 100 : loadingPercentage}
              animated={true}
            />
          </EmptyState>
        </InlineOverlay>
      )}
    </div>
  );
}
AudioWaveform.displayName = "AudioWaveform";
