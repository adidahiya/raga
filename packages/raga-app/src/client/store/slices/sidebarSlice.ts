import type { AppStoreSliceCreator } from "../zustandUtils";

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface SidebarState {
  // nothing
}

export interface SidebarActions {
  // nothing
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export const createSidebarSlice: AppStoreSliceCreator<SidebarState & SidebarActions> = (
  _set,
  _get,
) => ({
  // nothing
});
