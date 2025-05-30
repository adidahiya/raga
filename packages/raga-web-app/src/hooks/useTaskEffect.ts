import { type Operation, run } from "effection";
import { type DependencyList, useEffect } from "react";

// borrowed from https://github.com/taras/react-effection-autocomplete/blob/b7a1b23cf580240fafed403676a9c11d9a45434d/src/hooks/useTask.ts
export default function useTaskEffect(
  operation: () => Operation<unknown>,
  deps?: DependencyList,
): void {
  useEffect(() => {
    const task = run(operation);

    return () => {
      void run(() => task.halt());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
