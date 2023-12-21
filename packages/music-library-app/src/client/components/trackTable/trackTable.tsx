import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { Classes, HTMLTable } from "@blueprintjs/core";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getTrackFileType } from "../../../common/trackUtils";
import commonStyles from "../../common/commonStyles.module.scss";
import { appStore, useAppStore } from "../../store/appStore";
import AnalyzeAlPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";
import AnalyzeSingleTrackButton from "./analyzeSingleTrackButton";
import AudioFileTypeTag from "./audioFileTypeTag";
import styles from "./trackTable.module.scss";
import TrackTableRow from "./trackTableRow";

export interface TrackTableProps {
  // TODO: move this state to app store
  headerHeight: number;
  playlistId: string;
}

export default function TrackTable({ headerHeight, playlistId }: TrackTableProps) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const trackDefs = useAppStore(useShallow((state) => state.getPlaylistTrackDefs(playlistId)));

  if (trackDefs === undefined) {
    throw new Error(`[client] No track definitions found for playlist ${playlistId}.`);
  }

  const numTracksInPlaylist = trackDefs.length;

  const columnHelper = createColumnHelper<TrackDefinition>();
  const columns = [
    columnHelper.display({
      id: "index",
      cell: (info) => (
        <span className={classNames(Classes.TEXT_SMALL, Classes.TEXT_MUTED)}>
          {info.row.index + 1}
        </span>
      ),
      header: () => (
        <span>
          #{" "}
          <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>
            (of {numTracksInPlaylist})
          </span>
        </span>
      ),
      size: 60,
    }),
    columnHelper.accessor("BPM", {
      id: "bpm",
      cell: (info) => info.cell.getValue() ?? "-",
      header: () => <BPMColumnHeader playlistId={playlistId} />,
      size: 60,
    }),
    analyzeBPMPerTrack &&
      columnHelper.display({
        id: "analyzeBPM",
        cell: (info) => <AnalyzeSingleTrackButton trackDef={info.row.original} />,
        header: () => <AnalyzeAlPlaylistTracksButton playlistId={playlistId} />,
        size: 60,
      }),
    columnHelper.accessor("Name", {
      id: "name",
      cell: (info) => <span>{info.getValue()}</span>,
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("Artist", {
      id: "artist",
      cell: (info) => <i>{info.getValue()}</i>,
      header: () => <span>Artist</span>,
    }),
    columnHelper.accessor(getTrackFileType, {
      id: "fileType",
      cell: (info) => <AudioFileTypeTag fileType={info.getValue()} />,
      header: () => <span>Type</span>,
    }),
  ].filter((c) => !!c) as ColumnDef<TrackDefinition>[];

  const table = useReactTable({
    data: trackDefs,
    columns,
    state: {},
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel<TrackDefinition>(),
    enableRowSelection: true,
    enableMultiRowSelection: false,
  });

  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const selectedTrackId = appStore.use.selectedTrackId();

  // HACKHACK: for some reason, the table model retains some stale row selection state that
  // we need to clear when changing playlists
  useEffect(() => {
    table.resetRowSelection();
  }, [selectedPlaylistId, table]);

  useEffect(() => {
    table.resetRowSelection();
    table
      .getRowModel()
      .rows.find((row) => row.original["Track ID"] === selectedTrackId)
      ?.toggleSelected();
  }, [table, selectedTrackId]);

  const headerRows = table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <th key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
          <div
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
          />
        </th>
      ))}
    </tr>
  ));

  return (
    <div className={styles.trackTableContainer}>
      <div className={classNames(styles.header, commonStyles.compactTable)}>
        <HTMLTable compact={true}>
          <thead>{headerRows}</thead>
        </HTMLTable>
      </div>
      <div
        className={styles.body}
        // HACKHACK: magic number
        style={{ maxHeight: `calc(100vh - ${headerHeight + 74}px)` }}
      >
        <HTMLTable compact={true} interactive={true} striped={true}>
          <thead>{headerRows}</thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <TrackTableRow key={row.original["Track ID"]} {...row} />
            ))}
          </tbody>
        </HTMLTable>
      </div>
    </div>
  );
}
TrackTable.displayName = "TrackTable";

function BPMColumnHeader(props: { playlistId: string }) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  return (
    <div className={styles.bpmColumnHeader}>
      <span>BPM</span>
      {!analyzeBPMPerTrack && <AnalyzeAlPlaylistTracksButton {...props} />}
    </div>
  );
}
