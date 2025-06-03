import { Box, Button, Divider, Fieldset, FileInput, Stack } from "@mantine/core";
import classNames from "classnames";
import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { IoClose, IoDocument } from "react-icons/io5";
import { Roarr as log } from "roarr";
import { useResizeObserver } from "usehooks-ts";

import { truncateFilePath } from "../../common/stringUtils";
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
        const filePath = window.api.getFilePath(event.target.files[0]);
        setLibraryInputFilepath(filePath);
      }
    },
    [setLibraryInputFilepath],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      log.debug(`[client] accepted input library file: ${acceptedFiles[0].name}`);
      const filePath = window.api.getFilePath(acceptedFiles[0]);
      setLibraryInputFilepath(filePath);
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

  const ref = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    // @ts-expect-error - incompatible with stricter React 19 types, see https://github.com/juliencrn/usehooks-ts/issues/663
    ref,
    box: "border-box",
  });

  return (
    <Stack gap="xs" ref={ref}>
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
      <MaybeRecentlyUsedLibrariesSection formWidth={width} />
    </Stack>
  );
}

function MaybeRecentlyUsedLibrariesSection({ formWidth }: { formWidth: number }) {
  const previouslyUsedLibaries = appStore.use.previouslyUsedLibraries();
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();
  const clearPreviouslyUsedLibraries = appStore.use.clearPreviouslyUsedLibraries();
  const handleClear = useCallback(clearPreviouslyUsedLibraries, [clearPreviouslyUsedLibraries]);

  if (previouslyUsedLibaries.size === 0) {
    return null;
  }

  const maxFilePathLength = Math.floor((formWidth - 40) / 7);

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
              leftSection={<IoDocument size={14} />}
              title={filePath}
            >
              {truncateFilePath(filePath, maxFilePathLength)}
            </Button>
          ))}
          <Box mt="xs">
            <Button
              size="compact-sm"
              color="red"
              variant="subtle"
              onClick={handleClear}
              rightSection={<IoClose size={14} />}
            >
              Clear all recent libraries
            </Button>
          </Box>
        </Stack>
      </Fieldset>
    </>
  );
}

export function LoadMockLibraryForm() {
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();

  const handleClick = useCallback(() => {
    setLibraryInputFilepath("/mock/library.xml");
  }, [setLibraryInputFilepath]);

  return (
    <Stack gap="xs">
      <Button onClick={handleClick}>Load Mock Library</Button>
    </Stack>
  );
}
