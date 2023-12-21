import { Props } from "@blueprintjs/core";
import classNames from "classnames";
import React from "react";

import styles from "./inlineOverlay.module.scss";

export interface InlineOverlayProps extends Props {
  children?: React.ReactNode;
}

export default function InlineOverlay(props: InlineOverlayProps) {
  return <div className={classNames(styles.overlay, props.className)}>{props.children}</div>;
}
