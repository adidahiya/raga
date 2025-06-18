import "@glideapps/glide-data-grid/dist/index.css";

import type { TrackDefinition } from "@adahiya/raga-types";
import {
  CompactSelection,
  DataEditor,
  type DataEditorRef,
  type GridCell,
  GridCellKind,
  type GridColumn,
  type GridSelection,
  type HeaderClickedEventArgs,
  type Item,
  type ProvideEditorCallback,
  type Theme as GridTheme,
} from "@glideapps/glide-data-grid";
import { Stack, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import classNames from "classnames";
import { unique } from "radash";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Roarr as log } from "roarr";
import { useShallow } from "zustand/shallow";

import { TRACK_TABLE_HEADER_HEIGHT, TRACK_TABLE_ROW_HEIGHT } from "../../common/constants";
import { ClientErrors } from "../../common/errorMessages";
import { TrackPropertySortKey } from "../../common/trackPropertySortKey";
import { getTrackFileSource, getTrackFileType } from "../../common/trackUtils";
import { appStore, useAppStore } from "../../store/appStore";
import EmptyState from "../common/emptyState";
import styles from "./trackTable.module.scss";
import { TrackTableFilterBar } from "./trackTableFilterBar";
import useTrackTableContextMenu from "./useTrackTableContextMenu";
import useTrackTableHotkeys from "./useTrackTableHotkeys";

// INTERFACES
// -------------------------------------------------------------------------------------------------

export interface TrackTableProps {
  playlistId: string;
}

interface TrackDefinitionNode extends TrackDefinition {
  id: number;
  indexInPlaylist: number;
}

// CONFIGURATION
// -------------------------------------------------------------------------------------------------

const sortFns: Record<
  TrackPropertySortKey,
  (a: TrackDefinitionNode, b: TrackDefinitionNode) => number
> = {
  [TrackPropertySortKey.INDEX]: (a, b) => a.indexInPlaylist - b.indexInPlaylist,
  [TrackPropertySortKey.NAME]: (a, b) => (a.Name ?? "").localeCompare(b.Name ?? ""),
  [TrackPropertySortKey.ARTIST]: (a, b) => (a.Artist ?? "").localeCompare(b.Artist ?? ""),
  [TrackPropertySortKey.BPM]: (a, b) => (a.BPM ?? 0) - (b.BPM ?? 0),
  [TrackPropertySortKey.GENRE]: (a, b) => (a.Genre ?? "").localeCompare(b.Genre ?? ""),
  [TrackPropertySortKey.RATING]: (a, b) => (a.Rating ?? 0) - (b.Rating ?? 0),
  [TrackPropertySortKey.FILETYPE]: (a, b) =>
    (getTrackFileType(a) ?? "").localeCompare(getTrackFileType(b) ?? ""),
  [TrackPropertySortKey.FILESOURCE]: (a, b) =>
    getTrackFileSource(a).localeCompare(getTrackFileSource(b)),
  [TrackPropertySortKey.DATE_ADDED]: (a, b) =>
    (a["Date Added"]?.getTime() ?? 0) - (b["Date Added"]?.getTime() ?? 0),
};

// Column configuration mapping
const columnSortKeyMap: Record<number, TrackPropertySortKey> = {
  0: TrackPropertySortKey.INDEX,
  2: TrackPropertySortKey.BPM,
  3: TrackPropertySortKey.NAME,
  4: TrackPropertySortKey.ARTIST,
  5: TrackPropertySortKey.GENRE,
  6: TrackPropertySortKey.RATING,
  7: TrackPropertySortKey.FILETYPE,
  8: TrackPropertySortKey.FILESOURCE,
  9: TrackPropertySortKey.DATE_ADDED,
};

// COMPONENTS
// -------------------------------------------------------------------------------------------------

const TrackTable = memo(({ playlistId }: TrackTableProps) => {
  const allTrackDefNodes = useTrackDefinitionNodes(playlistId);
  const numTracksInPlaylist = allTrackDefNodes.nodes.length;
  const containerElement = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<DataEditorRef | null>(null);

  // filter trackDefNodes based on filterQuery value
  const [filterQuery, setFilterQuery] = useState<string>("");
  const clearFilterQuery = useCallback(() => {
    setFilterQuery("");
  }, []);
  const filteredTrackDefNodes = useMemo(() => {
    if (filterQuery.trim() === "") {
      return allTrackDefNodes;
    }

    return {
      nodes: allTrackDefNodes.nodes.filter((track) => {
        const query = filterQuery.toLowerCase();
        return (
          (track.Name ?? "").toLowerCase().includes(query) ||
          (track.Artist ?? "").toLowerCase().includes(query) ||
          (track.Album ?? "").toLowerCase().includes(query)
        );
      }),
    };
  }, [filterQuery, allTrackDefNodes]);

  // Table interactions
  const { sortedTrackDefs, selection, handleHeaderClick, handleSelectionChange } =
    useTableInteractions(playlistId, filteredTrackDefNodes);
  const sortedTrackIds = useMemo(() => sortedTrackDefs.map((d) => d.id), [sortedTrackDefs]);
  useTrackTableHotkeys({ containerElement, sortedTrackIds });
  const { handleContextMenu, isContextMenuOpen } = useTrackTableContextMenu({
    containerElement,
    sortedTrackDefs,
  });

  // Column definitions
  const columns = useColumns(numTracksInPlaylist);

  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const hasNoDiscogsGenres = appStore.use.getLibraryTrackHasNoDiscogsGenres();

  // Get cell content
  const getCellContent = useCallback(
    ([col, row]: Item): GridCell => {
      const track = sortedTrackDefs[row];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!track) {
        return {
          kind: GridCellKind.Text,
          data: "",
          displayData: "",
          allowOverlay: false,
        };
      }

      switch (col) {
        case 0: // Index
          return {
            kind: GridCellKind.Number,
            data: track.indexInPlaylist + 1,
            displayData: (track.indexInPlaylist + 1).toString(),
            allowOverlay: false,
          };
        case 1: // Analyze button
          if (!analyzeBPMPerTrack) {
            return {
              kind: GridCellKind.Text,
              data: "",
              displayData: "",
              allowOverlay: false,
            };
          }
          return {
            kind: GridCellKind.Text,
            data: "Analyze",
            displayData: "Analyze",
            allowOverlay: true,
            readonly: true,
          };
        case 2: // BPM
          return {
            kind: GridCellKind.Text,
            data: track.BPM?.toString() ?? "",
            displayData: track.BPM?.toString() ?? "",
            allowOverlay: true,
          };
        case 3: // Name
          return {
            kind: GridCellKind.Text,
            data: track.Name ?? "",
            displayData: track.Name ?? "",
            allowOverlay: true,
          };
        case 4: // Artist
          return {
            kind: GridCellKind.Text,
            data: track.Artist ?? "",
            displayData: track.Artist ?? "",
            allowOverlay: true,
          };
        case 5: {
          // Genre
          const hasNoGenres = hasNoDiscogsGenres(track["Track ID"]);
          return {
            kind: GridCellKind.Text,
            data: track.Genre ?? (hasNoGenres ? "--" : "Fetch"),
            displayData: track.Genre ?? (hasNoGenres ? "--" : "Fetch"),
            allowOverlay: true,
            readonly: hasNoGenres,
          };
        }
        case 6: {
          // Rating
          return {
            kind: GridCellKind.Text,
            data: "★".repeat(track.Rating ?? 0) + "☆".repeat(5 - (track.Rating ?? 0)),
            displayData: "★".repeat(track.Rating ?? 0) + "☆".repeat(5 - (track.Rating ?? 0)),
            allowOverlay: true,
            readonly: true,
          };
        }
        case 7: {
          // File Type
          return {
            kind: GridCellKind.Text,
            data: getTrackFileType(track) ?? "--",
            displayData: getTrackFileType(track) ?? "--",
            allowOverlay: true,
            readonly: true,
          };
        }
        case 8: {
          // Source
          return {
            kind: GridCellKind.Text,
            data: getTrackFileSource(track),
            displayData: getTrackFileSource(track),
            allowOverlay: true,
            readonly: true,
          };
        }
        case 9: {
          // Date Added
          const date = track["Date Added"];
          const dateStr = date ? date.toLocaleDateString() : "--";
          return {
            kind: GridCellKind.Text,
            data: dateStr,
            displayData: dateStr,
            allowOverlay: true,
            readonly: true,
          };
        }
        default:
          return {
            kind: GridCellKind.Text,
            data: "",
            displayData: "",
            allowOverlay: false,
          };
      }
    },
    [sortedTrackDefs, analyzeBPMPerTrack, hasNoDiscogsGenres],
  );

  // Provide React component editors for custom cells
  const provideEditor = useCallback<ProvideEditorCallback<GridCell>>((_cell) => {
    // For now, let's disable custom editors and use the default text editor
    // This avoids the complex type issues while still allowing editing
    return undefined;
  }, []);

  // Theme
  const theme = useGridTheme();

  // Handle row highlighting for active track
  const activeTrackId = appStore.use.activeTrackId();
  const getRowThemeOverride = useCallback(
    (row: number) => {
      const track = sortedTrackDefs[row];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (track && activeTrackId === track.id) {
        return {
          bgCell: theme.bgCellMedium,
        };
      }
      return undefined;
    },
    [sortedTrackDefs, activeTrackId, theme.bgCellMedium],
  );

  const table = (
    <div
      className={classNames(styles.trackTable, { [styles.contextMenuIsOpen]: isContextMenuOpen })}
    >
      <DataEditor
        ref={gridRef}
        columns={columns}
        rows={sortedTrackDefs.length}
        getCellContent={getCellContent}
        provideEditor={provideEditor}
        getRowThemeOverride={getRowThemeOverride}
        gridSelection={selection}
        onGridSelectionChange={handleSelectionChange}
        onHeaderClicked={handleHeaderClick}
        rowHeight={TRACK_TABLE_ROW_HEIGHT}
        headerHeight={TRACK_TABLE_HEADER_HEIGHT}
        smoothScrollX={true}
        smoothScrollY={true}
        theme={theme}
        onCellContextMenu={(cell, args) => {
          args.preventDefault();
          handleContextMenu(args);
        }}
        getCellsForSelection={true}
        rowMarkers="none"
        freezeColumns={1}
      />
    </div>
  );

  return (
    <Stack
      w="100%"
      h="100%"
      gap={0}
      className={styles.trackTableContainer}
      ref={containerElement}
      // onContextMenu={handleContextMenu}
    >
      <TrackTableFilterBar
        query={filterQuery}
        onClose={clearFilterQuery}
        onQueryChange={setFilterQuery}
      />
      {numTracksInPlaylist > 0 ? table : <TrackTableEmpty playlistId={playlistId} />}
    </Stack>
  );
});
TrackTable.displayName = "TrackTable";
export default TrackTable;

const TrackTableEmpty = memo(({ playlistId }: TrackTableProps) => {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  if (libraryPlaylists === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }

  const playlistDef = libraryPlaylists[playlistId];

  return (
    <div className={styles.trackTableEmpty}>
      {playlistDef === undefined ? (
        <EmptyState title="No playlist selected" />
      ) : (
        <EmptyState title={`No tracks found in playlist "${playlistDef.Name}"`}>
          <Text>
            <em>
              Raga does not currently support playlist editing. You may add tracks to this playlist
              in Swinsian and re-import your library.
            </em>
          </Text>
        </EmptyState>
      )}
    </div>
  );
});
TrackTableEmpty.displayName = "TrackTableEmpty";

// HOOKS
// -------------------------------------------------------------------------------------------------

/** Gets the list of track definitions for the given playlist as react-table-library data notes */
function useTrackDefinitionNodes(playlistId: string): { nodes: TrackDefinitionNode[] } {
  const trackDefs = useAppStore(useShallow((state) => state.getPlaylistTrackDefs(playlistId)));
  if (trackDefs === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }

  // filter out duplicates since a track may appear multiple times in a playlist
  // (this is more common in playlist folders which aggregate playlists)
  return useMemo(
    () => ({
      nodes: unique(trackDefs, (d) => d["Track ID"]).map((d, indexInPlaylist) => ({
        ...d,
        id: d["Track ID"],
        indexInPlaylist,
      })),
    }),
    [trackDefs],
  );
}

/** Configures columns */
function useColumns(numTracksInPlaylist: number): GridColumn[] {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const trackTableSort = appStore.use.trackTableSort();

  const indexColumnWidth = Math.log10(numTracksInPlaylist) * 10 + 25;
  const analyzeColumnWidth = 90;
  const bpmColumnWidth = 60;
  const genresColumnWidth = 120;
  const ratingColumnWidth = 90;
  const fileTypeColumnWidth = 80;
  const fileSourceColumnWidth = 90;
  const dateAddedColumnWidth = 80;

  const getSortIcon = useCallback(
    (sortKey: TrackPropertySortKey) => {
      if (trackTableSort.sortKey === sortKey) {
        return trackTableSort.reverse ? "headerIconIndicatorUp" : "headerIconIndicatorDown";
      }
      return "headerIconIndicatorDown";
    },
    [trackTableSort],
  );

  return useMemo(
    () => [
      {
        title: "#",
        width: indexColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.INDEX),
      },
      {
        title: analyzeBPMPerTrack ? "Analyze" : "",
        width: analyzeColumnWidth,
      },
      {
        title: "BPM",
        width: bpmColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.BPM),
      },
      {
        title: "Name",
        width: 200,
        grow: 1,
        icon: getSortIcon(TrackPropertySortKey.NAME),
      },
      {
        title: "Artist",
        width: 200,
        grow: 1,
        icon: getSortIcon(TrackPropertySortKey.ARTIST),
      },
      {
        title: "Genres",
        width: genresColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.GENRE),
      },
      {
        title: "Rating",
        width: ratingColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.RATING),
      },
      {
        title: "File Type",
        width: fileTypeColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.FILETYPE),
      },
      {
        title: "Source",
        width: fileSourceColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.FILESOURCE),
      },
      {
        title: "Date",
        width: dateAddedColumnWidth,
        icon: getSortIcon(TrackPropertySortKey.DATE_ADDED),
      },
    ],
    [indexColumnWidth, getSortIcon, analyzeBPMPerTrack],
  );
}

/** Configures grid theme */
function useGridTheme(): Partial<GridTheme> {
  const { colorScheme } = useMantineColorScheme();
  const { colors } = useMantineTheme();

  return useMemo(() => {
    const isDark = colorScheme === "dark";
    return {
      bgCell: isDark ? colors.dark[7] : "#FFFFFF",
      bgCellMedium: isDark ? colors.dark[6] : colors.gray[1],
      bgHeader: isDark ? colors.dark[7] : colors.gray[0],
      bgHeaderHasFocus: isDark ? colors.dark[6] : colors.gray[1],
      bgHeaderHovered: isDark ? colors.dark[6] : colors.gray[1],
      borderColor: isDark ? colors.gray[7] : colors.gray[3],
      textDark: isDark ? colors.gray[0] : colors.dark[9],
      textMedium: isDark ? colors.gray[3] : colors.gray[7],
      textLight: isDark ? colors.gray[5] : colors.gray[5],
      textBubble: isDark ? colors.gray[0] : colors.dark[9],
      bgBubble: isDark ? colors.dark[5] : colors.gray[2],
      bgBubbleSelected: isDark ? colors.blue[8] : colors.blue[1],
      accentColor: colors.blue[6],
      accentLight: isDark ? colors.blue[8] : colors.blue[1],
      accentFg: "#FFFFFF",
      cellHorizontalPadding: 8,
      cellVerticalPadding: 3,
    };
  }, [colorScheme, colors]);
}

function useTableInteractions(playlistId: string, trackDefNodes: { nodes: TrackDefinitionNode[] }) {
  const selectedTrackId = appStore.use.selectedTrackId();
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const trackTableSort = appStore.use.trackTableSort();
  const setTrackTableSort = appStore.use.setTrackTableSort();
  const [sortedTrackDefs, setSortedTrackDefs] = useState(trackDefNodes.nodes);

  // react to changes in track list and sort column (as well as initial sort column read from local storage)
  useEffect(() => {
    const { sortKey, reverse } = trackTableSort;
    // N.B. need to copy the array since sorting is done in place
    const sorted = [...trackDefNodes.nodes].sort(sortFns[sortKey]);
    setSortedTrackDefs(reverse ? sorted.reverse() : sorted);
  }, [trackDefNodes.nodes, trackTableSort]);

  const handleHeaderClick = useCallback(
    (colIndex: number, _args: HeaderClickedEventArgs) => {
      const sortKey = columnSortKeyMap[colIndex];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (sortKey) {
        const isCurrentSort = trackTableSort.sortKey === sortKey;
        const reverse = isCurrentSort ? !trackTableSort.reverse : false;
        log.debug(
          `[client] sorted track table by '${sortKey}' column (${reverse ? "descending" : "ascending"})`,
        );
        setTrackTableSort({ sortKey, reverse });
      }
    },
    [trackTableSort, setTrackTableSort],
  );

  const handleSelectionChange = useCallback(
    (newSelection: GridSelection) => {
      if (newSelection.rows.length === 1) {
        const selectedRow = newSelection.rows.toArray()[0];
        const track = sortedTrackDefs[selectedRow];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (track) {
          log.debug(
            `[client] selected track ${String(track.id)} in current playlist ${playlistId}`,
          );
          setSelectedTrackId(track.id);
        }
      }
    },
    [playlistId, setSelectedTrackId, sortedTrackDefs],
  );

  // Create selection object
  const selection = useMemo((): GridSelection => {
    const selectedIndex = sortedTrackDefs.findIndex((track) => track.id === selectedTrackId);
    if (selectedIndex >= 0) {
      return {
        columns: CompactSelection.empty(),
        rows: CompactSelection.fromSingleSelection(selectedIndex),
        current: undefined,
      };
    }
    return {
      columns: CompactSelection.empty(),
      rows: CompactSelection.empty(),
      current: undefined,
    };
  }, [selectedTrackId, sortedTrackDefs]);

  return useMemo(
    () => ({ sortedTrackDefs, selection, handleHeaderClick, handleSelectionChange }),
    [sortedTrackDefs, selection, handleHeaderClick, handleSelectionChange],
  );
}
