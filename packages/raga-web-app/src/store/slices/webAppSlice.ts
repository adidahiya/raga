import type { AppStoreSliceCreator } from "../zustandUtils";

export interface WebAppState {
  useMockData: boolean;
}

export interface WebAppActions {
  setUseMockData: (useMockData: boolean) => void;
}

export const createWebAppSlice: AppStoreSliceCreator<WebAppState & WebAppActions> = (set) => ({
  useMockData: false,
  setUseMockData: (useMockData) => {
    set({ useMockData });
  },
});
