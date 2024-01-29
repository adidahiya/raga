import type { PlaylistDefinition } from "@adahiya/raga-lib";
import { Classes } from "@blueprintjs/core";
import { ChevronDown, ChevronRight } from "@blueprintjs/icons";
import { useRowSelect } from "@table-library/react-table-library/select";
import {
  Body,
  type Data,
  type ExtendedNode,
  // Cell,
  Header,
  HeaderCell,
  HeaderRow,
  Row,
  Table,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { CellTree, TreeExpandClickTypes, useTree } from "@table-library/react-table-library/tree";
import type { Action, State, TreeOptionsIcon } from "@table-library/react-table-library/types";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { Roarr as log } from "roarr";

import { formatStatNumber } from "../../../common/format";
// import { useEffectOnce } from "usehooks-ts";
import { appStore } from "../../store/appStore";
import { useLibraryOrThrow } from "../../store/useLibraryOrThrow";
import styles from "./playlistTable.module.scss";

export interface LibraryTableProps {
  headerHeight: number;
  /** @default false */
  showItemCounts?: boolean;
  /** @default false */
  showFooter?: boolean;
}

interface PlaylistDefinitionNode extends PlaylistDefinition {
  id: string;
  /** Child nodes of this one. `null` if this is a leaf node. */
  nodes: PlaylistDefinitionNode[] | null;
}

const treeIcon: TreeOptionsIcon<PlaylistDefinitionNode> = {
  iconRight: <ChevronRight />,
  iconDown: <ChevronDown />,
};

/** Gets the list of playlist definitions in the music library as react-table-library data nodes */
function usePlaylistDefNodes(): Data<PlaylistDefinitionNode> {
  const { Playlists: playlistDefs } = useLibraryOrThrow();

  const folderChildrenByParentId = useMemo<PartialRecord<string, PlaylistDefinition[]>>(
    () =>
      playlistDefs.reduce<PartialRecord<string, PlaylistDefinition[]>>((acc, playlist) => {
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
      }, {}),
    [playlistDefs],
  );

  const playlistIsFolderWithChildren = useCallback(
    (playlistId: string) => folderChildrenByParentId[playlistId] !== undefined,
    [folderChildrenByParentId],
  );

  const recursivelyGetFolderChildern: (playlistId: string) => PlaylistDefinitionNode[] | null =
    useCallback(
      (playlistId: string) =>
        playlistIsFolderWithChildren(playlistId)
          ? folderChildrenByParentId[playlistId]!.map((def) => ({
              ...def,
              id: def["Playlist Persistent ID"],
              nodes: recursivelyGetFolderChildern(def["Playlist Persistent ID"]),
            }))
          : null,
      [folderChildrenByParentId, playlistIsFolderWithChildren],
    );

  return useMemo<Data<PlaylistDefinitionNode>>(
    () => ({
      nodes: playlistDefs
        .filter((p) => !p.Master && p.Name !== "Music" && p["Parent Persistent ID"] === undefined)
        .map((d) => ({
          ...d,
          id: d["Playlist Persistent ID"],
          nodes: recursivelyGetFolderChildern(d["Playlist Persistent ID"]),
        })),
    }),
    [playlistDefs, recursivelyGetFolderChildern],
  );
}

export default function PlaylistTable(props: LibraryTableProps) {
  const playlistDefNodes = usePlaylistDefNodes();
  const theme = useTheme([]);

  const selectedPlaylistPath = useSelectedPlaylistPath();
  const treeSelectionState = useMemo(() => ({ ids: selectedPlaylistPath }), [selectedPlaylistPath]);
  const handleTreeChange = useCallback((action: Action, state: State) => {
    // TODO
    console.log(action, state);
  }, []);
  const tree = useTree(
    playlistDefNodes,
    { state: treeSelectionState, onChange: handleTreeChange },
    { clickType: TreeExpandClickTypes.ButtonClick, treeIcon },
  );

  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();
  const handleSelectChange = useCallback(
    (action: Action, state: State) => {
      // TODO: better typedef for `state`
      log.debug(`[client] selected playlist ${state.id}`);
      if (state.id != null) {
        setSelectedPlaylistId(state.id);
      }
    },
    [setSelectedPlaylistId],
  );
  const select = useRowSelect(playlistDefNodes, {
    onChange: handleSelectChange,
  });

  return (
    <div className={styles.playlistTableContainer}>
      <Table data={playlistDefNodes} select={select} tree={tree} theme={theme}>
        {(nodes: ExtendedNode<PlaylistDefinitionNode>[]) => (
          <>
            <Header className={styles.header}>
              <HeaderRow className={styles.row}>
                <HeaderCell>
                  Playlists{" "}
                  <span className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}>
                    ({formatStatNumber(nodes.length)})
                  </span>
                </HeaderCell>
              </HeaderRow>
            </Header>
            <Body
              className={styles.body}
              // HACKHACK: magic number
              style={{ maxHeight: `calc(100vh - ${props.headerHeight + 164}px)` }}
            >
              {nodes.map((playlist) => (
                <PlaylistTableRow playlist={playlist} key={playlist.id} />
              ))}
            </Body>
          </>
        )}
      </Table>
    </div>
  );
}
PlaylistTable.displayName = "PlaylistTable";
PlaylistTable.defaultProps = {
  showHeader: true,
  showItemCounts: false,
  showFooter: false,
};

function PlaylistTableRow({ playlist }: { playlist: ExtendedNode<PlaylistDefinitionNode> }) {
  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const selectedPlaylistPath = useSelectedPlaylistPath();
  const isRowInSelectedPlaylistPath = selectedPlaylistPath.includes(playlist.id);
  const isRowSelected = playlist.id === selectedPlaylistId;

  return (
    <Row
      className={classNames(styles.row, {
        [styles.selectedPath]: isRowInSelectedPlaylistPath && !isRowSelected,
        [styles.selected]: isRowSelected,
      })}
      item={playlist}
      key={playlist.id}
    >
      <CellTree treeIcon={treeIcon} item={playlist}>
        {playlist.Name}
      </CellTree>
    </Row>
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
