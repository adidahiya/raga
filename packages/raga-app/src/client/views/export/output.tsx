import { Export } from "@blueprintjs/icons";
import { Button, FileInput } from "@mantine/core";
import React, { useCallback } from "react";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";

export function Output() {
  const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
  const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();
  const writeModifiedLibrary = appStore.use.writeModifiedLibrary();

  const handleOutputFilepathInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        const filePath = window.api.getFilePath(event.target.files[0]);
        setLibraryOutputFilepath(filePath);
      }
    },
    [setLibraryOutputFilepath],
  );
  const handleWriteModifiedLibrary = useOperationCallback(writeModifiedLibrary);
  return (
    <>
      <FileInput
        label="Location of the Music.app/Rekordbox compatible XML file"
        placeholder={libraryOutputFilepath}
        fileInputProps={{ onChange: handleOutputFilepathInputChange }}
        rightSection={<Button size="compact-sm">Browse</Button>}
        rightSectionWidth={70}
      />

      <Button leftSection={<Export />} onClick={handleWriteModifiedLibrary}>
        Export library for Rekordbox
      </Button>
    </>
  );
}
