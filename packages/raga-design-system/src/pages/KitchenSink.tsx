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
  Search,
  Settings,
  Star,
  Terminal,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { contrastRatio, fmtRatio, ratingFor } from "../lib/contrast";
import {
  Badge,
  Button,
  Checkbox,
  IconButton,
  Input,
  Kbd,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  StatusPill,
  Switch,
  Textarea,
} from "../primitives";
import { SURFACE_REF, TOKENS, type TypeKey, type TypeSpec } from "../tokens/tokens";

function getWebAppUrl(): string {
  const { host, protocol } = window.location;
  if (host.includes(".worf.replit.dev")) {
    return `${protocol}//${host.replace(/-5173(\.worf\.replit\.dev)$/, "$1")}`;
  }
  return "http://localhost:5000";
}

const T = TOKENS;

type ButtonVariant = "primary" | "secondary" | "ghost" | "warm" | "danger";
type ButtonState = "default" | "hover" | "active" | "disabled" | "focus";
type StatusTone = React.ComponentProps<typeof StatusPill>["tone"];

const SECTION_HEADER =
  "text-micro font-mono uppercase tracking-label text-text-disabled";

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
    <section className="px-section-px py-section-py border-t border-border-subtle">
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
  const ratio = contrastRatio(hex, SURFACE_REF);
  return (
    <div className="flex flex-col">
      <div
        className="flex w-full items-end rounded-sm border border-border-subtle p-2"
        style={{ height: T.size.swatchH, background: hex }}
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
  const ratio = contrastRatio(hex, SURFACE_REF);
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
  const ratio = contrastRatio(hex, SURFACE_REF);
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-border-subtle py-2">
      <span style={{ color: hex, fontSize: T.type.body.size }}>{name}</span>
      <span className="font-mono text-micro text-text-disabled">
        {hex} · {fmtRatio(ratio)} · {ratingFor(ratio)}
      </span>
    </div>
  );
}

function BorderSampleRow({ name, rgba }: { name: string; rgba: string }) {
  return (
    <div
      className="flex items-baseline justify-between py-2"
      style={{ borderBottom: `${String(T.size.separatorThickness)}px solid ${rgba}` }}
    >
      <span className="text-body-sm text-text-secondary">{name}</span>
      <span className="font-mono text-micro text-text-disabled">{rgba}</span>
    </div>
  );
}

function SemanticSwatch({ name, hex }: { name: string; hex: string }) {
  const ratio = contrastRatio(hex, SURFACE_REF);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className="inline-block rounded-pill"
          style={{
            width: T.size.indicatorDot * 1.5,
            height: T.size.indicatorDot * 1.5,
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

const fontFamilyOf = (k: "sans" | "mono") => (k === "mono" ? T.font.mono : T.font.sans);

function TypeRow({ name, spec, sample }: { name: TypeKey; spec: TypeSpec; sample: string }) {
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
          fontFamily: fontFamilyOf(spec.family),
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

// Per-variant override classes that visually simulate :hover / :active
// on the *next sibling* selector — since we can't actually trigger hover
// from markup, we use these `!`-modified utilities to flip the bg/text.
const HOVER_STATE_CLASSES: Record<ButtonVariant, string> = {
  primary: "!bg-accent-400",
  secondary: "!bg-overlay-white-fill",
  ghost: "!bg-overlay-white-subtle !text-text-primary",
  warm: "!bg-accent2-300",
  danger: "!bg-danger-hover",
};
const ACTIVE_STATE_CLASSES: Record<ButtonVariant, string> = {
  primary: "!bg-accent-600",
  secondary: "!bg-overlay-white-subtle",
  ghost: "!bg-overlay-white-soft !text-text-primary",
  warm: "!bg-accent2-600",
  danger: "!bg-danger !brightness-90",
};
const FOCUS_STATE_CLASSES = "focus-ring";

function stateClassesFor(state: ButtonState, variant: ButtonVariant): string {
  switch (state) {
    case "hover":
      return HOVER_STATE_CLASSES[variant];
    case "active":
      return ACTIVE_STATE_CLASSES[variant];
    case "focus":
      return FOCUS_STATE_CLASSES;
    default:
      return "";
  }
}

function ButtonStateColumn({ state }: { state: ButtonState }) {
  const isDisabled = state === "disabled";
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
    <div className="flex flex-col gap-3">
      <div className={SECTION_HEADER}>{state}</div>
      {variants.map((v) => (
        <Button
          key={v.variant}
          variant={v.variant}
          disabled={isDisabled}
          className={cn(stateClassesFor(state, v.variant))}
        >
          {v.icon}
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
          {b.node}
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

export function KitchenSink() {
  const webAppUrl = getWebAppUrl();
  return (
    <div className="min-h-screen w-full overflow-auto bg-surface-1 text-text-secondary font-sans">
      {/* floating back-to-app link */}
      <a
        href={webAppUrl}
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
            <Badge variant="accent">dark · v0.1</Badge>
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
            <div className={cn(SECTION_HEADER, "mb-3")}>Surface scale</div>
            <div className="grid grid-cols-5 gap-3">
              <Swatch name="surface-0" hex={T.surface[0]} textHex={T.text.muted} />
              <Swatch name="surface-1" hex={T.surface[1]} textHex={T.text.muted} />
              <Swatch name="surface-2" hex={T.surface[2]} textHex={T.text.secondary} />
              <Swatch name="surface-3" hex={T.surface[3]} textHex={T.text.secondary} />
              <Swatch name="surface-4" hex={T.surface[4]} textHex={T.text.primary} />
            </div>
            <div className={cn(SECTION_HEADER, "mt-6 mb-3")}>Text & border on surface-1</div>
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
              <div className={cn(SECTION_HEADER, "mb-3")}>
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
            <div className={cn(SECTION_HEADER, "mb-2")}>Sans · Inter</div>
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
            <div className={cn(SECTION_HEADER, "mb-2")}>Mono · JetBrains Mono</div>
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
            <div className={cn(SECTION_HEADER, "mb-3")}>Spacing scale (px)</div>
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
            <div className={cn(SECTION_HEADER, "mb-3")}>Radius scale (px)</div>
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
          {(
            ["default", "hover", "active", "disabled", "focus"] as const
          ).map((s) => (
            <ButtonStateColumn key={s} state={s} />
          ))}
        </div>
        <Separator className="my-6" />
        <div className="flex items-center gap-3">
          <span className={cn(SECTION_HEADER, "mr-2")}>sizes</span>
          <Button size="sm" variant="primary">
            Small
          </Button>
          <Button size="md" variant="primary">
            Medium
          </Button>
          <Button size="lg" variant="primary">
            Large
          </Button>
          <Button size="sm" variant="secondary">
            <Filter className="h-icon-sm w-icon-sm" />
            With icon
          </Button>
          <IconButton aria-label="Settings" variant="secondary">
            <Settings className="h-icon-md w-icon-md" />
          </IconButton>
          <IconButton aria-label="Play" variant="primary">
            <Play className="h-icon-md w-icon-md" fill="currentColor" />
          </IconButton>
        </div>
      </Section>

      {/* 05 — FORM CONTROLS */}
      <Section num="05" title="Form Controls">
        <div className="grid grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>text inputs</div>
              <div className="flex flex-col gap-2">
                <Input placeholder="Folder name…" />
                <Input defaultValue="House Sets 2025" autoFocus />
                <Input defaultValue="Read-only field" disabled />
              </div>
            </div>

            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>search with shortcut</div>
              <Input
                leadingIcon={<Search className="h-icon-md w-icon-md" />}
                placeholder="Search library, playlists, or commands…"
                trailing={<Kbd>⌘ K</Kbd>}
              />
            </div>

            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>select</div>
              <div className="flex flex-col gap-2">
                <Select defaultValue="bpm-asc">
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bpm-asc">Sort by · BPM ascending</SelectItem>
                    <SelectItem value="bpm-desc">Sort by · BPM descending</SelectItem>
                    <SelectItem value="title">Sort by · Title</SelectItem>
                  </SelectContent>
                </Select>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Disabled select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x">x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>textarea</div>
              <div className="flex flex-col gap-2">
                <Textarea defaultValue="Closing set for the warehouse — keep BPM under 124, lean dubby." />
                <Textarea
                  disabled
                  defaultValue="Disabled textarea — preserved formatting from the previous note."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>checkbox</div>
              <div className="flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 text-body text-text-primary">
                  <Checkbox defaultChecked /> on
                </label>
                <label className="flex items-center gap-2 text-body text-text-secondary">
                  <Checkbox /> off
                </label>
                <label className="flex items-center gap-2 text-body text-text-muted">
                  <Checkbox defaultChecked disabled /> disabled
                </label>
              </div>
            </div>

            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>radio</div>
              <RadioGroup defaultValue="a" className="flex flex-row items-center gap-5">
                <label className="flex items-center gap-2 text-body text-text-primary">
                  <Radio value="a" /> option A
                </label>
                <label className="flex items-center gap-2 text-body text-text-secondary">
                  <Radio value="b" /> option B
                </label>
                <label className="flex items-center gap-2 text-body text-text-muted">
                  <Radio value="c" disabled /> disabled
                </label>
              </RadioGroup>
            </div>

            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>switch</div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-body text-text-primary">
                  <Switch defaultChecked /> on
                </div>
                <div className="flex items-center gap-2 text-body text-text-secondary">
                  <Switch /> off
                </div>
                <div className="flex items-center gap-2 text-body text-text-muted">
                  <Switch defaultChecked disabled /> disabled
                </div>
              </div>
            </div>

            <div>
              <div className={cn(SECTION_HEADER, "mb-2")}>slider</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-icon-md w-icon-md text-text-muted" />
                  <Slider defaultValue={[62]} min={0} max={100} step={1} />
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="h-icon-md w-icon-md text-text-disabled" />
                  <Slider defaultValue={[62]} min={0} max={100} step={1} disabled />
                  <span className="w-meter-label-w text-right font-mono text-caption text-text-disabled">
                    62
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 06 — BADGES, CHIPS, KBD */}
      <Section num="06" title="Badges, chips & shortcuts">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex flex-col gap-2">
            <span className={SECTION_HEADER}>filter chip</span>
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
            <span className={SECTION_HEADER}>tag chip</span>
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
            <span className={SECTION_HEADER}>status pill</span>
            <div className="flex items-center gap-2">
              <StatusPill tone="success" label="library ready" />
              <StatusPill tone="warning" label="analyzing 12" />
              <StatusPill tone="danger" label="reload failed" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={SECTION_HEADER}>keyboard</span>
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
            <div className={cn(SECTION_HEADER, "mb-2")}>mini-player</div>
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
            <div className={cn(SECTION_HEADER, "mb-2")}>status bar</div>
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
    </div>
  );
}
