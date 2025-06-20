import {
  ActionIcon,
  Checkbox,
  getTreeExpandedState,
  Group,
  type RenderTreeNodePayload,
  Text,
  Tree,
  type TreeNodeData,
  useTree,
} from "@mantine/core";
import classNames from "classnames";
import { memo, useCallback, useEffect, useMemo } from "react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";

import styles from "./tree.module.scss";

// INTERFACES
// -------------------------------------------------------------------------------------------------

export type TreeSelectionMode = "single" | "multiple" | "none";

/**
 * Input tree node interface.
 * We can probably refactor this to not be necessary, just use Mantine's interfaces instead.
 */
export interface TreeNode<T> {
  children?: TreeNode<T>[];
  data: T;
  id: string;
  label: string;
  parentId: string | undefined;
}

export interface ControlledTreeProps<T> {
  /** Tree data nodes. */
  nodes: TreeNode<T>[];

  /** Selection mode. */
  selectionMode: TreeSelectionMode;

  /** IDs of the selected node(s). */
  selectedNodeIds: string[];

  /** Callback invoked when one or more nodes are selected. */
  onSelect?: (nodes: TreeNode<T>[]) => void;
}

// COMPONENTS
// -------------------------------------------------------------------------------------------------

/**
 * Wrapper around Mantine's Tree component with controlled state management.
 *
 * Notable differences from older tree implementations (like Blueprint's Tree component):
 * - Node value string represent not just the id of the current node, but the full path (delimited by
 *   slashes) of all the node ids from the root node to the current node.
 *
 * Performance notes:
 * - Event handlers are memoized to prevent re-renders on hover
 * - Component uses custom memo comparison to avoid re-renders when array contents haven't changed
 * - If still experiencing performance issues, check parent components for frequently changing props
 */
function ControlledTree<T extends object>({
  nodes,
  selectionMode,
  selectedNodeIds,
  onSelect,
}: ControlledTreeProps<T>) {
  // Convert our node structure to Mantine's expected format
  const { mantineNodes, numLeafNodes } = useMemo(
    () => mapNodesToMantineFormat(nodes, selectedNodeIds),
    [nodes, selectedNodeIds],
  );

  const { selectedNodes, selectedMantineNodes } = useMemo(
    () => ({
      selectedNodes: filterUndefined(selectedNodeIds.map((id) => findNodeById(nodes, id))),
      selectedMantineNodes: filterUndefined(
        selectedNodeIds.map((id) => findMantineNodeById(mantineNodes, id)),
      ),
    }),
    [nodes, mantineNodes, selectedNodeIds],
  );

  const pathToFirstSelectedNode = useMemo(() => {
    if (selectedNodes.length === 0 || selectedMantineNodes.length === 0) {
      return [];
    }

    const firstSelectedNode = selectedNodes[0];
    const firstSelectedMantineNode = selectedMantineNodes[0];

    const path = [];
    let currentNode: TreeNode<T> | undefined = firstSelectedNode;
    let currentMantineNode: TreeNodeData | undefined = firstSelectedMantineNode;
    while (currentNode && currentMantineNode) {
      path.unshift(currentMantineNode.value);
      currentNode = findNodeById(nodes, currentNode.parentId);
      currentMantineNode = findMantineNodeById(mantineNodes, currentNode?.id);
    }
    return path;
  }, [mantineNodes, nodes, selectedNodes, selectedMantineNodes]);

  const tree = useTree({
    initialExpandedState: getTreeExpandedState(mantineNodes, pathToFirstSelectedNode),
    initialSelectedState: selectedMantineNodes.map((node) => node.value),
  });
  const { select, clearSelected, checkedState } = tree;

  const allNodesChecked = checkedState.length === numLeafNodes;
  const someNodesChecked = checkedState.length > 0;
  useEffect(() => {
    if (selectionMode === "multiple") {
      onSelect?.(
        filterUndefined(
          checkedState.map((nodeId) => findNodeById(nodes, mantineNodeValueToId(nodeId))),
        ),
      );
    }
  }, [checkedState, nodes, onSelect, selectionMode]);

  // Memoized event handlers to prevent re-renders
  const handleCheckboxClick = useCallback(
    (nodeValue: string, checked: boolean) => {
      if (checked) {
        tree.uncheckNode(nodeValue);
      } else {
        tree.checkNode(nodeValue);
      }
    },
    [tree],
  );

  const handleExpandClick = useCallback(
    (nodeValue: string, expanded: boolean) => {
      if (expanded) {
        tree.collapse(nodeValue);
      } else {
        tree.expand(nodeValue);
      }
    },
    [tree],
  );

  const handleSingleSelection = useCallback(
    (nodeValue: string, selected: boolean) => {
      if (selectionMode !== "single") {
        return;
      }

      if (selected) {
        tree.deselect(nodeValue);
        onSelect?.([]);
      } else {
        tree.select(nodeValue);
        const selectedNode = findNodeById(nodes, mantineNodeValueToId(nodeValue));
        if (selectedNode) {
          onSelect?.([selectedNode]);
        }
      }
    },
    [selectionMode, tree, nodes, onSelect],
  );

  const handleSelectAllClick = useCallback(
    (allChecked: boolean) => {
      if (allChecked) {
        tree.uncheckAllNodes();
      } else {
        tree.checkAllNodes();
      }
    },
    [tree],
  );

  const renderTreeNode = useCallback(
    ({ node, expanded, selected, hasChildren, elementProps }: RenderTreeNodePayload) => {
      const checked = tree.isNodeChecked(node.value);
      const indeterminate = tree.isNodeIndeterminate(node.value);

      return (
        <div
          key={node.value}
          {...elementProps}
          className={classNames(styles.node, elementProps.className, {
            [styles.selectOnClick]: selectionMode === "single",
            [styles.selectedPath]: selected,
          })}
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            handleSingleSelection(node.value, selected);
            elementProps.onClick(event);
          }}
        >
          {selectionMode === "multiple" && (
            <Checkbox.Indicator
              className={classNames(styles.checkbox, { [styles.filled]: checked || indeterminate })}
              checked={checked}
              indeterminate={indeterminate}
              onClick={() => {
                handleCheckboxClick(node.value, checked);
              }}
            />
          )}

          {hasChildren && (
            <ActionIcon
              size="compact-sm"
              ml={2}
              color="gray"
              variant="subtle"
              onClick={() => {
                handleExpandClick(node.value, expanded);
              }}
            >
              {expanded ? <IoChevronDown /> : <IoChevronForward />}
            </ActionIcon>
          )}

          <div className={styles.labelContainer}>
            <span>{node.label}</span>
          </div>
        </div>
      );
    },
    [selectionMode, tree, handleCheckboxClick, handleExpandClick, handleSingleSelection],
  );

  // Update tree state controlled selection changes
  useEffect(() => {
    if (selectionMode === "single") {
      clearSelected();
      const selectedNode = selectedMantineNodes[0];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (selectedNode) {
        select(selectedNode.value);
      }
    }
  }, [selectedMantineNodes, select, clearSelected, selectionMode]);

  return (
    <>
      {selectionMode === "multiple" && (
        <Group gap={5} className={classNames(styles.node)}>
          <Checkbox.Indicator
            className={classNames(styles.checkbox, { [styles.filled]: someNodesChecked })}
            checked={allNodesChecked}
            indeterminate={!allNodesChecked && someNodesChecked}
            onClick={() => {
              handleSelectAllClick(allNodesChecked);
            }}
          />
          <Text pl={5} fw={600}>
            Select all
          </Text>
        </Group>
      )}
      <Tree
        data={mantineNodes}
        expandOnClick={false}
        selectOnClick={selectionMode === "single"}
        tree={tree}
        renderNode={renderTreeNode}
      />
    </>
  );
}

export default memo(ControlledTree) as typeof ControlledTree;

// UTILITIES
// -------------------------------------------------------------------------------------------------

function mapNodesToMantineFormat<T>(
  nodes: TreeNode<T>[],
  /** IDs of the selected node(s). */
  selectedNodeIds: string[],
  /**
   * Accumulated map of node id to node value path.
   * Example:
   * - node 1: "1"
   * - node 2: "1/2"
   * - node 3: "1/2/3"
   */
  nodeValuePaths: Map<string, string> = new Map<string, string>(),
): { mantineNodes: TreeNodeData[]; numLeafNodes: number } {
  let numLeafNodes = 0;

  function getNodeValue(node: TreeNode<T>) {
    const parentNodeValue = node.parentId ? nodeValuePaths.get(node.parentId) : undefined;
    const value = parentNodeValue ? `${parentNodeValue}/${node.id}` : node.id;
    nodeValuePaths.set(node.id, value);
    return value;
  }

  const mantineNodes = nodes.map((node) => {
    let children: TreeNodeData[] | undefined;

    if (node.children) {
      const { mantineNodes: childMantineNodes, numLeafNodes: childNumLeafNodes } =
        mapNodesToMantineFormat(node.children, selectedNodeIds, nodeValuePaths);
      children = childMantineNodes;
      numLeafNodes += childNumLeafNodes;
    } else {
      numLeafNodes++;
    }

    return {
      id: node.id,
      label: node.label,
      selected: selectedNodeIds.includes(node.id),
      value: getNodeValue(node),
      children,
    };
  });

  return { mantineNodes, numLeafNodes };
}

function findNodeById<T>(nodes: TreeNode<T>[], id: string | undefined): TreeNode<T> | undefined {
  if (!id) {
    return undefined;
  }

  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function findMantineNodeById(
  nodes: TreeNodeData[],
  id: string | undefined,
): TreeNodeData | undefined {
  if (!id) {
    return undefined;
  }

  for (const node of nodes) {
    const nodeId = mantineNodeValueToId(node.value);
    if (nodeId === id) {
      return node;
    }

    if (node.children) {
      const found = findMantineNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function mantineNodeValueToId(value: string): string {
  return value.split("/").at(-1) ?? "";
}

function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((item) => item !== undefined) as T[];
}
