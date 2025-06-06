import type { Mutate, StateCreator, StoreApi, UseBoundStore } from "zustand";

import type { AppStore } from "./appStore";

/**
 * @returns the type for a store slice creator function which has access to all other app store slices, augmented with immer middleware
 * @see https://docs.pmnd.rs/zustand/guides/typescript#slices-pattern
 */
export type AppStoreSliceCreator<S extends Partial<AppStore>> = StateCreator<
  AppStore,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  S
>;

// copied from zustand/vanilla.d.ts
type Get<T, K, F> = K extends keyof T ? T[K] : F;
export type AppStoreSet = Get<
  Mutate<StoreApi<AppStore>, [["zustand/immer", never]]>,
  "setState",
  never
>;
export type AppStoreGet = () => AppStore;

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

/**
 * Auto-create selector hooks for a bound zustand store.
 *
 * @see https://docs.pmnd.rs/zustand/guides/auto-generating-selectors#create-the-following-function:-createselectors
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(useStore: S) => {
  const store = useStore as WithSelectors<typeof useStore>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};
