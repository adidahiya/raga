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

import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../../common/constants";
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
    const status = appStore.use.audioFilesServerStatus();
    const rootFolder = appStore.use.audioFilesRootFolder();
    const setAudioFilesRootFolder = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        appStore.use.setAudioTracksRootFolder()(event.target.value);
    }, []);

    const label = (
        <span>
            Audio files server
            {status === "failed" ? (
                <strong> failed</strong>
            ) : status === "starting" ? (
                <em> starting...</em>
            ) : status === "started" ? (
                <>
                    {" "}
                    is running at{" "}
                    <a
                        href={`http://localhost:${DEFAULT_AUDIO_FILES_SERVER_PORT}/`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        localhost:{DEFAULT_AUDIO_FILES_SERVER_PORT}
                    </a>
                </>
            ) : (
                ""
            )}
        </span>
    );

    return (
        <FormGroup label={label}>
            <InputGroup
                value={rootFolder}
                onChange={setAudioFilesRootFolder}
                intent={
                    status === "failed" ? "danger" : status === "started" ? "success" : undefined
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
