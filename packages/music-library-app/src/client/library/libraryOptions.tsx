import {
    AnchorButton,
    ButtonGroup,
    FormGroup,
    InputGroup,
    Props,
    Section,
    SectionCard,
    Switch,
    Tooltip,
} from "@blueprintjs/core";
import { useCallback } from "react";

import { appStore } from "../store/appStore";

export type LibraryOptionsProps = Props;

export default function LibraryOptions(props: LibraryOptionsProps) {
    const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
    const setAnalyzeBPMPerTrack = appStore.use.setAnalyzeBPMPerTrack();

    const handleToggleAnalyzeBPMPerTrack = useCallback(() => {
        setAnalyzeBPMPerTrack(!analyzeBPMPerTrack);
    }, [analyzeBPMPerTrack, setAnalyzeBPMPerTrack]);

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
    const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
    const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
    const setAudioFilesRootFolder = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        appStore.use.setAudioTracksRootFolder()(event.target.value);
    }, []);

    const label = `Audio files server${
        audioFilesServerStatus === "started"
            ? ": running"
            : audioFilesServerStatus === "failed"
              ? ": error"
              : ""
    }`;

    return (
        <FormGroup label={label}>
            <InputGroup
                value={audioFilesRootFolder}
                onChange={setAudioFilesRootFolder}
                intent={
                    audioFilesServerStatus === "failed"
                        ? "danger"
                        : audioFilesServerStatus === "started"
                          ? "success"
                          : undefined
                }
                rightElement={<AudioFilesServerButtons />}
            />
        </FormGroup>
    );
}

function AudioFilesServerButtons() {
    const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
    const startAudioFilesServer = appStore.use.startAudioFilesServer();
    const stopAudioFilesServer = appStore.use.stopAudioFilesServer();

    return (
        <ButtonGroup>
            <Tooltip
                placement="top"
                compact={true}
                content={
                    audioFilesServerStatus === "started"
                        ? "Restart audio files server"
                        : audioFilesServerStatus === "failed"
                          ? "Failed to start audio files server"
                          : audioFilesServerStatus === "stopped"
                            ? "Start audio files server"
                            : "Starting audio files server..."
                }
            >
                <AnchorButton
                    minimal={true}
                    icon={
                        audioFilesServerStatus === "started"
                            ? "refresh"
                            : audioFilesServerStatus === "failed"
                              ? "refresh"
                              : "play"
                    }
                    loading={audioFilesServerStatus === "starting"}
                    onClick={startAudioFilesServer}
                />
            </Tooltip>
            {audioFilesServerStatus === "started" && (
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
