import { Button } from "@adahiya/raga-design-system";
import { FileInput } from "@mantine/core";
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
  const isWriting = libraryWriteState === "busy";

  return (
    <>
      <FileInput
        label="Location of the Music.app/Rekordbox compatible XML file"
        placeholder={libraryOutputFilepath}
        fileInputProps={{ onChange: handleOutputFilepathInputChange }}
        rightSection={<Button size="sm">Browse</Button>}
        rightSectionWidth={70}
      />

      {isExportComplete ? (
        <Button variant="secondary" disabled={true}>
          <span className="inline-flex items-center gap-2">
            <IoCheckmark size={16} />
            Export complete
          </span>
        </Button>
      ) : (
        <Button onClick={handleWriteModifiedLibrary} disabled={isWriting}>
          <span className="inline-flex items-center gap-2">
            <IoSave size={16} />
            {isWriting ? "Exporting…" : "Export library for Rekordbox"}
          </span>
        </Button>
      )}
    </>
  );
}
