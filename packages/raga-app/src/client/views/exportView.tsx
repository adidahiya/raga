import { Export } from "@blueprintjs/icons";
import { Button, FileInput, Group, Paper, Stack, Text } from "@mantine/core";
import { useCallback } from "react";

import PlaylistTable from "../components/playlistTable/playlistTable";
import { useOperationCallback } from "../hooks";
import { appStore } from "../store/appStore";
import styles from "./exportView.module.scss";

export default function ExportView() {
  const libraryOutputFilepath = appStore.use.libraryOutputFilepath();
  const setLibraryOutputFilepath = appStore.use.setLibraryOutputFilepath();
  const writeModifiedLibrary = appStore.use.writeModiifedLibrary();

  const handleOutputFilepathInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLibraryOutputFilepath(event.target.value);
    },
    [setLibraryOutputFilepath],
  );
  const handleWriteModifiedLibrary = useOperationCallback(writeModifiedLibrary);

  return (
    <Group
      w="100%"
      h="100%"
      gap={10}
      align="start"
      justify="flex-start"
      className={styles.export}
      wrap="nowrap"
    >
      {/* 1st Column: Playlist Tree */}
      <Paper shadow="sm" withBorder radius="sm" maw={300} w="100%" h="100%">
        <PlaylistTable collapsible={false} />
      </Paper>

      {/* 2nd Column: Placeholder for selecting which playlists to export */}
      <Paper shadow="sm" withBorder radius="sm" maw={300} w="100%" h="100%" p={10}>
        <Stack>
          <Text>Select playlists to export</Text>
          <Text size="sm" c="dimmed">
            This column will allow users to move playlists from the left column (tree) into a list
            or queue for export.
          </Text>
        </Stack>
      </Paper>

      {/* 3rd Column: Export target / output directory */}
      <Paper shadow="sm" withBorder radius="sm" maw={300} w="100%" h="100%" p={10}>
        <Stack>
          <Text>Export target</Text>
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
        </Stack>
      </Paper>
    </Group>
  );
}

ExportView.displayName = "ExportView";
