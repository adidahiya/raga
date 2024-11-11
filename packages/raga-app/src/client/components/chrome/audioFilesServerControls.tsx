import {
  AnchorButton,
  Button,
  ButtonGroup,
  ControlGroup,
  FormGroup,
  InputGroup,
  Popover,
  Tooltip,
} from "@blueprintjs/core";
import { Text } from "@mantine/core";
import { run } from "effection";
import { useCallback } from "react";
import { useInterval } from "usehooks-ts";

import { AUDIO_FILES_SERVER_PING_INTERVAL } from "../../../common/constants";
import commonStyles from "../../common/commonStyles.module.scss";
import { appStore } from "../../store/appStore";
import styles from "./audioFilesServerControls.module.scss";

export default function AudioFilesServerControls() {
  const status = appStore.use.audioFilesServerStatus();
  const isLibraryWriting = appStore.use.libraryWriteState() === "busy";
  const rootFolder = appStore.use.audioFilesRootFolder();
  const setAudioFilesRootFolder = appStore.use.setAudioTracksRootFolder();
  const handleRootFolderInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAudioFilesRootFolder(event.target.value);
    },
    [setAudioFilesRootFolder],
  );
  const pingServer = appStore.use.pingAudioFilesServer();

  // TODO: move this to some kind of zustand store subscription, it doesn't need to be in a React component
  // keep pinging server to make sure it's available while state is "started"
  const shouldPing = status === "started" && !isLibraryWriting;
  useInterval(() => void run(pingServer), shouldPing ? AUDIO_FILES_SERVER_PING_INTERVAL : null);

  const serverOptionsPopover = (
    <div className={styles.popover}>
      <FormGroup label="Root folder">
        <ControlGroup fill={true}>
          <InputGroup
            value={rootFolder}
            onChange={handleRootFolderInputChange}
            intent={status === "failed" ? "danger" : status === "started" ? "success" : undefined}
            style={{ minWidth: 300 }}
          />
          <AudioFilesServerButtons />
        </ControlGroup>
      </FormGroup>
    </div>
  );

  const statusText =
    status === "failed"
      ? "Failed"
      : status === "starting"
        ? "Starting..."
        : status === "started"
          ? "Running"
          : "Not running";
  const statusIcon =
    status === "failed"
      ? "error"
      : status === "starting"
        ? "time"
        : status === "started"
          ? "tick"
          : undefined;
  const statusIntent =
    status === "failed" ? "danger" : status === "started" ? "success" : undefined;

  return (
    <div className={styles.container}>
      <Text component="span" c="dimmed" size="sm">
        Audio server
      </Text>
      <Popover
        placement="bottom"
        content={serverOptionsPopover}
        hasBackdrop={true}
        backdropProps={{ className: commonStyles.popoverBackdrop }}
      >
        <Button
          small={true}
          minimal={true}
          text={statusText}
          icon={statusIcon}
          rightIcon="caret-down"
          intent={statusIntent}
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
          <AnchorButton minimal={true} icon="cross-circle" onClick={stopAudioFilesServer} />
        </Tooltip>
      )}
    </ButtonGroup>
  );
}
