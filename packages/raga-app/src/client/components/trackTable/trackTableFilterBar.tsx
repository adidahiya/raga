import { Classes, Collapse, FormGroup, InputGroup } from "@blueprintjs/core";
import { ChevronUp } from "@blueprintjs/icons";
import { ActionIcon } from "@mantine/core";
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
      <FormGroup className={Classes.TEXT_SMALL} inline={true} label="Filter table">
        <InputGroup
          inputRef={inputElement}
          type="search"
          small={true}
          placeholder="Search track names, artists, albums..."
          value={query}
          onChange={handleInputChange}
        />
      </FormGroup>
      <ActionIcon onClick={hideTableFilterBar} size="compact-sm" color="gray" variant="subtle">
        <ChevronUp />
      </ActionIcon>
    </Collapse>
  );
}
TrackTableFilterBar.displayName = "TrackTableFilterBar";
