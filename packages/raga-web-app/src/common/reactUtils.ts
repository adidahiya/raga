/**
 * Stop propagation of a React event up the component tree.
 */
export function stopPropagation(event: React.SyntheticEvent) {
  event.stopPropagation();
}
