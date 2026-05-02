import { Button, IconButton, Input, Separator } from "@adahiya/raga-design-system";
import { Menu, SegmentedControl } from "@mantine/core";
import { type ChangeEvent, useCallback, useState } from "react";
import { IoCheckmark, IoChevronDown, IoClose, IoSettingsOutline } from "react-icons/io5";

import { appStore } from "../../store/appStore";
import type { UserThemePreference } from "../../store/slices/userSettingsSlice";
import { AnalyzerSettings } from "./analyzerSettings";

const EMAIL_VALIDATION_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export default function UserSettingsDropdown() {
  return (
    <Menu
      trapFocus={true}
      position="bottom"
      withArrow={true}
      arrowSize={12}
      offset={{ mainAxis: 10 }}
    >
      <Menu.Target>
        <Button data-raga-settings-trigger variant="ghost" size="sm">
          <span className="inline-flex items-center gap-2">
            <IoSettingsOutline size={14} />
            Settings
            <IoChevronDown size={14} />
          </span>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <div className="flex flex-col gap-0">
          <div className="p-2">
            <UserEmailFormGroup />
          </div>
          <Separator orientation="horizontal" />
          <div className="p-2">
            <UIFontFormGroup />
          </div>
          <Separator orientation="horizontal" />
          <div className="p-2">
            <ThemeFormGroup />
          </div>
          <Separator orientation="horizontal" />
          <div className="p-2">
            <AnalyzerSettings />
          </div>
        </div>
      </Menu.Dropdown>
    </Menu>
  );
}
UserSettingsDropdown.displayName = "UserSettingsDropdown";

function UserEmailFormGroup() {
  const userEmail = appStore.use.userEmail() ?? "";
  const setUserEmail = appStore.use.setUserEmail();

  const [emailInputValue, setEmailInputValue] = useState<string>(userEmail);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const clearEmail = useCallback(() => {
    setEmailInputValue("");
    setUserEmail(undefined);
  }, [setUserEmail]);
  const handleEmailChange = useTextInputChangeHandler(
    (email: string) => {
      setEmailInputValue(email);
      const isValid = EMAIL_VALIDATION_REGEX.test(email);
      setIsEmailValid(isValid);
      if (isValid) {
        setUserEmail(email);
      }
    },
    [setUserEmail],
  );

  const trailingButton =
    emailInputValue === "" ? undefined : (
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={isEmailValid ? "Clear email" : "Clear invalid email"}
        onClick={clearEmail}
      >
        {isEmailValid ? <IoCheckmark /> : <IoClose />}
      </IconButton>
    );

  return (
    <div className="flex flex-col gap-1">
      <span className="text-body-sm font-medium text-text-primary">User email</span>
      <span className="text-caption text-text-muted">
        Used to write the &apos;Rating&apos; tag on audio files
      </span>
      <Input
        autoFocus={true}
        type="email"
        value={emailInputValue}
        onChange={handleEmailChange}
        trailing={trailingButton}
      />
    </div>
  );
}

const FONT_WEIGHT_OPTIONS = [
  {
    label: "Light",
    value: "light",
  },
  {
    label: "Regular",
    value: "regular",
  },
];

function UIFontFormGroup() {
  const fontWeight = appStore.use.fontWeight();
  const setFontWeight = appStore.use.setFontWeight();
  const handleValueChange = useCallback(
    (value: string) => {
      setFontWeight(value as "light" | "regular");
    },
    [setFontWeight],
  );

  return (
    <div className="flex items-center gap-3">
      <span>UI font</span>
      <SegmentedControl
        onChange={handleValueChange}
        data={FONT_WEIGHT_OPTIONS}
        value={fontWeight}
      />
    </div>
  );
}

const THEME_OPTIONS: { label: string; value: UserThemePreference }[] = [
  {
    label: "System",
    value: "auto",
  },
  {
    label: "Light",
    value: "light",
  },
  {
    label: "Dark",
    value: "dark",
  },
];

function ThemeFormGroup() {
  const userThemePreference = appStore.use.userThemePreference();
  const setUserThemePreference = appStore.use.setUserThemePreference();
  const handleValueChange = useCallback(
    (value: string) => {
      // App.tsx is the single source of truth: it resolves the preference
      // against `prefers-color-scheme` and pushes the result to both
      // `<html data-theme>` (design system) and `forceColorScheme` on
      // MantineProvider (held-over Mantine surfaces) in lockstep.
      setUserThemePreference(value as UserThemePreference);
    },
    [setUserThemePreference],
  );

  return (
    <div className="flex items-center gap-3">
      <span>Theme</span>
      <SegmentedControl
        onChange={handleValueChange}
        data={THEME_OPTIONS}
        value={userThemePreference}
      />
    </div>
  );
}

function useTextInputChangeHandler(cb: (value: string) => void, deps: React.DependencyList) {
  return useCallback((event: ChangeEvent<HTMLInputElement>) => {
    cb(event.target.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
