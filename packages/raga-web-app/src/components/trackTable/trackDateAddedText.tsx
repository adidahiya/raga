import type { TrackDefinition } from "@adahiya/raga-types";
import { Text } from "@mantine/core";
import { format } from "date-fns";
import { useMemo } from "react";

export default function TrackDateAddedText({ track }: { track: TrackDefinition }) {
  const dateAdded = track["Date Added"];
  const dateAddedText = useMemo(
    () => (dateAdded === undefined ? "" : format(dateAdded, "P")),
    [dateAdded],
  );
  return (
    <Text component="span" c="dimmed" size="sm" truncate={true}>
      {dateAddedText}
    </Text>
  );
}
