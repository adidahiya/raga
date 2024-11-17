import { Popover, Tooltip } from "@blueprintjs/core";
import { CaretDown, CrossCircle, Error, Play, Refresh, Tick, Time } from "@blueprintjs/icons";
import { ActionIcon, Box, Button, ButtonGroup, Group, Text, TextInput } from "@mantine/core";
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
      <Group grow={true} gap="xs">
        <TextInput
          value={rootFolder}
          onChange={handleRootFolderInputChange}
          color={status === "failed" ? "red" : status === "started" ? "green" : undefined}
          style={{ minWidth: 300 }}
          size="sm"
          label="Root folder"
        />
        <Box className={styles.buttons}>
          <AudioFilesServerButtons />
        </Box>
      </Group>
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
    status === "failed" ? (
      <Error />
    ) : status === "starting" ? (
      <Time />
    ) : status === "started" ? (
      <Tick />
    ) : undefined;

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
          variant="subtle"
          size="compact-sm"
          leftSection={statusIcon}
          rightSection={<CaretDown />}
          color={status === "failed" ? "red" : status === "started" ? "green" : "blue"}
        >
          {statusText}
        </Button>
      </Popover>
    </div>
  );
}

function AudioFilesServerButtons() {
  const status = appStore.use.audioFilesServerStatus();
  const startServer = appStore.use.startAudioFilesServer();
  const stopServer = appStore.use.stopAudioFilesServer();

  return (
    <ButtonGroup>
      <Tooltip
        placement="top"
        compact={true}
        content={
          status === "started"
            ? "Restart audio files server"
            : status === "failed"
              ? "Failed to start audio files server, click to restart"
              : status === "stopped"
                ? "Start audio files server"
                : "Starting audio files server..."
        }
      >
        <ActionIcon
          variant="subtle"
          color={status === "started" ? "blue" : "gray"}
          loading={status === "starting"}
          onClick={startServer}
        >
          {status === "started" ? <Refresh /> : status === "failed" ? <Refresh /> : <Play />}
        </ActionIcon>
      </Tooltip>
      {status === "started" && (
        <Tooltip placement="top" compact={true} content="Stop audio files server">
          <ActionIcon variant="subtle" color="red" onClick={stopServer}>
            <CrossCircle />
          </ActionIcon>
        </Tooltip>
      )}
    </ButtonGroup>
  );
}
