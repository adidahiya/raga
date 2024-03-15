import type { TrackDefinition } from "@adahiya/raga-lib";
import { Classes, Text } from "@blueprintjs/core";
import classNames from "classnames";
import { format } from "date-fns";
import { useMemo } from "react";

export default function TrackDateAddedText({ track }: { track: TrackDefinition }) {
  const dateAdded = track["Date Added"];
  const dateAddedText = useMemo(
    () => (dateAdded === undefined ? "" : format(dateAdded, "P")),
    [dateAdded],
  );
  return (
    <Text className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)} ellipsize={true}>
      {dateAddedText}
    </Text>
  );
}
