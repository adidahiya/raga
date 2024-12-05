import { ChevronDown, ChevronRight } from "@blueprintjs/icons";
import {
  ActionIcon,
  Group,
  type RenderTreeNodePayload,
  Tree,
  type TreeNodeData,
  useTree,
} from "@mantine/core";
import classNames from "classnames";
import { useCallback, useEffect, useMemo } from "react";

import styles from "./tree.module.scss";

// INTERFACES
// -------------------------------------------------------------------------------------------------

export interface TreeNode<T> {
  children?: TreeNode<T>[];
  data: T;
  id: string;
  label: string;
  parentId: string | undefined;
}

export interface ControlledTreeProps<T> {
  /** Optional classes for the container element. */
  className?: string;

  /** Whether to use compact styling */
  compact?: boolean;

  /** Tree data nodes. */
  nodes: TreeNode<T>[];

  /** ID of the selected node. */
  selectedNodeId?: string;

  /** Callback invoked when a node is selected. */
  onSelect?: (node: TreeNode<T>) => void;
}

// COMPONENTS
// -------------------------------------------------------------------------------------------------

/**
 * Wrapper around Mantine's Tree component with controlled state management
 */
export default function ControlledTree<T extends object>({
  className,
  compact,
  selectedNodeId,
  nodes,
  onSelect,
}: ControlledTreeProps<T>) {
  // Convert our node structure to Mantine's expected format
  const mantineNodes = useMemo(
    () => mapNodesToMantineFormat(nodes, selectedNodeId),
    [nodes, selectedNodeId],
  );

  const tree = useTree();
  const { select, clearSelected } = tree;

  const renderTreeNode = useCallback(
    ({ node, expanded, selected, hasChildren, elementProps, tree }: RenderTreeNodePayload) => {
      return (
        <Group gap="xs" {...elementProps}>
          {hasChildren && (
            <ActionIcon
              size="compact-sm"
              color="gray"
              variant="subtle"
              onClick={() => {
                if (expanded) {
                  tree.collapse(node.value);
                } else {
                  tree.expand(node.value);
                }
              }}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </ActionIcon>
          )}

          <Group
            gap={5}
            onClick={() => {
              if (selected) {
                tree.deselect(node.value);
              } else {
                tree.select(node.value);
                const selectedNode = findNodeById(nodes, node.value);
                if (selectedNode) {
                  onSelect?.(selectedNode);
                }
              }
            }}
          >
            <span>{node.label}</span>
          </Group>
        </Group>
      );
    },
    [nodes, onSelect],
  );

  // Update tree state controlled selection changes
  useEffect(() => {
    clearSelected();
    if (selectedNodeId) {
      select(selectedNodeId);
    }
  }, [selectedNodeId, select, clearSelected]);

  return (
    <Tree
      className={classNames(styles.tree, className, {
        [styles.compact]: compact,
      })}
      data={mantineNodes}
      expandOnClick={false}
      selectOnClick={true}
      tree={tree}
      renderNode={renderTreeNode}
    />
  );
}

// UTILITIES
// -------------------------------------------------------------------------------------------------

function mapNodesToMantineFormat<T>(nodes: TreeNode<T>[], selectedNodeId?: string): TreeNodeData[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    selected: node.id === selectedNodeId,
    value: node.id,
    children: node.children ? mapNodesToMantineFormat(node.children, selectedNodeId) : undefined,
  }));
}

function findNodeById<T>(nodes: TreeNode<T>[], id: string): TreeNode<T> | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
