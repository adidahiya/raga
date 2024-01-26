import type { TrackDefinition } from "@adahiya/raga-lib";
import { Classes } from "@blueprintjs/core";
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
import type { SortOptionsIcon } from "@table-library/react-table-library/types";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ClientErrors } from "../../../common/errorMessages";
import { getTrackFileType } from "../../../common/trackUtils";
// import commonStyles from "../../common/commonStyles.module.scss";
import { useIsTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import { appStore, useAppStore } from "../../store/appStore";
import AnalyzeAlPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";
import AnalyzeSingleTrackButton from "./analyzeSingleTrackButton";
import AudioFileTypeTag from "./audioFileTypeTag";
import TrackRatingStars from "./trackRatingStars";
import styles from "./trackTable.module.scss";
import AnalyzeAllPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";

export interface TrackTableProps {
  // TODO: move this state to app store
  headerHeight: number;
  playlistId: string;
}

interface TrackDefinitionNode extends TrackDefinition {
  id: number;
  indexInPlaylist: number;
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

const sortOptionsIcon: SortOptionsIcon = {
  iconDefault: <ExpandAll />,
  iconDown: <ChevronDown />,
  iconUp: <ChevronUp />,
};

export default function TrackTableNext({ headerHeight, playlistId }: TrackTableProps) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const trackDefs = useAppStore(useShallow((state) => state.getPlaylistTrackDefs(playlistId)));

  if (trackDefs === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }

  const selectedTrackId = appStore.use.selectedTrackId();
  const setSelectedTrackId = appStore.use.setSelectedTrackId();

  const theme = useTheme([
    {
      Table: `
        --data-table-library_grid-template-columns:  24px repeat(5, minmax(0, 1fr));
      `,
    },
  ]);

  const handleSortChange = useCallback((action, state) => {
    // TODO
    console.log(action, state);
  }, []);

  const handleSelectChange = useCallback(
    (action, state) => {
      console.log(action, state);
      setSelectedTrackId(state.id);
    },
    [setSelectedTrackId],
  );

  const data: Data<TrackDefinitionNode> = useMemo(
    () => ({
      nodes: trackDefs.map((d, indexInPlaylist) => ({ ...d, id: d["Track ID"], indexInPlaylist })),
    }),
    [trackDefs],
  );
  const sort = useSort(
    data,
    {
      onChange: handleSortChange,
    },
    {
      sortFns: {
        [TrackPropertySortKey.INDEX]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) => a.indexInPlaylist - b.indexInPlaylist),
        [TrackPropertySortKey.NAME]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) =>
            (a.Name ?? "").localeCompare(b.Name ?? ""),
          ),
        [TrackPropertySortKey.ARTIST]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) =>
            (a.Artist ?? "").localeCompare(b.Artist ?? ""),
          ),
        [TrackPropertySortKey.RATING]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) => (a.Rating ?? 0) - (b.Rating ?? 0)),
        [TrackPropertySortKey.FILETYPE]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) =>
            getTrackFileType(a)!.localeCompare(getTrackFileType(b)!),
          ),
      },
    },
  );

  const select = useRowSelect(data, {
    state: { id: selectedTrackId },
    onChange: handleSelectChange,
  });

  return (
    <div className={styles.trackTableNext}>
      <Table data={data} theme={theme} layout={{ custom: true }} sort={sort} select={select}>
        {(trackNodes: ExtendedNode<TrackDefinitionNode>[]) => (
          <>
            <Header className={styles.header}>
              <HeaderRow className={styles.headerRow}>
                <HeaderCellSort
                  resize={{ minWidth: 40 }}
                  sortKey={TrackPropertySortKey.INDEX}
                  sortIcon={sortOptionsIcon}
                >
                  <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>#</span>
                </HeaderCellSort>
                <HeaderCellSort
                  resize={{ minWidth: 60 }}
                  sortKey={TrackPropertySortKey.BPM}
                  sortIcon={sortOptionsIcon}
                >
                  <BPMColumnHeader playlistId={playlistId} />
                </HeaderCellSort>
                {analyzeBPMPerTrack && (
                  <HeaderCell>
                    <AnalyzeAllPlaylistTracksButton playlistId={playlistId} />
                  </HeaderCell>
                )}
                <HeaderCellSort
                  resize={true}
                  sortKey={TrackPropertySortKey.NAME}
                  sortIcon={sortOptionsIcon}
                >
                  Name
                </HeaderCellSort>
                <HeaderCellSort
                  resize={true}
                  sortKey={TrackPropertySortKey.ARTIST}
                  sortIcon={sortOptionsIcon}
                >
                  Artist
                </HeaderCellSort>
                <HeaderCellSort
                  resize={{ minWidth: 110 }}
                  sortKey={TrackPropertySortKey.RATING}
                  sortIcon={sortOptionsIcon}
                >
                  Rating
                </HeaderCellSort>
                <HeaderCellSort sortKey={TrackPropertySortKey.FILETYPE} sortIcon={sortOptionsIcon}>
                  File Type
                </HeaderCellSort>
              </HeaderRow>
            </Header>
            <Body
              className={styles.body}
              // HACKHACK: magic number
              style={{ maxHeight: `calc(100vh - ${headerHeight + 164}px)` }}
            >
              {trackNodes.map((track) => (
                <Row className={styles.row} item={track} key={track.id}>
                  <Cell>{track.indexInPlaylist + 1}</Cell>
                  <Cell>{track.BPM}</Cell>
                  {analyzeBPMPerTrack && (
                    <Cell>
                      <AnalyzeSingleTrackButton trackDef={track} />
                    </Cell>
                  )}
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
          </>
        )}
      </Table>
    </div>
  );
}
TrackTableNext.displayName = "TrackTableNext";

function BPMColumnHeader(props: { playlistId: string }) {
  const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  return (
    <div className={styles.bpmColumnHeader}>
      <span>BPM</span> {!analyzeBPMPerTrack && <AnalyzeAlPlaylistTracksButton {...props} />}
    </div>
  );
}

function TrackFileTypeCell({ track }: { track: TrackDefinition }) {
  const isReadyForAnalysis = useIsTrackReadyForAnalysis(track["Track ID"]);
  const fileType = getTrackFileType(track);
  return <AudioFileTypeTag isReadyForAnalysis={isReadyForAnalysis} fileType={fileType} />;
}
