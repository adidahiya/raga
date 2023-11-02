import { MusicLibraryPlist, PlaylistDefinition } from "@adahiya/music-library-tools-lib";
import { Classes, HTMLTable, Icon } from "@blueprintjs/core";
import {
    createColumnHelper,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import styles from "./playlistTable.module.scss";
import { useCallback, useMemo, useState } from "react";
import classNames from "classnames";

export interface LibraryTableProps {
    headerHeight: number;
    library: MusicLibraryPlist;
}

interface PlaylistRow {
    def: PlaylistDefinition;
    children: PlaylistRow[];
}

export default function (props: LibraryTableProps) {
    // TODO: cleanup
    // const playlistsByPersistentId = useMemo<Record<string, PlaylistDefinition>>(
    //     () =>
    //         props.library.Playlists.reduce<Record<string, PlaylistDefinition>>((acc, playlist) => {
    //             acc[playlist["Playlist Persistent ID"]] = playlist;
    //             return acc;
    //         }, {}),
    //     [props.library.Playlists],
    // );

    const folderChildrenByParentId = useMemo<Record<string, PlaylistDefinition[]>>(
        () =>
            props.library.Playlists.reduce<Record<string, PlaylistDefinition[]>>(
                (acc, playlist) => {
                    const parentId = playlist["Parent Persistent ID"];
                    if (parentId !== undefined) {
                        if (acc[parentId] !== undefined) {
                            acc[parentId].push(playlist);
                        } else {
                            acc[parentId] = [playlist];
                        }
                    }
                    return acc;
                },
                {},
            ),
        [props.library.Playlists],
    );

    const playlistIsFolderWithChildren = useCallback(
        (playlistId: string) => folderChildrenByParentId[playlistId] !== undefined,
        [folderChildrenByParentId],
    );

    const recursivelyGetFolderChildern: (playlistId: string) => PlaylistRow[] = useCallback(
        (playlistId: string) =>
            playlistIsFolderWithChildren(playlistId)
                ? folderChildrenByParentId[playlistId].map((def) => ({
                      def,
                      children: recursivelyGetFolderChildern(def["Playlist Persistent ID"]),
                  }))
                : [],
        [folderChildrenByParentId],
    );

    const playlistRows = useMemo<PlaylistRow[]>(
        () =>
            props.library.Playlists.filter(
                (p) => !p.Master && p.Name !== "Music" && p["Parent Persistent ID"] === undefined,
            ).map((def) => ({
                def,
                children: recursivelyGetFolderChildern(def["Playlist Persistent ID"]),
            })),
        [props.library.Playlists],
    );

    const columnHelper = createColumnHelper<PlaylistRow>();

    const columns = [
        columnHelper.accessor((row) => row.def.Name, {
            id: "name",
            cell: (info) => (
                <span
                    style={{
                        // Since rows are flattened by default, we can use the row.depth property
                        // and paddingLeft to visually indicate the depth of the row
                        paddingLeft: `${info.row.depth * 2}rem`,
                    }}
                >
                    {info.row.getCanExpand() ? (
                        <Icon
                            className={Classes.TEXT_MUTED}
                            icon={info.row.getIsExpanded() ? "chevron-down" : "chevron-right"}
                        />
                    ) : (
                        " "
                    )}{" "}
                    {info.getValue()}
                </span>
            ),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row.def["Playlist Items"].length, {
            id: "numberOfTracks",
            cell: (info) => <i>{info.getValue()}</i>,
            header: () => <span># tracks</span>,
            footer: (info) => info.column.id,
        }),
    ];

    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
        data: playlistRows,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        enableRowSelection: true,
        enableMultiRowSelection: false,
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
                            <tr
                                key={row.id}
                                className={classNames({
                                    [styles.selected]: row.getIsSelected(),
                                })}
                                onClick={
                                    row.getCanExpand()
                                        ? row.getToggleExpandedHandler()
                                        : row.getToggleSelectedHandler()
                                }
                            >
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
