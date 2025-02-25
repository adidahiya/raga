import type { PlaylistDefinition } from "@adahiya/raga-lib";
import { Box, Divider, type MantineStyleProps, Text } from "@mantine/core";
import { memo, useCallback, useMemo } from "react";
import { Roarr as log } from "roarr";

import { formatStatNumber } from "../../../common/format";
import { appStore } from "../../store/appStore";
import { useLibraryOrThrow } from "../../store/useLibraryOrThrow";
import Tree, { type TreeNode, type TreeSelectionMode } from "../common/tree";
import styles from "./playlistTable.module.scss";

// COMPONENTS
// -------------------------------------------------------------------------------------------------

interface PlaylistTableProps extends MantineStyleProps {
  /** @default true */
  showHeader?: boolean;

  /** @default "none" */
  selectionMode?: TreeSelectionMode;

  /** Callback invoked when a playlist is selected or deselected. */
  onSelect?: (playlistIds: string[]) => void;
}

function PlaylistTable({
  showHeader = true,
  selectionMode = "none",
  onSelect,
  ...props
}: PlaylistTableProps) {
  const numTotalPlaylists = Object.keys(appStore.use.libraryPlaylists() ?? {}).length;
  const playlistDefNodes = usePlaylistTreeNodes();

  const selectedPlaylistId = appStore.use.selectedPlaylistId();

  const selectedNodeIds = useMemo(() => {
    return selectionMode === "none" || selectedPlaylistId === undefined ? [] : [selectedPlaylistId];
  }, [selectionMode, selectedPlaylistId]);
  // Selects a playlist in Raga's app store only. Mantine UI selection state is handled
  // in the Tree component.
  const handleSelect = useCallback(
    (nodes: TreeNode<PlaylistDefinition>[]) => {
      if (selectionMode === "single") {
        const firstNode = nodes[0];
        log.debug(`[client] selected playlist ${firstNode.id}: '${firstNode.data.Name}'`);
        onSelect?.([firstNode.id]);
      } else if (selectionMode === "multiple") {
        onSelect?.(nodes.map((n) => n.id));
      }
    },
    [onSelect, selectionMode],
  );

  return (
    <Box className={styles.playlistTableContainer} {...props}>
      {showHeader && (
        <>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <span>
                Playlists{" "}
                <Text component="span" c="dimmed" size="sm">
                  ({formatStatNumber(numTotalPlaylists)})
                </Text>
              </span>
            </div>
          </div>
          <Divider orientation="horizontal" />
        </>
      )}
      <div className={styles.body}>
        <Tree
          nodes={playlistDefNodes}
          selectionMode={selectionMode}
          selectedNodeIds={selectedNodeIds}
          onSelect={selectionMode === "none" ? undefined : handleSelect}
        />
      </div>
    </Box>
  );
}

export default memo(PlaylistTable);

// HOOKS
// -------------------------------------------------------------------------------------------------

/**
 * Gets the list of playlist definitions in the music library as tree data nodes.
 *
 * TODO: we can probably just return Mantine tree nodes instead of an intermediate data structure.
 */
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
              children: recursivelyGetFolderChildren(def["Playlist Persistent ID"]),
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
        .map(
          (d) =>
            ({
              children: recursivelyGetFolderChildren(d["Playlist Persistent ID"]),
              data: d,
              id: d["Playlist Persistent ID"],
              label: d.Name,
              parentId: d["Parent Persistent ID"],
            }) satisfies TreeNode<PlaylistDefinition>,
        ),
    [playlistDefs, recursivelyGetFolderChildren],
  );
}
