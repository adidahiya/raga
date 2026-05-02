import type { MusicLibraryPlist } from "@adahiya/raga-types";
import { format, parseISO } from "date-fns";
import { isString } from "radash";

import { appStore } from "../../store/appStore";

export default function LibraryLastModifiedText() {
  const library = appStore.use.library();
  const dateModified = getDateModified(library);

  if (library == null) {
    return <span>No library loaded</span>;
  }

  return <span>Last modified: {format(dateModified, "Pp")}</span>;
}

function getDateModified(library: MusicLibraryPlist | undefined) {
  if (library === undefined) {
    return new Date();
  }

  if (isString(library.Date)) {
    return parseISO(library.Date);
  }

  return library.Date;
}
