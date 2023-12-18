import { FormGroup, Props, Switch } from "@blueprintjs/core";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";

export function AnalyzerSettings(props: Props) {
    const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
    const setAnalyzeBPMPerTrack = appStore.use.setAnalyzeBPMPerTrack();

    const handleToggleAnalyzeBPMPerTrack = useCallback(() => {
        setAnalyzeBPMPerTrack(!analyzeBPMPerTrack);
    }, [analyzeBPMPerTrack, setAnalyzeBPMPerTrack]);

    return (
        <FormGroup className={props.className} label="Analysis settings">
            <Switch
                label="Analyze BPM per track"
                onChange={handleToggleAnalyzeBPMPerTrack}
                checked={analyzeBPMPerTrack}
            />
        </FormGroup>
    );
}
