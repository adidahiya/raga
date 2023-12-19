import { Classes } from "@blueprintjs/core";
import { lazy, Suspense } from "react";

import styles from "./audioPlayer.module.scss";

const AudioWaveform = lazy(() => import("./audioWaveform"));

export function AudioPlayer() {
    const fallback = <div className={Classes.SKELETON} />;

    return (
        <div className={styles.container}>
            <Suspense fallback={fallback}>
                <AudioWaveform />
            </Suspense>
        </div>
    );
}
AudioPlayer.displayName = "AudioPlayer";
