import {
    AnchorButton,
    Button,
    ButtonGroup,
    Classes,
    ControlGroup,
    FormGroup,
    InputGroup,
    Popover,
    Tooltip,
} from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";
import styles from "./audioFilesServerControls.module.scss";

export default function AudioFilesServerControls() {
    const status = appStore.use.audioFilesServerStatus();
    const rootFolder = appStore.use.audioFilesRootFolder();
    const setAudioFilesRootFolder = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        appStore.use.setAudioTracksRootFolder()(event.target.value);
    }, []);

    const serverOptionsPopover = (
        <div className={styles.popover}>
            <FormGroup label="Root folder">
                <ControlGroup fill={true}>
                    <InputGroup
                        value={rootFolder}
                        onChange={setAudioFilesRootFolder}
                        intent={
                            status === "failed"
                                ? "danger"
                                : status === "started"
                                  ? "success"
                                  : undefined
                        }
                        style={{ minWidth: 300 }}
                    />
                    <AudioFilesServerButtons />
                </ControlGroup>
            </FormGroup>
        </div>
    );

    const buttonText =
        status === "failed"
            ? "Failed"
            : status === "starting"
              ? "Starting..."
              : status === "started"
                ? "Running"
                : "Not running";
    const buttonIcon =
        status === "failed"
            ? "error"
            : status === "starting"
              ? "time"
              : status === "started"
                ? "tick"
                : undefined;
    const buttonIntent =
        status === "failed" ? "danger" : status === "started" ? "success" : undefined;

    return (
        <div className={styles.container}>
            <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>
                Audio files server
            </span>
            <Popover
                placement="bottom"
                content={serverOptionsPopover}
                hasBackdrop={true}
                backdropProps={{ className: styles.backdrop }}
            >
                <Button
                    small={true}
                    minimal={true}
                    text={buttonText}
                    icon={buttonIcon}
                    rightIcon="caret-down"
                    intent={buttonIntent}
                />
            </Popover>
        </div>
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
