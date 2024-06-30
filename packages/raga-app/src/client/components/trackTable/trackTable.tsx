import type { TrackDefinition } from "@adahiya/raga-lib";
import { Classes, Colors, NonIdealState, Tag, Tooltip } from "@blueprintjs/core";
import { ChevronDown, ChevronUp, ExpandAll } from "@blueprintjs/icons";
import { useRowSelect } from "@table-library/react-table-library/select";
import { HeaderCellSort, useSort } from "@table-library/react-table-library/sort";
import {
  Cell,
  type Data,
  type ExtendedNode,
  Header,
  HeaderCell,
  HeaderRow,
  Row,
  Table,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import type {
  Action,
  SortFn,
  SortOptionsIcon,
  State,
  Theme,
} from "@table-library/react-table-library/types";
import { type RowHeight, Virtualized } from "@table-library/react-table-library/virtualized";
import classNames from "classnames";
import { unique } from "radash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Roarr as log } from "roarr";
import { useResizeObserver } from "usehooks-ts";
import { useShallow } from "zustand/react/shallow";

import { TRACK_TABLE_HEADER_HEIGHT, TRACK_TABLE_ROW_HEIGHT } from "../../../common/constants";
import { ClientErrors } from "../../../common/errorMessages";
import { AudioFileSource, getTrackFileSource, getTrackFileType } from "../../../common/trackUtils";
import { stopPropagation } from "../../common/reactUtils";
import { TrackPropertySortKey } from "../../common/trackPropertySortKey";
import { useIsTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import { appStore, useAppStore } from "../../store/appStore";
import type { TrackTableSortState } from "../../store/slices/trackTableSlice";
import AnalyzeAllPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";
import AnalyzeSingleTrackButton from "./analyzeSingleTrackButton";
import AudioFileTypeTag from "./audioFileTypeTag";
import EditableTrackTagValue from "./editableTrackTagValue";
import TrackDateAddedText from "./trackDateAddedText";
import TrackRatingStars from "./trackRatingStars";
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

const sortFns: Record<TrackPropertySortKey, SortFn> = {
  [TrackPropertySortKey.INDEX]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) => a.indexInPlaylist - b.indexInPlaylist),
  [TrackPropertySortKey.NAME]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) => (a.Name ?? "").localeCompare(b.Name ?? "")),
  [TrackPropertySortKey.ARTIST]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) => (a.Artist ?? "").localeCompare(b.Artist ?? "")),
  [TrackPropertySortKey.BPM]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) => (a.BPM ?? 0) - (b.BPM ?? 0)),
  [TrackPropertySortKey.RATING]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) => (a.Rating ?? 0) - (b.Rating ?? 0)),
  [TrackPropertySortKey.FILETYPE]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) =>
      (getTrackFileType(a) ?? "").localeCompare(getTrackFileType(b) ?? ""),
    ),
  [TrackPropertySortKey.FILESOURCE]: (array) =>
    (array as TrackDefinitionNode[]).sort((a, b) =>
      getTrackFileSource(a).localeCompare(getTrackFileSource(b)),
    ),
  [TrackPropertySortKey.DATE_ADDED]: (array) =>
    (array as TrackDefinitionNode[]).sort(
      (a, b) => (a["Date Added"]?.getTime() ?? 0) - (b["Date Added"]?.getTime() ?? 0),
    ),
};

const sortIcon: SortOptionsIcon = {
  iconDefault: <ExpandAll />,
  iconDown: <ChevronDown />,
  iconUp: <ChevronUp />,
};

// N.B. there is a bug in the <Virtualized> component `rowHeight` prop where it does not calculate
// row offsets correctly when configured with different heights like this (e.g. header row is taller than body rows).
// So we can't use this prop; instead we fix vertical spacing in CSS.
const _virtualizedRowHeight: RowHeight = (_node, index) =>
  index === 0 ? TRACK_TABLE_HEADER_HEIGHT : TRACK_TABLE_ROW_HEIGHT;

// COMPONENTS
// -------------------------------------------------------------------------------------------------

export default function TrackTable({ playlistId }: TrackTableProps) {
  const allTrackDefNodes = useTrackDefinitionNodes(playlistId);
  const numTracksInPlaylist = allTrackDefNodes.nodes.length;
  const theme = useTableTheme(numTracksInPlaylist);
  const containerElement = useRef<HTMLDivElement>(null);

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

  // N.B. table interaction hooks need to the list of tracks with the current sort order applied
  // so that they can locate rows correctly in 2D space
  const { select, sort, sortedTrackDefs } = useTableInteractions(playlistId, filteredTrackDefNodes);
  const sortedTrackIds = useMemo(() => sortedTrackDefs.map((d) => d.id), [sortedTrackDefs]);
  useTrackTableHotkeys({ containerElement, sortedTrackIds });
  const { contextMenuPopover, handleContextMenu, isContextMenuOpen } = useTrackTableContextMenu({
    containerElement,
    sortedTrackDefs,
  });

  const setTrackTablePanelWidth = appStore.use.setTrackTablePanelWidth();
  const handleTrackTableResize = useCallback(
    (size: { width: number | undefined }) => {
      setTrackTablePanelWidth(size.width);
    },
    [setTrackTablePanelWidth],
  );

  useResizeObserver({
    ref: containerElement,
    onResize: handleTrackTableResize,
  });

  const table = (
    <Table
      className={classNames(styles.trackTable, { [styles.contextMenuIsOpen]: isContextMenuOpen })}
      data={filteredTrackDefNodes}
      layout={{ isDiv: true, fixedHeader: true, custom: true }}
      select={select}
      sort={sort}
      theme={theme}
    >
      {(trackNodes: ExtendedNode<TrackDefinitionNode>[]) => (
        <Virtualized
          tableList={trackNodes}
          rowHeight={TRACK_TABLE_ROW_HEIGHT}
          header={() => <TrackTableHeader playlistId={playlistId} />}
          body={(item) => <TrackTableRow item={item} playlistId={playlistId} />}
        />
      )}
    </Table>
  );

  return (
    <div
      className={styles.trackTableContainer}
      ref={containerElement}
      onContextMenu={handleContextMenu}
    >
      <TrackTableFilterBar
        query={filterQuery}
        onClose={clearFilterQuery}
        onQueryChange={setFilterQuery}
      />
      {numTracksInPlaylist > 0 ? table : <TrackTableEmpty playlistId={playlistId} />}
      {contextMenuPopover}
    </div>
  );
}
TrackTable.displayName = "TrackTable";

const RESIZER_OPTIONS = {
  minWidth: 50,
  resizerHighlight: Colors.DARK_GRAY5,
  resizerWidth: 8,
};

function TrackTableHeader({ playlistId }: Pick<TrackTableProps, "playlistId">) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const disabledColumns = useDisabledColumns();

  return (
    <Header className={styles.header}>
      <HeaderRow className={styles.headerRow}>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          pinLeft={true}
          sortKey={TrackPropertySortKey.INDEX}
        >
          <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>#</span>
        </HeaderCellSort>
        <HeaderCell
          className={styles.headerCell}
          stiff={true}
          pinLeft={true}
          hide={!analyzeBPMPerTrack}
        >
          <AnalyzeAllPlaylistTracksButton playlistId={playlistId} />
        </HeaderCell>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          sortKey={TrackPropertySortKey.BPM}
        >
          <div className={styles.bpmColumnHeader}>
            <span>BPM</span>{" "}
            {!analyzeBPMPerTrack && <AnalyzeAllPlaylistTracksButton playlistId={playlistId} />}
          </div>
        </HeaderCellSort>
        <HeaderCellSort
          className={classNames(styles.headerCell, styles.editableColumn)}
          resize={RESIZER_OPTIONS}
          sortKey={TrackPropertySortKey.NAME}
        >
          Name
        </HeaderCellSort>
        <HeaderCellSort
          className={classNames(styles.headerCell, styles.editableColumn)}
          resize={RESIZER_OPTIONS}
          sortKey={TrackPropertySortKey.ARTIST}
        >
          Artist
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          sortKey={TrackPropertySortKey.RATING}
          hide={disabledColumns.rating}
        >
          Rating
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          sortKey={TrackPropertySortKey.FILETYPE}
        >
          File Type
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          sortKey={TrackPropertySortKey.FILESOURCE}
          hide={disabledColumns.filesource}
        >
          Source
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          pinRight={true}
          sortKey={TrackPropertySortKey.DATE_ADDED}
        >
          <Tooltip content="Date added" placement="bottom" compact={true}>
            <span>Date</span>
          </Tooltip>
        </HeaderCellSort>
      </HeaderRow>
    </Header>
  );
}

interface TrackTableRowProps
  extends TrackTableProps,
    Pick<React.HTMLAttributes<HTMLDivElement>, "onContextMenu"> {
  item: ExtendedNode<TrackDefinitionNode>;
}

// N.B. we cannot wrap this in a standard Blueprint ContextMenu because `<Row>` does not use forwardRef
const TrackTableRow = ({ item: track, playlistId }: TrackTableRowProps) => {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const activeTrackId = appStore.use.activeTrackId();
  const disabledColumns = useDisabledColumns();

  return (
    <Row
      className={classNames(styles.row, { [styles.rowActive]: activeTrackId === track.id })}
      data-track-id={track.id}
      item={track}
      // N.B. key must include the playlist ID because there is row information which changes as we navigate
      // through different playlists (like the index column)
      key={`${playlistId}-${track.id.toString()}`}
    >
      <Cell className={styles.indexCell}>{track.indexInPlaylist + 1}</Cell>
      <Cell hide={!analyzeBPMPerTrack} onClick={stopPropagation}>
        <AnalyzeSingleTrackButton trackDef={track} />
      </Cell>
      <Cell className={styles.bpmCell}>
        <EditableTrackTagValue tagName="BPM" trackDef={track} />
      </Cell>
      <Cell>
        <EditableTrackTagValue tagName="Title" trackDef={track} />
      </Cell>
      <Cell>
        <EditableTrackTagValue tagName="Artist" trackDef={track} />
      </Cell>
      {disabledColumns.rating ? null : (
        <Cell onClick={stopPropagation}>
          <TrackRatingStars trackID={track["Track ID"]} rating={track.Rating} />
        </Cell>
      )}
      <Cell>
        <TrackFileTypeCell track={track} />
      </Cell>
      {disabledColumns.filesource ? null : (
        <Cell>
          <TrackFileSourceCell track={track} />
        </Cell>
      )}
      <Cell>
        <TrackDateAddedText track={track} />
      </Cell>
    </Row>
  );
};
TrackTableRow.displayName = "TrackTableRow";

function TrackFileTypeCell({ track }: { track: TrackDefinition }) {
  const isReadyForAnalysis = useIsTrackReadyForAnalysis(track["Track ID"]);
  const fileType = getTrackFileType(track);
  return <AudioFileTypeTag isReadyForAnalysis={isReadyForAnalysis} fileType={fileType} />;
}

function TrackFileSourceCell({ track }: { track: TrackDefinition }) {
  const fileSource = getTrackFileSource(track);
  const intent =
    fileSource === AudioFileSource.BANDCAMP
      ? "primary"
      : fileSource === AudioFileSource.SOULSEEK
        ? "success"
        : "none";
  return (
    <Tag fill={true} minimal={true} intent={intent} style={{ textAlign: "center" }}>
      {fileSource}
    </Tag>
  );
}

function TrackTableEmpty({ playlistId }: TrackTableProps) {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  if (libraryPlaylists === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }

  const playlistDef = libraryPlaylists[playlistId];

  return (
    <div className={styles.trackTableEmpty}>
      {playlistDef === undefined ? (
        <NonIdealState title={`No playlist selected`} />
      ) : (
        <NonIdealState
          title={`No tracks found in playlist "${playlistDef.Name}"`}
          action={
            <p>
              <em>
                Raga does not currently support playlist editing. You may add tracks to this
                playlist in Swinsian and re-import your library.
              </em>
            </p>
          }
        />
      )}
    </div>
  );
}

// HOOKS
// -------------------------------------------------------------------------------------------------

/** Gets the list of track definitions for the given playlist as react-table-library data notes */
function useTrackDefinitionNodes(playlistId: string): Data<TrackDefinitionNode> {
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

/** Determines which track table columns should be hidden according to responsive design constraints */
function useDisabledColumns(): PartialRecord<TrackPropertySortKey, boolean> {
  const trackTablePanelWidth = appStore.use.trackTablePanelWidth() ?? 9999;

  return useMemo(() => {
    return {
      [TrackPropertySortKey.RATING]: trackTablePanelWidth < 700,
      [TrackPropertySortKey.FILESOURCE]: trackTablePanelWidth < 650,
    };
  }, [trackTablePanelWidth]);
}

/** Configures CSS grid styles. */
function useTableTheme(numTracksInPlaylist: number): Theme {
  const indexColumnWidth = Math.ceil(Math.log10(numTracksInPlaylist) * 10 + 15);
  const analyzeColumnWidth = 90;
  const bpmColumnWidth = 60;
  const ratingColumnWidth = 90;
  const fileTypeColumnWidth = 80;
  const fileSourceColumnWidth = 80;
  const dateAddedColumnWidth = 80;

  const disabledColumns = useDisabledColumns();

  const gridTemplateColumns = [
    `${indexColumnWidth.toString()}px`,
    `${analyzeColumnWidth.toString()}px`,
    `${bpmColumnWidth.toString()}px`,
    `repeat(2, minmax(40px, 1fr))`,
    disabledColumns.rating ? undefined : `${ratingColumnWidth.toString()}px`,
    `${fileTypeColumnWidth.toString()}px`,
    disabledColumns.filesource ? undefined : `${fileSourceColumnWidth.toString()}px`,
    `${dateAddedColumnWidth.toString()}px`,
  ].filter((value) => !!value);

  return useTheme([
    {
      Table: `
        flex: 1;
        --data-table-library_grid-template-columns: ${gridTemplateColumns.join(" ")};
      `,
    },
  ]);
}

function useTableInteractions(playlistId: string, trackDefNodes: Data<TrackDefinitionNode>) {
  const selectedTrackId = appStore.use.selectedTrackId();
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const trackTableSort = appStore.use.trackTableSort();
  const setTrackTableSort = appStore.use.setTrackTableSort();
  const [sortedTrackDefs, setSortedTrackDefs] = useState(trackDefNodes.nodes);

  // react to changes in track list and sort column (as well as initial sort column read from local storage)
  useEffect(() => {
    const { sortKey, reverse } = trackTableSort;
    // N.B. need to copy the array since `sortFns` do sorting in place
    const sortedTrackDefs = sortFns[sortKey](trackDefNodes.nodes.slice()) as TrackDefinitionNode[];
    setSortedTrackDefs(reverse ? sortedTrackDefs.reverse() : sortedTrackDefs);
  }, [trackDefNodes.nodes, trackTableSort]);

  const handleSortChange = useCallback(
    (_action: Action, state: State) => {
      const { sortKey, reverse } = state as TrackTableSortState;
      log.debug(
        `[client] sorted track table by '${sortKey}' column (${reverse ? "descending" : "ascending"})`,
      );
      setTrackTableSort({ sortKey, reverse });
    },
    [setTrackTableSort],
  );

  const handleSelectChange = useCallback(
    (_action: Action, state: State) => {
      // TODO: better typedef for `state`
      log.debug(`[client] selected track ${state.id as string} in current playlist ${playlistId}`);
      setSelectedTrackId(state.id);
    },
    [playlistId, setSelectedTrackId],
  );

  const sort = useSort(
    trackDefNodes,
    { state: trackTableSort, onChange: handleSortChange },
    { sortFns, sortIcon },
  );

  const select = useRowSelect(trackDefNodes, {
    state: { id: selectedTrackId },
    onChange: handleSelectChange,
  });

  return useMemo(() => ({ select, sort, sortedTrackDefs }), [sort, select, sortedTrackDefs]);
}
