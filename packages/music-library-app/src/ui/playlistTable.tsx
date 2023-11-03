import { MusicLibraryPlist, PlaylistDefinition } from "@adahiya/music-library-tools-lib";
import { Classes, HTMLTable, Icon } from "@blueprintjs/core";
import {
    createColumnHelper,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    Row,
    useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { useCallback, useMemo, useState, MouseEvent } from "react";

import { appStore } from "./store/appStore";

import styles from "./playlistTable.module.scss";

export interface LibraryTableProps {
    headerHeight: number;
    library: MusicLibraryPlist;
    /** @default false */
    showItemCounts?: boolean;
    /** @default false */
    showHeader?: boolean;
    /** @default false */
    showFooter?: boolean;
}

interface PlaylistRow {
    def: PlaylistDefinition;
    children: PlaylistRow[];
}

export default function PlaylistTable(props: LibraryTableProps) {
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
            enableHiding: true,
        }),
        columnHelper.accessor((row) => row.def["Playlist Persistent ID"], {
            id: "persistentId",
            cell: (info) => <i>{info.getValue()}</i>,
            header: () => <span>Persistent ID</span>,
            footer: (info) => info.column.id,
            enableHiding: true,
        }),
    ];

    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [columnVisibility, setColumnVisibility] = useState({
        numberOfTracks: props.showItemCounts ?? false,
        persistentId: false,
    });

    const table = useReactTable({
        data: playlistRows,
        columns,
        state: {
            columnVisibility,
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        enableRowSelection: true,
        enableMultiRowSelection: false,
    });

    // TODO: adjustable column widths
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
            {props.showHeader && (
                <div className={styles.header}>
                    <HTMLTable compact={true}>
                        <thead>{headerRows}</thead>
                    </HTMLTable>
                </div>
            )}
            <div
                className={styles.body}
                style={{ maxHeight: `calc(100vh - ${props.headerHeight + 50 + 75}px)` }}
            >
                <HTMLTable compact={true} interactive={true} striped={true}>
                    <thead>{headerRows}</thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <PlaylistTableRow key={row.id} {...row} />
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
            {props.showFooter && (
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
            )}
        </div>
    );
}
PlaylistTable.displayName = "PlaylistTable";

function PlaylistTableRow(row: Row<PlaylistRow>) {
    const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();

    // TODO: consider rewriting in FP style (perhaps with Rambda?)
    const handleClick = useCallback(
        (event: MouseEvent) => {
            if (row.getCanExpand()) {
                row.getToggleExpandedHandler()();
            } else {
                row.getToggleSelectedHandler()(event);
                // HACKHACK: need a better (type safe) way to get this without using the tanstack row model
                setSelectedPlaylistId(row.getValue<string>("persistentId"));
            }
        },
        [row, setSelectedPlaylistId],
    );

    return (
        <tr
            className={classNames({
                [styles.selected]: row.getIsSelected(),
            })}
            onClick={handleClick}
        >
            {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
        </tr>
    );
}
PlaylistTableRow.displayName = "PlaylistTableRow";
