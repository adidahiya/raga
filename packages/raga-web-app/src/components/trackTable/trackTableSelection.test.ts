import { describe, expect,it } from "vitest";

import {
  computeNextSelection,
  createRowRange,
  type SelectionAction,
  type SelectionState,
  toggleRowInSelection,
} from "./trackTableSelection";

describe("trackTableSelection", () => {
  describe("createRowRange", () => {
    it("creates ascending range", () => {
      expect(createRowRange(2, 5)).toEqual([2, 3, 4, 5]);
    });

    it("handles reversed start/end", () => {
      expect(createRowRange(5, 2)).toEqual([2, 3, 4, 5]);
    });

    it("handles same start and end", () => {
      expect(createRowRange(3, 3)).toEqual([3]);
    });
  });

  describe("toggleRowInSelection", () => {
    it("adds row when not in selection", () => {
      const selection = new Set([1, 2]);
      const result = toggleRowInSelection(selection, 3);
      expect(result).toEqual(new Set([1, 2, 3]));
    });

    it("removes row when already selected", () => {
      const selection = new Set([1, 2, 3]);
      const result = toggleRowInSelection(selection, 2);
      expect(result).toEqual(new Set([1, 3]));
    });

    it("does not mutate original set", () => {
      const selection = new Set([1, 2]);
      toggleRowInSelection(selection, 3);
      expect(selection).toEqual(new Set([1, 2]));
    });
  });

  describe("computeNextSelection", () => {
    const baseState: SelectionState = {
      selectedRows: new Set([1]),
      lastClickedRow: 1,
    };

    const noModifiers: Omit<SelectionAction, "row"> = {
      shiftKey: false,
      metaKey: false,
      ctrlKey: false,
    };

    it("single click replaces selection with clicked row", () => {
      const result = computeNextSelection(baseState, { row: 5, ...noModifiers });
      expect(result.selectedRows).toEqual(new Set([5]));
      expect(result.lastClickedRow).toBe(5);
    });

    it("cmd+click adds row to selection", () => {
      const result = computeNextSelection(baseState, { row: 5, ...noModifiers, metaKey: true });
      expect(result.selectedRows).toEqual(new Set([1, 5]));
      expect(result.lastClickedRow).toBe(5);
    });

    it("ctrl+click adds row to selection", () => {
      const result = computeNextSelection(baseState, { row: 5, ...noModifiers, ctrlKey: true });
      expect(result.selectedRows).toEqual(new Set([1, 5]));
      expect(result.lastClickedRow).toBe(5);
    });

    it("cmd+click on selected row removes it", () => {
      const result = computeNextSelection(baseState, { row: 1, ...noModifiers, metaKey: true });
      expect(result.selectedRows).toEqual(new Set());
      expect(result.lastClickedRow).toBe(1);
    });

    it("shift+click creates range from lastClickedRow", () => {
      const result = computeNextSelection(baseState, { row: 4, ...noModifiers, shiftKey: true });
      expect(result.selectedRows).toEqual(new Set([1, 2, 3, 4]));
      // lastClickedRow should not change for shift+click (anchor stays)
      expect(result.lastClickedRow).toBe(1);
    });

    it("shift+click backwards creates range", () => {
      const state: SelectionState = { selectedRows: new Set([5]), lastClickedRow: 5 };
      const result = computeNextSelection(state, { row: 2, ...noModifiers, shiftKey: true });
      expect(result.selectedRows).toEqual(new Set([2, 3, 4, 5]));
    });

    it("shift+click without lastClickedRow selects single row", () => {
      const state: SelectionState = { selectedRows: new Set(), lastClickedRow: undefined };
      const result = computeNextSelection(state, { row: 3, ...noModifiers, shiftKey: true });
      expect(result.selectedRows).toEqual(new Set([3]));
      expect(result.lastClickedRow).toBe(3);
    });

    it("shift+click extends existing selection", () => {
      const state: SelectionState = { selectedRows: new Set([1, 2]), lastClickedRow: 2 };
      const result = computeNextSelection(state, { row: 5, ...noModifiers, shiftKey: true });
      expect(result.selectedRows).toEqual(new Set([1, 2, 3, 4, 5]));
    });
  });
});
