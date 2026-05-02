import { Kbd } from "@adahiya/raga-design-system";
import { Modal } from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";

/**
 * Global hotkeys modal dialog.
 * We have to build this ourselves since Mantine doesn't provide it out of the box.
 *
 * Also note that Mantine doesn't have key resolution like Blueprint does for punctuation
 * like '?', and shift+. doesn't work either, so we need to come up with a new hotkey.
 */
export default function GlobalHotkeysDialog() {
  const [opened, { open, close }] = useDisclosure(false);

  useHotkeys([["mod+i", open]]);

  return (
    <Modal opened={opened} onClose={close} centered={true} title="Global hotkeys">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center">
          <ShortcutKeys keys={["⌘", "i"]} />
          <span>Keyboard shortcuts</span>

          <ShortcutKeys keys={["⌘", "f"]} />
          <span>Find in track table</span>

          <ShortcutKeys keys={["⌘", "l"]} />
          <span>Scroll to selected track</span>

          <ShortcutKeys keys={["Space"]} />
          <span>Play/pause</span>

          <ShortcutKeys keys={["←"]} />
          <span>Seek backward 10 seconds</span>

          <ShortcutKeys keys={["⌘", "←"]} />
          <span>Seek backward 30 seconds</span>

          <ShortcutKeys keys={["→"]} />
          <span>Seek forward 10 seconds</span>

          <ShortcutKeys keys={["⌘", "→"]} />
          <span>Seek forward 30 seconds</span>
        </div>
      </div>
    </Modal>
  );
}

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {keys.map((k, idx) => (
        <span key={`${k}-${idx.toString()}`} className="inline-flex items-center gap-1">
          {idx > 0 && <span className="text-text-muted">+</span>}
          <Kbd>{k}</Kbd>
        </span>
      ))}
    </div>
  );
}
