import "@glideapps/glide-data-grid/dist/index.css";

import type { TrackDefinition } from "@adahiya/raga-types";
import {
  type CellClickedEventArgs,
  CompactSelection,
  type CustomCell,
  type CustomRenderer,
  DataEditor,
  type DataEditorRef,
  type GridCell,
  GridCellKind,
  type GridColumn,
  type GridMouseEventArgs,
  type GridSelection,
  type HeaderClickedEventArgs,
  type Item,
  type ProvideEditorCallback,
  type Theme as GridTheme,
} from "@glideapps/glide-data-grid";
import type { MantineColorScheme, MantineTheme } from "@mantine/core";
import { Stack, Text, useComputedColorScheme, useMantineTheme } from "@mantine/core";
import classNames from "classnames";
import { run } from "effection";
import { unique } from "radash";
import { memo, useCallback, useMemo, useRef, useState } from "react";
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
import { computeNextSelection, type SelectionState } from "./trackTableSelection";
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

interface RatingCellData {
  kind: "rating";
  trackId: number;
  rating: number;
}

type RatingCell = CustomCell<RatingCellData>;

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

// Custom header icons for sort indicators (IoCaretUp/IoCaretDown from react-icons/io5)
const headerIcons: Record<string, (props: { fgColor: string; bgColor: string }) => string> = {
  sortAsc: ({ fgColor }) =>
    `<svg width="12" height="12" viewBox="0 0 512 512" fill="${fgColor}" xmlns="http://www.w3.org/2000/svg">
      <path d="M414 321.94L274.22 158.82a24 24 0 00-36.44 0L98 321.94c-13.34 15.57-2.28 39.62 18.22 39.62h279.6c20.5 0 31.56-24.05 18.18-39.62z"/>
    </svg>`,
  sortDesc: ({ fgColor }) =>
    `<svg width="12" height="12" viewBox="0 0 512 512" fill="${fgColor}" xmlns="http://www.w3.org/2000/svg">
      <path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62H116.18C95.68 150.44 84.62 174.49 98 190.06z"/>
    </svg>`,
};

// Custom cell renderer for interactive rating stars
const RATING_CELL_KIND = "rating" as const;

// Star SVG path (24x24 viewBox)
const STAR_PATH = new Path2D(
  "M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z",
);
const STAR_VIEWBOX_SIZE = 24;

function isRatingCell(cell: CustomCell): cell is RatingCell {
  const data = cell.data as unknown;
  return (
    typeof data === "object" &&
    data !== null &&
    "kind" in data &&
    (data as { kind: string }).kind === RATING_CELL_KIND
  );
}

const getRatingCellRenderer = (
  mantineTheme: MantineTheme,
  colorScheme: MantineColorScheme,
): CustomRenderer<RatingCell> => ({
  kind: GridCellKind.Custom,
  isMatch: isRatingCell,
  draw: (args, cell) => {
    const { ctx, rect, theme, hoverX, overrideCursor } = args;
    // Ensure rating is clamped to 0-5 range
    const rating = Math.max(0, Math.min(5, cell.data.rating));

    // Calculate star size to fit cell height with padding
    const padding = theme.cellVerticalPadding;
    const starSize = rect.height - padding * 2;
    const scale = starSize / STAR_VIEWBOX_SIZE;

    // Align stars left with horizontal padding (reduced by 2px for rating cell)
    const paddingOffset = theme.cellHorizontalPadding - 2;
    const startX = rect.x + paddingOffset;
    const startY = rect.y + padding;

    // Calculate hovered star (for preview effect)
    let hoveredStar = -1;
    if (hoverX !== undefined) {
      const hoverRelativeX = hoverX - paddingOffset;
      hoveredStar = Math.ceil(hoverRelativeX / starSize);
      hoveredStar = Math.max(0, Math.min(5, hoveredStar));
      // Set pointer cursor when hovering
      overrideCursor?.("pointer");
    }

    ctx.save();

    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(startX + i * starSize, startY);
      ctx.scale(scale, scale);

      const starIndex = i + 1;
      const isHovering = hoveredStar > 0;
      const isHoverPreview = isHovering && starIndex <= hoveredStar;
      const isFilled = starIndex <= rating;

      if (isHoverPreview) {
        // Hover preview takes precedence - show dimmed gold
        ctx.fillStyle = mantineTheme.colors.yellow[7];
        ctx.globalAlpha = 0.5;
      } else if (isFilled) {
        // Filled star uses full gold color
        ctx.fillStyle = mantineTheme.colors.yellow[7];
        ctx.globalAlpha = 1.0;
      } else {
        // Empty star uses dim gray color
        ctx.fillStyle =
          colorScheme === "dark" ? mantineTheme.colors.gray[8] : mantineTheme.colors.gray[2];
        ctx.globalAlpha = 1.0;
      }

      ctx.fill(STAR_PATH);
      ctx.restore();
    }

    ctx.restore();
  },
  needsHover: true,
  needsHoverPosition: true,
  onClick: (args) => {
    const { bounds, posX, cell, theme } = args;
    // Calculate star size matching the draw function
    const padding = theme.cellVerticalPadding;
    const starSize = bounds.height - padding * 2;
    // Match the reduced padding in draw function
    const startX = theme.cellHorizontalPadding - 2;

    // Calculate which star was clicked (1-5) based on X position relative to star area
    const clickX = posX - startX;
    const clickedStar = Math.ceil(clickX / starSize);
    const newRating = Math.max(0, Math.min(5, clickedStar));

    // Persist the rating change via app store
    void run(function* () {
      const setTrackRating = appStore.getState().setTrackRating;
      yield* setTrackRating(cell.data.trackId, newRating * 20);
    });

    // Return updated cell
    return { ...cell, data: { ...cell.data, rating: newRating } };
  },
});

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

  // Track hovered row for hover styling
  const [hoveredRow, setHoveredRow] = useState<number | undefined>(undefined);
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
  const { sortedTrackDefs, selection, handleHeaderClick, handleCellClicked, clearSelection } =
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
          // Rating (interactive custom cell) - convert from 0-100 to 0-5 scale
          const ratingOutOf100 = track.Rating ?? 0;
          const ratingOutOf5 = Math.round(ratingOutOf100 / 20);
          return {
            kind: GridCellKind.Custom,
            data: { kind: "rating", trackId: track.id, rating: ratingOutOf5 },
            allowOverlay: false,
            copyData: String(ratingOutOf5),
          } as RatingCell;
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

  // Handle row highlighting for active track and hover
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
      // Apply hover styling
      if (row === hoveredRow) {
        return {
          bgCell: theme.bgHeaderHovered,
        };
      }
      return undefined;
    },
    [sortedTrackDefs, activeTrackId, theme.bgCellMedium, theme.bgHeaderHovered, hoveredRow],
  );

  // Handle item hover to track which row is being hovered
  const handleItemHovered = useCallback((args: GridMouseEventArgs) => {
    // Only set hover when actually hovering over a cell, not header or empty space
    if (args.kind === "cell") {
      const [, row] = args.location;
      setHoveredRow(row);
    } else {
      setHoveredRow(undefined);
    }
  }, []);

  // const colorScheme = useComputedColorScheme("light");
  const mantineTheme = useMantineTheme();
  const colorScheme = useComputedColorScheme();
  const ratingCellRenderer = useMemo(() => {
    return getRatingCellRenderer(mantineTheme, colorScheme);
  }, [mantineTheme, colorScheme]);

  const table = (
    <div
      className={classNames(styles.trackTable, { [styles.contextMenuIsOpen]: isContextMenuOpen })}
      onClick={(e) => {
        // Clear selection when clicking directly on the container div (empty space)
        // Clicks on cells are handled by onCellClicked and won't bubble here
        if (e.target === e.currentTarget) {
          clearSelection();
        }
      }}
    >
      <DataEditor
        ref={gridRef}
        columns={columns}
        rows={sortedTrackDefs.length}
        getCellContent={getCellContent}
        provideEditor={provideEditor}
        getRowThemeOverride={getRowThemeOverride}
        gridSelection={selection}
        onHeaderClicked={handleHeaderClick}
        onCellClicked={handleCellClicked}
        rowHeight={TRACK_TABLE_ROW_HEIGHT}
        headerHeight={TRACK_TABLE_HEADER_HEIGHT}
        headerIcons={headerIcons}
        smoothScrollX={true}
        smoothScrollY={true}
        theme={theme}
        customRenderers={[ratingCellRenderer]}
        onCellContextMenu={(_cell, args) => {
          args.preventDefault();
          handleContextMenu(args);
        }}
        getCellsForSelection={true}
        rowMarkers="none"
        rowSelect="multi"
        freezeColumns={1}
        onItemHovered={handleItemHovered}
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
  const ratingColumnWidth = 100;
  const fileTypeColumnWidth = 80;
  const fileSourceColumnWidth = 90;
  const dateAddedColumnWidth = 80;

  const getSortIcon = useCallback(
    (sortKey: TrackPropertySortKey): string | undefined => {
      if (trackTableSort.sortKey === sortKey) {
        return trackTableSort.reverse ? "sortDesc" : "sortAsc";
      }
      return undefined; // No icon for non-sorted columns
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
  const colorScheme = useComputedColorScheme("light");
  const { colors, fontFamily } = useMantineTheme();

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
      textHeader: isDark ? colors.gray[0] : colors.dark[9],
      textMedium: isDark ? colors.gray[3] : colors.gray[7],
      textLight: isDark ? colors.gray[5] : colors.gray[5],
      textBubble: isDark ? colors.gray[0] : colors.dark[9],
      bgBubble: isDark ? colors.dark[5] : colors.gray[2],
      bgBubbleSelected: isDark ? colors.blue[8] : colors.blue[1],
      accentColor: colors.blue[6],
      accentLight: isDark ? colors.blue[8] : colors.blue[1],
      accentFg: "#FFFFFF",
      fontFamily: fontFamily,
      cellHorizontalPadding: 8,
      cellVerticalPadding: 3,
      headerIconSize: 12,
    };
  }, [colorScheme, colors, fontFamily]);
}

function useTableInteractions(playlistId: string, trackDefNodes: { nodes: TrackDefinitionNode[] }) {
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const trackTableSort = appStore.use.trackTableSort();
  const setTrackTableSort = appStore.use.setTrackTableSort();

  // Multi-row selection state
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedRows: new Set(),
    lastClickedRow: undefined,
  });

  const sortedTrackDefs = useMemo(() => {
    const { sortKey, reverse } = trackTableSort;
    const sortFn = sortFns[sortKey];
    const sorted = trackDefNodes.nodes.slice().sort(sortFn);
    return reverse ? sorted.reverse() : sorted;
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

  // Clear selection function
  const clearSelection = useCallback(() => {
    setSelectionState({ selectedRows: new Set(), lastClickedRow: undefined });
    setSelectedTrackId(undefined);
  }, [setSelectedTrackId]);

  // Handle cell click with modifier key support for multi-selection
  const handleCellClicked = useCallback(
    (cell: Item, event: CellClickedEventArgs) => {
      const [, row] = cell;
      // If clicking on empty space (row out of bounds), clear selection
      if (row >= sortedTrackDefs.length) {
        clearSelection();
        return;
      }
      const nextState = computeNextSelection(selectionState, {
        row,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
      });
      setSelectionState(nextState);

      // Update primary selection in app store (for backwards compatibility)
      const track = sortedTrackDefs[row];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (track) {
        log.debug(`[client] selected track ${String(track.id)} in playlist ${playlistId}`);
        setSelectedTrackId(track.id);
      }
    },
    [selectionState, sortedTrackDefs, setSelectedTrackId, playlistId, clearSelection],
  );

  // Create selection based on selectionState for multi-row selection
  const selection = useMemo((): GridSelection => {
    const { selectedRows, lastClickedRow } = selectionState;
    if (selectedRows.size === 0) {
      return {
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
        current: undefined,
      };
    }

    const rowsArray = Array.from(selectedRows).sort((a, b) => a - b);
    let rowSelection = CompactSelection.empty();
    for (const row of rowsArray) {
      rowSelection = rowSelection.add(row);
    }

    // Use last clicked row for current cell position
    const currentRow = lastClickedRow ?? rowsArray[rowsArray.length - 1];
    return {
      columns: CompactSelection.empty(),
      rows: rowSelection,
      current: {
        cell: [0, currentRow] as [number, number],
        range: { x: 0, y: currentRow, width: 1, height: 1 },
        rangeStack: [],
      },
    };
  }, [selectionState]);

  return useMemo(
    () => ({ sortedTrackDefs, selection, handleHeaderClick, handleCellClicked, clearSelection }),
    [sortedTrackDefs, selection, handleHeaderClick, handleCellClicked, clearSelection],
  );
}
