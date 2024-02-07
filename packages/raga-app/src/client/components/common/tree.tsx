import { Classes, Tree, type TreeNodeInfo } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useImmer } from "use-immer";

import styles from "./tree.module.scss";

// INTERFACES
// -------------------------------------------------------------------------------------------------

export interface TreeNode<T> extends Omit<TreeNodeInfo<T>, "hasCaret" | "isSelected"> {
  childNodes?: TreeNode<T>[];
  data: T;
  id: string;
}

export interface UncontrolledTreeProps<T> {
  /** Optional classes for the container element. */
  className?: string;

  /** Whether to use compact styles. */
  compact?: boolean;

  /** Tree data nodes. */
  nodes: TreeNode<T>[];

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
export default function UncontrolledTree<T extends object>({
  compact,
  nodes,
  onChange,
  onSelect,
  ...treeProps
}: UncontrolledTreeProps<T>) {
  const nodesWithDefaultClassNames = mapEachNode<T>(nodes, applyDefaultClassNames);
  const [nodesWithTreeState, setNodes] = useImmer<TreeNodeInfo<T>[]>(nodesWithDefaultClassNames);

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
      className={classNames(treeProps.className, {
        [Classes.COMPACT]: compact,
      })}
      contents={nodesWithTreeState}
      onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
    />
  );
}
UncontrolledTree.displayName = "UncontrolledTree";

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

function forNodeAtPath(
  nodes: TreeNodeInfo[],
  path: NodePath,
  callback: (node: TreeNodeInfo) => void,
) {
  callback(Tree.nodeFromPath(path, nodes));
}

function mapEachNode<T>(
  nodes: TreeNodeInfo<T>[],
  callback: (node: TreeNodeInfo<T>) => TreeNodeInfo<T>,
) {
  return nodes.map((node: TreeNodeInfo<T>): TreeNodeInfo<T> => {
    const newNode = callback(node);
    return {
      ...newNode,
      childNodes:
        newNode.childNodes === undefined ? undefined : mapEachNode(newNode.childNodes, callback),
    };
  });
}

function applyDefaultClassNames<T>(node: TreeNodeInfo<T>) {
  return {
    ...node,
    className: classNames(node.className, styles.node),
  };
}
