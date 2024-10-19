export function formatStatNumber(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
  }).format(n);
}

export function formatAudioDuration(durationMs: number) {
  const { minutes, seconds } = getAudioMinutesAndSeconds(durationMs);
  const formattedSeconds = seconds >= 10 ? seconds.toString() : "0" + seconds.toString();
  return minutes.toString() + ":" + formattedSeconds;
}

export function getAudioMinutesAndSeconds(durationMs: number) {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  return { minutes, seconds: Math.floor(seconds % 60) };
}
