export function formatStatNumber(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
  }).format(n);
}

export function formatAudioDuration(durationMs: number) {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = Math.floor(seconds % 60);
  const formattedSeconds =
    remainderSeconds >= 10 ? remainderSeconds.toString() : "0" + remainderSeconds.toString();
  return minutes.toString() + ":" + formattedSeconds;
}
