import { IconButton, Input, Separator } from "@adahiya/raga-design-system";
import { Collapse } from "@mantine/core";
import { memo, useCallback, useEffect, useRef } from "react";
import { IoChevronUp } from "react-icons/io5";

import { appStore } from "../../store/appStore";
import styles from "./trackTableFilterBar.module.scss";

interface TrackTableFilterBarProps {
  query: string;
  onClose?: () => void;
  onQueryChange: (query: string) => void;
}

export const TrackTableFilterBar = memo(
  ({ query, onClose, onQueryChange }: TrackTableFilterBarProps) => {
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
      <Collapse in={isVisible}>
        <div className="flex items-center justify-end gap-2 px-2 py-1">
          <span className="text-body-sm">Filter table</span>
          <Input
            className={`${styles.filterInput} w-[300px] rounded-pill`}
            ref={inputElement}
            type="search"
            placeholder="Search track names, artists, albums..."
            value={query}
            onChange={handleInputChange}
          />
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Hide filter bar"
            onClick={hideTableFilterBar}
          >
            <IoChevronUp />
          </IconButton>
        </div>
        <Separator />
      </Collapse>
    );
  },
);
TrackTableFilterBar.displayName = "TrackTableFilterBar";
