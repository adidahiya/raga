/**
 * @see https://docs.pmnd.rs/zustand/guides/auto-generating-selectors#create-the-following-function:-createselectors
 */

import type { StoreApi, UseBoundStore } from "zustand";

type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(useStore: S) => {
    let store = useStore as WithSelectors<typeof useStore>;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
    }

    return store;
};
