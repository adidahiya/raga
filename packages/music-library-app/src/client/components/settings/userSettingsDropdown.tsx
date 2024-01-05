import { Button, FormGroup, InputGroup, Popover } from "@blueprintjs/core";
import { Tick } from "@blueprintjs/icons";
import { useCallback, useState } from "react";

import commonStyles from "../../common/commonStyles.module.scss";
import { appStore } from "../../store/appStore";
import styles from "./userSettingsDropdown.module.scss";

const EMAIL_VALIDATION_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export default function UserSettingsDropdown() {
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

  const settingsPopover = (
    <div className={styles.popover}>
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
    </div>
  );

  return (
    <div className={styles.container}>
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
