import { useHotkeys } from "@blueprintjs/core";
import { useCallback, useMemo } from "react";

import { useOperationCallback } from "../../hooks";
import { useAudioPlayerControls } from "../../store/selectors/useAudioPlayerControls";

export default function useAudioPlayerHotkeys() {
  const { play, pause, isPlaying, seek } = useAudioPlayerControls();

  const handlePlay = useOperationCallback(play, [play]);

  const seekBackwardTen = useCallback(() => {
    seek(-10 * 1000);
  }, [seek]);

  const seekBackwardThirty = useCallback(() => {
    seek(-30 * 1000);
  }, [seek]);

  const seekForwardTen = useCallback(() => {
    seek(10 * 1000);
  }, [seek]);

  const seekForwardThirty = useCallback(() => {
    seek(30 * 1000);
  }, [seek]);

  const hotkeyConfig = useMemo(
    () => [
      {
        global: true,
        combo: "space",
        label: "Play/Pause audio",
        onKeyDown: isPlaying ? pause : handlePlay,
        preventDefault: true,
      },
      {
        global: true,
        combo: "arrowleft",
        label: "Seek backward 10s",
        onKeyDown: seekBackwardTen,
      },
      {
        global: true,
        combo: "cmd+arrowleft",
        label: "Seek backward 30s",
        onKeyDown: seekBackwardThirty,
      },
      {
        global: true,
        combo: "arrowright",
        label: "Seek forward 10s",
        onKeyDown: seekForwardTen,
      },
      {
        global: true,
        combo: "cmd+arrowright",
        label: "Seek forward 30s",
        onKeyDown: seekForwardThirty,
      },
    ],
    [
      handlePlay,
      isPlaying,
      pause,
      seekBackwardTen,
      seekBackwardThirty,
      seekForwardTen,
      seekForwardThirty,
    ],
  );

  return useHotkeys(hotkeyConfig);
}
