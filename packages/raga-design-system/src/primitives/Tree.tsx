import { ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface TreeNodeData {
  value: string;
  label: React.ReactNode;
  nodeProps?: Record<string, unknown>;
  children?: TreeNodeData[];
}

export type CheckedNodeStatus = "checked" | "unchecked" | "indeterminate";

export interface UseTreeInput {
  initialExpandedState?: Record<string, boolean>;
  initialSelectedState?: string[];
  initialCheckedState?: string[];
  /** Allow more than one selected node (default true). */
  multiple?: boolean;
  onNodeExpand?: (value: string) => void;
  onNodeCollapse?: (value: string) => void;
}

export interface UseTreeReturnType {
  multiple: boolean;
  expandedState: Record<string, boolean>;
  selectedState: string[];
  checkedState: string[];
  anchorNode: string | null;
  hoveredNode: string | null;

  expand: (value: string) => void;
  collapse: (value: string) => void;
  toggleExpanded: (value: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  setExpandedState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  select: (value: string) => void;
  deselect: (value: string) => void;
  toggleSelected: (value: string) => void;
  clearSelected: () => void;
  setSelectedState: React.Dispatch<React.SetStateAction<string[]>>;
  setHoveredNode: React.Dispatch<React.SetStateAction<string | null>>;

  checkNode: (value: string) => void;
  uncheckNode: (value: string) => void;
  checkAllNodes: () => void;
  uncheckAllNodes: () => void;
  isNodeChecked: (value: string) => boolean;
  isNodeIndeterminate: (value: string) => boolean;
  setCheckedState: React.Dispatch<React.SetStateAction<string[]>>;
  getCheckedNodes: () => TreeNodeData[];

  initialize: (data: TreeNodeData[]) => void;
}

function flattenValues(nodes: TreeNodeData[]): string[] {
  const out: string[] = [];
  const walk = (list: TreeNodeData[]) => {
    for (const n of list) {
      out.push(n.value);
      if (n.children && n.children.length > 0) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

function flattenLeafValues(nodes: TreeNodeData[]): string[] {
  const out: string[] = [];
  const walk = (list: TreeNodeData[]) => {
    for (const n of list) {
      const children = n.children;
      if (children && children.length > 0) walk(children);
      else out.push(n.value);
    }
  };
  walk(nodes);
  return out;
}

function collectCheckedNodes(
  nodes: TreeNodeData[],
  checked: Set<string>,
  out: TreeNodeData[],
): void {
  for (const node of nodes) {
    const children = node.children;
    if (children && children.length > 0) {
      collectCheckedNodes(children, checked, out);
    } else if (checked.has(node.value)) {
      out.push(node);
    }
  }
}

function findNode(nodes: TreeNodeData[], value: string): TreeNodeData | null {
  for (const n of nodes) {
    if (n.value === value) return n;
    if (n.children) {
      const found = findNode(n.children, value);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Build an expanded-state map from a list of node value-paths, mirroring the
 * Mantine `getTreeExpandedState` helper. Pass `"*"` to expand everything.
 */
export function getTreeExpandedState(
  data: TreeNodeData[],
  values: string[] | "*",
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (values === "*") {
    for (const v of flattenValues(data)) result[v] = true;
    return result;
  }
  for (const v of values) result[v] = true;
  return result;
}

export function useTree({
  initialExpandedState = {},
  initialSelectedState = [],
  initialCheckedState = [],
  multiple = false,
  onNodeExpand,
  onNodeCollapse,
}: UseTreeInput = {}): UseTreeReturnType {
  const [expandedState, setExpandedState] = React.useState(initialExpandedState);
  const [selectedState, setSelectedState] = React.useState(initialSelectedState);
  const [checkedState, setCheckedState] = React.useState(initialCheckedState);
  const [anchorNode, setAnchorNode] = React.useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);
  const dataRef = React.useRef<TreeNodeData[]>([]);

  const initialize = React.useCallback((data: TreeNodeData[]) => {
    dataRef.current = data;
  }, []);

  const expand = React.useCallback(
    (value: string) => {
      setExpandedState((prev) => ({ ...prev, [value]: true }));
      onNodeExpand?.(value);
    },
    [onNodeExpand],
  );

  const collapse = React.useCallback(
    (value: string) => {
      setExpandedState((prev) => ({ ...prev, [value]: false }));
      onNodeCollapse?.(value);
    },
    [onNodeCollapse],
  );

  const toggleExpanded = React.useCallback(
    (value: string) => {
      setExpandedState((prev) => {
        const next = { ...prev, [value]: !(prev[value] ?? false) };
        if (next[value]) onNodeExpand?.(value);
        else onNodeCollapse?.(value);
        return next;
      });
    },
    [onNodeExpand, onNodeCollapse],
  );

  const expandAllNodes = React.useCallback(() => {
    setExpandedState(getTreeExpandedState(dataRef.current, "*"));
  }, []);

  const collapseAllNodes = React.useCallback(() => {
    setExpandedState({});
  }, []);

  const select = React.useCallback(
    (value: string) => {
      setSelectedState((prev) => {
        if (!multiple) return [value];
        return prev.includes(value) ? prev : [...prev, value];
      });
      setAnchorNode(value);
    },
    [multiple],
  );

  const deselect = React.useCallback((value: string) => {
    setSelectedState((prev) => prev.filter((v) => v !== value));
  }, []);

  const toggleSelected = React.useCallback(
    (value: string) => {
      setSelectedState((prev) => {
        if (prev.includes(value)) return prev.filter((v) => v !== value);
        if (!multiple) return [value];
        return [...prev, value];
      });
      setAnchorNode(value);
    },
    [multiple],
  );

  const clearSelected = React.useCallback(() => {
    setSelectedState([]);
  }, []);

  const checkNode = React.useCallback((value: string) => {
    setCheckedState((prev) => {
      const node = findNode(dataRef.current, value);
      if (!node) return prev.includes(value) ? prev : [...prev, value];
      const leaves = flattenLeafValues([node]);
      const valuesToCheck = leaves.length > 0 ? leaves : [node.value];
      const next = new Set(prev);
      for (const v of valuesToCheck) next.add(v);
      return Array.from(next);
    });
  }, []);

  const uncheckNode = React.useCallback((value: string) => {
    setCheckedState((prev) => {
      const node = findNode(dataRef.current, value);
      if (!node) return prev.filter((v) => v !== value);
      const leaves = flattenLeafValues([node]);
      const valuesToRemove = new Set(leaves.length > 0 ? leaves : [node.value]);
      return prev.filter((v) => !valuesToRemove.has(v));
    });
  }, []);

  const checkAllNodes = React.useCallback(() => {
    setCheckedState(flattenLeafValues(dataRef.current));
  }, []);

  const uncheckAllNodes = React.useCallback(() => {
    setCheckedState([]);
  }, []);

  const isNodeChecked = React.useCallback(
    (value: string): boolean => {
      const node = findNode(dataRef.current, value);
      if (!node) return checkedState.includes(value);
      const leaves = flattenLeafValues([node]);
      if (leaves.length === 0) return checkedState.includes(value);
      return leaves.every((v) => checkedState.includes(v));
    },
    [checkedState],
  );

  const isNodeIndeterminate = React.useCallback(
    (value: string): boolean => {
      const node = findNode(dataRef.current, value);
      if (!node?.children || node.children.length === 0) return false;
      const leaves = flattenLeafValues([node]);
      const matched = leaves.filter((v) => checkedState.includes(v)).length;
      return matched > 0 && matched < leaves.length;
    },
    [checkedState],
  );

  const getCheckedNodes = React.useCallback((): TreeNodeData[] => {
    const out: TreeNodeData[] = [];
    collectCheckedNodes(dataRef.current, new Set(checkedState), out);
    return out;
  }, [checkedState]);

  return {
    multiple,
    expandedState,
    selectedState,
    checkedState,
    anchorNode,
    hoveredNode,
    expand,
    collapse,
    toggleExpanded,
    expandAllNodes,
    collapseAllNodes,
    setExpandedState,
    select,
    deselect,
    toggleSelected,
    clearSelected,
    setSelectedState,
    setHoveredNode,
    checkNode,
    uncheckNode,
    checkAllNodes,
    uncheckAllNodes,
    isNodeChecked,
    isNodeIndeterminate,
    setCheckedState,
    getCheckedNodes,
    initialize,
  };
}

export interface RenderTreeNodePayload {
  node: TreeNodeData;
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  selected: boolean;
  level: number;
  /**
   * Spread onto the row element to wire up click + keyboard + roving focus
   * (tabIndex/onKeyDown/onFocus). Required for built-in keyboard navigation.
   */
  elementProps: TreeRowElementProps;
  tree: UseTreeReturnType;
}

export interface TreeRowElementProps {
  className: string;
  tabIndex: number;
  role: "treeitem";
  "aria-level": number;
  "aria-expanded": boolean | undefined;
  "aria-selected": boolean | undefined;
  "data-selected": boolean | undefined;
  "data-value": string;
  onClick: (event: React.MouseEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onFocus: (event: React.FocusEvent) => void;
}

export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  data: TreeNodeData[];
  tree: UseTreeReturnType;
  renderNode?: (payload: RenderTreeNodePayload) => React.ReactNode;
  /** Click on a row toggles expansion. Defaults to true. */
  expandOnClick?: boolean;
  /** Click on a row toggles selection. Defaults to false. */
  selectOnClick?: boolean;
  /** Indent in pixels per level. Defaults to 16. */
  levelOffset?: number;
}

interface VisibleNode {
  node: TreeNodeData;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

function buildVisibleList(
  nodes: TreeNodeData[],
  expandedState: Record<string, boolean>,
  depth: number,
  out: VisibleNode[],
): void {
  for (const node of nodes) {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const expanded = expandedState[node.value] ?? false;
    out.push({ node, depth, hasChildren, expanded });
    if (hasChildren && expanded) {
      buildVisibleList(node.children ?? [], expandedState, depth + 1, out);
    }
  }
}

function findParentValue(
  nodes: TreeNodeData[],
  target: string,
  parent: string | null,
): string | null {
  for (const node of nodes) {
    if (node.value === target) return parent;
    if (node.children) {
      const result = findParentValue(node.children, target, node.value);
      if (result !== null) return result;
    }
  }
  return null;
}

const defaultRenderNode = ({
  node,
  expanded,
  hasChildren,
  elementProps,
  level,
  tree,
}: RenderTreeNodePayload): React.ReactNode => (
  <div
    {...elementProps}
    style={{ paddingLeft: `calc(var(--tree-level-offset, 16px) * ${level.toString()})` }}
  >
    {hasChildren ? (
      <span
        aria-hidden
        className="inline-flex h-icon-lg w-icon-lg items-center justify-center text-text-muted"
        onClick={(event) => {
          event.stopPropagation();
          tree.toggleExpanded(node.value);
        }}
      >
        <ChevronRight
          className={cn(
            "h-icon-md w-icon-md transition-transform",
            expanded && "rotate-90",
          )}
        />
      </span>
    ) : (
      <span className="inline-block h-icon-lg w-icon-lg" />
    )}
    <span className="truncate">{node.label}</span>
  </div>
);

export const Tree = React.forwardRef<HTMLUListElement, TreeProps>(
  (
    {
      data,
      tree,
      renderNode = defaultRenderNode,
      expandOnClick = true,
      selectOnClick = false,
      levelOffset = 16,
      className,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      tree.initialize(data);
    }, [data, tree]);

    const visible = React.useMemo(() => {
      const list: VisibleNode[] = [];
      buildVisibleList(data, tree.expandedState, 0, list);
      return list;
    }, [data, tree.expandedState]);

    const visibleValues = React.useMemo(
      () => visible.map((v) => v.node.value),
      [visible],
    );

    const containerRef = React.useRef<HTMLUListElement | null>(null);
    const setContainerRef = React.useCallback(
      (node: HTMLUListElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const [focusedValue, setFocusedValue] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (focusedValue !== null && !visibleValues.includes(focusedValue)) {
        setFocusedValue(null);
      }
    }, [focusedValue, visibleValues]);

    const focusValue = React.useCallback((value: string) => {
      setFocusedValue(value);
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-value="${CSS.escape(value)}"]`,
      );
      el?.focus();
    }, []);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent, value: string) => {
        const index = visibleValues.indexOf(value);
        if (index === -1) return;
        const item = visible[index];

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            if (index + 1 < visibleValues.length) focusValue(visibleValues[index + 1]);
            return;
          }
          case "ArrowUp": {
            event.preventDefault();
            if (index > 0) focusValue(visibleValues[index - 1]);
            return;
          }
          case "ArrowRight": {
            event.preventDefault();
            if (item.hasChildren && !item.expanded) {
              tree.expand(item.node.value);
            } else if (item.hasChildren && item.expanded) {
              const firstChild = item.node.children?.[0]?.value;
              if (firstChild !== undefined) focusValue(firstChild);
            }
            return;
          }
          case "ArrowLeft": {
            event.preventDefault();
            if (item.hasChildren && item.expanded) {
              tree.collapse(item.node.value);
            } else {
              const parent = findParentValue(data, item.node.value, null);
              if (parent !== null) focusValue(parent);
            }
            return;
          }
          case "Home": {
            event.preventDefault();
            if (visibleValues.length > 0) focusValue(visibleValues[0]);
            return;
          }
          case "End": {
            event.preventDefault();
            if (visibleValues.length > 0) {
              focusValue(visibleValues[visibleValues.length - 1]);
            }
            return;
          }
          case "Enter":
          case " ": {
            event.preventDefault();
            if (selectOnClick) {
              if (event.metaKey || event.ctrlKey) tree.toggleSelected(item.node.value);
              else tree.select(item.node.value);
            } else if (expandOnClick && item.hasChildren) {
              tree.toggleExpanded(item.node.value);
            }
            return;
          }
          case "*": {
            event.preventDefault();
            tree.expandAllNodes();
            return;
          }
          default:
            return;
        }
      },
      [
        data,
        expandOnClick,
        focusValue,
        selectOnClick,
        tree,
        visible,
        visibleValues,
      ],
    );

    const firstSelected =
      tree.selectedState.length > 0 ? tree.selectedState[0] : undefined;
    const rovingValue: string | undefined =
      focusedValue ??
      (firstSelected !== undefined && visibleValues.includes(firstSelected)
        ? firstSelected
        : visibleValues.length > 0
          ? visibleValues[0]
          : undefined);

    const renderNodes = (nodes: TreeNodeData[], depth: number): React.ReactNode =>
      nodes.map((node) => {
        const hasChildren = (node.children?.length ?? 0) > 0;
        const expanded = tree.expandedState[node.value] ?? false;
        const selected = tree.selectedState.includes(node.value);
        const isRoving = rovingValue === node.value;
        const elementProps: TreeRowElementProps = {
          className: cn(
            "flex items-center gap-control-gap rounded-sm px-1 py-0.5 text-body text-text-primary",
            "outline-none focus-visible:focus-ring",
            "hover:bg-overlay-white-subtle cursor-pointer select-none",
            selected && "bg-accent-500/20 text-text-primary",
          ),
          tabIndex: isRoving ? 0 : -1,
          role: "treeitem",
          "aria-level": depth + 1,
          "aria-expanded": hasChildren ? expanded : undefined,
          "aria-selected": selectOnClick ? selected : undefined,
          "data-selected": selected || undefined,
          "data-value": node.value,
          onClick: (event: React.MouseEvent) => {
            setFocusedValue(node.value);
            if (expandOnClick && hasChildren) tree.toggleExpanded(node.value);
            if (selectOnClick) {
              if (event.metaKey || event.ctrlKey) tree.toggleSelected(node.value);
              else tree.select(node.value);
            }
          },
          onKeyDown: (event) => { handleKeyDown(event, node.value); },
          onFocus: () => { setFocusedValue(node.value); },
        };
        return (
          <li
            key={node.value}
            role="none"
            style={{ ["--tree-level" as string]: depth.toString() }}
          >
            {renderNode({
              node,
              depth,
              expanded,
              hasChildren,
              selected,
              level: depth,
              elementProps,
              tree,
            })}
            {hasChildren && expanded ? (
              <ul role="group" className="m-0 list-none p-0">
                {renderNodes(node.children ?? [], depth + 1)}
              </ul>
            ) : null}
          </li>
        );
      });

    return (
      <ul
        ref={setContainerRef}
        role="tree"
        className={cn("m-0 list-none p-0 font-sans text-body", className)}
        style={{ ["--tree-level-offset" as string]: `${levelOffset.toString()}px` }}
        {...props}
      >
        {/* eslint-disable-next-line react-hooks/refs -- focusValue/handleKeyDown read containerRef only inside event-handler callbacks; the ref is never read during render itself. */}
        {renderNodes(data, 0)}
      </ul>
    );
  },
);
Tree.displayName = "Tree";
