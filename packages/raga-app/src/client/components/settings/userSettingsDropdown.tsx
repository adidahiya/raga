import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  type MantineColorScheme,
  Menu,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { type ChangeEvent, useCallback, useState } from "react";
import { IoCheckmark, IoChevronDown, IoClose, IoSettingsOutline } from "react-icons/io5";

import { appStore } from "../../store/appStore";
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
        <Button
          size="compact-sm"
          color="gray"
          variant="subtle"
          leftSection={<IoSettingsOutline size={14} />}
          rightSection={<IoChevronDown size={14} />}
        >
          Settings
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Stack gap={0}>
          <Box p="xs">
            <UserEmailFormGroup />
          </Box>
          <Divider orientation="horizontal" />
          <Box p="xs">
            <UIFontFormGroup />
          </Box>
          <Divider orientation="horizontal" />
          <Box p="xs">
            <ThemeFormGroup />
          </Box>
          <Divider orientation="horizontal" />
          <Box p="xs">
            <AnalyzerSettings />
          </Box>
        </Stack>
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

  return (
    <TextInput
      label="User email"
      description="Used to write the 'Rating' tag on audio files"
      autoFocus={true}
      type="email"
      value={emailInputValue}
      onChange={handleEmailChange}
      color={emailInputValue === "" ? "gray" : isEmailValid ? "green" : "red"}
      rightSection={
        emailInputValue === "" ? undefined : isEmailValid ? (
          <ActionIcon variant="subtle" onClick={clearEmail}>
            <IoCheckmark />
          </ActionIcon>
        ) : (
          <ActionIcon variant="subtle" onClick={clearEmail}>
            <IoClose />
          </ActionIcon>
        )
      }
    />
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
    <Group>
      <Text>UI font</Text>
      <SegmentedControl
        onChange={handleValueChange}
        data={FONT_WEIGHT_OPTIONS}
        value={fontWeight}
      />
    </Group>
  );
}

const THEME_OPTIONS: { label: string; value: MantineColorScheme }[] = [
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
  const { setColorScheme } = useMantineColorScheme();
  const userThemePreference = appStore.use.userThemePreference();
  const setUserThemePreference = appStore.use.setUserThemePreference();
  const handleValueChange = useCallback(
    (value: string) => {
      setUserThemePreference(value as MantineColorScheme);
      setColorScheme(value as MantineColorScheme);
    },
    [setUserThemePreference, setColorScheme],
  );

  return (
    <Group>
      <Text>Theme</Text>
      <SegmentedControl
        onChange={handleValueChange}
        data={THEME_OPTIONS}
        value={userThemePreference}
      />
    </Group>
  );
}

function useTextInputChangeHandler(cb: (value: string) => void, deps: React.DependencyList) {
  return useCallback((event: ChangeEvent<HTMLInputElement>) => {
    cb(event.target.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
