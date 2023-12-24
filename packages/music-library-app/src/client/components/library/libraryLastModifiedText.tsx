import type { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { format, parseISO } from "date-fns";

import { appStore } from "../../store/appStore";

export default function LibraryLastModifiedText() {
  const library = appStore.use.library();
  const dateModified = getDateModified(library);

  return (
    <span className={classNames({ [Classes.SKELETON]: !library })}>
      Last modified: {format(dateModified, "Pp")}
    </span>
  );
}

function getDateModified(library: MusicLibraryPlist | undefined) {
  if (library === undefined) {
    return new Date();
  }

  if (typeof library.Date === "string") {
    return parseISO(library.Date);
  }

  return library.Date;
}
