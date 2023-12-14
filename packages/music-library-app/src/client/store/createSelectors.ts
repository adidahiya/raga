/**
 * @see https://docs.pmnd.rs/zustand/guides/auto-generating-selectors#create-the-following-function:-createselectors
 */

import type { StoreApi, UseBoundStore } from "zustand";

type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(useStore: S) => {
    const store = useStore as WithSelectors<typeof useStore>;
    store.use = {};
    for (const k of Object.keys(store.getState())) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
    }

    return store;
};
