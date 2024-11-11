import { Button, Popover, Spinner } from "@blueprintjs/core";
import { Text } from "@mantine/core";

import commonStyles from "../../common/commonStyles.module.scss";
import { appStore } from "../../store/appStore";
import { AnalyzerSettings } from "../settings/analyzerSettings";
import styles from "./audioAnalyzerStatus.module.scss";

export default function AudioAnalyzerStatus() {
  const status = appStore.use.analyzerStatus();

  const statusPopover = (
    <div className={styles.popover}>
      <AnalyzerSettings />
    </div>
  );

  return (
    <div className={styles.container}>
      <Text component="span" c="dimmed" size="sm">
        Analyzer
      </Text>
      <Popover
        placement="bottom"
        content={statusPopover}
        hasBackdrop={true}
        backdropProps={{ className: commonStyles.popoverBackdrop }}
      >
        <Button
          small={true}
          minimal={true}
          text={status === "busy" ? "Busy…" : "Ready"}
          icon={status === "busy" ? <Spinner size={12} /> : "tick"}
          rightIcon="caret-down"
          intent={status === "busy" ? "success" : "primary"}
        />
      </Popover>
    </div>
  );
}
