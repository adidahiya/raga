import { useEffect, useState } from "react";

/**
 * Adapted from https://gist.github.com/EdPike365/d4a66d56b1575985d19c71a51f4d256c
 *
 * @returns whether the user OS setting prefers dark theme/mode
 */
export function usePrefersDarkTheme() {
  // NOTE: On Windows 10, Chrome gets its settings from the OS via Settings> Colors
  //  options: light, dark, custom
  // This value can be overridden using Chrome dev tools emulator
  //  options: no-preference, light, dark

  // Note: If 2 browser tabs are open on pages with this widget, when Chrome emulator settings
  // change it only changes the text value in the tab that has the debugger open. However, the
  // browser media value changes and any theme change will take affect on both tabs even though
  // the string does not change.
  const [prefersDarkMode, setPrefersDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    function handleDarkModePrefferedChange() {
      const doesMatch = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setPrefersDarkMode(doesMatch);
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleDarkModePrefferedChange);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleDarkModePrefferedChange);
    };
  }, []);

  return prefersDarkMode;
}
