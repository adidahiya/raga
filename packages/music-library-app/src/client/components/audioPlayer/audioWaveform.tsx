import { Colors } from "@blueprintjs/colors";
import { ProgressBar } from "@blueprintjs/core";
import { useEffect, useRef, useState } from "react";
import { useBoolean } from "usehooks-ts";
import WaveSurfer from "wavesurfer.js";

import { useSelectedTrackFileURL } from "../../hooks";
import { appStore } from "../../store/appStore";
import InlineOverlay from "../common/inlineOverlay";
import styles from "./audioWaveform.module.scss";

/** It's recommended to lazy-load this component to defer loading the wavesurfer.js library. */
export default function AudioWaveform() {
  const audioFilesConverterIsBusy = appStore.use.audioFilesConverterIsBusy();
  const isAudioFilesServerReady = appStore.use.audioFilesServerStatus() === "started";
  const waveformElement = useRef<HTMLDivElement>(null);
  const setWaveSurfer = appStore.use.setWaveSurfer();
  const selectedFileURL = useSelectedTrackFileURL();

  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const {
    value: isWaveformReady,
    setTrue: handleWaveformReady,
    setFalse: resetWaveformReady,
  } = useBoolean(false);

  // initialize a new WaveSurfer instance when the selected track or audio server status changes
  useEffect(() => {
    if (
      isAudioFilesServerReady &&
      waveformElement.current != null &&
      selectedFileURL != undefined
    ) {
      const height = waveformElement.current.clientHeight;
      const inst = WaveSurfer.create({
        container: waveformElement.current,
        height,
        url: selectedFileURL,
        waveColor: Colors.BLUE3,
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
    isAudioFilesServerReady,
    waveformElement,
    selectedFileURL,
    setWaveSurfer,
    handleWaveformReady,
    resetWaveformReady,
  ]);

  const showProgressOverlay = audioFilesConverterIsBusy || !isWaveformReady;

  return (
    <div className={styles.container}>
      {showProgressOverlay && (
        <InlineOverlay>
          <ProgressBar
            className={styles.progressBar}
            value={audioFilesConverterIsBusy ? undefined : loadingPercentage / 100}
            intent="primary"
          />
        </InlineOverlay>
      )}
      <div className={styles.waveform} ref={waveformElement} />
    </div>
  );
}
AudioWaveform.displayName = "AudioWaveform";
