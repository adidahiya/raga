import { Blank, Tick } from "@blueprintjs/icons";
import { Badge, Group, Text } from "@mantine/core";

import { appStore } from "../../store/appStore";

export default function AudioAnalyzerStatus() {
  const status = appStore.use.analyzerStatus();

  return (
    <Group gap="xs" align="center" justify="space-between">
      <Text component="span" c="dimmed" size="sm">
        Analyzer
      </Text>
      <Badge
        size="sm"
        variant="light"
        color={status === "busy" ? "blue" : "green"}
        leftSection={status === "busy" ? <Blank /> : <Tick />}
        radius="sm"
      >
        {status === "busy" ? "Busy…" : "Ready"}
      </Badge>
    </Group>
  );
}
AudioAnalyzerStatus.displayName = "AudioAnalyzerStatus";
