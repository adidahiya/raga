import { useShallow } from "zustand/react/shallow";

import { useAppStore } from "../appStore";

export const useIsDarkThemeEnabled: () => boolean = () =>
  useAppStore(
    useShallow((state) => {
      return (
        state.userThemePreference === "dark" ||
        (state.userThemePreference === "system" && state.systemThemePreference === "dark")
      );
    }),
  );
