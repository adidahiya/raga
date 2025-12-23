export function getTableScrollingContainer(containerElement: HTMLElement | null) {
  // glide-data-grid uses the "dvn-scroller" class for its scrolling container
  return containerElement?.querySelector<HTMLElement>(".dvn-scroller");
}
