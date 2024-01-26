import { type Toaster } from "@blueprintjs/core";

import type { AppStoreSliceCreator } from "../zustandUtils";

/**
 * State used to manage application overlay UIs.
 */
export interface AppOverlaysState {
  toaster: Toaster | undefined;
}

export interface AppOverlaysActions {
  setToaster: (toaster: Toaster) => void;
}

export const createAppOverlaysSlice: AppStoreSliceCreator<AppOverlaysState & AppOverlaysActions> = (
  set,
  _get,
) => ({
  toaster: undefined,

  // called in `<AppChrome>` mount lifecycle
  setToaster: (toaster) => {
    set({ toaster });
  },
});
