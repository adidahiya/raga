import * as React from "react";

export interface HotkeyItemOptions {
  preventDefault?: boolean;
}

export type HotkeyItem = [string, (event: KeyboardEvent) => void, HotkeyItemOptions?];

interface ParsedHotkey {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  mod: boolean;
}

const isMac = (): boolean =>
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

function parseHotkey(input: string): ParsedHotkey {
  const parts = input
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const result: ParsedHotkey = {
    key: "",
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
    mod: false,
  };
  for (const part of parts) {
    switch (part) {
      case "mod":
        result.mod = true;
        break;
      case "ctrl":
      case "control":
        result.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        result.meta = true;
        break;
      case "alt":
      case "option":
        result.alt = true;
        break;
      case "shift":
        result.shift = true;
        break;
      default:
        result.key = part;
    }
  }
  return result;
}

function eventMatches(event: KeyboardEvent, hotkey: ParsedHotkey): boolean {
  if (hotkey.key.length === 0) return false;
  const eventKey = event.key.toLowerCase();
  const eventCode = event.code.toLowerCase();
  if (eventKey !== hotkey.key && eventCode !== hotkey.key && eventCode !== `key${hotkey.key}`) {
    return false;
  }
  const mac = isMac();
  const modActive = hotkey.mod ? (mac ? event.metaKey : event.ctrlKey) : null;
  if (modActive === false) return false;
  if (hotkey.ctrl && !event.ctrlKey) return false;
  if (hotkey.meta && !event.metaKey) return false;
  if (hotkey.alt && !event.altKey) return false;
  if (hotkey.shift && !event.shiftKey) return false;
  if (!hotkey.mod && !hotkey.ctrl && (mac ? event.metaKey : event.ctrlKey)) return false;
  if (!hotkey.meta && !hotkey.mod && mac && event.metaKey) return false;
  if (!hotkey.alt && event.altKey) return false;
  if (!hotkey.shift && event.shiftKey && hotkey.key.length > 1) return false;
  return true;
}

const DEFAULT_TAGS_TO_IGNORE = ["INPUT", "TEXTAREA", "SELECT"];

function shouldIgnoreEvent(
  event: KeyboardEvent,
  tagsToIgnore: string[],
  triggerOnContentEditable: boolean,
): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (tagsToIgnore.includes(target.tagName)) return true;
  if (!triggerOnContentEditable && target.isContentEditable) return true;
  return false;
}

/**
 * Mantine-compatible hotkeys hook.
 *
 * @example
 * useHotkeys([
 *   ["mod+k", openPalette],
 *   ["mod+shift+s", saveAs, { preventDefault: false }],
 * ]);
 */
export function useHotkeys(
  hotkeys: HotkeyItem[],
  tagsToIgnore: string[] = DEFAULT_TAGS_TO_IGNORE,
  triggerOnContentEditable = false,
): void {
  const hotkeysRef = React.useRef(hotkeys);
  React.useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  const tagsRef = React.useRef(tagsToIgnore);
  React.useEffect(() => {
    tagsRef.current = tagsToIgnore;
  }, [tagsToIgnore]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      for (const item of hotkeysRef.current) {
        const [combo, callback, options] = item;
        const parsed = parseHotkey(combo);
        if (!eventMatches(event, parsed)) continue;
        if (shouldIgnoreEvent(event, tagsRef.current, triggerOnContentEditable)) continue;
        if (options?.preventDefault !== false) event.preventDefault();
        callback(event);
        return;
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [triggerOnContentEditable]);
}
