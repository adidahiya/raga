import { Cross, DocumentOpen } from "@blueprintjs/icons";
import { Box, Button, Divider, Fieldset, FileInput, Stack } from "@mantine/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Roarr as log } from "roarr";

import { appStore } from "../../store/appStore";
import styles from "./loadLibraryForm.module.scss";

const XML_INPUT_PROPS = {
  accept: ".xml",
};

export default function LoadLibraryForm() {
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        setLibraryInputFilepath(event.target.files[0].path);
      }
    },
    [setLibraryInputFilepath],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      log.debug(`[client] accepted input library file: ${acceptedFiles[0].path}`);
      setLibraryInputFilepath(acceptedFiles[0].path);
    },
    [setLibraryInputFilepath],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/xml": [".xml"],
    },
    maxFiles: 1,
    onDrop,
  });

  return (
    <Stack gap="xs">
      <FileInput
        className={styles.fileInput}
        placeholder="Select XML file"
        fileInputProps={{ ...XML_INPUT_PROPS, onChange: handleInputChange }}
        rightSection={<Button size="compact-sm">Browse</Button>}
        rightSectionWidth={70}
      />
      <Divider orientation="horizontal" label="or" />
      <Box
        className={classNames(styles.dropzone, { [styles.active]: isDragActive })}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? <span>Drop XML file here...</span> : <span>Drag and drop XML file</span>}
      </Box>
      <MaybeRecentlyUsedLibrariesSection />
    </Stack>
  );
}

function MaybeRecentlyUsedLibrariesSection() {
  const previouslyUsedLibaries = appStore.use.previouslyUsedLibraries();
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();
  const clearPreviouslyUsedLibraries = appStore.use.clearPreviouslyUsedLibraries();
  const handleClear = useCallback(clearPreviouslyUsedLibraries, [clearPreviouslyUsedLibraries]);

  if (previouslyUsedLibaries.size === 0) {
    return null;
  }

  return (
    <>
      <Divider orientation="horizontal" label="or" />
      <Fieldset className={styles.recentLibrariesForm} legend="Use a recent library">
        <Stack gap={0} align="center">
          {Array.from(previouslyUsedLibaries).map(({ filePath }) => (
            <Button
              key={filePath}
              variant="subtle"
              onClick={() => {
                setLibraryInputFilepath(filePath);
              }}
              leftSection={<DocumentOpen />}
            >
              {filePath}
            </Button>
          ))}
          <Box mt="xs">
            <Button
              size="compact-sm"
              color="red"
              variant="subtle"
              onClick={handleClear}
              rightSection={<Cross />}
            >
              Clear all recent libraries
            </Button>
          </Box>
        </Stack>
      </Fieldset>
    </>
  );
}
