import { type TrackDefinition, TrackProperty } from "@adahiya/raga-lib";
// import { Classes, HTMLTable } from "@blueprintjs/core";
import {
  CellSelect,
  HeaderCellSelect,
  useRowSelect,
} from "@table-library/react-table-library/select";
import { HeaderCellSort, useSort } from "@table-library/react-table-library/sort";
import {
  Body,
  Cell,
  type Data,
  type ExtendedNode,
  Header,
  // HeaderCell,
  HeaderRow,
  Row,
  Table,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
// import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ClientErrors } from "../../../common/errorMessages";
import { getTrackFileType } from "../../../common/trackUtils";
// import commonStyles from "../../common/commonStyles.module.scss";
import { useIsTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import { useAppStore } from "../../store/appStore";
// import AnalyzeAlPlaylistTracksButton from "./analyzeAllPlaylistTracksButton";
// import AnalyzeSingleTrackButton from "./analyzeSingleTrackButton";
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
}

export default function TrackTableNext({ headerHeight, playlistId }: TrackTableProps) {
  // const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
  const trackDefs = useAppStore(useShallow((state) => state.getPlaylistTrackDefs(playlistId)));

  if (trackDefs === undefined) {
    throw new Error(ClientErrors.libraryNoTracksFoundForPlaylist(playlistId));
  }

  // const numTracksInPlaylist = trackDefs.length;
  // const selectedPlaylistId = appStore.use.selectedPlaylistId();
  // const selectedTrackId = appStore.use.selectedTrackId();

  const theme = useTheme({
    Table: `
        --data-table-library_grid-template-columns:  24px repeat(5, minmax(0, 1fr));
      `,
  });

  const handleSortChange = useCallback((action, state) => {
    // TODO
    console.log(action, state);
  }, []);

  const handleSelectChange = useCallback((action, state) => {
    // TODO
    console.log(action, state);
  }, []);

  const data: Data<TrackDefinitionNode> = useMemo(
    () => ({ nodes: trackDefs.map((d) => ({ ...d, id: d["Track ID"] })) }),
    [trackDefs],
  );
  const sort = useSort(
    data,
    {
      onChange: handleSortChange,
    },
    {
      sortFns: {
        [TrackProperty.NAME]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) => a.Name!.localeCompare(b.Name!)),
        [TrackProperty.ARTIST]: (array) =>
          (array as TrackDefinitionNode[]).sort((a, b) => a.Artist!.localeCompare(b.Artist!)),
      },
    },
  );

  const select = useRowSelect(data, {
    onChange: handleSelectChange,
  });

  return (
    <div className={styles.trackTableContainer}>
      <div className={styles.body} style={{ maxHeight: `calc(100vh - ${headerHeight}px)` }}>
        <Table data={data} theme={theme} layout={{ custom: true }} sort={sort} select={select}>
          {(trackNodes: ExtendedNode<TrackDefinitionNode>[]) => (
            <>
              <Header>
                <HeaderRow>
                  <HeaderCellSelect />
                  <HeaderCellSort sortKey="index">#</HeaderCellSort>
                  <HeaderCellSort sortKey={TrackProperty.NAME}>Name</HeaderCellSort>
                  <HeaderCellSort sortKey={TrackProperty.ARTIST}>Artist</HeaderCellSort>
                </HeaderRow>
              </Header>

              <Body>
                {trackNodes.map((track, index) => (
                  <Row item={track} key={track.id}>
                    <CellSelect item={track} />
                    <Cell>{index}</Cell>
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
    </div>
  );
}
TrackTableNext.displayName = "TrackTableNext";

// function BPMColumnHeader(props: { playlistId: string }) {
//   const analyzeBPMPerTrack = appStore.use.analyzeBPMPerTrack();
//   return (
//     <div className={styles.bpmColumnHeader}>
//       <span>BPM</span>
//       {!analyzeBPMPerTrack && <AnalyzeAlPlaylistTracksButton {...props} />}
//     </div>
//   );
// }

function TrackFileTypeCell({ track }: { track: TrackDefinition }) {
  const isReadyForAnalysis = useIsTrackReadyForAnalysis(track["Track ID"]);
  const fileType = getTrackFileType(track);
  return <AudioFileTypeTag isReadyForAnalysis={isReadyForAnalysis} fileType={fileType} />;
}
