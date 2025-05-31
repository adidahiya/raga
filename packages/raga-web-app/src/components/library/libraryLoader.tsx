import { Progress, Stack } from "@mantine/core";
import { IoMusicalNotes, IoWarning } from "react-icons/io5";

import { useTaskEffect } from "../../hooks";
import { appStore } from "../../store/appStore";
import EmptyState from "../common/emptyState";
import styles from "./libraryLoader.module.scss";
import LoadLibraryForm, { LoadMockLibraryForm } from "./loadLibraryForm";

export default function LibraryLoader(props: { children: React.ReactNode }) {
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const libraryState = appStore.use.libraryLoadingState();
  const loadLibrary = appStore.use.loadSwinsianLibrary();
  const useMockData = appStore.use.useMockData();

  useTaskEffect(
    function* () {
      if (libraryInputFilepath !== undefined) {
        yield* loadLibrary({ filepath: libraryInputFilepath });
      }
    },
    [libraryInputFilepath, loadLibrary],
  );

  return (
    <Stack className={styles.container} gap={0} px={5}>
      {libraryState === "none" ? (
        <EmptyState
          className={styles.emptyState}
          title="Select a Swinsian library"
          icon={<IoMusicalNotes size={48} />}
        >
          {useMockData ? <LoadMockLibraryForm /> : <LoadLibraryForm />}
        </EmptyState>
      ) : libraryState === "loading" ? (
        <EmptyState
          className={styles.emptyState}
          title="Loading Swinsian library..."
          icon={<IoMusicalNotes size={48} />}
        >
          <Progress size="sm" color="blue" animated={true} value={100} />
        </EmptyState>
      ) : libraryState === "error" ? (
        <EmptyState
          className={styles.emptyState}
          title="Error loading Swinsian library"
          icon={<IoWarning size={48} />}
        />
      ) : (
        <div className={styles.libraryLoaded}>{props.children}</div>
      )}
    </Stack>
  );
}
