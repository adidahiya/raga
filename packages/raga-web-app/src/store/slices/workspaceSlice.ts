import type { AppStoreSliceCreator } from "../zustandUtils";

/**
 * High-level workspace layout, controlling which major mode or view is active.
 */
export interface WorkspaceState {
  /** @default "tracks" */
  workspaceMode: "tracks" | "export";
}

export interface WorkspaceActions {
  setWorkspaceMode: (mode: WorkspaceState["workspaceMode"]) => void;
}

export const createWorkspaceSlice: AppStoreSliceCreator<WorkspaceState & WorkspaceActions> = (
  set,
  _get,
) => ({
  workspaceMode: "tracks",

  setWorkspaceMode: (mode) => {
    set({ workspaceMode: mode });
  },
});
