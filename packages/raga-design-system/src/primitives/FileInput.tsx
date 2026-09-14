import { Upload, X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

type SingleOrMultiple<TMulti extends boolean | undefined> = TMulti extends true
  ? File[]
  : File | null;

export interface FileInputProps<TMulti extends boolean | undefined = false>
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "defaultValue" | "onChange" | "type" | "children"
  > {
  /** Controlled value. */
  value?: SingleOrMultiple<TMulti>;
  /** Uncontrolled initial value. */
  defaultValue?: SingleOrMultiple<TMulti>;
  /** Called whenever the user picks files (or clears). */
  onChange?: (files: SingleOrMultiple<TMulti>) => void;
  /** Allow multiple files. */
  multiple?: TMulti;
  /** Placeholder shown when nothing is selected. */
  placeholder?: React.ReactNode;
  /** Optional label for the field. Render above the trigger. */
  label?: React.ReactNode;
  /** Accept attribute, e.g. "audio/*,.mp3". */
  accept?: string;
  /** Show "clear" affordance once a value is selected. */
  clearable?: boolean;
  /** Render as a full-width control. */
  fullWidth?: boolean;
  /** Custom renderer for the selected value(s). */
  valueRenderer?: (value: File[] | null) => React.ReactNode;
  /** Optional error state (red border + error class). */
  error?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
}

function asArray(value: File | File[] | null | undefined): File[] | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.length > 0 ? value : null;
  return [value];
}

const InnerFileInput = React.forwardRef<HTMLButtonElement, FileInputProps<boolean | undefined>>(
  (
    {
      value,
      defaultValue,
      onChange,
      multiple,
      placeholder = "Choose file…",
      label,
      accept,
      clearable = true,
      fullWidth = false,
      valueRenderer,
      error = false,
      disabled = false,
      className,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<File[] | null>(() => asArray(defaultValue));
    const current = isControlled ? asArray(value) : internal;
    const reactId = React.useId();
    const fieldId = id ?? `file-input-${reactId}`;
    const showClear = clearable && current !== null && !disabled;

    const updateValue = (next: File[] | null) => {
      if (!isControlled) setInternal(next);
      if (!onChange) return;
      if (multiple) {
        (onChange as (files: File[]) => void)(next ?? []);
      } else {
        (onChange as (file: File | null) => void)(next?.[0] ?? null);
      }
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (inputRef.current) inputRef.current.value = "";
      updateValue(null);
    };

    return (
      <div className={cn("flex flex-col gap-1 font-sans", fullWidth && "w-full")}>
        {label === undefined ? null : (
          <label
            htmlFor={fieldId}
            className="text-caption font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-control-md min-w-0 items-center rounded-sm",
            "bg-surface-2 border border-border-default",
            "transition-colors",
            "focus-within:focus-ring",
            error && "border-danger",
            disabled && "opacity-50 pointer-events-none bg-surface-1",
            fullWidth && "w-full",
            className,
          )}
        >
          <button
            ref={ref}
            type="button"
            id={fieldId}
            disabled={disabled}
            aria-haspopup="dialog"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-1 min-w-0 items-center gap-2 px-control-px h-full rounded-sm",
              "text-text-primary text-left text-body",
              "outline-none transition-colors",
              "hover:bg-overlay-white-soft",
            )}
            {...props}
          >
            <Upload className="h-icon-md w-icon-md text-text-muted shrink-0" />
            <span
              className={cn(
                "flex-1 truncate",
                current === null && "text-text-muted",
              )}
            >
              {valueRenderer
                ? valueRenderer(current)
                : current === null
                  ? placeholder
                  : current.length === 1
                    ? current[0].name
                    : `${current.length.toString()} files`}
            </span>
          </button>
          {showClear ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className={cn(
                "inline-flex h-icon-lg w-icon-lg items-center justify-center mr-1 rounded-sm",
                "text-text-muted hover:text-text-primary hover:bg-overlay-white-soft",
                "outline-none focus-visible:focus-ring",
              )}
            >
              <X className="h-icon-sm w-icon-sm" />
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            const files = event.currentTarget.files;
            if (files === null || files.length === 0) {
              updateValue(null);
              return;
            }
            updateValue(Array.from(files));
          }}
        />
      </div>
    );
  },
);
InnerFileInput.displayName = "FileInput";

export const FileInput = InnerFileInput as <TMulti extends boolean | undefined = false>(
  props: FileInputProps<TMulti> & { ref?: React.ForwardedRef<HTMLButtonElement> },
) => React.ReactElement;
