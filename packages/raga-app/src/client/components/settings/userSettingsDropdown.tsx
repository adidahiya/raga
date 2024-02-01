import {
  Button,
  Divider,
  FormGroup,
  InputGroup,
  Popover,
  SegmentedControl,
} from "@blueprintjs/core";
import { Tick } from "@blueprintjs/icons";
import { useCallback, useState } from "react";

import commonStyles from "../../common/commonStyles.module.scss";
import { appStore } from "../../store/appStore";
import styles from "./userSettingsDropdown.module.scss";

const EMAIL_VALIDATION_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export default function UserSettingsDropdown() {
  const settingsPopover = (
    <div className={styles.popover}>
      <UserEmailFormGroup />
      <Divider className={styles.divider} />
      <UIFontFormGroup />
    </div>
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
        <Button small={true} minimal={true} text="Settings" icon="cog" rightIcon="caret-down" />
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
  const handleEmailChange = useCallback(
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
    <FormGroup label="User email" helperText="Used to write the 'Rating' tag on audio files">
      <InputGroup
        autoFocus={true}
        type="email"
        value={emailInputValue}
        onValueChange={handleEmailChange}
        intent={emailInputValue === "" ? "none" : isEmailValid ? "success" : "danger"}
        rightElement={
          emailInputValue === "" ? undefined : isEmailValid ? (
            <Tick className={styles.validIcon} />
          ) : (
            <Button minimal={true} icon="cross" onClick={clearEmail} />
          )
        }
      />
    </FormGroup>
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
    <FormGroup label="UI font" inline={true}>
      <SegmentedControl
        onValueChange={handleValueChange}
        options={FONT_WEIGHT_OPTIONS}
        small={true}
        value={fontWeight}
      />
    </FormGroup>
  );
}
