import { Export, Tick } from "@blueprintjs/icons";
import {
  Badge,
  Button,
  FileInput,
  Group,
  Paper,
  type PaperProps,
  Stack,
  Text,
} from "@mantine/core";
import React, { useCallback } from "react";
import { useBoolean } from "usehooks-ts";

import LoadLibraryForm from "../components/library/loadLibraryForm";
import PlaylistTable from "../components/playlistTable/playlistTable";
import { useOperationCallback } from "../hooks";
import { appStore } from "../store/appStore";
import styles from "./exportView.module.scss";

export default function ExportView() {
  const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
  const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();
  const setSelectedPlaylistIdsForExport = appStore.use.setSelectedPlaylistIdsForExport();
  const writeModifiedLibrary = appStore.use.writeModifiedLibrary();

  const handlePlaylistsSelected = useCallback(
    (nodeIds: string[]) => {
      setSelectedPlaylistIdsForExport(nodeIds);
    },
    [setSelectedPlaylistIdsForExport],
  );

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
    <Group
      w="100%"
      h="100%"
      gap={5}
      align="start"
      justify="flex-start"
      className={styles.export}
      wrap="nowrap"
    >
      <ExportColumn title="Input library">
        <InputLibraryColumn />
      </ExportColumn>

      <ExportColumn title="Select playlists to export">
        <PlaylistTable
          collapsible={false}
          showHeader={false}
          selectionMode="multiple"
          onSelect={handlePlaylistsSelected}
        />
      </ExportColumn>

      <ExportColumn title="Export target">
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
      </ExportColumn>
    </Group>
  );
}
ExportView.displayName = "ExportView";

interface ExportColumnProps extends PaperProps {
  children: React.ReactNode;
  title?: React.ReactNode;
}

function ExportColumn({ children, title, ...props }: ExportColumnProps) {
  return (
    <Paper
      shadow="sm"
      withBorder
      radius="sm"
      miw={250}
      maw={500}
      w="100%"
      h="100%"
      p={10}
      {...props}
    >
      <Stack h="100%">
        {title && <Text>{title}</Text>}
        {children}
      </Stack>
    </Paper>
  );
}

function InputLibraryColumn() {
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const { value: isSelectingNewLibrary, setTrue: setIsSelectingNewLibrary } = useBoolean(false);

  if (isSelectingNewLibrary) {
    return <LoadLibraryForm />;
  }

  return (
    <>
      <Badge leftSection={<Tick />} color="green" variant="light" radius="sm">
        Loaded
      </Badge>
      <Text>{libraryInputFilepath}</Text>
      <Button onClick={setIsSelectingNewLibrary}>Select new library</Button>
    </>
  );
}
