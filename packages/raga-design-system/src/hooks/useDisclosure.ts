import * as React from "react";

export interface UseDisclosureCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseDisclosureHandlers {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Mantine-compatible disclosure hook. Returns the tuple
 * `[opened, { open, close, toggle }]`.
 */
export function useDisclosure(
  initialState = false,
  callbacks: UseDisclosureCallbacks = {},
): [boolean, UseDisclosureHandlers] {
  const { onOpen, onClose } = callbacks;
  const [opened, setOpened] = React.useState(initialState);
  const openedRef = React.useRef(opened);
  React.useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  const open = React.useCallback(() => {
    if (!openedRef.current) {
      openedRef.current = true;
      setOpened(true);
      onOpen?.();
    }
  }, [onOpen]);

  const close = React.useCallback(() => {
    if (openedRef.current) {
      openedRef.current = false;
      setOpened(false);
      onClose?.();
    }
  }, [onClose]);

  const toggle = React.useCallback(() => {
    if (openedRef.current) {
      openedRef.current = false;
      setOpened(false);
      onClose?.();
    } else {
      openedRef.current = true;
      setOpened(true);
      onOpen?.();
    }
  }, [onOpen, onClose]);

  return [opened, { open, close, toggle }];
}
