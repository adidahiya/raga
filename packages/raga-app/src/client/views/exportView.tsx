import { Center, Paper, Stack, Text } from "@mantine/core";

import styles from "./exportView.module.scss";

export default function ExportView() {
  return (
    <Paper w="100%" h="100%" shadow="sm" withBorder={true} radius="sm" className={styles.export}>
      <Stack gap={0} w="100%" h="100%" justify="center">
        <Center>
          <Text>ExportView</Text>
        </Center>
      </Stack>
    </Paper>
  );
}
ExportView.displayName = "ExportView";
