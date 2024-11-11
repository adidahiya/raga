import { InputGroup, Spinner } from "@blueprintjs/core";
import { Button } from "@mantine/core";
import { Text } from "@mantine/core";
import classNames from "classnames";
import type { Operation } from "effection";
import { useCallback, useRef, useState } from "react";

import { useOperationCallback } from "../../hooks";
import styles from "./editableOnHover.module.scss";

interface EditableOnHoverProps<T> {
  value: T | undefined;
  onChangeOperation: (newValue: T | undefined) => Operation<void>;
  placeholder?: string;
  textAlign?: "left" | "right";
  showGradient?: boolean;
}

export default function EditableOnHover<T extends string | number>({
  value,
  onChangeOperation,
  placeholder,
  textAlign = "left",
  showGradient = true,
}: EditableOnHoverProps<T>) {
  const valueType = typeof value;
  const [isEditing, setIsEditing] = useState(false);
  // loading state, usually writing back to the data store in response to UI input
  const [isLoading, setIsLoading] = useState(false);
  const [localValue, setLocalValue] = useState<T | undefined>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);

    // wait until the next frame when `display: none` is removed from the input
    setTimeout(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = (
        valueType === "string" ? event.target.value : parseInt(event.target.value, 10)
      ) as T;
      setLocalValue(newValue);
    },
    [valueType],
  );

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  }, []);

  const handleInputBlur = useOperationCallback(
    function* () {
      if (localValue === value) {
        // no change in value, so don't do anything
        setIsEditing(false);
        return;
      }

      setIsLoading(true);

      try {
        yield* onChangeOperation(localValue);
      } finally {
        setIsLoading(false);
        setIsEditing(false);
      }
    },
    [localValue, onChangeOperation, value],
  );

  const valueAndEditableContent = (
    <>
      <Text component="div" c={value == null ? "dimmed" : undefined} className={styles.value}>
        {value ?? placeholder}
      </Text>

      <div className={styles.editInput}>
        <InputGroup
          small={true}
          defaultValue={value === undefined ? "" : value.toString()}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          inputRef={inputRef}
        />
      </div>
      <div className={styles.editButtonContainer}>
        {showGradient && <div className={styles.editButtonGradient} />}
        <Button
          className={styles.editButton}
          size="compact-sm"
          color="gray"
          variant="subtle"
          onClick={handleEditClick}
        >
          Edit
        </Button>
      </div>
    </>
  );

  return (
    <div
      className={classNames(styles.editableOnHover, {
        [styles.isEditing]: isEditing,
        [styles.isLoading]: isLoading,
        [styles.alignLeft]: textAlign === "left",
        [styles.alignRight]: textAlign === "right",
        [styles.showGradient]: showGradient,
      })}
    >
      {isLoading ? <Spinner className={styles.spinner} size={16} /> : valueAndEditableContent}
    </div>
  );
}
