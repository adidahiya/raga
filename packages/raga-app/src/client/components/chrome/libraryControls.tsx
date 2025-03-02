import { Button, Group, Menu, MenuDivider, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useRef } from "react";
import {
  IoArrowRedo,
  IoCheckmark,
  IoChevronDown,
  IoFolder,
  IoSave,
  IoWarning,
} from "react-icons/io5";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import NotificationMessage from "../common/NotificationMessage";
import LibraryLastModifiedText from "./libraryLastModifiedText";

export default function LibraryControls() {
  const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const libraryWriteState = appStore.use.libraryWriteState();

  const loadLibrary = appStore.use.loadSwinsianLibrary();
  const unloadSwinsianLibrary = appStore.use.unloadSwinsianLibrary();

  const handleLoad = useOperationCallback(
    function* () {
      if (libraryInputFilepath === undefined) {
        return;
      }
      yield* loadLibrary({ filepath: libraryInputFilepath });
    },
    [libraryInputFilepath, loadLibrary],
  );

  const confirmedLoadFromDisk = useOperationCallback(function* () {
    if (libraryInputFilepath === undefined) {
      return;
    }
    yield* loadLibrary({ filepath: libraryInputFilepath, reloadFromDisk: true });
  });

  const notificationId = useRef<string | undefined>(undefined);

  const handleLoadFromDisk = useCallback(() => {
    if (libraryInputFilepath === undefined) {
      return;
    }

    if (libraryWriteState === "ready") {
      if (notificationId.current != null) {
        notifications.hide(notificationId.current);
      }
      notificationId.current = notifications.show({
        title: "Unsaved changes",
        message: (
          <NotificationMessage
            message="There are changes which have not been written to disk."
            action={{
              icon: <IoCheckmark size={16} />,
              text: "Confirm reload",
              onClick: confirmedLoadFromDisk,
              color: "yellow",
            }}
          />
        ),
        color: "yellow",
        autoClose: false,
      });
      return;
    }

    confirmedLoadFromDisk();
  }, [confirmedLoadFromDisk, libraryInputFilepath, libraryWriteState]);

  const handleSelectNewLibrary = useCallback(() => {
    if (libraryWriteState === "ready") {
      if (notificationId.current != null) {
        notifications.hide(notificationId.current);
      }
      notificationId.current = notifications.show({
        title: "Unsaved changes",
        message: (
          <NotificationMessage
            message="There are changes which have not been written to disk, are you sure you want to unload this library?"
            action={{
              icon: <IoCheckmark size={16} />,
              text: "Confirm unload",
              onClick: unloadSwinsianLibrary,
              color: "yellow",
            }}
          />
        ),
        color: "yellow",
        autoClose: false,
      });
      return;
    }

    unloadSwinsianLibrary();
  }, [libraryWriteState, unloadSwinsianLibrary]);

  return (
    <Group gap="xs">
      <Text size="sm">Library</Text>
      <Group gap="sm">
        <Menu position="bottom" withArrow={true} arrowSize={12} offset={{ mainAxis: 10 }}>
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={isLibraryLoaded ? <IoCheckmark size={14} /> : <IoWarning size={14} />}
              rightSection={<IoChevronDown size={14} />}
              color={isLibraryLoaded ? "green" : "blue"}
            >
              {isLibraryLoaded ? "Loaded" : "Not loaded"}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu>
              <Menu.Label>
                <LibraryLastModifiedText />
              </Menu.Label>
              <MenuDivider />
              <Menu.Item leftSection={<IoArrowRedo size={14} />} onClick={handleLoad}>
                {`${isLibraryLoaded ? "Reload" : "Load"} library`}
              </Menu.Item>
              <Menu.Item leftSection={<IoSave size={14} />} onClick={handleLoadFromDisk}>
                Reload from disk
              </Menu.Item>
              <Menu.Item leftSection={<IoFolder size={14} />} onClick={handleSelectNewLibrary}>
                Select new library…
              </Menu.Item>
            </Menu>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
