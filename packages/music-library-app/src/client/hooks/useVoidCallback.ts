import { DependencyList, useCallback } from "react";

/**
 * Wraps an async callback and ignores its return value, suitable for use in DOM event handlers.
 *
 * If no dependency list is provided, the callback function will be used as the only dependency.
 */
export default function useVoidCallback<T>(
    cb: () => Promise<T>,
    deps: DependencyList = [cb],
): () => void {
    /* eslint-disable react-hooks/exhaustive-deps */
    return useCallback(() => {
        void cb();
    }, [deps]);
}
