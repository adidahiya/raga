import { type Operation, run } from "effection";
import { type DependencyList, useEffect } from "react";

/** Runs an async operation as a React lifecycle effect. */
export default function useOperationEffect(op: () => Operation<void>, deps: DependencyList): void {
  useEffect(
    () => void run(op),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );
}
