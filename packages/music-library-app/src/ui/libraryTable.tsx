import { MusicLibraryPlist, PlaylistDefinition } from "@adahiya/music-library-tools-lib";
import { HTMLTable } from "@blueprintjs/core";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import styles from "./libraryTable.module.scss";
import { useState } from "react";

export interface LibraryTableProps {
    headerHeight: number;
    library: MusicLibraryPlist;
}

export default function (props: LibraryTableProps) {
    const columnHelper = createColumnHelper<PlaylistDefinition>();

    const columns = [
        columnHelper.accessor("Name", {
            cell: (info) => info.getValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row["Playlist Items"].length, {
            id: "numberOfTracks",
            cell: (info) => <i>{info.getValue()}</i>,
            header: () => <span># tracks</span>,
            footer: (info) => info.column.id,
        }),
    ];

    const table = useReactTable({
        data: props.library.Playlists,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        columns.reduce(
            (acc, column) => {
                acc[column.id!] = 100;
                return acc;
            },
            {} as Record<string, number>,
        ),
    );

    const headerRows = table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ width: columnWidths[header.column.columnDef.id!] }}>
                    {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                style={{ maxHeight: `calc(100vh - ${props.headerHeight + 50 + 75}px)` }}
            >
                <HTMLTable compact={true} interactive={true} striped={true}>
                    <thead>{headerRows}</thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
            <div className={styles.footer}>
                <HTMLTable className={styles.footer} compact={true}>
                    <thead>{headerRows}</thead>
                    <tfoot>
                        {table.getFooterGroups().map((footerGroup) => (
                            <tr key={footerGroup.id}>
                                {footerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.footer,
                                                  header.getContext(),
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                </HTMLTable>
            </div>
        </div>
    );
}
