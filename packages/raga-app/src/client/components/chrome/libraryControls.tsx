import { CaretDown, Error, Export, FloppyDisk, FolderOpen, Reset, Tick } from "@blueprintjs/icons";
import {
  Button,
  ButtonGroup,
  Divider,
  FileInput,
  Group,
  Menu,
  MenuDivider,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useRef } from "react";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import NotificationMessage from "../common/NotificationMessage";
import styles from "./libraryControls.module.scss";
import LibraryLastModifiedText from "./libraryLastModifiedText";

export default function LibraryControls() {
  const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
  const libraryWriteState = appStore.use.libraryWriteState();

  const loadLibrary = appStore.use.loadSwinsianLibrary();
  const writeModifiedLibrary = appStore.use.writeModiifedLibrary();
  const unloadSwinsianLibrary = appStore.use.unloadSwinsianLibrary();
  const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();

  const handleWriteModifiedLibrary = useOperationCallback(writeModifiedLibrary);
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
              icon: <Tick />,
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
              icon: <Tick />,
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

  const handleOutputFilepathInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLibraryOutputFilepath(event.target.value);
    },
    [setLibraryOutputFilepath],
  );

  const canWrite = libraryWriteState === "ready" && libraryOutputFilepath !== undefined;

  return (
    <Group gap="xs">
      <Text size="sm">Library</Text>
      <Group gap="sm">
        <Menu
          position="bottom"
          withArrow={true}
          arrowSize={12}
          offset={{ mainAxis: 10 }}
          // TODO: restore commonStyles.popoverBackdrop
        >
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={isLibraryLoaded ? <Tick /> : <Error />}
              rightSection={<CaretDown />}
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
              <Menu.Item leftSection={<Reset />} onClick={handleLoad}>
                {`${isLibraryLoaded ? "Reload" : "Load"} library`}
              </Menu.Item>
              <Menu.Item leftSection={<FloppyDisk />} onClick={handleLoadFromDisk}>
                Reload from disk
              </Menu.Item>
              <Menu.Item leftSection={<FolderOpen />} onClick={handleSelectNewLibrary}>
                Select new library…
              </Menu.Item>
            </Menu>
          </Menu.Dropdown>
        </Menu>

        <Divider orientation="vertical" />

        <ButtonGroup>
          <Tooltip
            position="bottom-end"
            label={
              libraryWriteState === "busy"
                ? "Writing..."
                : canWrite
                  ? "Write modified library to disk"
                  : libraryWriteState === "ready"
                    ? "Need to set output file"
                    : "No changes to write to disk"
            }
          >
            <Button
              className={styles.buttonNoRightRadius}
              size="compact-sm"
              leftSection={<Export />}
              disabled={!canWrite}
              loading={libraryWriteState === "busy"}
              onClick={handleWriteModifiedLibrary}
            >
              Export
            </Button>
          </Tooltip>
          <Menu
            position="bottom"
            withArrow={true}
            arrowSize={12}
            offset={{ mainAxis: 10 }}
            // TODO: restore commonStyles.popoverBackdrop
          >
            <Menu.Target>
              <Button
                className={styles.buttonNoLeftRadius}
                size="compact-sm"
                color={libraryWriteState === "none" ? "gray" : "blue"}
              >
                <CaretDown />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Stack gap="xs">
                <Stack gap={0}>
                  <Text>Output file</Text>
                  <FileInput
                    label="Location of the Music.app/Rekordbox compatible XML file"
                    placeholder={libraryOutputFilepath}
                    fileInputProps={{ onChange: handleOutputFilepathInputChange }}
                    rightSection={<Button size="compact-sm">Browse</Button>}
                    rightSectionWidth={70}
                  />
                </Stack>
                <Menu.Item leftSection={<Export />} onClick={handleWriteModifiedLibrary}>
                  Export library for Rekordbox
                </Menu.Item>
              </Stack>
            </Menu.Dropdown>
          </Menu>
        </ButtonGroup>
      </Group>
    </Group>
  );
}
