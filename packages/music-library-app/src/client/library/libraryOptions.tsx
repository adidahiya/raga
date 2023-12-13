import {
    AnchorButton,
    ButtonGroup,
    FormGroup,
    InputGroup,
    Section,
    SectionCard,
    Props,
    Tooltip,
    Switch,
} from "@blueprintjs/core";
import { useCallback } from "react";

import { appStore } from "../store/appStore";

export interface LibraryOptionsProps extends Props {}

export default function LibraryOptions(props: LibraryOptionsProps) {
    const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
    const setAnalyzeBPMPerTrack = appStore.use.setAnalyzeBPMPerTrack();

    const handleToggleAnalyzeBPMPerTrack = useCallback(() => {
        setAnalyzeBPMPerTrack(!analyzeBPMPerTrack);
    }, [analyzeBPMPerTrack]);

    return (
        <Section className={props.className} compact={true} title="Options">
            <SectionCard>
                <AudioFilesServerForm />
            </SectionCard>
            <SectionCard>
                <Switch
                    label="Analyze BPM per track"
                    onChange={handleToggleAnalyzeBPMPerTrack}
                    checked={analyzeBPMPerTrack}
                />
            </SectionCard>
        </Section>
    );
}

function AudioFilesServerForm() {
    const audioFilesServerState = appStore.use.audioFilesServerState();
    const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
    const setAudioFilesRootFolder = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        appStore.use.setAudioTracksRootFolder()(event.target.value);
    }, []);

    const label = `Audio files server${
        audioFilesServerState === "started"
            ? ": running"
            : audioFilesServerState === "failed"
              ? ": error"
              : ""
    }`;

    return (
        <FormGroup label={label}>
            <InputGroup
                value={audioFilesRootFolder}
                onChange={setAudioFilesRootFolder}
                intent={
                    audioFilesServerState === "failed"
                        ? "danger"
                        : audioFilesServerState === "started"
                          ? "success"
                          : undefined
                }
                rightElement={<AudioFilesServerButtons />}
            />
        </FormGroup>
    );
}

function AudioFilesServerButtons() {
    const audioFilesServerState = appStore.use.audioFilesServerState();
    const startAudioFilesServer = appStore.use.startAudioFilesServer();
    const stopAudioFilesServer = appStore.use.stopAudioFilesServer();

    return (
        <ButtonGroup>
            <Tooltip
                placement="top"
                compact={true}
                content={
                    audioFilesServerState === "started"
                        ? "Restart audio files server"
                        : audioFilesServerState === "failed"
                          ? "Failed to start audio files server"
                          : audioFilesServerState === "stopped"
                            ? "Start audio files server"
                            : "Starting audio files server..."
                }
            >
                <AnchorButton
                    minimal={true}
                    icon={
                        audioFilesServerState === "started"
                            ? "refresh"
                            : audioFilesServerState === "failed"
                              ? "cross"
                              : "play"
                    }
                    loading={audioFilesServerState === "starting"}
                    onClick={startAudioFilesServer}
                />
            </Tooltip>
            {audioFilesServerState === "started" && (
                <Tooltip placement="top" compact={true} content="Stop audio files server">
                    <AnchorButton
                        minimal={true}
                        icon="cross-circle"
                        onClick={stopAudioFilesServer}
                    />
                </Tooltip>
            )}
        </ButtonGroup>
    );
}
