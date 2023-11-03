import { PlaylistDefinition, TrackDefinition } from "@adahiya/music-library-tools-lib";
import { Classes, HTMLTable } from "@blueprintjs/core";
import {
    Row,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { useMemo } from "react";

import { appStore } from "./store/appStore";

import styles from "./trackTable.module.scss";

export interface TrackTableProps {
    // TODO: move this state to app store
    headerHeight: number;
    playlistId: string;
}

export default function TrackTable({ headerHeight, playlistId }: TrackTableProps) {
    const playlists = usePlaylists();
    if (playlists === undefined) {
        return null;
    }

    const selectedPlaylist = playlists[playlistId];
    if (selectedPlaylist === undefined) {
        return null;
    }

    const trackDefs = usePlaylistTrackDefs(selectedPlaylist);
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
            footer: (info) => info.column.id,
            maxSize: 60,
        }),
        columnHelper.accessor("Name", {
            id: "name",
            cell: (info) => <span>{info.getValue()}</span>,
            header: () => <span>Name</span>,
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("Artist", {
            id: "artist",
            cell: (info) => <i>{info.getValue()}</i>,
            header: () => <span>Artist</span>,
            footer: (info) => info.column.id,
        }),
    ];

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
            <div className={styles.header}>
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

function usePlaylistTrackDefs(playlist: PlaylistDefinition): TrackDefinition[] {
    const libraryPlist = appStore.use.libraryPlist();

    if (libraryPlist === undefined) {
        // TODO: implement invariant
        return [];
    }

    const trackIds = useMemo(
        () => playlist["Playlist Items"].map((item) => item["Track ID"]),
        [playlist],
    );

    return useMemo(
        () => trackIds.map((trackId) => libraryPlist.Tracks[trackId] as TrackDefinition),
        [trackIds, libraryPlist],
    );
}

// TODO: move to derived state in app store
function usePlaylists() {
    const libraryPlist = appStore.use.libraryPlist();

    if (libraryPlist === undefined) {
        // TODO: implement invariant
        return undefined;
    }

    return useMemo<Record<string, PlaylistDefinition>>(
        () =>
            libraryPlist.Playlists.reduce<Record<string, PlaylistDefinition>>((acc, playlist) => {
                acc[playlist["Playlist Persistent ID"]] = playlist;
                return acc;
            }, {}),
        [libraryPlist.Playlists],
    );
}
