import { Colors } from "@blueprintjs/colors";
import { ProgressBar } from "@blueprintjs/core";
import { useEffect, useRef, useState } from "react";
import { useBoolean } from "usehooks-ts";
import WaveSurfer from "wavesurfer.js";

import { useSelectedTrackFileURL } from "../hooks/useSelectedTrackFileURL";
import { appStore } from "../store/appStore";
import styles from "./audioWaveform.module.scss";
import InlineOverlay from "./inlineOverlay";

/** It's recommended to lazy-load this component to defer loading the wavesurfer.js library. */
export default function AudioWaveform() {
    const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
    const waveformElement = useRef<HTMLDivElement>(null);
    const setWaveSurfer = appStore.use.setWaveSurfer();
    const selectedFileURL = useSelectedTrackFileURL();
    const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
    const {
        value: isWaveformReady,
        setTrue: handleWaveformReady,
        setFalse: resetWaveformReady,
    } = useBoolean(false);

    useEffect(() => {
        if (audioFilesServerStatus === "started" && waveformElement.current != null) {
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
        audioFilesServerStatus,
        waveformElement,
        selectedFileURL,
        setWaveSurfer,
        handleWaveformReady,
        resetWaveformReady,
    ]);

    return (
        <div className={styles.container}>
            {isWaveformReady ? undefined : (
                <InlineOverlay>
                    <ProgressBar
                        className={styles.progressBar}
                        value={loadingPercentage / 100}
                        intent="primary"
                    />
                </InlineOverlay>
            )}
            <div className={styles.waveform} ref={waveformElement} />
        </div>
    );
}
AudioWaveform.displayName = "AudioWaveform";
