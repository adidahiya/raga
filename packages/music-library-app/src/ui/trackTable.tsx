import { NonIdealState } from "@blueprintjs/core";

import styles from "./trackTable.module.scss";

export default function TrackTable() {
    return (
        <div className={styles.container}>
            <NonIdealState title="Track table" description="(unimplemented)" />
        </div>
    );
}
TrackTable.displayName = "TrackTable";
