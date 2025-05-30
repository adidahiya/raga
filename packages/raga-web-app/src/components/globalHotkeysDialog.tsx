import { Group, Kbd, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
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
      <Stack>
        <SimpleGrid cols={2}>
          <Group gap="xs" justify="flex-end">
            <Kbd>⌘</Kbd> + <Kbd>i</Kbd>
          </Group>
          <Text>Keyboard shortcuts</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>⌘</Kbd> + <Kbd>f</Kbd>
          </Group>
          <Text>Find in track table</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>⌘</Kbd> + <Kbd>l</Kbd>
          </Group>
          <Text>Scroll to selected track</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>Space</Kbd>
          </Group>
          <Text>Play/pause</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>←</Kbd>
          </Group>
          <Text>Seek backward 10 seconds</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>⌘</Kbd> + <Kbd>←</Kbd>
          </Group>
          <Text>Seek backward 30 seconds</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>→</Kbd>
          </Group>
          <Text>Seek forward 10 seconds</Text>

          <Group gap="xs" justify="flex-end">
            <Kbd>⌘</Kbd> + <Kbd>→</Kbd>
          </Group>
          <Text>Seek forward 30 seconds</Text>
        </SimpleGrid>
      </Stack>
    </Modal>
  );
}
