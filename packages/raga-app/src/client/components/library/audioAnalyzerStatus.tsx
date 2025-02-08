import { Badge, Group, Text } from "@mantine/core";
import { Check, Loader } from "lucide-react";

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
        leftSection={status === "busy" ? <Loader /> : <Check />}
        radius="sm"
      >
        {status === "busy" ? "Busy…" : "Ready"}
      </Badge>
    </Group>
  );
}
AudioAnalyzerStatus.displayName = "AudioAnalyzerStatus";
