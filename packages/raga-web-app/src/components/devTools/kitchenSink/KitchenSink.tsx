import {
  Badge,
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CommandGroup,
  CommandItem,
  CommandPalette,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  FileInput,
  IconButton,
  Input,
  Kbd,
  Progress,
  Radio,
  RadioGroup,
  Rating,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Spinner,
  StatusPill,
  Switch,
  Textarea,
  toast,
  Toaster,
  ToggleGroup,
  ToggleGroupItem,
  Tree,
  type TreeNodeData,
  useTree,
} from "@adahiya/raga-design-system";
import { useDisclosure, useHotkeys } from "@adahiya/raga-design-system/hooks";
import { cn } from "@adahiya/raga-design-system/lib/cn";
import { contrastRatio, fmtRatio, ratingFor } from "@adahiya/raga-design-system/lib/contrast";
import {
  surfaceRefFor,
  type ThemeName,
  THEMES,
  type Tokens,
  type TypeKey,
  type TypeSpec,
} from "@adahiya/raga-design-system/tokens";
import {
  Activity,
  ActivitySquare,
  Filter,
  FolderTree,
  HardDrive,
  Library,
  Music,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  Star,
  Terminal,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
  tokens: Tokens;
  surfaceRef: string;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function useThemeCtx(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("ThemeContext missing — wrap KitchenSink content in <ThemeProvider>.");
  }
  return ctx;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "warm" | "danger";
type ButtonState = "default" | "hover" | "active" | "disabled" | "loading";
type StatusTone = React.ComponentProps<typeof StatusPill>["tone"];

// Inner sub-label style used inside every section. Mixed-case mono at the
// mockup's small size, no forced uppercase or wide tracking — the numbered
// top-level section headers (in Section) keep their uppercase + tracking.
const SUBLABEL =
  "text-mono-sm font-mono text-text-muted leading-none whitespace-nowrap";

function Section({
  num,
  title,
  hint,
  children,
}: {
  num: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`s-${num}`}
      className="px-section-px py-section-py border-t border-border-subtle"
    >
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-caption tracking-label text-text-disabled">
          {num}
        </span>
        <h2 className="text-body font-semibold uppercase tracking-header text-text-secondary">
          {title}
        </h2>
        {hint ? <span className="ml-2 text-body-sm text-text-muted">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, textHex }: { name: string; hex: string; textHex?: string }) {
  const { surfaceRef, tokens } = useThemeCtx();
  const ratio = contrastRatio(hex, surfaceRef);
  return (
    <div className="flex flex-col">
      <div
        className="flex w-full items-end rounded-sm border border-border-subtle p-2"
        style={{ height: tokens.size.swatchH, background: hex }}
      >
        {textHex ? (
          <span className="font-mono text-micro" style={{ color: textHex }}>
            Aa
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex flex-col gap-icon-nudge">
        <span className="font-mono text-caption text-text-secondary">{name}</span>
        <span className="font-mono text-micro text-text-disabled">{hex}</span>
        <span className="font-mono text-micro text-text-muted">
          {fmtRatio(ratio)} · {ratingFor(ratio)}
        </span>
      </div>
    </div>
  );
}

function RampSwatch({ hex, k }: { hex: string; k: number }) {
  const { surfaceRef } = useThemeCtx();
  const ratio = contrastRatio(hex, surfaceRef);
  return (
    <div className="flex flex-1 flex-col items-start">
      <div
        className="h-avatar-md w-full rounded-xs border border-border-subtle"
        style={{ background: hex }}
      />
      <span className="mt-1 font-mono text-nano text-text-disabled">{k}</span>
      <span className="font-mono text-nano text-text-disabled">{hex}</span>
      <span className="font-mono text-nano text-text-muted">
        {fmtRatio(ratio)} · {ratingFor(ratio)}
      </span>
    </div>
  );
}

function ColorRow({
  label,
  scale,
  keys,
}: {
  label: string;
  scale: Record<number, string>;
  keys: number[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-caption text-text-muted">{label}</div>
      <div className="flex gap-1">
        {keys.map((k) => (
          <RampSwatch key={k} hex={scale[k]} k={k} />
        ))}
      </div>
    </div>
  );
}

function TextSampleRow({ name, hex }: { name: string; hex: string }) {
  const { surfaceRef, tokens } = useThemeCtx();
  const ratio = contrastRatio(hex, surfaceRef);
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-border-subtle py-2">
      <span style={{ color: hex, fontSize: tokens.type.body.size }}>{name}</span>
      <span className="font-mono text-micro text-text-disabled">
        {hex} · {fmtRatio(ratio)} · {ratingFor(ratio)}
      </span>
    </div>
  );
}

function BorderSampleRow({ name, rgba }: { name: string; rgba: string }) {
  const { tokens } = useThemeCtx();
  return (
    <div
      className="flex items-baseline justify-between py-2"
      style={{ borderBottom: `${String(tokens.size.separatorThickness)}px solid ${rgba}` }}
    >
      <span className="text-body-sm text-text-secondary">{name}</span>
      <span className="font-mono text-micro text-text-disabled">{rgba}</span>
    </div>
  );
}

function SemanticSwatch({ name, hex }: { name: string; hex: string }) {
  const { surfaceRef, tokens } = useThemeCtx();
  const ratio = contrastRatio(hex, surfaceRef);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className="inline-block rounded-pill"
          style={{
            width: tokens.size.indicatorDot * 1.5,
            height: tokens.size.indicatorDot * 1.5,
            background: hex,
          }}
        />
        <span className="font-mono text-caption text-text-secondary">{name}</span>
      </div>
      <span className="font-mono text-micro text-text-disabled">{hex}</span>
      <span className="font-mono text-micro text-text-muted">
        {fmtRatio(ratio)} · {ratingFor(ratio)}
      </span>
    </div>
  );
}

function fontFamilyOf(tokens: Tokens, k: "sans" | "mono"): string {
  return k === "mono" ? tokens.font.mono : tokens.font.sans;
}

function TypeRow({ name, spec, sample }: { name: TypeKey; spec: TypeSpec; sample: string }) {
  const { tokens } = useThemeCtx();
  return (
    <div className="flex items-baseline gap-6 border-b border-dashed border-border-subtle py-2">
      <div className="w-spec-label-w shrink-0">
        <div className="font-mono text-caption text-text-secondary">{name}</div>
        <div className="mt-icon-nudge font-mono text-micro text-text-disabled">
          {String(spec.size)}px · {String(Math.round(spec.size * spec.leading * 10) / 10)}px
          lh · {String(spec.weight)}
        </div>
      </div>
      <div
        className="flex-1 truncate text-text-primary"
        style={{
          fontFamily: fontFamilyOf(tokens, spec.family),
          fontSize: spec.size,
          fontWeight: spec.weight,
          lineHeight: spec.leading,
          letterSpacing: spec.tracking,
        }}
      >
        {sample}
      </div>
    </div>
  );
}

// Per-variant override classes that visually simulate :hover / :active —
// since we can't actually trigger hover from markup, we use these
// `!`-modified utilities to flip the bg/text.
const HOVER_STATE_CLASSES: Record<ButtonVariant, string> = {
  primary: "!bg-accent-400",
  secondary: "!bg-overlay-white-fill",
  ghost: "!bg-overlay-white-subtle !text-text-primary !border-border-default",
  warm: "!bg-accent2-300",
  danger: "!bg-danger-hover",
};
const ACTIVE_STATE_CLASSES: Record<ButtonVariant, string> = {
  primary: "!bg-accent-600",
  secondary: "!bg-overlay-white-subtle",
  ghost: "!bg-overlay-white-soft !text-text-primary !border-border-default",
  warm: "!bg-accent2-600",
  danger: "!bg-danger !brightness-90",
};

function stateClassesFor(state: ButtonState, variant: ButtonVariant): string {
  switch (state) {
    case "hover":
      return HOVER_STATE_CLASSES[variant];
    case "active":
      return ACTIVE_STATE_CLASSES[variant];
    default:
      return "";
  }
}

function ButtonStateColumn({ state }: { state: ButtonState }) {
  const isDisabled = state === "disabled";
  const isLoading = state === "loading";
  const variants: { variant: ButtonVariant; label: string; icon?: React.ReactNode }[] = [
    { variant: "primary", label: "Play set", icon: <Play className="h-icon-sm w-icon-sm" /> },
    { variant: "secondary", label: "Open folder" },
    { variant: "warm", label: "Analyze", icon: <Zap className="h-icon-sm w-icon-sm" /> },
    { variant: "ghost", label: "Cancel" },
    { variant: "danger", label: "Remove", icon: <X className="h-icon-sm w-icon-sm" /> },
  ];
  const iconBtns: { variant: ButtonVariant; node: React.ReactNode }[] = [
    { variant: "primary", node: <Play className="h-icon-md w-icon-md" fill="currentColor" /> },
    { variant: "secondary", node: <Settings className="h-icon-md w-icon-md" /> },
    { variant: "ghost", node: <Filter className="h-icon-md w-icon-md" /> },
    { variant: "danger", node: <X className="h-icon-md w-icon-md" /> },
    { variant: "warm", node: <Zap className="h-icon-md w-icon-md" /> },
  ];
  return (
    <div className="flex flex-col items-start gap-3">
      <div className={SUBLABEL}>{state}</div>
      {variants.map((v) => (
        <Button
          key={v.variant}
          variant={v.variant}
          disabled={isDisabled}
          className={cn(stateClassesFor(state, v.variant))}
        >
          {isLoading ? (
            <RefreshCw className="h-icon-sm w-icon-sm animate-spin" />
          ) : (
            v.icon
          )}
          {v.label}
        </Button>
      ))}
      {iconBtns.map((b, i) => (
        <IconButton
          key={i}
          variant={b.variant}
          disabled={isDisabled}
          aria-label={`${b.variant} icon`}
          className={stateClassesFor(state, b.variant)}
        >
          {isLoading ? (
            <RefreshCw className="h-icon-md w-icon-md animate-spin" />
          ) : (
            b.node
          )}
        </IconButton>
      ))}
    </div>
  );
}

function ElevationCard({
  level,
  hex,
  label,
  description,
}: {
  level: number;
  hex: string;
  label: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "flex-1 rounded-md border border-border-default p-4",
        level >= 3 ? "shadow-card-elevated" : "",
      )}
      style={{ background: hex }}
    >
      <div className="mb-1 font-mono text-caption text-text-muted">{label}</div>
      <div className="mb-1 text-body font-medium text-text-primary">Surface {level}</div>
      <div className="text-caption text-text-muted">{description}</div>
      <div className="mt-2 font-mono text-micro text-text-disabled">{hex}</div>
    </div>
  );
}

const STATUS_PILLS: { tone: StatusTone; label: string }[] = [
  { tone: "success", label: "ready" },
  { tone: "warning", label: "analyzing" },
  { tone: "danger", label: "error" },
  { tone: "info", label: "info" },
  { tone: "idle", label: "idle" },
];

const ICON_GRID: { I: typeof Library; label: string; accent?: boolean }[] = [
  { I: Library, label: "library" },
  { I: FolderTree, label: "playlists" },
  { I: HardDrive, label: "folders" },
  { I: ActivitySquare, label: "analyzer", accent: true },
  { I: Terminal, label: "command" },
  { I: Search, label: "search" },
  { I: Filter, label: "filter" },
  { I: Play, label: "play" },
  { I: Pause, label: "pause" },
  { I: Volume2, label: "volume" },
  { I: Star, label: "rating" },
  { I: Settings, label: "settings" },
];

function readInitialTheme(): ThemeName {
  // Kitchen sink mirrors the dark-mode design-system mockup, so we default to
  // dark and only honour an explicit `data-theme` attribute on <html>. The
  // user can still flip themes at runtime via the toggle in the page header.
  if (typeof document === "undefined") return "dark";
  const fromAttr = document.documentElement.dataset.theme;
  if (fromAttr === "light" || fromAttr === "dark") return fromAttr;
  return "dark";
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeName>(readInitialTheme);

  React.useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      tokens: THEMES[theme],
      surfaceRef: surfaceRefFor(theme),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeCtx();
  const next: ThemeName = theme === "dark" ? "light" : "dark";
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        setTheme(next);
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? "🌙" : "☀️"}
      <span className="font-mono text-caption uppercase tracking-label">
        {theme}
      </span>
    </Button>
  );
}

export function KitchenSink() {
  return (
    <ThemeProvider>
      <KitchenSinkContent />
    </ThemeProvider>
  );
}

function KitchenSinkContent() {
  const { tokens: T, theme } = useThemeCtx();
  React.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
  }, []);
  return (
    <div className="min-h-screen w-full overflow-auto bg-surface-1 text-text-secondary font-sans">
      {/* floating back-to-app link */}
      <a
        href="/"
        title="Back to Raga web app"
        style={{
          position: "fixed",
          bottom: 24,
          right: 16,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          borderRadius: 999,
          background: "rgba(20,20,28,0.85)",
          border: "1px solid rgba(138,92,246,0.4)",
          color: "#c4b5fd",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--type-micro-size)",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textDecoration: "none",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 12px rgba(138,92,246,0.25)",
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        ← App
      </a>
      {/* HEADER */}
      <header className="bg-surface-1 px-section-px pt-section-px pb-section-py">
        <div className="flex items-baseline gap-4">
          <div className="flex h-avatar-md w-avatar-md items-center justify-center rounded-md bg-accent-500 text-fg-on-accent font-mono text-base font-bold shadow-avatar-glow">
            R
          </div>
          <div>
            <h1 className="text-h1 font-semibold tracking-tight text-text-primary">
              Raga Design System
            </h1>
            <p className="mt-1 text-body text-text-muted">
              v0.1 · @adahiya/raga-design-system · tokens-first, Tailwind v4 + Radix +
              CVA + lucide
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge>tokens · {Object.keys(T.accent).length * 2 + 12}</Badge>
            <Badge>primitives · 15</Badge>
            <Badge variant="accent">{theme} · v0.1</Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 01 — COLOR */}
      <Section
        num="01"
        title="Color"
        hint="Surfaces are slightly cool-neutral. Iris-blue accent; warm coral for friendly emphasis."
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <div className={cn(SUBLABEL, "mb-3")}>Surface scale</div>
            <div className="grid grid-cols-5 gap-3">
              <Swatch name="surface-0" hex={T.surface[0]} textHex={T.text.muted} />
              <Swatch name="surface-1" hex={T.surface[1]} textHex={T.text.muted} />
              <Swatch name="surface-2" hex={T.surface[2]} textHex={T.text.secondary} />
              <Swatch name="surface-3" hex={T.surface[3]} textHex={T.text.secondary} />
              <Swatch name="surface-4" hex={T.surface[4]} textHex={T.text.primary} />
            </div>
            <div className={cn(SUBLABEL, "mt-6 mb-3")}>Text & border on surface-1</div>
            <div className="grid grid-cols-2 gap-3 rounded-md border border-border-default bg-surface-1 p-4">
              <div>
                <TextSampleRow name="text-primary" hex={T.text.primary} />
                <TextSampleRow name="text-secondary" hex={T.text.secondary} />
                <TextSampleRow name="text-muted" hex={T.text.muted} />
                <TextSampleRow name="text-disabled" hex={T.text.disabled} />
              </div>
              <div>
                <BorderSampleRow name="border-subtle" rgba={T.border.subtle} />
                <BorderSampleRow name="border-default" rgba={T.border.default} />
                <BorderSampleRow name="border-strong" rgba={T.border.strong} />
              </div>
            </div>
          </div>
          <div className="col-span-5 flex flex-col gap-5">
            <ColorRow
              label="accent (iris) — primary"
              scale={T.accent}
              keys={[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
            />
            <ColorRow
              label="accent2 (warm coral) — friendly emphasis"
              scale={T.accent2}
              keys={[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
            />
            <div>
              <div className={cn(SUBLABEL, "mb-3")}>
                Semantic — token · hex · contrast vs surface-1
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                <SemanticSwatch name="success" hex={T.semantic.success} />
                <SemanticSwatch name="warning" hex={T.semantic.warning} />
                <SemanticSwatch name="danger" hex={T.semantic.danger} />
                <SemanticSwatch name="dangerHover" hex={T.semantic.dangerHover} />
                <SemanticSwatch name="info" hex={T.semantic.info} />
                <SemanticSwatch name="idle" hex={T.semantic.idle} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {STATUS_PILLS.map((p) => (
                  <StatusPill key={p.label} tone={p.tone} label={p.label} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 02 — TYPOGRAPHY */}
      <Section
        num="02"
        title="Typography"
        hint="Sans for content & UI, mono for data, identifiers, and shortcuts."
      >
        <div className="grid grid-cols-2 gap-10">
          <div>
            <div className={cn(SUBLABEL, "mb-2")}>Sans · Inter</div>
            <TypeRow name="display" spec={T.type.display} sample="House Sets 2025" />
            <TypeRow
              name="headline"
              spec={T.type.headline}
              sample="Tonight's set, sorted by energy"
            />
            <TypeRow
              name="title"
              spec={T.type.title}
              sample="Selected Ambient Works 85–92"
            />
            <TypeRow
              name="body"
              spec={T.type.body}
              sample="Drag a folder here to start your library."
            />
            <TypeRow
              name="bodySm"
              spec={T.type.bodySm}
              sample="245 tracks · last analyzed 10m ago"
            />
            <TypeRow name="caption" spec={T.type.caption} sample="Updated automatically" />
            <TypeRow name="micro" spec={T.type.micro} sample="OVERLINE · LABEL · TINY" />
          </div>
          <div>
            <div className={cn(SUBLABEL, "mb-2")}>Mono · JetBrains Mono</div>
            <TypeRow name="monoLg" spec={T.type.monoLg} sample="BPM 124.5" />
            <TypeRow name="monoMd" spec={T.type.monoMd} sample="Autechre — VLetrmx" />
            <TypeRow name="monoSm" spec={T.type.monoSm} sample="00:03:42 · FLAC" />
            <TypeRow name="monoXs" spec={T.type.monoXs} sample="SECTION · LABEL" />
          </div>
        </div>
      </Section>

      {/* 03 — SPACING / RADIUS */}
      <Section num="03" title="Spacing & radius">
        <div className="grid grid-cols-2 gap-10">
          <div>
            <div className={cn(SUBLABEL, "mb-3")}>Spacing scale (px)</div>
            <div className="flex flex-col gap-control-gap">
              {Object.entries(T.spacing).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-meter-num-w font-mono text-caption text-text-muted">
                    space-{k}
                  </span>
                  <div
                    className="bg-accent-500 rounded-xs"
                    style={{ width: v, height: T.size.meterRowH }}
                  />
                  <span className="font-mono text-micro text-text-disabled">{v}px</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className={cn(SUBLABEL, "mb-3")}>Radius scale (px)</div>
            <div className="flex items-end gap-4">
              {Object.entries(T.radius).map(([k, v]) => (
                <div key={k} className="flex flex-col items-center gap-2">
                  <div
                    className="h-radius-swatch-h w-radius-swatch-h border border-border-default bg-surface-3"
                    style={{ borderRadius: v }}
                  />
                  <div className="font-mono text-micro text-text-secondary">
                    radius-{k}
                  </div>
                  <div className="font-mono text-nano text-text-disabled">{v}px</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 04 — BUTTONS */}
      <Section
        num="04"
        title="Buttons"
        hint="Primary uses iris accent. Warm secondary is reserved for friendly, non-destructive emphasis."
      >
        <div className="grid grid-cols-5 gap-4">
          {(["default", "hover", "active", "disabled", "loading"] as ButtonState[]).map(
            (state) => (
              <ButtonStateColumn key={state} state={state} />
            ),
          )}
        </div>
        <div className="mt-8 flex items-center gap-3 border-t border-border-subtle pt-6">
          <span className={cn(SUBLABEL, "mr-2")}>sizes</span>
          <Button size="sm" variant="primary">
            Small
          </Button>
          <Button size="md" variant="primary">
            Medium
          </Button>
          <Button size="sm" variant="secondary">
            <Filter className="h-icon-xs w-icon-xs" />
            With icon
          </Button>
          <IconButton size="sm" variant="secondary" aria-label="Settings">
            <Settings className="h-icon-sm w-icon-sm" />
          </IconButton>
          <IconButton size="sm" variant="primary" aria-label="Play">
            <Play className="h-icon-sm w-icon-sm" fill="currentColor" />
          </IconButton>
        </div>
      </Section>

      {/* 05 — FORM CONTROLS */}
      <Section num="05" title="Form controls">
        <div className="grid grid-cols-2 gap-10">
          {/* Left column: text inputs, search w/ shortcut, select, textarea */}
          <div className="flex flex-col gap-4">
            <div>
              <div className={cn(SUBLABEL, "mb-2")}>text inputs</div>
              <div className="flex flex-col gap-2">
                <Input placeholder="Folder name…" />
                <Input className="focus-ring" defaultValue="House Sets 2025" />
                <Input defaultValue="Read-only field" disabled />
              </div>
            </div>

            <div>
              <div className={cn(SUBLABEL, "mb-2")}>search with shortcut</div>
              <Input
                leadingIcon={<Search className="h-icon-sm w-icon-sm" />}
                placeholder="Search library, playlists, or commands…"
                trailing={<Kbd>⌘ K</Kbd>}
              />
            </div>

            <div>
              <div className={cn(SUBLABEL, "mb-2")}>
                select · default / focused / disabled
              </div>
              <div className="flex flex-col gap-2">
                <Select defaultValue="bpm">
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bpm">Sort by · BPM ascending</SelectItem>
                    <SelectItem value="title">Sort by · Title</SelectItem>
                    <SelectItem value="added">Sort by · Date added</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="bpm">
                  <SelectTrigger className="focus-ring">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bpm">Sort by · BPM ascending</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="bpm" disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bpm">Sort by · BPM ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className={cn(SUBLABEL, "mb-2")}>
                textarea · default / focused / disabled
              </div>
              <div className="flex flex-col gap-2">
                <Textarea
                  rows={2}
                  defaultValue="Closing set for the warehouse — keep BPM under 124, lean dubby."
                />
                <Textarea
                  className="focus-ring"
                  rows={2}
                  defaultValue="Closing set for the warehouse — keep BPM under 124, lean dubby."
                />
                <Textarea
                  rows={2}
                  disabled
                  defaultValue="Closing set for the warehouse — keep BPM under 124, lean dubby."
                />
              </div>
            </div>
          </div>

          {/* Right column: checkbox, radio, switch, slider — each as a triplet */}
          <div className="flex flex-col gap-5">
            <div>
              <div className={cn(SUBLABEL, "mb-2")}>
                checkbox · default / focused / disabled
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <Checkbox defaultChecked /> on
                </label>
                <label className="flex items-center gap-2 text-body-sm text-text-secondary">
                  <Checkbox /> off
                </label>
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <Checkbox defaultChecked className="focus-ring" /> focused
                </label>
                <label className="flex items-center gap-2 text-body-sm text-text-muted">
                  <Checkbox defaultChecked disabled /> disabled
                </label>
              </div>
            </div>

            <div>
              <div className={cn(SUBLABEL, "mb-2")}>
                radio · default / focused / disabled
              </div>
              <RadioGroup
                defaultValue="on"
                className="flex flex-row flex-wrap items-center gap-5"
              >
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <Radio value="on" /> on
                </label>
                <label className="flex items-center gap-2 text-body-sm text-text-secondary">
                  <Radio value="off" /> off
                </label>
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <Radio value="focused" className="focus-ring" /> focused
                </label>
                <label className="flex items-center gap-2 text-body-sm text-text-muted">
                  <Radio value="disabled" disabled /> disabled
                </label>
              </RadioGroup>
            </div>

            <div>
              <div className={cn(SUBLABEL, "mb-2")}>
                switch · default / focused / disabled
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-body-sm text-text-primary">
                  <Switch defaultChecked /> on
                </div>
                <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                  <Switch /> off
                </div>
                <div className="flex items-center gap-2 text-body-sm text-text-primary">
                  <Switch defaultChecked className="focus-ring" /> focused
                </div>
                <div className="flex items-center gap-2 text-body-sm text-text-muted">
                  <Switch defaultChecked disabled /> disabled
                </div>
              </div>
            </div>

            <div>
              <div className={cn(SUBLABEL, "mb-2")}>
                slider · default / focused / disabled
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-icon-md w-icon-md text-text-muted" />
                  <div className="flex-1">
                    <Slider defaultValue={[62]} min={0} max={100} step={1} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="h-icon-md w-icon-md text-accent-300" />
                  <div className="flex-1">
                    <Slider
                      defaultValue={[62]}
                      min={0}
                      max={100}
                      step={1}
                      className="[&_.bg-overlay-white-soft]:shadow-knob-glow"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="h-icon-md w-icon-md text-text-disabled" />
                  <div className="flex-1">
                    <Slider defaultValue={[62]} min={0} max={100} step={1} disabled />
                  </div>
                  <span className="w-8 text-right font-mono text-mono-sm text-text-disabled">
                    62
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 06 — BADGES, CHIPS & SHORTCUTS */}
      <Section num="06" title="Badges, chips & shortcuts">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex flex-col gap-2">
            <span className={SUBLABEL}>filter chip</span>
            <div className="flex items-center gap-2">
              <Badge variant="accent">
                <Filter className="h-icon-xs w-icon-xs" />
                BPM &gt; 120
              </Badge>
              <Badge variant="accent">
                <Filter className="h-icon-xs w-icon-xs" />
                Genre · House
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={SUBLABEL}>tag chip</span>
            <div className="flex items-center gap-2">
              <Badge>
                House
                <X className="h-icon-xs w-icon-xs cursor-pointer text-text-muted" />
              </Badge>
              <Badge>
                Late-night
                <X className="h-icon-xs w-icon-xs cursor-pointer text-text-muted" />
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={SUBLABEL}>status pill</span>
            <div className="flex items-center gap-2">
              <StatusPill tone="success" label="library ready" />
              <StatusPill tone="warning" label="analyzing 12" />
              <StatusPill tone="danger" label="reload failed" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={SUBLABEL}>keyboard</span>
            <div className="flex items-center gap-control-gap">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span className="mx-1 text-caption text-text-muted">command</span>
              <Kbd>J</Kbd>
              <Kbd>K</Kbd>
              <span className="mx-1 text-caption text-text-muted">nav</span>
              <Kbd>Space</Kbd>
              <span className="ml-1 text-caption text-text-muted">play</span>
            </div>
          </div>
        </div>
      </Section>

      {/* 07 — SURFACES & ELEVATION */}
      <Section
        num="07"
        title="Surfaces & elevation"
        hint="Three steps: page, panel, floating. Shadow only kicks in at level 3+."
      >
        <div className="flex gap-4">
          <ElevationCard
            level={1}
            hex={T.surface[1]}
            label="surface-1"
            description="Page background. Where the track table lives."
          />
          <ElevationCard
            level={2}
            hex={T.surface[2]}
            label="surface-2"
            description="Sidebar panels, sticky table headers, inputs."
          />
          <ElevationCard
            level={3}
            hex={T.surface[3]}
            label="surface-3"
            description="Floating panels: command palette, popovers, dropdowns."
          />
          <ElevationCard
            level={4}
            hex={T.surface[4]}
            label="surface-4"
            description="Hover & active fills inside floating panels."
          />
        </div>
      </Section>

      {/* 08 — APP CHROME */}
      <Section num="08" title="App chrome · mini-player & status bar">
        <div className="flex flex-col gap-6">
          <div>
            <div className={cn(SUBLABEL, "mb-2")}>mini-player</div>
            <div className="inline-flex items-center gap-4 rounded-pill border border-border-default bg-surface-2 py-1 pl-1 pr-4 shadow-card-elevated">
              <button
                type="button"
                aria-label="Play"
                className="flex h-icon-pill w-icon-pill items-center justify-center rounded-pill bg-accent-500 text-fg-on-accent shadow-icon-pill-glow"
              >
                <Play className="ml-icon-nudge h-icon-sm w-icon-sm" fill="currentColor" />
              </button>
              <div className="flex w-mini-player-w flex-col">
                <span className="truncate text-body-sm font-medium leading-tight text-text-primary">
                  Autechre — VLetrmx
                </span>
                <div className="mt-1 flex h-meter-row-h items-center gap-2">
                  <span className="font-mono text-micro leading-none text-accent-300">124</span>
                  <div className="flex h-full flex-1 items-end gap-px opacity-80">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-spectrum-bar-w bg-accent-500 rounded-xs"
                        style={{
                          height: `${String(Math.max(T.spectrumBar.minPct, (i * T.spectrumBar.stride) % T.spectrumBar.range))}%`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-nano leading-none text-text-disabled">
                    2:45
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-separator-md-h" />
              <Volume2 className="h-icon-md w-icon-md text-text-muted" />
            </div>
          </div>

          <div>
            <div className={cn(SUBLABEL, "mb-2")}>status bar</div>
            <div className="flex h-control-sm items-center justify-between rounded-sm border border-border-default bg-surface-0 px-4 font-mono text-micro text-text-muted">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-control-gap">
                  <Activity className="h-icon-xs w-icon-xs text-success" />
                  <span>Library: 12,847 tracks</span>
                </div>
                <Separator orientation="vertical" className="h-meter-row-h" />
                <div className="flex items-center gap-control-gap">
                  <span className="h-status-dot w-status-dot rounded-pill bg-idle" />
                  <span>Analyzer: idle</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-control-gap">
                  <Kbd>J</Kbd>
                  <Kbd>K</Kbd>
                  <span className="opacity-70">nav</span>
                </div>
                <div className="flex items-center gap-control-gap">
                  <Kbd>Space</Kbd>
                  <span className="opacity-70">play</span>
                </div>
                <div className="flex items-center gap-control-gap">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                  <span className="opacity-70">command</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 09 — ICONOGRAPHY */}
      <Section
        num="09"
        title="Iconography"
        hint="Lucide, 18px in nav, 14px inline. Default text-secondary; accent-400 when active."
      >
        <div className="grid grid-cols-12 gap-3">
          {ICON_GRID.map(({ I, label, accent }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-sm border border-border-subtle bg-surface-2 p-3"
            >
              <I
                className={cn("h-icon-lg w-icon-lg", accent ? "text-accent-400" : "text-text-secondary")}
              />
              <span className="font-mono text-micro text-text-disabled">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        num="10"
        title="Overlays · menus · feedback"
        hint="New DS primitives: Dialog, Dropdown/Context menus, Command palette, Toaster, Toggle group, Collapsible, Progress, Spinner, Rating, FileInput, Tree."
      >
        <NewPrimitivesShowcase />
      </Section>

      {/* FOOTER */}
      <footer className="mt-4 flex items-center justify-between border-t border-border-subtle bg-surface-0 px-section-px py-6 font-mono text-micro text-text-disabled">
        <div>raga · design system spec sheet · all values from a single TOKENS object</div>
        <div className="flex items-center gap-4">
          <Music className="h-icon-sm w-icon-sm" />
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span className="text-text-muted">
            tweak a token, the whole sheet updates
          </span>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 10 — new DS primitives showcase
// ---------------------------------------------------------------------------

const TREE_DATA: TreeNodeData[] = [
  {
    value: "library",
    label: "Library",
    children: [
      {
        value: "house",
        label: "House",
        children: [
          { value: "deep", label: "Deep house" },
          { value: "tech", label: "Tech house" },
        ],
      },
      {
        value: "techno",
        label: "Techno",
        children: [
          { value: "melodic", label: "Melodic" },
          { value: "industrial", label: "Industrial" },
        ],
      },
    ],
  },
];

const PALETTE_ACTIONS = [
  { id: "play", label: "Play / pause", group: "Playback" },
  { id: "next", label: "Next track", group: "Playback" },
  { id: "prev", label: "Previous track", group: "Playback" },
  { id: "search", label: "Find in library", group: "Library" },
  { id: "scroll", label: "Scroll to selected track", group: "Library" },
  { id: "refresh", label: "Refresh metadata", group: "Library" },
  { id: "toggle-theme", label: "Toggle theme", group: "View" },
];

function NewPrimitivesShowcase() {
  const [paletteOpen, { open: openPalette, close: closePalette, toggle: togglePalette }] =
    useDisclosure(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(42);
  const [rating, setRating] = React.useState(3);
  const [segment, setSegment] = React.useState<"sets" | "tracks" | "tags">("tracks");
  const [bold, setBold] = React.useState(true);
  const [italic, setItalic] = React.useState(false);
  const [underline, setUnderline] = React.useState(false);
  const [showLogs, setShowLogs] = React.useState(false);
  const [filterEnabled, setFilterEnabled] = React.useState(true);
  const tree = useTree({
    initialExpandedState: { library: true, house: true },
    initialSelectedState: ["deep"],
  });

  useHotkeys([["mod+k", togglePalette]]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 6));
    }, 800);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-10">
      <div className="flex flex-col gap-6">
        <div>
          <div className={cn(SUBLABEL, "mb-2")}>dialog · drop-in modal</div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Settings className="h-icon-sm w-icon-sm" />
                Open dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rebuild library cache?</DialogTitle>
                <DialogDescription>
                  This will re-scan every track and may take a few minutes.
                </DialogDescription>
              </DialogHeader>
              <p className="text-body text-text-secondary">
                You can keep working while the rebuild happens in the background.
              </p>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setDialogOpen(false);
                    toast.success("Library rebuild started");
                  }}
                >
                  Rebuild
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>dropdown menu · checkbox & shortcuts</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                Library actions
                <RefreshCw className="h-icon-sm w-icon-sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Library</DropdownMenuLabel>
              <DropdownMenuItem>
                Reload<DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Rebuild<DropdownMenuShortcut>⌥⌘R</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterEnabled}
                onCheckedChange={setFilterEnabled}
              >
                Show filter bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showLogs} onCheckedChange={setShowLogs}>
                Show logs panel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>context menu · right-click target</div>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="flex h-control-lg items-center justify-center rounded-md border border-dashed border-border-default bg-surface-2 text-body-sm text-text-muted">
                Right-click me
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Play</ContextMenuItem>
              <ContextMenuItem>Add to playlist…</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-danger data-[highlighted]:text-danger">
                Remove from library
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>command palette · ⌘K to open</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={openPalette}>
              <Search className="h-icon-sm w-icon-sm" />
              Open palette
            </Button>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
          <CommandPalette
            open={paletteOpen}
            onOpenChange={(next) => {
              if (next) openPalette();
              else closePalette();
            }}
            placeholder="Type a command or search tracks…"
            renderResults={(query) => {
              const q = query.trim().toLowerCase();
              const matches = PALETTE_ACTIONS.filter(
                (a) => q.length === 0 || a.label.toLowerCase().includes(q),
              );
              const groups = new Map<string, typeof matches>();
              for (const m of matches) {
                const list = groups.get(m.group) ?? [];
                list.push(m);
                groups.set(m.group, list);
              }
              return Array.from(groups.entries()).map(([group, items]) => (
                <CommandPaletteGroup
                  key={group}
                  heading={group}
                  items={items}
                  onSelect={(action) => {
                    closePalette();
                    toast(`Action: ${action.label}`);
                  }}
                />
              ));
            }}
          />
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>toaster · sonner</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                toast("Track added to queue");
              }}
            >
              Default
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toast.success("Library reload complete");
              }}
            >
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toast.error("Failed to read file");
              }}
            >
              Error
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className={cn(SUBLABEL, "mb-2")}>segmented control</div>
          <SegmentedControl
            data={[
              { value: "sets", label: "Sets" },
              { value: "tracks", label: "Tracks" },
              { value: "tags", label: "Tags" },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>toggle group · multi-select</div>
          <ToggleGroup
            type="multiple"
            value={[
              ...(bold ? ["bold"] : []),
              ...(italic ? ["italic"] : []),
              ...(underline ? ["underline"] : []),
            ]}
            onValueChange={(next) => {
              setBold(next.includes("bold"));
              setItalic(next.includes("italic"));
              setUnderline(next.includes("underline"));
            }}
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <span className="font-bold">B</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <span className="italic">I</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <span className="underline">U</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>collapsible · expand/collapse</div>
          <Collapsible className="flex flex-col gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost">
                <Filter className="h-icon-sm w-icon-sm" />
                Toggle filter panel
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="rounded-md border border-border-default bg-surface-2 p-3 text-body text-text-secondary">
                Hidden filter controls live here. The Collapsible primitive
                shows/hides via Radix data-state attributes.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>progress · determinate / indeterminate</div>
          <div className="flex flex-col gap-3">
            <Progress value={progress} />
            <Progress value={progress} color="warm" striped />
            <Progress value={null} animated color="info" />
          </div>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>spinner · sizes & colors</div>
          <div className="flex items-center gap-3">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" color="success" />
            <Spinner size="xl" color="muted" />
          </div>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>rating · star control</div>
          <div className="flex items-center gap-3">
            <Rating value={rating} onChange={setRating} count={5} />
            <span className="font-mono text-mono-sm text-text-muted">{rating}/5</span>
            <Separator orientation="vertical" className="h-control-md" />
            <Rating value={4.5} fractions={2} readOnly />
          </div>
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>file input</div>
          <FileInput
            label="Library XML"
            accept=".xml"
            placeholder="Pick a Rekordbox export…"
            fullWidth
          />
        </div>

        <div>
          <div className={cn(SUBLABEL, "mb-2")}>tree</div>
          <div className="rounded-md border border-border-default bg-surface-2 p-2 max-h-72 overflow-auto">
            <Tree data={TREE_DATA} tree={tree} selectOnClick />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaletteAction {
  id: string;
  label: string;
  group: string;
}

function CommandPaletteGroup({
  heading,
  items,
  onSelect,
}: {
  heading: string;
  items: PaletteAction[];
  onSelect: (item: PaletteAction) => void;
}) {
  if (items.length === 0) return null;
  return (
    <CommandGroup heading={heading}>
      {items.map((item) => (
        <CommandItem
          key={item.id}
          value={item.label}
          onSelect={() => { onSelect(item); }}
        >
          {item.label}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
