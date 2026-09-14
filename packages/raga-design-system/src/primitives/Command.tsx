import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import {
  Dialog,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogTitle,
} from "./Dialog";

export const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md",
      "bg-surface-1 text-text-primary font-sans",
      className,
    )}
    {...props}
  />
));
Command.displayName = "Command";

export const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    leadingIcon?: React.ReactNode;
  }
>(({ className, leadingIcon, ...props }, ref) => (
  <div
    className="flex items-center gap-2 px-control-px border-b border-border-default"
    {...{ "cmdk-input-wrapper": "" }}
  >
    <span className="text-text-muted shrink-0">
      {leadingIcon ?? <Search className="h-icon-md w-icon-md" />}
    </span>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-control-lg w-full rounded-sm bg-transparent py-3 text-body text-text-primary",
        "outline-none placeholder:text-text-muted",
        "disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[320px] overflow-y-auto overflow-x-hidden p-popover-p", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn("py-6 text-center text-body text-text-muted", className)}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-popover-p text-text-primary",
      "[&_[cmdk-group-heading]]:px-control-px [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1",
      "[&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:font-mono",
      "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-label",
      "[&_[cmdk-group-heading]]:text-text-muted",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

export const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-separator-thickness bg-border-default", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

export const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-control-gap rounded-sm",
      "px-control-px py-select-item-py text-body text-text-secondary outline-none",
      "data-[selected=true]:bg-overlay-white-subtle data-[selected=true]:text-text-primary",
      "data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

export const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto pl-4 text-caption font-mono tracking-label text-text-muted",
      className,
    )}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

/**
 * Action shape compatible with Mantine's Spotlight. When passed via the
 * `actions` prop, the palette will render them with cmdk's built-in fuzzy
 * filter and call `onTrigger` (alias: `onClick`) when the user picks one.
 */
export interface CommandPaletteAction {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  keywords?: string[];
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  disabled?: boolean;
  onTrigger?: () => void;
  /** Spotlight-style alias for `onTrigger`. */
  onClick?: () => void;
}

export interface CommandPaletteActionGroup {
  group: string;
  actions: CommandPaletteAction[];
}

export type CommandPaletteActions =
  | CommandPaletteAction[]
  | CommandPaletteActionGroup[];

function isActionGroupArray(
  actions: CommandPaletteActions,
): actions is CommandPaletteActionGroup[] {
  return actions.length > 0 && "group" in actions[0] && "actions" in actions[0];
}

function actionSearchString(action: CommandPaletteAction): string {
  const parts: string[] = [];
  if (typeof action.label === "string") parts.push(action.label);
  if (typeof action.description === "string") parts.push(action.description);
  if (action.keywords) parts.push(...action.keywords);
  return parts.join(" ");
}

function renderAction(
  action: CommandPaletteAction,
  closePalette: () => void,
): React.ReactElement {
  const handler = action.onTrigger ?? action.onClick;
  return (
    <CommandItem
      key={action.id}
      value={`${action.id} ${actionSearchString(action)}`}
      disabled={action.disabled}
      onSelect={() => {
        handler?.();
        closePalette();
      }}
    >
      {action.leftSection ? <span className="shrink-0">{action.leftSection}</span> : null}
      <span className="flex flex-col min-w-0">
        <span className="truncate">{action.label}</span>
        {action.description === undefined ? null : (
          <span className="text-caption text-text-muted truncate">{action.description}</span>
        )}
      </span>
      {action.rightSection ? <span className="ml-auto shrink-0">{action.rightSection}</span> : null}
    </CommandItem>
  );
}

/**
 * CommandPalette — drops a `Command` into a `Dialog`. Three usage modes:
 *  - `actions` (Mantine Spotlight-shaped array, optionally grouped) — easiest
 *    migration path; the palette handles rendering and filtering.
 *  - `filter` (lazy render fn) — disables cmdk's built-in fuzzy filter; the
 *    consumer fully controls what is rendered for each query.
 *  - `children` — render your own `CommandGroup`/`CommandItem` tree.
 */
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Placeholder for the search input. */
  placeholder?: string;
  /** Optional aria title — rendered visually-hidden if `title` is omitted. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * Mantine Spotlight-style action list. Pass either a flat array or an array
   * of `{ group, actions }` to render section headings.
   */
  actions?: CommandPaletteActions;
  /** Static children, used when the consumer renders its own groups/items. */
  children?: React.ReactNode;
  /**
   * Mantine Spotlight-shaped filter. Use together with `actions`: receives the
   * current query plus the unfiltered list and returns the subset to render.
   * Disables cmdk's built-in fuzzy filter. Ignored when `renderResults` is set.
   */
  filter?: (query: string, actions: CommandPaletteActions) => CommandPaletteActions;
  /**
   * Lazy render function. Receives the current query and returns the items to
   * render. Returning an empty fragment will cause `emptyMessage` to render.
   * When provided, cmdk's built-in fuzzy filter is disabled.
   */
  renderResults?: (query: string) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  /** Optional initial query value (uncontrolled). */
  defaultQuery?: string;
  /** Class applied to the underlying DialogContent. */
  contentClassName?: string;
  /** Forwarded to DialogContent. */
  contentProps?: Omit<DialogContentProps, "className" | "children">;
}

export function CommandPalette({
  open,
  onOpenChange,
  placeholder = "Search…",
  title,
  description,
  actions,
  children,
  filter,
  renderResults,
  emptyMessage = "No results.",
  defaultQuery = "",
  contentClassName,
  contentProps,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState(defaultQuery);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const closePalette = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const renderActions = React.useCallback(
    (list: CommandPaletteActions): React.ReactNode => {
      if (isActionGroupArray(list)) {
        return list.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.actions.map((a) => renderAction(a, closePalette))}
          </CommandGroup>
        ));
      }
      return list.map((a) => renderAction(a, closePalette));
    },
    [closePalette],
  );

  const filtered = React.useMemo(() => {
    if (renderResults !== undefined) return renderResults(query);
    if (filter !== undefined && actions !== undefined) {
      return renderActions(filter(query, actions));
    }
    return null;
  }, [renderResults, filter, query, actions, renderActions]);

  const renderedActions = React.useMemo(() => {
    if (actions === undefined) return null;
    return renderActions(actions);
  }, [actions, renderActions]);

  const useFilter = renderResults !== undefined || filter !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn("max-w-xl p-0 overflow-hidden", contentClassName)}
        {...contentProps}
      >
        {title === undefined ? (
          <DialogTitle className="sr-only">Command palette</DialogTitle>
        ) : (
          <DialogTitle className="sr-only">{title}</DialogTitle>
        )}
        {description === undefined ? null : (
          <DialogDescription className="sr-only">{description}</DialogDescription>
        )}
        <Command shouldFilter={!useFilter} value={undefined}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {useFilter ? filtered : (renderedActions ?? children)}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
CommandPalette.displayName = "CommandPalette";
