export function getTableScrollingContainer(containerElement: HTMLElement | null) {
  return containerElement?.querySelector("[data-table-library_body]")?.parentElement?.parentElement;
}
