import { IconButton, Input, StatusPill } from "@adahiya/raga-design-system";
import { Menu } from "@mantine/core";
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

import { AUDIO_FILES_SERVER_PING_INTERVAL } from "../../common/constants";
import { appStore } from "../../store/appStore";
import SimpleTooltip from "../common/SimpleTooltip";

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
    ) : null;

  const statusTone =
    status === "failed"
      ? "danger"
      : status === "started"
        ? "success"
        : status === "starting"
          ? "info"
          : "idle";

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-body-sm text-text-muted">Audio server</span>
      <Menu
        position="bottom"
        withArrow={true}
        arrowSize={12}
        offset={{ mainAxis: 10, crossAxis: 6 }}
      >
        <Menu.Target>
          <button
            type="button"
            className="inline-flex items-center gap-1 cursor-pointer outline-none"
            aria-label={`Audio server status: ${statusText}`}
          >
            <StatusPill
              tone={statusTone}
              label={statusText}
            />
            {statusIcon}
            <IoChevronDown size={12} />
          </button>
        </Menu.Target>
        <Menu.Dropdown>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1 min-w-[300px]">
              <span className="text-body-sm font-medium">Root folder</span>
              <Input
                value={rootFolder}
                onChange={handleRootFolderInputChange}
              />
            </div>
            <AudioFilesServerButtons />
          </div>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}

function AudioFilesServerButtons() {
  const status = appStore.use.audioFilesServerStatus();
  const startServer = appStore.use.startAudioFilesServer();
  const stopServer = appStore.use.stopAudioFilesServer();

  const startTooltip =
    status === "started"
      ? "Restart audio files server"
      : status === "failed"
        ? "Failed to start audio files server, click to restart"
        : status === "stopped"
          ? "Start audio files server"
          : "Starting audio files server...";

  return (
    <div className="inline-flex items-center gap-1">
      <SimpleTooltip side="top" label={startTooltip}>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={startTooltip}
          disabled={status === "starting"}
          onClick={startServer}
        >
          {status === "started" || status === "failed" ? <IoRefresh /> : <IoPlay />}
        </IconButton>
      </SimpleTooltip>
      {status === "started" && (
        <SimpleTooltip side="top" label="Stop audio files server">
          <IconButton
            variant="danger"
            size="sm"
            aria-label="Stop audio files server"
            onClick={stopServer}
          >
            <IoStop />
          </IconButton>
        </SimpleTooltip>
      )}
    </div>
  );
}
