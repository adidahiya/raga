import type { TrackDefinition } from "@adahiya/raga-lib";
import { Classes, Colors, NonIdealState } from "@blueprintjs/core";
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
} from "@table-library/react-table-library/types";
import { Virtualized } from "@table-library/react-table-library/virtualized";
import classNames from "classnames";
import { unique } from "radash";
import { useCallback, useMemo } from "react";
import { Roarr as log } from "roarr";
import { useShallow } from "zustand/react/shallow";

import { ClientErrors } from "../../../common/errorMessages";
import { getTrackFileType } from "../../../common/trackUtils";
import { stopPropagation } from "../../common/reactUtils";
import { useIsTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import { appStore, useAppStore } from "../../store/appStore";
import AnalyzeAllPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";
import AnalyzeSingleTrackButton from "./analyzeSingleTrackButton";
import AudioFileTypeTag from "./audioFileTypeTag";
import TrackRatingStars from "./trackRatingStars";
import styles from "./trackTable.module.scss";

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

// TODO: make track table row height configurable
const ROW_HEIGHT = 24;

// HACKHACK: do not use `{ TrackDefinition } from "@adahiya/raga-lib"` values for this because that import
// causes our fluent-ffmepg resolution alias (defined in `vite.main.config.mjs`) to be insufficient; we cannot
// configure how raga-lib's CJS dependencies are resolved
const enum TrackPropertySortKey {
  INDEX = "index",
  NAME = "name",
  ARTIST = "artist",
  FILETYPE = "filetype",
  RATING = "rating",
  BPM = "bpm",
}

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
};

const sortIcon: SortOptionsIcon = {
  iconDefault: <ExpandAll />,
  iconDown: <ChevronDown />,
  iconUp: <ChevronUp />,
};

// TODO: show singleton ContextMenuPopover on row click

// COMPONENTS
// -------------------------------------------------------------------------------------------------

export default function TrackTable({ playlistId }: TrackTableProps) {
  const selectedTrackId = appStore.use.selectedTrackId();
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const trackDefNodes = useTrackDefinitionNodes(playlistId);

  const numTracksInPlaylist = trackDefNodes.nodes.length;

  const theme = useTableLibraryTheme(numTracksInPlaylist);

  const handleSortChange = useCallback((_action: Action, state: State) => {
    log.debug(`[client] sorted track table: ${JSON.stringify(state)}`);
  }, []);

  const handleSelectChange = useCallback(
    (_action: Action, state: State) => {
      // TODO: better typedef for `state`
      log.debug(`[client] selected track ${state.id} in current playlist ${playlistId}`);
      setSelectedTrackId(state.id);
    },
    [playlistId, setSelectedTrackId],
  );

  const sort = useSort(trackDefNodes, { onChange: handleSortChange }, { sortFns, sortIcon });

  const select = useRowSelect(trackDefNodes, {
    state: { id: selectedTrackId },
    onChange: handleSelectChange,
  });

  const table = (
    <Table
      data={trackDefNodes}
      layout={{ isDiv: true, fixedHeader: true, custom: true }}
      select={select}
      sort={sort}
      theme={theme}
    >
      {(trackNodes: ExtendedNode<TrackDefinitionNode>[]) => (
        <Virtualized
          tableList={trackNodes}
          rowHeight={ROW_HEIGHT}
          header={() => <TrackTableHeader playlistId={playlistId} />}
          body={(item) => <TrackTableRow item={item} playlistId={playlistId} />}
        />
      )}
    </Table>
  );

  return (
    <div className={styles.trackTableContainer}>
      {numTracksInPlaylist > 0 ? table : <TrackTableEmpty playlistId={playlistId} />}
    </div>
  );
}
TrackTable.displayName = "TrackTableNext";

const defaultResizer = {
  minWidth: 50,
  resizerHighlight: Colors.DARK_GRAY5,
  resizerWidth: 8,
};

function TrackTableHeader({ playlistId }: Pick<TrackTableProps, "playlistId">) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
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
          className={styles.headerCell}
          resize={defaultResizer}
          sortKey={TrackPropertySortKey.NAME}
        >
          Name
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          resize={defaultResizer}
          sortKey={TrackPropertySortKey.ARTIST}
        >
          Artist
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          sortKey={TrackPropertySortKey.RATING}
        >
          Rating
        </HeaderCellSort>
        <HeaderCellSort
          className={styles.headerCell}
          stiff={true}
          pinRight={true}
          sortKey={TrackPropertySortKey.FILETYPE}
        >
          File Type
        </HeaderCellSort>
      </HeaderRow>
    </Header>
  );
}

function TrackTableRow({
  item: track,
  playlistId,
}: { item: ExtendedNode<TrackDefinitionNode> } & Pick<TrackTableProps, "playlistId">) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();

  // N.B. key must include the playlist ID because there is row information which changes as we navigate
  // through different playlists (like the index column)
  return (
    <Row className={styles.row} item={track} key={`${playlistId}-${track.id}`}>
      <Cell className={styles.indexCell}>{track.indexInPlaylist + 1}</Cell>
      <Cell hide={!analyzeBPMPerTrack} onClick={stopPropagation}>
        <AnalyzeSingleTrackButton trackDef={track} />
      </Cell>
      <Cell className={styles.bpmCell}>{track.BPM}</Cell>
      <Cell>{track.Name}</Cell>
      <Cell>{track.Artist}</Cell>
      <Cell onClick={stopPropagation}>
        <TrackRatingStars trackID={track["Track ID"]} rating={track.Rating} />
      </Cell>
      <Cell>
        <TrackFileTypeCell track={track} />
      </Cell>
    </Row>
  );
}

function TrackFileTypeCell({ track }: { track: TrackDefinition }) {
  const isReadyForAnalysis = useIsTrackReadyForAnalysis(track["Track ID"]);
  const fileType = getTrackFileType(track);
  return <AudioFileTypeTag isReadyForAnalysis={isReadyForAnalysis} fileType={fileType} />;
}

function TrackTableEmpty({ playlistId }: TrackTableProps) {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  if (libraryPlaylists === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }

  const playlistDef = libraryPlaylists[playlistId];

  return (
    <div className={styles.trackTableEmpty}>
      <NonIdealState
        title={`No tracks found in playlist "${playlistDef?.Name}"`}
        action={
          <p>
            <em>
              Raga does not currently support playlist editing. You may add tracks to this playlist
              in Swinsian and re-import your library.
            </em>
          </p>
        }
      />
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

/** Configures CSS grid styles. */
function useTableLibraryTheme(numTracksInPlaylist: number) {
  const indexColumnWidth = Math.log10(numTracksInPlaylist) * 10 + 15;
  const analyzeColumnWidth = 90;
  const bpmColumnWidth = 60;
  const ratingColumnWidth = 100;
  const fileTypeColumnWidth = 90;

  const gridTemplateColumns = [
    `${indexColumnWidth}px`,
    `${analyzeColumnWidth}px`,
    `${bpmColumnWidth}px`,
    `repeat(2, minmax(40px, 1fr))`,
    `${ratingColumnWidth}px`,
    `${fileTypeColumnWidth}px`,
  ];
  return useTheme([
    {
      Table: `
        flex: 1;
        --data-table-library_grid-template-columns: ${gridTemplateColumns.join(" ")};
      `,
    },
  ]);
}
