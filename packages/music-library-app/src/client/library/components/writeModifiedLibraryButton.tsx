import { Button } from "@blueprintjs/core";

import { useVoidCallback } from "../../common/hooks";
import { appStore } from "../../store/appStore";

export function WriteModifiedLibraryButton() {
    const libraryWriteState = appStore.use.libraryWriteState();
    const writeModifiedLibrary = appStore.use.writeModiifedLibrary();

    const handleWriteModifiedLibrary = useVoidCallback(writeModifiedLibrary);

    return (
        <Button
            outlined={true}
            text="Write modified library to disk"
            disabled={libraryWriteState === "none"}
            loading={libraryWriteState === "busy"}
            intent="primary"
            onClick={handleWriteModifiedLibrary}
        />
    );
}
