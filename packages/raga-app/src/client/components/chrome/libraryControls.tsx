import { Classes, Menu, MenuDivider, MenuItem, Popover, Tooltip } from "@blueprintjs/core";
import { CaretDown, Error, Export, Tick } from "@blueprintjs/icons";
import { Button, ButtonGroup, Divider, FileInput, Group, Stack, Text } from "@mantine/core";
import classNames from "classnames";
import { useCallback } from "react";

import commonStyles from "../../common/commonStyles.module.scss";
import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import styles from "./libraryControls.module.scss";
import LibraryLastModifiedText from "./libraryLastModifiedText";

export default function LibraryControls() {
  const toaster = appStore.use.toaster();
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

  const handleLoadFromDisk = useCallback(() => {
    if (libraryInputFilepath === undefined) {
      return;
    }

    if (libraryWriteState === "ready") {
      toaster?.show({
        intent: "warning",
        message:
          "There are changes which have not been written to disk, are you sure you want to reload?",
        action: {
          icon: "tick",
          text: "Confirm reload",
          onClick: confirmedLoadFromDisk,
        },
      });
      return;
    }

    confirmedLoadFromDisk();
  }, [confirmedLoadFromDisk, libraryInputFilepath, libraryWriteState, toaster]);

  const handleSelectNewLibrary = useCallback(() => {
    if (libraryWriteState === "ready") {
      toaster?.show({
        intent: "warning",
        message:
          "There are changes which have not been written to disk, are you sure you want to unload this library?",
        action: {
          icon: "tick",
          text: "Confirm unload",
          onClick: unloadSwinsianLibrary,
        },
      });
      return;
    }

    unloadSwinsianLibrary();
  }, [libraryWriteState, toaster, unloadSwinsianLibrary]);

  const handleOutputFilepathInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLibraryOutputFilepath(event.target.value);
    },
    [setLibraryOutputFilepath],
  );

  const libraryOutputMenu = (
    <Stack gap="xs" className={styles.popoverContent}>
      <Stack gap="xs">
        <Text className={styles.outputFilepath}>Output file</Text>
        <FileInput
          label="Location of the Music.app/Rekordbox compatible XML file"
          placeholder={libraryOutputFilepath}
          fileInputProps={{ onChange: handleOutputFilepathInputChange }}
          rightSection={<Button size="compact-sm">Browse</Button>}
          rightSectionWidth={70}
        />
      </Stack>
      <Menu>
        <MenuItem
          icon="export"
          text="Export library for Rekordbox"
          onClick={handleWriteModifiedLibrary}
        />
      </Menu>
    </Stack>
  );

  const libraryInputMenu = (
    <Menu>
      <MenuDivider title={<LibraryLastModifiedText />} />
      <MenuDivider />
      <MenuItem
        icon="reset"
        text={`${isLibraryLoaded ? "Reload" : "Load"} library`}
        onClick={handleLoad}
      />
      <MenuItem icon="floppy-disk" text="Reload from disk" onClick={handleLoadFromDisk} />
      <MenuItem icon="folder-open" text="Select new library..." onClick={handleSelectNewLibrary} />
    </Menu>
  );

  const canWrite = libraryWriteState === "ready" && libraryOutputFilepath !== undefined;

  return (
    <Group className={styles.container} gap="xs">
      <span className={classNames(Classes.TEXT_SMALL)}>Library</span>
      <Group gap="sm">
        <Popover
          placement="bottom-end"
          content={libraryInputMenu}
          hasBackdrop={true}
          backdropProps={{ className: commonStyles.popoverBackdrop }}
        >
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={isLibraryLoaded ? <Tick /> : <Error />}
            rightSection={<CaretDown />}
            color={isLibraryLoaded ? "green" : "blue"}
          >
            {isLibraryLoaded ? "Loaded" : "Not loaded"}
          </Button>
        </Popover>

        <Divider orientation="vertical" />

        <ButtonGroup>
          <Tooltip
            placement="bottom-end"
            compact={true}
            content={
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
          <Popover
            placement="bottom-end"
            content={libraryOutputMenu}
            hasBackdrop={true}
            backdropProps={{ className: commonStyles.popoverBackdrop }}
          >
            <Button
              className={styles.buttonNoLeftRadius}
              size="compact-sm"
              color={libraryWriteState === "none" ? "gray" : "blue"}
            >
              <CaretDown />
            </Button>
          </Popover>
        </ButtonGroup>
      </Group>
    </Group>
  );
}
