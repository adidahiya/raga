import type { AppStoreSliceCreator } from "../zustandUtils";

export interface ExporterState {
  /** Placeholder for tracking progress of some export operation */
  exportProgress: number;
}

export interface ExporterActions {
  /** Sets the current progress of an export operation */
  setExportProgress: (progress: number) => void;
}

export const createExporterSlice: AppStoreSliceCreator<ExporterState & ExporterActions> = (
  set,
  _get,
) => ({
  exportProgress: 0,

  setExportProgress: (progress) => {
    set({ exportProgress: progress });
  },
});
