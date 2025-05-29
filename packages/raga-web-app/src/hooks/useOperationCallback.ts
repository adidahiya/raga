import { type Operation, run } from "effection";
import { type DependencyList, useCallback } from "react";

/** Runs an async operation as a React callback. */
export default function useOperationCallback<TArgs extends unknown[]>(
  op: (...args: TArgs) => Operation<void>,
  deps: DependencyList = [op],
): () => void {
  return useCallback((...args: TArgs) => {
    void run(function* () {
      yield* op(...args);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
