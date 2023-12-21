import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { ContextMenu, ContextMenuChildrenProps, Menu, MenuItem } from "@blueprintjs/core";
import { flexRender, Row } from "@tanstack/react-table";
import classNames from "classnames";
import { MouseEvent, useCallback } from "react";
import { Roarr as log } from "roarr";

import { ClientEventChannel } from "../../../common/events";
import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export default function TrackTableRow(row: Row<TrackDefinition>) {
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const rowTrackId = row.original["Track ID"];
  const isRowSelected = row.getIsSelected();
  const canSelect = row.getCanSelect();

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const isClickOnAnalyzeButton =
        (event.target as HTMLElement).closest(`.${styles.analyzeTrackButton}`) != null;
      if (canSelect && !isClickOnAnalyzeButton) {
        // N.B. row selection is toggled in an update effect in <TrackTable>
        setSelectedTrackId(rowTrackId);
      }
    },
    [rowTrackId, setSelectedTrackId, canSelect],
  );

  const handleOpenFile = useCallback(() => {
    const filepath = decodeURIComponent(row.original.Location.replace("file://", ""));
    log.debug(`[client] Opening file at path: '${filepath}'`);
    window.api.send(ClientEventChannel.OPEN_FILE_LOCATION, { filepath });
  }, [row.original.Location]);

  const menu = (
    <Menu>
      <MenuItem text="Reveal in Finder" onClick={handleOpenFile} />
    </Menu>
  );

  return (
    <ContextMenu content={menu}>
      {(ctxMenuProps: ContextMenuChildrenProps) => (
        <tr
          onContextMenu={ctxMenuProps.onContextMenu}
          ref={ctxMenuProps.ref}
          className={classNames(ctxMenuProps.className, {
            [styles.selected]: isRowSelected,
            [styles.disabled]: !canSelect,
          })}
          data-track-id={rowTrackId}
          onClick={handleClick}
        >
          {ctxMenuProps.popover}
          {row.getVisibleCells().map((cell) => (
            <td className={styles.trackCell} key={cell.id} style={{ width: cell.column.getSize() }}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      )}
    </ContextMenu>
  );
}
TrackTableRow.displayName = "TrackTableRow";
