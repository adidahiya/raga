import { Colors } from "@blueprintjs/colors";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { useToggle } from "react-use";

import { useSelectedTrackFileURL } from "../hooks/useSelectedTrackFileURL";
import { useWaveSurferModule } from "../hooks/useWaveSurferModule";
import { appStore } from "../store/appStore";
import styles from "./audioPlayer.module.scss";

export function AudioPlayer() {
    const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
    const waveSurferModule = useWaveSurferModule();
    const setWaveSurfer = appStore.use.setWaveSurfer();
    const selectedFileURL = useSelectedTrackFileURL();
    const playerElementRef = useRef<HTMLDivElement>(null);
    const [loading, toggleLoading] = useToggle(false);

    useEffect(() => {
        const subscriptions: (() => void)[] = [];

        if (
            audioFilesServerStatus === "started" &&
            playerElementRef.current != null &&
            waveSurferModule != null
        ) {
            const height = playerElementRef.current.clientHeight;
            toggleLoading(true);
            const inst = waveSurferModule.default.create({
                container: playerElementRef.current,
                height,
                url: selectedFileURL,
                waveColor: Colors.BLUE3,
            });
            setWaveSurfer(inst);
            subscriptions.push(...[inst.on("ready", toggleLoading)]);
        }

        return () => {
            for (const unsub of subscriptions) {
                unsub();
            }
        };
    }, [
        audioFilesServerStatus,
        playerElementRef,
        selectedFileURL,
        setWaveSurfer,
        toggleLoading,
        waveSurferModule,
    ]);

    return (
        <div className={styles.container}>
            <div
                className={classNames(styles.player, {
                    [Classes.SKELETON]: !waveSurferModule || loading,
                })}
                ref={playerElementRef}
            />
        </div>
    );
}
AudioPlayer.displayName = "AudioPlayer";
