import { Button, ButtonGroup, Menu, MenuItem, Popover, Props, Section } from "@blueprintjs/core";
import { useCallback } from "react";

import { appStore } from "../store/appStore";
import { LibraryLastModifiedText } from "./library/libraryLastModifiedText";
import { WriteModifiedLibraryButton } from "./library/writeModifiedLibraryButton";

export type LibraryHeaderSectionProps = Props;

export default function LibraryHeaderSection(props: LibraryHeaderSectionProps) {
    return (
        <Section
            className={props.className}
            compact={true}
            title="Library"
            subtitle={<LibraryLastModifiedText />}
            rightElement={<LibraryIOActions />}
        />
    );
}

function LibraryIOActions() {
    const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
    const loadLibrary = appStore.use.loadSwinsianLibrary();
    const libraryInputFilepath = appStore.use.libraryInputFilepath();
    const unloadSwinsianLibrary = appStore.use.unloadSwinsianLibrary();

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

    const menu = (
        <Menu>
            <MenuItem
                text={`${isLibraryLoaded ? "Reload" : "Load"} library`}
                onClick={handleLoad}
            />
            <MenuItem text="Reload from disk" onClick={handleLoadFromDisk} />
            <MenuItem text="Select new library..." onClick={handleSelectNewLibrary} />
        </Menu>
    );

    return (
        <ButtonGroup>
            <WriteModifiedLibraryButton />
            <Popover minimal={true} content={menu} placement="bottom-end">
                <Button outlined={true} icon="caret-down" />
            </Popover>
        </ButtonGroup>
    );
}
