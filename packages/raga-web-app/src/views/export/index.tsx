import { Card } from "@adahiya/raga-design-system";
import classNames from "classnames";
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
    <div className="flex h-full min-h-0 flex-col gap-0">
      <div
        className={classNames(
          "flex w-full min-h-0 flex-1 items-start justify-start flex-nowrap gap-1.5",
          styles.export,
        )}
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
      </div>
      <StatusBar
        totalTracks={
          masterPlaylist === undefined
            ? undefined
            : formatStatNumber(masterPlaylist["Playlist Items"].length)
        }
      />
    </div>
  );
}
ExportView.displayName = "ExportView";

interface ExportColumnProps {
  children: React.ReactNode;
  title?: React.ReactNode;
}

function ExportColumn({ children, title }: ExportColumnProps) {
  return (
    <Card className={classNames("p-card-p shadow-card-elevated", styles.exportColumn)}>
      <div className="flex h-full flex-col gap-4">
        {title !== undefined && <span>{title}</span>}
        {children}
      </div>
    </Card>
  );
}
