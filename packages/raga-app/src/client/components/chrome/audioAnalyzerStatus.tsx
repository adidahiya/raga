import { Blank, CaretDown, Tick } from "@blueprintjs/icons";
import { Button, Group, Menu, Text } from "@mantine/core";

import { appStore } from "../../store/appStore";
import { AnalyzerSettings } from "../settings/analyzerSettings";

export default function AudioAnalyzerStatus() {
  const status = appStore.use.analyzerStatus();

  return (
    <Group gap="xs" align="center">
      <Text component="span" c="dimmed" size="sm">
        Analyzer
      </Text>
      <Menu position="bottom" withArrow={true} arrowSize={12} offset={{ mainAxis: 10 }}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="compact-sm"
            loading={status === "busy"}
            leftSection={status === "busy" ? <Blank /> : <Tick />}
            rightSection={<CaretDown />}
            color={status === "busy" ? "blue" : "green"}
          >
            {status === "busy" ? "Busy…" : "Ready"}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <AnalyzerSettings />
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
