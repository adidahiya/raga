import type { TrackDefinition } from "@adahiya/raga-lib";
import { ContextMenu, type ContextMenuChildrenProps, Menu, MenuItem } from "@blueprintjs/core";
import { flexRender, type Row } from "@tanstack/react-table";
import classNames from "classnames";
import { type MouseEvent, useCallback } from "react";
import { Roarr as log } from "roarr";

import { ClientEventChannel } from "../../../common/events";
import { appStore } from "../../store/appStore";
import trackRatingStarsStyles from "./trackRatingStars.module.scss";
import styles from "./trackTable.module.scss";

function isClickOnInteractiveRowElement(event: MouseEvent) {
  const target = event.target as HTMLElement;
  return (
    target.closest(`.${styles.analyzeTrackButton}`) != null ||
    target.closest(`.${trackRatingStarsStyles.trackRatingStars}`) != null
  );
}

export default function TrackTableRow({
  ctxMenuProps,
  ...row
}: Row<TrackDefinition> & { ctxMenuProps?: ContextMenuChildrenProps }) {
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const rowTrackId = row.original["Track ID"];
  const isRowSelected = row.getIsSelected();
  const canSelect = row.getCanSelect();

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (canSelect && !isClickOnInteractiveRowElement(event)) {
        // N.B. row selection is toggled in an update effect in <TrackTable>
        // TODO: consider implementing multiple selection with shift and ctrl key modifiers
        // toggleSelected(event);
        setSelectedTrackId(rowTrackId);
      }
    },
    [rowTrackId, setSelectedTrackId, canSelect],
  );

  return (
    <tr
      onContextMenu={ctxMenuProps?.onContextMenu}
      ref={ctxMenuProps?.ref}
      className={classNames(ctxMenuProps?.className, {
        [styles.selected]: isRowSelected,
        [styles.disabled]: !canSelect,
      })}
      data-track-id={rowTrackId}
      onClick={handleClick}
    >
      {ctxMenuProps?.popover}
      {row.getVisibleCells().map((cell) => (
        <td className={styles.trackCell} key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
TrackTableRow.displayName = "TrackTableRow";

export function TrackTableRowWithContextMenu(row: Row<TrackDefinition>) {
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
        <TrackTableRow {...row} ctxMenuProps={ctxMenuProps} />
      )}
    </ContextMenu>
  );
}
TrackTableRowWithContextMenu.displayName = "TrackTableRowWithContextMenu";
