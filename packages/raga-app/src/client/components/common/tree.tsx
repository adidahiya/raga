import { Tree, type TreeNodeInfo, type TreeProps, usePrevious } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { useImmer } from "use-immer";

import styles from "./tree.module.scss";

// INTERFACES
// -------------------------------------------------------------------------------------------------

export interface TreeNode<T> extends TreeNodeInfo<T> {
  childNodes?: TreeNode<T>[];
  data: T;
  id: string;
  parentId: string | undefined;
}

export interface ControlledTreeProps<T> extends Omit<TreeProps<T>, "contents"> {
  /** Optional classes for the container element. */
  className?: string;

  /** Tree data nodes. */
  nodes: TreeNode<T>[];

  /** ID of the selected node. */
  selectedNodeId?: string;

  /** Callback invoked when a node is selected. */
  onSelect?: (node: TreeNode<T>, nodePath: NodePath) => void;

  /** Callback invoked when a node is expanded or collapsed in the tree. */
  onChange?: (node: TreeNode<T>, nodePath: NodePath, changeType: "expand" | "collapse") => void;
}

// COMPONENTS
// -------------------------------------------------------------------------------------------------

// TODO: consider refactoring with `useImmerReducer` if the state management in event handlers feels unweildy,
// see https://immerjs.github.io/immer/example-setstate#useimmerreducer

/**
 * Augment Blueprint's Tree component (purely presentational, fully controlled) with Immer-based
 * immutable state management.
 */
export default function ControlledTree<T extends object>({
  selectedNodeId,
  nodes,
  onChange,
  onSelect,
  ...treeProps
}: ControlledTreeProps<T>) {
  const nodesWithClassNames = useMemo(() => mapEachNode<T>(nodes, applyDefaultClassNames), [nodes]);
  const [nodesWithTreeState, setNodes] = useImmer<TreeNode<T>[]>(nodesWithClassNames);

  const prevSelectedNodeId = usePrevious(selectedNodeId);

  // set the intially selected node and expand its parent nodes, only once on component mount
  useEffect(() => {
    if (selectedNodeId !== undefined) {
      setNodes((draft) => {
        const previouslySelectedNode = getNodeWithId(draft, prevSelectedNodeId);
        const newlySelectedNode = getNodeWithId(draft, selectedNodeId);

        // deselect previous node, collapse all parents in its path
        if (previouslySelectedNode !== undefined) {
          previouslySelectedNode.isSelected = false;

          let currentNodeInSelectionPath = getNodeWithId(draft, previouslySelectedNode.parentId);
          while (currentNodeInSelectionPath !== undefined) {
            currentNodeInSelectionPath.isExpanded = false;
            currentNodeInSelectionPath = getNodeWithId(draft, currentNodeInSelectionPath.parentId);
          }
        }

        // select new node, expand all parents in its path
        if (newlySelectedNode !== undefined) {
          newlySelectedNode.isSelected = true;

          let currentNodeInSelectionPath = getNodeWithId(draft, newlySelectedNode.parentId);
          while (currentNodeInSelectionPath !== undefined) {
            currentNodeInSelectionPath.isExpanded = true;
            currentNodeInSelectionPath = getNodeWithId(draft, currentNodeInSelectionPath.parentId);
          }
        }
      });
    }
  }, [prevSelectedNodeId, selectedNodeId, setNodes]);

  const handleNodeClick = useCallback(
    (node: TreeNodeInfo<T>, nodePath: NodePath, e: React.MouseEvent<HTMLElement>) => {
      const originallySelected = node.isSelected ?? false;
      const newSelected = !originallySelected;

      // set the node at this path to be selected
      setNodes((draft) => {
        if (!e.shiftKey) {
          // deselect all
          forEachNode(draft, (node) => {
            node.isSelected = false;
            if (node.className !== undefined) {
              // remove our 'selected path' classes
              node.className = node.className.replace(styles.selectedPath, "");
            }
          });
        }

        if (newSelected) {
          // apply our 'selected path' class at each level of the path
          for (let i = 0; i < nodePath.length; i++) {
            const subPath = nodePath.slice(0, i + 1);
            forNodeAtPath(draft, subPath, (node) => {
              if (!node.className?.includes(styles.selectedPath)) {
                node.className = classNames(node.className, styles.selectedPath);
              }
            });
          }
        }

        forNodeAtPath(draft, nodePath, (node) => {
          node.isSelected = newSelected;
        });
      });

      onSelect?.(node as TreeNode<T>, nodePath);
    },
    [onSelect, setNodes],
  );

  const handleNodeCollapse = useCallback(
    (node: TreeNodeInfo<T>, nodePath: NodePath) => {
      // set the node at this path to be collapsed
      setNodes((draft) => {
        forNodeAtPath(draft, nodePath, (node) => {
          node.isExpanded = false;
        });
      });
      onChange?.(node as TreeNode<T>, nodePath, "collapse");
    },
    [onChange, setNodes],
  );

  const handleNodeExpand = useCallback(
    (node: TreeNodeInfo<T>, nodePath: NodePath) => {
      // set the node at this path to be expanded
      setNodes((draft) => {
        forNodeAtPath(draft, nodePath, (node) => {
          node.isExpanded = true;
        });
      });
      onChange?.(node as TreeNode<T>, nodePath, "expand");
    },
    [setNodes, onChange],
  );

  return (
    <Tree
      {...treeProps}
      contents={nodesWithTreeState}
      onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
    />
  );
}
ControlledTree.displayName = "ControlledTree";

// TREE MANIPULATION UTILITIES
// -------------------------------------------------------------------------------------------------

type NodePath = number[];

function forEachNode<T>(
  nodes: TreeNodeInfo<T>[] | undefined,
  callback: (node: TreeNodeInfo<T>) => void,
) {
  if (nodes === undefined) {
    return;
  }

  for (const node of nodes) {
    callback(node);
    forEachNode(node.childNodes, callback);
  }
}

/** Invokes the given callback on a node at the specified path */
function forNodeAtPath(
  nodes: TreeNodeInfo[],
  path: NodePath,
  callback: (node: TreeNodeInfo) => void,
) {
  callback(Tree.nodeFromPath(path, nodes));
}

/** Gets the node with a specified ID in the tree */
function getNodeWithId<T>(
  nodes: TreeNode<T>[] | undefined,
  id: string | undefined,
): TreeNode<T> | undefined {
  if (nodes === undefined || id === undefined) {
    return;
  }

  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const childNode = getNodeWithId(node.childNodes, id);
    if (childNode !== undefined) {
      return childNode;
    }
  }

  return undefined;
}

function mapEachNode<T>(nodes: TreeNode<T>[], callback: (node: TreeNode<T>) => TreeNode<T>) {
  return nodes.map((node: TreeNode<T>): TreeNode<T> => {
    const newNode = callback(node);
    return {
      ...newNode,
      childNodes:
        newNode.childNodes === undefined ? undefined : mapEachNode(newNode.childNodes, callback),
    };
  });
}

function applyDefaultClassNames<T>(node: TreeNode<T>) {
  return {
    ...node,
    className: classNames(node.className, styles.node),
  };
}
