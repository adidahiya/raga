/**
 * Stop propagation of click events on interactive cells which should not trigger a change in the
 * currently selected track.
 */
export function stopPropagation(event: React.SyntheticEvent) {
  event.stopPropagation();
}
