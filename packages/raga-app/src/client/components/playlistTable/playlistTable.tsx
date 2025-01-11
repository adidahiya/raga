import type { PlaylistDefinition } from "@adahiya/raga-lib";
import { CaretDown, CaretUp } from "@blueprintjs/icons";
import { ActionIcon, Box, Collapse, Divider, type MantineStyleProps, Text } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { Roarr as log } from "roarr";

import { formatStatNumber } from "../../../common/format";
import { appStore } from "../../store/appStore";
import { useLibraryOrThrow } from "../../store/useLibraryOrThrow";
import Tree, { type TreeNode } from "../common/tree";
import styles from "./playlistTable.module.scss";

// COMPONENTS
// -------------------------------------------------------------------------------------------------

interface PlaylistTableProps extends MantineStyleProps {
  /** @default true */
  collapsible?: boolean;

  /** @default "none" */
  selectionMode?: "single" | "multiple" | "none";

  /** Callback invoked when a playlist is selected or deselected. */
  onSelect?: (playlistIds: string[]) => void;
}

export default function PlaylistTable({
  collapsible = true,
  selectionMode = "none",
  onSelect,
  ...props
}: PlaylistTableProps) {
  const numTotalPlaylists = Object.keys(appStore.use.libraryPlaylists() ?? {}).length;
  const playlistDefNodes = usePlaylistTreeNodes();

  const selectedPlaylistId = appStore.use.selectedPlaylistId();

  const isPlaylistTreeExpanded = appStore.use.isPlaylistTreeExpanded();
  const togglePlaylistTreeExpanded = appStore.use.togglePlaylistTreeExpanded();

  const selectedNodeIds = useMemo(() => {
    return selectionMode === "none" || selectedPlaylistId === undefined ? [] : [selectedPlaylistId];
  }, [selectionMode, selectedPlaylistId]);
  // Selects a playlist in Raga's app store only. Mantine UI selection state is handled
  // in the Tree component.
  const handleSelect = useCallback(
    (node: TreeNode<PlaylistDefinition>) => {
      log.debug(`[client] selected playlist ${node.id}: '${node.data.Name}'`);

      if (selectionMode === "single") {
        onSelect?.([node.id]);
      } else if (selectionMode === "multiple") {
        // TODO: implement multiple selection
      }
    },
    [onSelect, selectionMode],
  );

  return (
    <Box className={styles.playlistTableContainer} {...props}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span>
            Playlists{" "}
            <Text component="span" c="dimmed" size="sm">
              ({formatStatNumber(numTotalPlaylists)})
            </Text>
          </span>
          {collapsible && (
            <ActionIcon
              size="compact-sm"
              color="gray"
              variant="subtle"
              onClick={togglePlaylistTreeExpanded}
            >
              {isPlaylistTreeExpanded ? <CaretUp /> : <CaretDown />}
            </ActionIcon>
          )}
        </div>
      </div>
      <Divider orientation="horizontal" />
      <div className={styles.body}>
        <Collapse in={collapsible ? isPlaylistTreeExpanded : true}>
          <Tree
            selectedNodeIds={selectedNodeIds}
            nodes={playlistDefNodes}
            onSelect={selectionMode === "none" ? undefined : handleSelect}
          />
        </Collapse>
      </div>
    </Box>
  );
}

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
