import classNames from "classnames";
import { PanelResizeHandle } from "react-resizable-panels";

import styles from "./resizeHandle.module.scss";

export default function ResizeHandle({ className = "", id }: { className?: string; id?: string }) {
    return (
        <PanelResizeHandle className={classNames(styles.outer, className)} id={id}>
            <div className={styles.inner} />
        </PanelResizeHandle>
    );
}
ResizeHandle.displayName = "ResizeHandle";
