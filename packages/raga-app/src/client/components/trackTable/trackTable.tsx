import type { TrackDefinition } from "@adahiya/raga-lib";
import { Classes, Colors } from "@blueprintjs/core";
import { ChevronDown, ChevronUp, ExpandAll } from "@blueprintjs/icons";
import { useRowSelect } from "@table-library/react-table-library/select";
import { HeaderCellSort, useSort } from "@table-library/react-table-library/sort";
import {
  Body,
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
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { Roarr as log } from "roarr";
import { useShallow } from "zustand/react/shallow";

import { ClientErrors } from "../../../common/errorMessages";
import { getTrackFileType } from "../../../common/trackUtils";
import { useIsTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import { appStore, useAppStore } from "../../store/appStore";
import AnalyzeAllPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";
import AnalyzeSingleTrackButton from "./analyzeSingleTrackButton";
import AudioFileTypeTag from "./audioFileTypeTag";
import TrackRatingStars from "./trackRatingStars";
import styles from "./trackTable.module.scss";

export interface TrackTableProps {
  // TODO: move this state to app store
  headerHeight: number;
  playlistId: string;
}

interface TrackDefinitionNode extends TrackDefinition {
  id: number;
  indexInPlaylist: number;
}

/** Gets the list of track definitions for the given playlist as react-table-library data notes */
function useTrackDefinitionNodes(playlistId: string): Data<TrackDefinitionNode> {
  const trackDefs = useAppStore(useShallow((state) => state.getPlaylistTrackDefs(playlistId)));
  if (trackDefs === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }
  return useMemo(
    () => ({
      nodes: trackDefs.map((d, indexInPlaylist) => ({ ...d, id: d["Track ID"], indexInPlaylist })),
    }),
    [trackDefs],
  );
}

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
      getTrackFileType(a)!.localeCompare(getTrackFileType(b)!),
    ),
};

const sortOptionsIcon: SortOptionsIcon = {
  iconDefault: <ExpandAll />,
  iconDown: <ChevronDown />,
  iconUp: <ChevronUp />,
};

export default function TrackTable({ headerHeight, playlistId }: TrackTableProps) {
  const selectedTrackId = appStore.use.selectedTrackId();
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const trackDefNodes = useTrackDefinitionNodes(playlistId);

  const numTracksInPlaylist = trackDefNodes.nodes.length;
  const indexColumnWidth = Math.log10(numTracksInPlaylist) * 10 + 15;
  const analyzeColumnWidth = 90;
  const bpmColumnWidth = 60;
  const ratingColumnWidth = 100;
  const fileTypeColumnWidth = 90;

  const theme = useTheme([
    {
      Table: `
        --data-table-library_grid-template-columns: ${indexColumnWidth}px ${analyzeColumnWidth}px ${bpmColumnWidth}px repeat(2, minmax(40px, 1fr)) ${ratingColumnWidth}px ${fileTypeColumnWidth}px;
      `,
    },
  ]);

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

  const sort = useSort(trackDefNodes, { onChange: handleSortChange }, { sortFns });

  const select = useRowSelect(trackDefNodes, {
    state: { id: selectedTrackId },
    onChange: handleSelectChange,
  });

  return (
    <div className={styles.trackTableContainer}>
      <Table
        data={trackDefNodes}
        theme={theme}
        layout={{ custom: true }}
        sort={sort}
        select={select}
      >
        {(trackNodes: ExtendedNode<TrackDefinitionNode>[]) => (
          <>
            <TrackTableHeader playlistId={playlistId} />
            <TrackTableBody trackNodes={trackNodes} headerHeight={headerHeight} />
          </>
        )}
      </Table>
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
          stiff={true}
          pinLeft={true}
          sortKey={TrackPropertySortKey.INDEX}
          sortIcon={sortOptionsIcon}
        >
          <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>#</span>
        </HeaderCellSort>
        <HeaderCell stiff={true} pinLeft={true} hide={!analyzeBPMPerTrack}>
          <AnalyzeAllPlaylistTracksButton playlistId={playlistId} />
        </HeaderCell>
        <HeaderCellSort stiff={true} sortKey={TrackPropertySortKey.BPM} sortIcon={sortOptionsIcon}>
          <div className={styles.bpmColumnHeader}>
            <span>BPM</span>{" "}
            {!analyzeBPMPerTrack && <AnalyzeAllPlaylistTracksButton playlistId={playlistId} />}
          </div>
        </HeaderCellSort>
        <HeaderCellSort
          resize={defaultResizer}
          sortKey={TrackPropertySortKey.NAME}
          sortIcon={sortOptionsIcon}
        >
          Name
        </HeaderCellSort>
        <HeaderCellSort
          resize={defaultResizer}
          sortKey={TrackPropertySortKey.ARTIST}
          sortIcon={sortOptionsIcon}
        >
          Artist
        </HeaderCellSort>
        <HeaderCellSort
          stiff={true}
          sortKey={TrackPropertySortKey.RATING}
          sortIcon={sortOptionsIcon}
        >
          Rating
        </HeaderCellSort>
        <HeaderCellSort
          stiff={true}
          pinRight={true}
          sortKey={TrackPropertySortKey.FILETYPE}
          sortIcon={sortOptionsIcon}
        >
          File Type
        </HeaderCellSort>
      </HeaderRow>
    </Header>
  );
}

function TrackTableBody({
  trackNodes,
  headerHeight,
}: { trackNodes: ExtendedNode<TrackDefinitionNode>[] } & Pick<TrackTableProps, "headerHeight">) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  return (
    <Body
      className={styles.body}
      // HACKHACK: magic number
      style={{ maxHeight: `calc(100vh - ${headerHeight + 164}px)` }}
    >
      {trackNodes.map((track) => (
        <Row className={styles.row} item={track} key={track.id}>
          <Cell className={styles.indexCell}>{track.indexInPlaylist + 1}</Cell>
          <Cell hide={!analyzeBPMPerTrack}>
            <AnalyzeSingleTrackButton trackDef={track} />
          </Cell>
          <Cell className={styles.bpmCell}>{track.BPM}</Cell>
          <Cell>{track.Name}</Cell>
          <Cell>{track.Artist}</Cell>
          <Cell>
            <TrackRatingStars trackID={track["Track ID"]} rating={track.Rating} />
          </Cell>
          <Cell>
            <TrackFileTypeCell track={track} />
          </Cell>
        </Row>
      ))}
    </Body>
  );
}

function TrackFileTypeCell({ track }: { track: TrackDefinition }) {
  const isReadyForAnalysis = useIsTrackReadyForAnalysis(track["Track ID"]);
  const fileType = getTrackFileType(track);
  return <AudioFileTypeTag isReadyForAnalysis={isReadyForAnalysis} fileType={fileType} />;
}
