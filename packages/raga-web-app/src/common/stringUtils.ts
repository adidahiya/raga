/**
 * Truncates a filepath from the middle of the string, replacing the middle with an ellipsis.
 */
export function truncateFilePath(filepath: string, maxLength = 20) {
  if (filepath.length <= maxLength) {
    return filepath;
  }

  const middle = Math.floor(maxLength / 2);
  return filepath.slice(0, middle) + "..." + filepath.slice(-middle);
}
