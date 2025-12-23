export interface SelectionState {
  selectedRows: Set<number>;
  lastClickedRow: number | undefined;
}

export interface SelectionAction {
  row: number;
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

/** Creates a range of row indices (inclusive) */
export function createRowRange(start: number, end: number): number[] {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const range: number[] = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }
  return range;
}

/** Toggles a row in the selection set, returns new Set */
export function toggleRowInSelection(selectedRows: Set<number>, row: number): Set<number> {
  const newSelection = new Set(selectedRows);
  if (newSelection.has(row)) {
    newSelection.delete(row);
  } else {
    newSelection.add(row);
  }
  return newSelection;
}

/** Computes the next selection state based on a click action */
export function computeNextSelection(
  currentState: SelectionState,
  action: SelectionAction,
): SelectionState {
  const { selectedRows, lastClickedRow } = currentState;
  const { row, shiftKey, metaKey, ctrlKey } = action;
  const isModifierClick = metaKey || ctrlKey;

  if (shiftKey && lastClickedRow !== undefined) {
    // Range selection: add all rows between lastClickedRow and current row
    const range = createRowRange(lastClickedRow, row);
    const newSelection = new Set(selectedRows);
    for (const r of range) {
      newSelection.add(r);
    }
    return { selectedRows: newSelection, lastClickedRow };
  } else if (isModifierClick) {
    // Toggle selection
    return {
      selectedRows: toggleRowInSelection(selectedRows, row),
      lastClickedRow: row,
    };
  } else {
    // Single selection - replace
    return {
      selectedRows: new Set([row]),
      lastClickedRow: row,
    };
  }
}
