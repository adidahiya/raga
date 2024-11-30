import type { PlaylistDefinition } from "@adahiya/raga-lib";
import { CaretDown, CaretUp } from "@blueprintjs/icons";
import { ActionIcon, Collapse, Text } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { Roarr as log } from "roarr";

import { formatStatNumber } from "../../../common/format";
import { appStore } from "../../store/appStore";
import { useLibraryOrThrow } from "../../store/useLibraryOrThrow";
import Tree, { type TreeNode } from "../common/tree";
import styles from "./playlistTable.module.scss";

// COMPONENTS
// -------------------------------------------------------------------------------------------------

export default function PlaylistTable() {
  const numTotalPlaylists = Object.keys(appStore.use.libraryPlaylists() ?? {}).length;
  const playlistDefNodes = usePlaylistTreeNodes();

  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();

  const isPlaylistTreeExpanded = appStore.use.isPlaylistTreeExpanded();
  const togglePlaylistTreeExpanded = appStore.use.togglePlaylistTreeExpanded();

  const handleSelect = useCallback(
    (node: TreeNode<PlaylistDefinition>) => {
      log.debug(`[client] selected playlist ${node.id}: '${node.data.Name}'`);
      setSelectedPlaylistId(node.id);
    },
    [setSelectedPlaylistId],
  );

  return (
    <div className={styles.playlistTableContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span>
            Playlists{" "}
            <Text component="span" c="dimmed" size="sm">
              ({formatStatNumber(numTotalPlaylists)})
            </Text>
          </span>
          <ActionIcon
            size="compact-sm"
            color="gray"
            variant="subtle"
            onClick={togglePlaylistTreeExpanded}
          >
            {isPlaylistTreeExpanded ? <CaretUp /> : <CaretDown />}
          </ActionIcon>
        </div>
      </div>
      <div className={styles.body}>
        <Collapse in={isPlaylistTreeExpanded}>
          <Tree
            compact={true}
            selectedNodeId={selectedPlaylistId}
            nodes={playlistDefNodes}
            onSelect={handleSelect}
          />
        </Collapse>
      </div>
    </div>
  );
}

// HOOKS
// -------------------------------------------------------------------------------------------------

/** Gets the list of playlist definitions in the music library as tree data nodes */
function usePlaylistTreeNodes(): TreeNode<PlaylistDefinition>[] {
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

  const recursivelyGetFolderChildren: (
    playlistId: string,
  ) => TreeNode<PlaylistDefinition>[] | undefined = useCallback(
    (playlistId: string) =>
      playlistIsFolderWithChildren(playlistId)
        ? folderChildrenByParentId[playlistId]!.map(
            (def: PlaylistDefinition): TreeNode<PlaylistDefinition> => ({
              childNodes: recursivelyGetFolderChildren(def["Playlist Persistent ID"]),
              data: def,
              id: def["Playlist Persistent ID"],
              label: def.Name,
              parentId: def["Parent Persistent ID"],
            }),
          )
        : undefined,
    [folderChildrenByParentId, playlistIsFolderWithChildren],
  );

  return useMemo<TreeNode<PlaylistDefinition>[]>(
    () =>
      playlistDefs
        .filter((p) => !p.Master && p.Name !== "Music" && p["Parent Persistent ID"] === undefined)
        .map((d) => ({
          childNodes: recursivelyGetFolderChildren(d["Playlist Persistent ID"]),
          data: d,
          id: d["Playlist Persistent ID"],
          label: d.Name,
          parentId: d["Parent Persistent ID"],
        })),
    [playlistDefs, recursivelyGetFolderChildren],
  );
}
