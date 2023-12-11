import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { Button, Classes, HTMLTable } from "@blueprintjs/core";
import {
    CellContext,
    ColumnDef,
    HeaderContext,
    Row,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { useShallow } from "zustand/react/shallow";
import { useCallback } from "react";

import { LIBRARY_VIEW_SETTINGS } from "../common/constants";
import { appStore, useAppStore } from "./store/appStore";

import commonStyles from "../common/commonStyles.module.scss";
import styles from "./trackTable.module.scss";

export interface TrackTableProps {
    // TODO: move this state to app store
    headerHeight: number;
    playlistId: string;
}

export default function TrackTable({ headerHeight, playlistId }: TrackTableProps) {
    const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
    const trackDefs = useAppStore(useShallow((state) => state.getPlaylistTrackDefs(playlistId)));

    if (trackDefs === undefined) {
        return;
    }

    const columnHelper = createColumnHelper<TrackDefinition>();
    const columns = [
        columnHelper.display({
            id: "index",
            cell: (info) => (
                <span className={classNames(Classes.TEXT_SMALL, Classes.TEXT_MUTED)}>
                    {info.row.index + 1}
                </span>
            ),
            header: () => <span>#</span>,
            size: 60,
        }),
        columnHelper.accessor("BPM", {
            id: "bpm",
            cell: (info) => info.cell.getValue() ?? "-",
            header: BPMColumnHeader,
            size: 60,
        }),
        analyzeBPMPerTrack &&
            columnHelper.display({
                id: "analyzeBPM",
                cell: AnalyzeBPMCell,
                header: () => (
                    <div>
                        <AnalyzeAllTracksInSelectedPlaylistButton />
                    </div>
                ),
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
    ].filter((c) => !!c) as Array<ColumnDef<TrackDefinition, unknown>>;

    const table = useReactTable({
        data: trackDefs,
        columns,
        state: {},
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        enableMultiRowSelection: false,
    });

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
        <div className={styles.container}>
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
                            <TrackTableRow key={row.id} {...row} />
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
        </div>
    );
}
TrackTable.displayName = "TrackTable";

function TrackTableRow(row: Row<TrackDefinition>) {
    return (
        <tr>
            {row.getVisibleCells().map((cell) => (
                <td key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    );
}
TrackTableRow.displayName = "TrackTableRow";

function BPMColumnHeader(_props: HeaderContext<TrackDefinition, number>) {
    const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
    return (
        <div className={styles.bpmColumnHeader}>
            <span>BPM</span>
            {!analyzeBPMPerTrack && <AnalyzeAllTracksInSelectedPlaylistButton />}
        </div>
    );
}
BPMColumnHeader.displayName = "BPMColumnHeader";

function AnalyzeBPMCell(props: CellContext<TrackDefinition, unknown>) {
    const trackId = props.row.original["Track ID"];
    const analyzeTrack = appStore.use.analyzeTrack();
    const handleAnalyzeBPM = useCallback(async () => {
        await analyzeTrack(trackId);
    }, []);
    return <Button outlined={true} small={true} text="Analyze" onClick={handleAnalyzeBPM} />;
}

function AnalyzeAllTracksInSelectedPlaylistButton() {
    const audioFilesServerState = LIBRARY_VIEW_SETTINGS.USE_EXTERNAL_AUDIO_FILES_SERVER
        ? "started"
        : appStore.use.audioFilesServerState();
    const analyzerState = appStore.use.analyzerState();
    const analyzePlaylist = appStore.use.analyzePlaylist();
    const selectedPlaylistId = appStore.use.selectedPlaylistId();
    const handleAnalyzeClick = useCallback(async () => {
        await analyzePlaylist(selectedPlaylistId!);
    }, []);

    return (
        <Button
            className={styles.analyzeAllButton}
            disabled={audioFilesServerState !== "started"}
            ellipsizeText={true}
            intent="primary"
            loading={analyzerState === "busy"}
            minimal={true}
            onClick={handleAnalyzeClick}
            small={true}
            text="Analyze all"
        />
    );
}
