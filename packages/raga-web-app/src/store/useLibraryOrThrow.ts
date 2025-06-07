import type { SwinsianLibraryPlist } from "@adahiya/raga-types";

import { ClientErrors } from "../common/errorMessages";
import { appStore } from "./appStore";

export function useLibraryOrThrow(): SwinsianLibraryPlist {
  const library = appStore.use.library();

  if (library === undefined) {
    throw new Error(ClientErrors.LIBRARY_NOT_LOADED);
  }

  return library;
}
