import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { LOCAL_STORAGE_KEY } from "../../common/constants";
import { onRehydrateStorage, partialize, storage } from "./persist";
import {
  type AudioAnalyzerActions,
  type AudioAnalyzerState,
  createAudioAnalyzerSlice,
} from "./slices/audioAnalyzerSlice";
import {
  type AudioFilesServerActions,
  type AudioFilesServerState,
  createAudioFilesServerSlice,
} from "./slices/audioFilesServerSlice";
import {
  type AudioPlayerActions,
  type AudioPlayerState,
  createAudioPlayerSlice,
} from "./slices/audioPlayerSlice";
import {
  createExporterSlice,
  type ExporterActions,
  type ExporterState,
} from "./slices/exporterSlice";
import { createLibrarySlice, type LibraryActions, type LibraryState } from "./slices/librarySlice";
import { createSidebarSlice, type SidebarActions, type SidebarState } from "./slices/sidebarSlice";
import {
  createTrackTableSlice,
  type TrackTableActions,
  type TrackTableState,
} from "./slices/trackTableSlice";
import {
  createUserSettingsSlice,
  type UserSettingsActions,
  type UserSettingsState,
} from "./slices/userSettingsSlice";
import {
  createWorkspaceSlice,
  type WorkspaceActions,
  type WorkspaceState,
} from "./slices/workspaceSlice";
import { createSelectors } from "./zustandUtils";

export type AppState = AudioFilesServerState &
  LibraryState &
  AudioAnalyzerState &
  AudioPlayerState &
  SidebarState &
  TrackTableState &
  UserSettingsState &
  ExporterState &
  WorkspaceState;
export type AppActions = AudioFilesServerActions &
  LibraryActions &
  AudioAnalyzerActions &
  AudioPlayerActions &
  SidebarActions &
  TrackTableActions &
  UserSettingsActions &
  ExporterActions &
  WorkspaceActions;
export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  // persist app store to localStorage, see https://docs.pmnd.rs/zustand/integrations/persisting-store-data
  persist(
    immer((...args) => ({
      // store is split into slices, see https://docs.pmnd.rs/zustand/guides/slices-pattern
      ...createAudioFilesServerSlice(...args),
      ...createLibrarySlice(...args),
      ...createAudioAnalyzerSlice(...args),
      ...createAudioPlayerSlice(...args),
      ...createSidebarSlice(...args),
      ...createTrackTableSlice(...args),
      ...createUserSettingsSlice(...args),
      ...createExporterSlice(...args),
      ...createWorkspaceSlice(...args),
    })),
    {
      name: `${LOCAL_STORAGE_KEY}-appStore`,
      version: 0,
      onRehydrateStorage,
      partialize,
      storage,
    },
  ),
);

export const appStore = createSelectors(useAppStore);
