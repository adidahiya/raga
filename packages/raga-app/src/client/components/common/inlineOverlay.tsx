import classNames from "classnames";
import type React from "react";

import styles from "./inlineOverlay.module.scss";

export interface InlineOverlayProps {
  children?: React.ReactNode;
  className?: string;
}

export default function InlineOverlay(props: InlineOverlayProps) {
  return <div className={classNames(styles.overlay, props.className)}>{props.children}</div>;
}
