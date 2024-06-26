import {
  Button,
  ButtonGroup,
  Classes,
  Divider,
  FileInput,
  FormGroup,
  type IconName,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Tooltip,
} from "@blueprintjs/core";
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
    <Menu>
      <FormGroup
        label="Output file"
        className={styles.outputFilepath}
        subLabel="Location of the Music.app/Rekordbox compatible XML file"
      >
        <FileInput text={libraryOutputFilepath} onInputChange={handleOutputFilepathInputChange} />
      </FormGroup>
      <MenuItem
        icon="export"
        text="Export library for Rekordbox"
        onClick={handleWriteModifiedLibrary}
      />
    </Menu>
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

  const statusText = isLibraryLoaded ? "Loaded" : "Not loaded";
  const statusIcon: IconName = isLibraryLoaded ? "tick" : "error";
  const statusIntent = isLibraryLoaded ? "success" : "none";
  const canWrite = libraryWriteState === "ready" && libraryOutputFilepath !== undefined;
  const libraryOutputIntent = libraryWriteState === "none" ? "none" : "primary";

  return (
    <div className={styles.container}>
      <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>Library</span>
      <ButtonGroup>
        <Popover
          placement="bottom-end"
          content={libraryInputMenu}
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
        <Divider className={styles.divider} />

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
            icon="export"
            small={true}
            disabled={!canWrite}
            loading={libraryWriteState === "busy"}
            intent={libraryOutputIntent}
            onClick={handleWriteModifiedLibrary}
            text="Export"
          />
        </Tooltip>
        <Popover
          placement="bottom-end"
          content={libraryOutputMenu}
          hasBackdrop={true}
          backdropProps={{ className: commonStyles.popoverBackdrop }}
        >
          <Button rightIcon="caret-down" small={true} intent={libraryOutputIntent} />
        </Popover>
      </ButtonGroup>
    </div>
  );
}
