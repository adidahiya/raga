import { Button, Group, Menu, MenuDivider, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, ChevronDown, CircleAlert, FolderOpen, Redo, Save } from "lucide-react";
import { useCallback, useRef } from "react";

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
              icon: <Check />,
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
              icon: <Check />,
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
              leftSection={isLibraryLoaded ? <Check /> : <CircleAlert />}
              rightSection={<ChevronDown />}
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
              <Menu.Item leftSection={<Redo />} onClick={handleLoad}>
                {`${isLibraryLoaded ? "Reload" : "Load"} library`}
              </Menu.Item>
              <Menu.Item leftSection={<Save />} onClick={handleLoadFromDisk}>
                Reload from disk
              </Menu.Item>
              <Menu.Item leftSection={<FolderOpen />} onClick={handleSelectNewLibrary}>
                Select new library…
              </Menu.Item>
            </Menu>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
