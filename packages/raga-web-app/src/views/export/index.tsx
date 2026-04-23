import { Group, Paper, type PaperProps, Stack, Text } from "@mantine/core";
import React from "react";

import { formatStatNumber } from "../../common/format";
import StatusBar from "../../components/library/statusBar";
import { useMasterPlaylist } from "../../hooks";
import styles from "./exportView.module.scss";
import { Input } from "./input";
import { Output } from "./output";
import { Transform } from "./transform";

export default function ExportView() {
  const masterPlaylist = useMasterPlaylist();
  return (
    <Stack gap={0} h="100%">
      <Group
        w="100%"
        gap={5}
        align="start"
        justify="flex-start"
        className={styles.export}
        wrap="nowrap"
        style={{ flex: "1 1 auto", minHeight: 0 }}
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
      <StatusBar
        totalTracks={
          masterPlaylist === undefined
            ? undefined
            : formatStatNumber(masterPlaylist["Playlist Items"].length)
        }
      />
    </Stack>
  );
}
ExportView.displayName = "ExportView";

interface ExportColumnProps extends PaperProps {
  children: React.ReactNode;
  title?: React.ReactNode;
}

function ExportColumn({ children, title, ...props }: ExportColumnProps) {
  return (
    <Paper shadow="sm" withBorder radius="sm" className={styles.exportColumn} {...props}>
      <Stack h="100%">
        {title && <Text>{title}</Text>}
        {children}
      </Stack>
    </Paper>
  );
}
