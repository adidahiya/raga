import {
  ActionIcon,
  Badge,
  Box,
  ButtonGroup,
  Group,
  Menu,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { run } from "effection";
import { useCallback } from "react";
import {
  IoCheckmark,
  IoChevronDown,
  IoPlay,
  IoRefresh,
  IoStop,
  IoTimer,
  IoWarning,
} from "react-icons/io5";
import { useInterval } from "usehooks-ts";

import { AUDIO_FILES_SERVER_PING_INTERVAL } from "../../../common/constants";
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
      <IoWarning />
    ) : status === "starting" ? (
      <IoTimer />
    ) : status === "started" ? (
      <IoCheckmark />
    ) : undefined;

  const { lineHeights } = useMantineTheme();

  return (
    <Group gap="xs" align="center" justify="space-between">
      <Text component="span" c="dimmed" size="sm">
        Audio server
      </Text>
      <Menu
        position="bottom"
        withArrow={true}
        arrowSize={12}
        offset={{ mainAxis: 10, crossAxis: 6 }}
      >
        <Menu.Target>
          <Badge
            size="sm"
            variant="light"
            leftSection={statusIcon}
            rightSection={<IoChevronDown />}
            color={status === "failed" ? "red" : status === "started" ? "green" : "blue"}
            radius="sm"
          >
            {statusText}
          </Badge>
        </Menu.Target>
        <Menu.Dropdown>
          <Group grow={true} gap="xs">
            <TextInput
              value={rootFolder}
              onChange={handleRootFolderInputChange}
              color={status === "failed" ? "red" : status === "started" ? "green" : undefined}
              className={styles.input}
              size="sm"
              label="Root folder"
            />
            {/* Account for line height of text input label */}
            <Box mt={`${lineHeights.xl}em`}>
              <AudioFilesServerButtons />
            </Box>
          </Group>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

function AudioFilesServerButtons() {
  const status = appStore.use.audioFilesServerStatus();
  const startServer = appStore.use.startAudioFilesServer();
  const stopServer = appStore.use.stopAudioFilesServer();

  return (
    <ButtonGroup>
      <Tooltip
        position="top"
        label={
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
          {status === "started" ? <IoRefresh /> : status === "failed" ? <IoRefresh /> : <IoPlay />}
        </ActionIcon>
      </Tooltip>
      {status === "started" && (
        <Tooltip position="top" label="Stop audio files server">
          <ActionIcon variant="subtle" color="red" onClick={stopServer}>
            <IoStop />
          </ActionIcon>
        </Tooltip>
      )}
    </ButtonGroup>
  );
}
