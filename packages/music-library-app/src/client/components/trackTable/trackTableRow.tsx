import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { flexRender, Row } from "@tanstack/react-table";
import classNames from "classnames";
import { MouseEvent, useCallback } from "react";

import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export default function TrackTableRow(row: Row<TrackDefinition>) {
    const setSelectedTrackId = appStore.use.setSelectedTrackId();
    const rowTrackId = row.original["Track ID"];
    const isRowSelected = row.getIsSelected();
    const toggleSelected = row.getToggleSelectedHandler();
    const canSelect = row.getCanSelect();

    const handleClick = useCallback(
        (event: MouseEvent) => {
            const isClickOnAnalyzeButton =
                (event.target as HTMLElement).closest(`.${styles.analyzeTrackButton}`) != null;
            if (canSelect && !isClickOnAnalyzeButton) {
                toggleSelected(event);
                setSelectedTrackId(rowTrackId);
            }
        },
        [rowTrackId, setSelectedTrackId, toggleSelected, canSelect],
    );

    return (
        <tr
            className={classNames({
                [styles.selected]: isRowSelected,
                [styles.disabled]: !canSelect,
            })}
            onClick={handleClick}
        >
            {row.getVisibleCells().map((cell) => (
                <td
                    className={styles.trackCell}
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    );
}
TrackTableRow.displayName = "TrackTableRow";
