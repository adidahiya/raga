import { Group, Paper, type PaperProps, Stack, Text } from "@mantine/core";
import React from "react";

import styles from "./exportView.module.scss";
import { Input } from "./input";
import { Output } from "./output";
import { Transform } from "./transform";

export default function ExportView() {
  return (
    <Group
      w="100%"
      h="100%"
      gap={5}
      align="start"
      justify="flex-start"
      className={styles.export}
      wrap="nowrap"
    >
      <ExportColumn title="Input library">
        <Input />
      </ExportColumn>

      <ExportColumn>
        <Transform />
      </ExportColumn>

      <ExportColumn title="Export target">
        <Output />
      </ExportColumn>
    </Group>
  );
}
ExportView.displayName = "ExportView";

interface ExportColumnProps extends PaperProps {
  children: React.ReactNode;
  title?: React.ReactNode;
}

function ExportColumn({ children, title, ...props }: ExportColumnProps) {
  return (
    <Paper
      shadow="sm"
      withBorder
      radius="sm"
      miw={250}
      maw={500}
      w="100%"
      h="100%"
      p={10}
      {...props}
    >
      <Stack h="100%">
        {title && <Text>{title}</Text>}
        {children}
      </Stack>
    </Paper>
  );
}
