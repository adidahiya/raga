import { Button, FileInput } from "@mantine/core";
import { Check, Save } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";

export function Output() {
  const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
  const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();
  const writeModifiedLibrary = appStore.use.writeModifiedLibrary();
  const libraryWriteState = appStore.use.libraryWriteState();
  const lastLibraryWriteState = useRef(libraryWriteState);
  const [isExportComplete, setIsExportComplete] = useState(false);

  const handleOutputFilepathInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        const filePath = window.api.getFilePath(event.target.files[0]);
        setLibraryOutputFilepath(filePath);
        setIsExportComplete(false);
      }
    },
    [setLibraryOutputFilepath],
  );
  const handleWriteModifiedLibrary = useOperationCallback(writeModifiedLibrary);

  useEffect(() => {
    if (libraryWriteState === "none" && lastLibraryWriteState.current === "busy") {
      setIsExportComplete(true);
    }

    if (libraryWriteState === "ready" && lastLibraryWriteState.current !== "ready") {
      setIsExportComplete(false);
    }

    lastLibraryWriteState.current = libraryWriteState;
  }, [libraryWriteState]);

  return (
    <>
      <FileInput
        label="Location of the Music.app/Rekordbox compatible XML file"
        placeholder={libraryOutputFilepath}
        fileInputProps={{ onChange: handleOutputFilepathInputChange }}
        rightSection={<Button size="compact-sm">Browse</Button>}
        rightSectionWidth={70}
      />

      {isExportComplete ? (
        <Button leftSection={<Check />} color="green" disabled={true}>
          Export complete
        </Button>
      ) : (
        <Button
          leftSection={<Save />}
          onClick={handleWriteModifiedLibrary}
          loading={libraryWriteState === "busy"}
        >
          Export library for Rekordbox
        </Button>
      )}
    </>
  );
}
