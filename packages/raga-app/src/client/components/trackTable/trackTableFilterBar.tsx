import { Collapse } from "@blueprintjs/core";
import { ChevronUp } from "@blueprintjs/icons";
import { ActionIcon, Group, Text, TextInput } from "@mantine/core";
import { useCallback, useEffect, useRef } from "react";

import { appStore } from "../../store/appStore";
import styles from "./trackTableFilterBar.module.scss";

interface TrackTableFilterBarProps {
  query: string;
  onClose?: () => void;
  onQueryChange: (query: string) => void;
}

export function TrackTableFilterBar({ query, onClose, onQueryChange }: TrackTableFilterBarProps) {
  const isVisible = appStore.use.trackTableFilterVisible();
  const setIsVisible = appStore.use.setTrackTableFilterVisible();

  const inputElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) {
      inputElement.current?.focus();
    }
  }, [isVisible]);

  const hideTableFilterBar = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose, setIsVisible]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange(e.target.value);
    },
    [onQueryChange],
  );

  return (
    <Collapse isOpen={isVisible} className={styles.tableFilter}>
      <Group>
        <Text size="sm">Filter table</Text>
        <TextInput
          className={styles.filterInput}
          w={300}
          size="compact-sm"
          radius="xl"
          ref={inputElement}
          type="search"
          placeholder="Search track names, artists, albums..."
          value={query}
          onChange={handleInputChange}
        />
      </Group>
      <ActionIcon onClick={hideTableFilterBar} size="compact-sm" color="gray" variant="subtle">
        <ChevronUp />
      </ActionIcon>
    </Collapse>
  );
}
TrackTableFilterBar.displayName = "TrackTableFilterBar";
