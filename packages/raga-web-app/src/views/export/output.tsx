import { Button, FileInput } from "@mantine/core";
import React, { useCallback, useRef, useState } from "react";
import { IoCheckmark, IoSave } from "react-icons/io5";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";

export function Output() {
  const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
  const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();
  const writeModifiedLibrary = appStore.use.writeModifiedLibrary();
  const libraryWriteState = appStore.use.libraryWriteState();
  // isCompletingRef prevents overlapping export triggers without causing rerenders;
  // isExportComplete drives the UI state for showing the completion message.
  const isCompletingRef = useRef(false);
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
  const handleWriteModifiedLibrary = useOperationCallback(
    function* () {
      // prevent racing click interactions from toggling completion incorrectly
      if (isCompletingRef.current) {
        return;
      }
      isCompletingRef.current = true;
      setIsExportComplete(false);
      try {
        yield* writeModifiedLibrary();
        setIsExportComplete(true);
      } finally {
        isCompletingRef.current = false;
      }
    },
    [writeModifiedLibrary],
  );

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
        <Button leftSection={<IoCheckmark size={16} />} color="green" disabled={true}>
          Export complete
        </Button>
      ) : (
        <Button
          leftSection={<IoSave size={16} />}
          onClick={handleWriteModifiedLibrary}
          loading={libraryWriteState === "busy"}
        >
          Export library for Rekordbox
        </Button>
      )}
    </>
  );
}
