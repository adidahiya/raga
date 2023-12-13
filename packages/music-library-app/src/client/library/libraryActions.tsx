import { ButtonGroup, Button, Props } from "@blueprintjs/core";
import { useCallback } from "react";
import { appStore } from "../store/appStore";

export interface LibraryActionsProps extends Props {}

export default function LibraryActions(props: LibraryActionsProps) {
    const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
    const loadLibrary = appStore.use.loadSwinsianLibrary();

    const handleLoad = useCallback(() => loadLibrary(), []);
    const handleLoadFromDisk = useCallback(() => loadLibrary({ reloadFromDisk: true }), []);

    return (
        <div className={props.className}>
            <ButtonGroup>
                <Button
                    text={`${isLibraryLoaded ? "Reload" : "Load"} library`}
                    onClick={handleLoad}
                />
                <Button text="Reload from disk" onClick={handleLoadFromDisk} />
            </ButtonGroup>
            <br />
            <br />
            <ButtonGroup>
                <WriteModifiedLibraryButton />
            </ButtonGroup>
        </div>
    );
}

function WriteModifiedLibraryButton() {
    const libraryWriteState = appStore.use.libraryWriteState();
    const writeModifiedLibrary = appStore.use.writeModiifedLibrary();
    const handleWriteModifiedLibrary = useCallback(async () => {
        await writeModifiedLibrary();
    }, []);

    return (
        <Button
            text="Write modified library to disk"
            disabled={libraryWriteState === "none"}
            loading={libraryWriteState === "busy"}
            intent="primary"
            onClick={handleWriteModifiedLibrary}
        />
    );
}
