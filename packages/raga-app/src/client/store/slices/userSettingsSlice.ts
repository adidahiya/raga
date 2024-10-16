import type { AppStoreSliceCreator } from "../zustandUtils";

const MAX_PREVIOUSLY_USED_LIBRARIES = 3;

export interface PreviouslyUsedLibrary {
  filePath: string;
  lastUsed: Date;
}

export interface UserSettingsState {
  fontWeight: "light" | "regular";
  systemThemePreference: "light" | "dark";
  userThemePreference: "light" | "dark" | "system";
  previouslyUsedLibraries: Set<PreviouslyUsedLibrary>;
  userEmail: string | undefined;
  isDarkThemeEnabled: boolean;
}

export interface UserSettingsActions {
  setFontWeight: (fontWeight: "light" | "regular") => void;
  setSystemThemePreference: (pref: "light" | "dark") => void;
  setUserThemePreference: (pref: "light" | "dark" | "system") => void;
  setUserEmail: (userEmail: string | undefined) => void;
  saveCurrentLibraryPath: (filePath: string) => void;
  clearPreviouslyUsedLibraries: () => void;
}

export const createUserSettingsSlice: AppStoreSliceCreator<
  UserSettingsState & UserSettingsActions
> = (set, get) => ({
  fontWeight: "light",

  systemThemePreference: "light",

  userThemePreference: "system",

  previouslyUsedLibraries: new Set<PreviouslyUsedLibrary>(),

  userEmail: undefined,

  get isDarkThemeEnabled() {
    return (
      get().userThemePreference === "dark" ||
      (get().userThemePreference === "system" && get().systemThemePreference === "dark")
    );
  },

  setFontWeight: (fontWeight) => {
    set({ fontWeight });
  },

  setSystemThemePreference: (pref) => {
    set({ systemThemePreference: pref });
  },

  setUserThemePreference: (pref) => {
    set({ userThemePreference: pref });
  },

  setUserEmail: (userEmail: string | undefined) => {
    set({ userEmail });
  },

  saveCurrentLibraryPath: (filePath: string) => {
    const existingEntry = Array.from(get().previouslyUsedLibraries).find(
      (library) => library.filePath === filePath,
    );
    const newEntry: PreviouslyUsedLibrary = {
      filePath,
      lastUsed: new Date(),
    };

    set((state) => {
      if (existingEntry !== undefined) {
        // update the last used date
        state.previouslyUsedLibraries.delete(existingEntry);
        state.previouslyUsedLibraries.add(newEntry);
      } else {
        // need to add a new entry, but first check if we've reached the limit
        if (state.previouslyUsedLibraries.size === MAX_PREVIOUSLY_USED_LIBRARIES) {
          // remove the oldest entry
          let oldestLibrary: PreviouslyUsedLibrary | undefined;
          for (const library of state.previouslyUsedLibraries) {
            if (oldestLibrary === undefined || library.lastUsed < oldestLibrary.lastUsed) {
              oldestLibrary = library;
            }
          }
          state.previouslyUsedLibraries.delete(oldestLibrary!);
        }

        state.previouslyUsedLibraries.add(newEntry);
      }
    });
  },

  clearPreviouslyUsedLibraries: () => {
    set({ previouslyUsedLibraries: new Set<PreviouslyUsedLibrary>() });
  },
});
