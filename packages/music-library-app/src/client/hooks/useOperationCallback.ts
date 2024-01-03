import { type Operation, run } from "effection";
import { type DependencyList, useCallback } from "react";

/** Runs an async operation as a React callback. */
export default function useOperationCallback(
  op: () => Operation<void>,
  deps: DependencyList,
): () => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(() => void run(op), deps);
}
