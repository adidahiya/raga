import { Popover } from "@blueprintjs/core";
import { CaretDown, Cog, Cross, Tick } from "@blueprintjs/icons";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  type MantineColorScheme,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { type ChangeEvent, useCallback, useState } from "react";

import commonStyles from "../../common/commonStyles.module.scss";
import { appStore } from "../../store/appStore";
import styles from "./userSettingsDropdown.module.scss";

const EMAIL_VALIDATION_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export default function UserSettingsDropdown() {
  const settingsPopover = (
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
    </Stack>
  );

  return (
    <div className={styles.userSettingsDropdown}>
      <Popover
        autoFocus={true}
        backdropProps={{ className: commonStyles.popoverBackdrop }}
        content={settingsPopover}
        hasBackdrop={true}
        placement="bottom"
        shouldReturnFocusOnClose={true}
      >
        <Button
          size="compact-sm"
          color="gray"
          variant="subtle"
          leftSection={<Cog />}
          rightSection={<CaretDown />}
        >
          Settings
        </Button>
      </Popover>
    </div>
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
          <Tick className={styles.validIcon} />
        ) : (
          <ActionIcon variant="subtle" onClick={clearEmail}>
            <Cross />
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
