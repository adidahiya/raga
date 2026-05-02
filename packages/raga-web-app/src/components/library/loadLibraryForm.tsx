import { Button, Card, Separator } from "@adahiya/raga-design-system";
import { FileInput } from "@mantine/core";
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
    <div className="flex flex-col gap-2.5" ref={ref}>
      <FileInput
        className={styles.fileInput}
        placeholder="Select XML file"
        fileInputProps={{ ...XML_INPUT_PROPS, onChange: handleInputChange }}
        rightSection={<Button size="sm">Browse</Button>}
        rightSectionWidth={70}
      />
      <DividerWithLabel label="or" />
      <div
        className={classNames(styles.dropzone, { [styles.active]: isDragActive })}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? <span>Drop XML file here...</span> : <span>Drag and drop XML file</span>}
      </div>
      <MaybeRecentlyUsedLibrariesSection formWidth={width} />
    </div>
  );
}

function DividerWithLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-text-muted">
      <Separator className="flex-1" />
      <span className="text-caption">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function MaybeRecentlyUsedLibrariesSection({ formWidth }: { formWidth: number }) {
  const previouslyUsedLibaries = appStore.use.previouslyUsedLibraries();
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();
  const clearPreviouslyUsedLibraries = appStore.use.clearPreviouslyUsedLibraries();

  if (previouslyUsedLibaries.size === 0) {
    return null;
  }

  const maxFilePathLength = Math.floor((formWidth - 40) / 7);

  return (
    <>
      <DividerWithLabel label="or" />
      <Card className={`${styles.recentLibrariesForm} p-card-p`}>
        <div className="flex flex-col gap-1 mb-2">
          <span className="text-caption font-medium text-text-muted uppercase tracking-label">
            Use a recent library
          </span>
        </div>
        <div className="flex flex-col items-center gap-0">
          {Array.from(previouslyUsedLibaries).map(({ filePath }) => (
            <Button
              key={filePath}
              variant="ghost"
              size="sm"
              onClick={() => {
                setLibraryInputFilepath(filePath);
              }}
              title={filePath}
            >
              <span className="inline-flex items-center gap-2">
                <IoDocument size={14} />
                {truncateFilePath(filePath, maxFilePathLength)}
              </span>
            </Button>
          ))}
          <div className="mt-2.5">
            <Button
              size="sm"
              variant="danger"
              onClick={clearPreviouslyUsedLibraries}
            >
              <span className="inline-flex items-center gap-2">
                Clear all recent libraries
                <IoClose size={14} />
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export function LoadMockLibraryForm() {
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();

  const handleClick = useCallback(() => {
    setLibraryInputFilepath("/mock/library.xml");
  }, [setLibraryInputFilepath]);

  return (
    <div className="flex flex-col gap-2.5">
      <Button onClick={handleClick}>Load Mock Library</Button>
    </div>
  );
}
