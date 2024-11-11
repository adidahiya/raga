import { Button, FileInput, FormGroup, Menu, MenuItem } from "@blueprintjs/core";
import { Text } from "@mantine/core";
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
    <div className={styles.loadLibraryForm}>
      <FormGroup>
        <FileInput
          className={styles.fileInput}
          text="Select XML file"
          fill={true}
          onInputChange={handleInputChange}
          inputProps={XML_INPUT_PROPS}
        />
        <div className={styles.separator}>or</div>
        <div
          className={classNames(styles.dropzone, { [styles.active]: isDragActive })}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? <span>Drop XML file here...</span> : <span>Drag and drop XML file</span>}
        </div>
      </FormGroup>
      <MaybeRecentlyUsedLibrariesSection />
    </div>
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
      <div className={styles.separator}>or</div>
      <FormGroup
        className={styles.recentLibrariesForm}
        label={
          <Text component="span" c="dimmed">
            Use a recent library
          </Text>
        }
      >
        <Menu className={styles.recentLibrariesMenu}>
          {Array.from(previouslyUsedLibaries).map(({ filePath }) => (
            <MenuItem
              key={filePath}
              text={filePath}
              onClick={() => {
                setLibraryInputFilepath(filePath);
              }}
              icon="document-open"
            />
          ))}
        </Menu>
        <div className={styles.clearRecent}>
          <Button
            minimal={true}
            onClick={handleClear}
            rightIcon="cross"
            small={true}
            text="Clear all recent libraries"
          />
        </div>
      </FormGroup>
    </>
  );
}
