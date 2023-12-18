import { PlaylistDefinition } from "@adahiya/music-library-tools-lib";
import { Classes, HTMLTable, Icon, IconSize } from "@blueprintjs/core";
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
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { formatStatNumber } from "../common/format";
import commonStyles from "./common/commonStyles.module.scss";
import styles from "./playlistTable.module.scss";
import { appStore } from "./store/appStore";
import { useLibraryOrThrow } from "./store/useLibraryOrThrow";

export interface LibraryTableProps {
    headerHeight: number;
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
    const library = useLibraryOrThrow();

    const folderChildrenByParentId = useMemo<PartialRecord<string, PlaylistDefinition[]>>(
        () =>
            library.Playlists.reduce<PartialRecord<string, PlaylistDefinition[]>>(
                (acc, playlist) => {
                    const parentId = playlist["Parent Persistent ID"];
                    if (parentId !== undefined) {
                        const parent = acc[parentId];
                        if (parent !== undefined) {
                            parent.push(playlist);
                        } else {
                            acc[parentId] = [playlist];
                        }
                    }
                    return acc;
                },
                {},
            ),
        [library.Playlists],
    );

    const playlistIsFolderWithChildren = useCallback(
        (playlistId: string) => folderChildrenByParentId[playlistId] !== undefined,
        [folderChildrenByParentId],
    );

    const recursivelyGetFolderChildern: (playlistId: string) => PlaylistRow[] = useCallback(
        (playlistId: string) =>
            playlistIsFolderWithChildren(playlistId)
                ? folderChildrenByParentId[playlistId]!.map((def) => ({
                      def,
                      children: recursivelyGetFolderChildern(def["Playlist Persistent ID"]),
                  }))
                : [],
        [folderChildrenByParentId, playlistIsFolderWithChildren],
    );

    const playlistRows = useMemo<PlaylistRow[]>(
        () =>
            library.Playlists.filter(
                (p) => !p.Master && p.Name !== "Music" && p["Parent Persistent ID"] === undefined,
            ).map((def) => ({
                def,
                children: recursivelyGetFolderChildern(def["Playlist Persistent ID"]),
            })),
        [library.Playlists, recursivelyGetFolderChildern],
    );

    const numPlaylistsStat = formatStatNumber(library.Playlists.length);
    const columnHelper = createColumnHelper<PlaylistRow>();

    const iconRightPadding = 4;
    const columns = [
        columnHelper.accessor((row) => row.def.Name, {
            id: "name",
            cell: (info) => (
                <span
                    style={{
                        // Since rows are flattened by default, we can use the row.depth property
                        // and paddingLeft to visually indicate the depth of the row
                        paddingLeft:
                            info.row.depth === 0
                                ? 0
                                : info.row.depth * IconSize.STANDARD + iconRightPadding,
                    }}
                >
                    {info.row.getCanExpand() && (
                        <Icon
                            className={Classes.TEXT_MUTED}
                            style={{ paddingRight: iconRightPadding }}
                            icon={info.row.getIsExpanded() ? "chevron-down" : "chevron-right"}
                        />
                    )}
                    {info.getValue()}
                </span>
            ),
            header: () => (
                <span>
                    Playlists{" "}
                    <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>
                        ({numPlaylistsStat})
                    </span>
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
    const [columnVisibility, _setColumnVisibility] = useState({
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
    const [columnWidths, _setColumnWidths] = useState<Record<string, number>>(
        columns.reduce<Record<string, number>>((acc, column) => {
            acc[column.id!] = 100;
            return acc;
        }, {}),
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
                <div className={classNames(styles.header, commonStyles.compactTable)}>
                    <HTMLTable compact={true}>
                        <thead>{headerRows}</thead>
                    </HTMLTable>
                </div>
            )}
            <div
                className={styles.body}
                // HACKHACK: magic number
                style={{ maxHeight: `calc(100vh - ${props.headerHeight + 74}px)` }}
            >
                <HTMLTable compact={true} interactive={true}>
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
PlaylistTable.defaultProps = {
    showHeader: true,
    showItemCounts: false,
    showFooter: false,
};

function PlaylistTableRow(row: Row<PlaylistRow>) {
    const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();
    const selectedPlaylistPath = useSelectedPlaylistPath();
    const rowPlaylistId = row.original.def["Playlist Persistent ID"];
    const isRowInSelectedPlaylistPath = selectedPlaylistPath.includes(rowPlaylistId);
    const isRowSelected = row.getIsSelected();
    const isRowExpanded = row.getIsExpanded();
    const toggleExpanded = row.getToggleExpandedHandler();
    const toggleSelected = row.getToggleSelectedHandler();

    useEffect(() => {
        // run once on initial render, if we have a selected playlist from local storage and need to show its path
        if (isRowInSelectedPlaylistPath && !isRowExpanded) {
            toggleExpanded();
        }
    });

    const handleClick = useCallback(
        (event: MouseEvent) => {
            if (row.getCanExpand()) {
                toggleExpanded();
            } else if (row.getCanSelect()) {
                toggleSelected(event);
                setSelectedPlaylistId(rowPlaylistId);
            }
        },
        [row, rowPlaylistId, setSelectedPlaylistId, toggleExpanded, toggleSelected],
    );

    return (
        <tr
            className={classNames({
                [styles.selectedPath]: isRowInSelectedPlaylistPath && !isRowSelected,
                [styles.selected]: isRowSelected,
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

/** @returns a list of the persistent playlist IDs which form the tree path to the currently selected playlist */
function useSelectedPlaylistPath() {
    const libraryPlaylists = appStore.use.libraryPlaylists();
    const selectedPlaylistId = appStore.use.selectedPlaylistId();

    return useMemo(() => {
        if (libraryPlaylists === undefined || selectedPlaylistId === undefined) {
            return [];
        }

        const path = [selectedPlaylistId];
        let currentPlaylistId = selectedPlaylistId;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
            const currentPlaylist = libraryPlaylists[currentPlaylistId];
            if (currentPlaylist === undefined) {
                break;
            }
            const parentId = currentPlaylist["Parent Persistent ID"];
            if (parentId === undefined) {
                break;
            }
            path.unshift(parentId);
            currentPlaylistId = parentId;
        }
        return path;
    }, [libraryPlaylists, selectedPlaylistId]);
}
