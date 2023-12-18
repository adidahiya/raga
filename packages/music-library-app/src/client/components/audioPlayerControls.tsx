import { Button, ButtonGroup } from "@blueprintjs/core";

import { useVoidCallback } from "../common/hooks";
import { appStore } from "../store/appStore";

export function AudioPlayerControls() {
    const audioPlay = appStore.use.audioPlay();
    const audioPause = appStore.use.audioPause();
    const audioIsPlaying = appStore.use.audioIsPlaying();
    const waveSurfer = appStore.use.waveSurfer();

    const handlePlay = useVoidCallback(audioPlay);
    const handlePause = audioPause;

    if (waveSurfer === undefined) {
        return undefined;
    }

    return (
        <ButtonGroup>
            <Button minimal={true} icon="play" onClick={handlePlay} disabled={audioIsPlaying} />
            <Button minimal={true} icon="pause" onClick={handlePause} disabled={!audioIsPlaying} />
        </ButtonGroup>
    );
}
