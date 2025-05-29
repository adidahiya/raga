import { Group, SegmentedControl } from "@mantine/core";

import { appStore } from "../../store/appStore";

/**
 * Segmented control for app mode, to switch between:
 * - "tracks" view which allows exploring playlists and tracks
 * - "export" view which only shows playlist tree and streamlined view to export library data for other apps (rekordbox)
 */
export default function WorkspaceModeControl() {
  const workspaceMode = appStore.use.workspaceMode();
  const setWorkspaceMode = appStore.use.setWorkspaceMode();

  return (
    <Group gap="xs" align="center">
      <SegmentedControl
        size="xs"
        value={workspaceMode}
        onChange={(value) => {
          setWorkspaceMode(value as "tracks" | "export");
        }}
        data={[
          { value: "tracks", label: "Tracks" },
          { value: "export", label: "Export" },
        ]}
      />
    </Group>
  );
}
WorkspaceModeControl.displayName = "WorkspaceModeControl";
