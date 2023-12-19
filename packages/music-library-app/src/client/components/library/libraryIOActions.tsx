import {
    Button,
    ButtonGroup,
    FileInput,
    FormGroup,
    Menu,
    MenuItem,
    Popover,
    Tooltip,
} from "@blueprintjs/core";
import { useCallback } from "react";

import { useVoidCallback } from "../../common/hooks";
import { appStore } from "../../store/appStore";
import styles from "./libraryIOActions.module.scss";

export default function LibraryIOActions() {
    const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
    const libraryInputFilepath = appStore.use.libraryInputFilepath();
    const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
    const libraryWriteState = appStore.use.libraryWriteState();

    const loadLibrary = appStore.use.loadSwinsianLibrary();
    const writeModifiedLibrary = appStore.use.writeModiifedLibrary();
    const unloadSwinsianLibrary = appStore.use.unloadSwinsianLibrary();
    const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();

    const handleWriteModifiedLibrary = useVoidCallback(writeModifiedLibrary);
    const handleLoad = useCallback(() => {
        if (libraryInputFilepath === undefined) {
            return;
        }
        void loadLibrary({ filepath: libraryInputFilepath });
    }, [libraryInputFilepath, loadLibrary]);

    const handleLoadFromDisk = useCallback(() => {
        if (libraryInputFilepath === undefined) {
            return;
        }
        void loadLibrary({ filepath: libraryInputFilepath, reloadFromDisk: true });
    }, [libraryInputFilepath, loadLibrary]);

    const handleSelectNewLibrary = unloadSwinsianLibrary;
    const handleOutputFilepathInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setLibraryOutputFilepath(event.target.value);
        },
        [setLibraryOutputFilepath],
    );

    const menu = (
        <Menu>
            <FormGroup label="Output file" className={styles.outputFilepath}>
                <FileInput
                    text={libraryOutputFilepath}
                    onInputChange={handleOutputFilepathInputChange}
                />
            </FormGroup>
            <MenuItem
                text={`${isLibraryLoaded ? "Reload" : "Load"} library`}
                onClick={handleLoad}
            />
            <MenuItem text="Reload from disk" onClick={handleLoadFromDisk} />
            <MenuItem text="Select new library..." onClick={handleSelectNewLibrary} />
        </Menu>
    );

    const canWrite = libraryWriteState === "ready" && libraryOutputFilepath !== undefined;
    const intent = libraryWriteState === "none" ? "none" : "primary";
    const tooltipProps =
        libraryWriteState === "busy"
            ? { content: "Writing..." }
            : libraryWriteState === "ready" && !canWrite
              ? { content: "Need to set output file" }
              : { disabled: true };

    return (
        <ButtonGroup>
            <Tooltip compact={true} {...tooltipProps}>
                <Button
                    text="Write modified library to disk"
                    disabled={!canWrite}
                    loading={libraryWriteState === "busy"}
                    intent={intent}
                    onClick={handleWriteModifiedLibrary}
                />
            </Tooltip>
            <Popover minimal={true} content={menu} placement="bottom-end">
                <Button icon="caret-down" intent={intent} disabled={libraryWriteState === "busy"} />
            </Popover>
        </ButtonGroup>
    );
}
