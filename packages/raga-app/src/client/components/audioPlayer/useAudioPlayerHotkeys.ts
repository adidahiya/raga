import { useHotkeys } from "@mantine/hooks";
import { useCallback } from "react";

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

  useHotkeys([
    ["space", isPlaying ? pause : handlePlay],
    ["ArrowLeft", seekBackwardTen],
    ["mod+ArrowLeft", seekBackwardThirty],
    ["ArrowRight", seekForwardTen],
    ["mod+ArrowRight", seekForwardThirty],
  ]);
}
