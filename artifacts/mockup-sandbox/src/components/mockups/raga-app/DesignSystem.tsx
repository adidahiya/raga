import React from "react";
import {
  Search,
  Play,
  Pause,
  Volume2,
  Filter,
  Activity,
  Zap,
  Star,
  ActivitySquare,
  RefreshCw,
  History,
  Music,
  FolderDot,
  Terminal,
  FolderTree,
  Settings,
  HardDrive,
  Library,
  HelpCircle,
  X,
  Check,
} from "lucide-react";

const TOKENS = {
  surface: {
    0: "#101114",
    1: "#16171a",
    2: "#1c1d22",
    3: "#23252b",
    4: "#2c2e35",
  },
  text: {
    primary: "#f5f5f7",
    secondary: "#c9cad0",
    muted: "#8b8d96",
    disabled: "#5a5c64",
  },
  border: {
    subtle: "rgba(255,255,255,0.05)",
    default: "rgba(255,255,255,0.09)",
    strong: "rgba(255,255,255,0.16)",
  },
  accent: {
    50: "#eef0ff",
    100: "#dde1ff",
    200: "#b8c0ff",
    300: "#8e9aff",
    400: "#6b78ff",
    500: "#5b6cff",
    600: "#4a59e6",
    700: "#3b48bf",
    800: "#2e3899",
    900: "#212973",
  },
  accent2: {
    50: "#fff1ec",
    100: "#ffe0d2",
    200: "#ffc7af",
    300: "#ffae93",
    400: "#ff9a7d",
    500: "#ff8a66",
    600: "#e26a48",
    700: "#cc5e3b",
    800: "#9c4426",
    900: "#6e2f17",
  },
  semantic: {
    success: "#4ade80",
    warning: "#fbbf24",
    danger: "#f87171",
    dangerHover: "#fa8585",
    info: "#60a5fa",
    idle: "#5a5c64",
  },
  fg: {
    onAccent: "#ffffff",
    onWarm: "#2a0e05",
    onDanger: "#1a0606",
  },
  overlay: {
    whiteSubtle: "rgba(255,255,255,0.04)",
    whiteSoft: "rgba(255,255,255,0.06)",
    whiteFill: "rgba(255,255,255,0.08)",
    blackScrim25: "rgba(0,0,0,0.25)",
    blackScrim30: "rgba(0,0,0,0.30)",
    blackScrim40: "rgba(0,0,0,0.40)",
    blackScrim50: "rgba(0,0,0,0.50)",
  },
  radius: { xs: 3, sm: 5, md: 8, lg: 12, xl: 16, pill: 999 },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
  size: {
    controlSm: 28,
    controlMd: 34,
    controlLg: 40,
    iconSm: 12,
    iconMd: 14,
    iconLg: 18,
    swatchH: 64,
    knob: 14,
    railThumb: 14,
    indicatorDot: 6,
  },
  type: {
    display:  { size: 32, leading: 1.15, weight: 600, family: "sans" as const, tracking: "-0.02em" },
    headline: { size: 20, leading: 1.25, weight: 600, family: "sans" as const, tracking: "-0.01em" },
    title:    { size: 15, leading: 1.35, weight: 600, family: "sans" as const, tracking: "0" },
    body:     { size: 13, leading: 1.55, weight: 400, family: "sans" as const, tracking: "0" },
    bodySm:   { size: 12, leading: 1.5,  weight: 400, family: "sans" as const, tracking: "0" },
    caption:  { size: 11, leading: 1.4,  weight: 500, family: "sans" as const, tracking: "0.01em" },
    micro:    { size: 10, leading: 1.3,  weight: 600, family: "sans" as const, tracking: "0.06em" },
    monoLg:   { size: 16, leading: 1.3,  weight: 500, family: "mono" as const, tracking: "0" },
    monoMd:   { size: 13, leading: 1.4,  weight: 500, family: "mono" as const, tracking: "0" },
    monoSm:   { size: 11, leading: 1.4,  weight: 500, family: "mono" as const, tracking: "0" },
    monoXs:   { size: 10, leading: 1.3,  weight: 600, family: "mono" as const, tracking: "0.12em" },
  },
  font: {
    sans: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", "IBM Plex Mono", "SF Mono", Menlo, monospace',
  },
} as const;

const T = TOKENS;

// --- contrast helpers ---
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h.length === 8
      ? h.slice(0, 6)
      : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
}
function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
function fmtRatio(n: number): string {
  return `${n.toFixed(2)}:1`;
}
function ratingFor(ratio: number): string {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA·lg";
  return "—";
}

const SURFACE_REF = T.surface[1];

const fontFamilyOf = (k: "sans" | "mono") =>
  k === "mono" ? T.font.mono : T.font.sans;

const Section = ({
  num,
  title,
  hint,
  children,
}: {
  num: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <section
    className="px-10 py-8"
    style={{ borderTop: `1px solid ${T.border.subtle}` }}
  >
    <div className="flex items-baseline gap-3 mb-6">
      <span
        className="font-mono text-[11px] tracking-[0.18em]"
        style={{ color: T.text.disabled }}
      >
        {num}
      </span>
      <h2
        className="text-[13px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: T.text.secondary }}
      >
        {title}
      </h2>
      {hint && (
        <span
          className="text-[12px] font-sans ml-2"
          style={{ color: T.text.muted }}
        >
          {hint}
        </span>
      )}
    </div>
    {children}
  </section>
);

const TokenLabel = ({ name, value }: { name: string; value?: string }) => (
  <div className="flex flex-col gap-0.5 mt-2">
    <span
      className="text-[11px] font-mono"
      style={{ color: T.text.secondary }}
    >
      {name}
    </span>
    {value && (
      <span
        className="text-[10px] font-mono"
        style={{ color: T.text.disabled }}
      >
        {value}
      </span>
    )}
  </div>
);

const Swatch = ({
  name,
  hex,
  textHex,
}: {
  name: string;
  hex: string;
  textHex?: string;
}) => {
  const ratio = contrastRatio(hex, SURFACE_REF);
  const rating = ratingFor(ratio);
  return (
    <div className="flex flex-col">
      <div
        className="w-full flex items-end p-2"
        style={{
          height: T.size.swatchH,
          background: hex,
          borderRadius: T.radius.sm,
          border: `1px solid ${T.border.subtle}`,
        }}
      >
        {textHex && (
          <span className="font-mono text-[10px]" style={{ color: textHex }}>
            Aa
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 mt-2">
        <span
          className="text-[11px] font-mono"
          style={{ color: T.text.secondary }}
        >
          {name}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: T.text.disabled }}
        >
          {hex}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: T.text.muted }}
        >
          {fmtRatio(ratio)} · {rating}
        </span>
      </div>
    </div>
  );
};

const RampSwatch = ({
  hex,
  k,
  showRatio,
}: {
  hex: string;
  k: number;
  showRatio?: boolean;
}) => {
  const ratio = contrastRatio(hex, SURFACE_REF);
  return (
    <div className="flex flex-col items-start flex-1">
      <div
        style={{
          background: hex,
          height: 36,
          width: "100%",
          borderRadius: T.radius.xs,
          border: `1px solid ${T.border.subtle}`,
        }}
      />
      <span
        className="text-[9px] font-mono mt-1"
        style={{ color: T.text.disabled }}
      >
        {k}
      </span>
      {showRatio && (
        <span
          className="text-[9px] font-mono"
          style={{ color: T.text.disabled }}
        >
          {fmtRatio(ratio)}
        </span>
      )}
    </div>
  );
};

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd
    className="pointer-events-none inline-flex h-5 select-none items-center justify-center gap-1 px-1.5 font-mono text-[10px] font-medium"
    style={{
      color: T.text.muted,
      background: T.overlay.whiteSubtle,
      border: `1px solid ${T.border.default}`,
      borderRadius: T.radius.xs,
      minWidth: 18,
    }}
  >
    {children}
  </kbd>
);

const StatusPill = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <div
    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium"
    style={{
      background: `${color}1f`,
      border: `1px solid ${color}33`,
      borderRadius: 999,
      color: color,
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 6px ${color}99` }}
    />
    {label}
  </div>
);

const Chip = ({
  children,
  removable,
  accent,
}: {
  children: React.ReactNode;
  removable?: boolean;
  accent?: boolean;
}) => (
  <div
    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono"
    style={{
      background: accent ? `${T.accent[500]}14` : T.overlay.whiteSubtle,
      border: `1px solid ${accent ? T.accent[500] + "40" : T.border.default}`,
      color: accent ? T.accent[300] : T.text.secondary,
      borderRadius: T.radius.sm,
    }}
  >
    {accent && <Filter size={10} />}
    {children}
    {removable && (
      <X
        size={10}
        style={{ color: T.text.muted, cursor: "pointer" }}
      />
    )}
  </div>
);

const Btn = ({
  variant = "primary",
  size = "md",
  state = "default",
  children,
  icon,
}: {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "warm";
  size?: "sm" | "md";
  state?: "default" | "hover" | "active" | "disabled" | "loading";
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const padY = size === "sm" ? "6px" : "8px";
  const padX = size === "sm" ? "10px" : "14px";
  const fontSize = size === "sm" ? 12 : 13;

  let bg: string = "transparent";
  let color: string = T.text.primary;
  let border: string = `1px solid transparent`;
  let shadow: string = "none";

  if (variant === "primary") {
    bg = T.accent[500];
    color = T.fg.onAccent;
    border = `1px solid ${T.accent[400]}`;
    shadow = `0 1px 0 ${T.accent[700]}, 0 4px 12px ${T.accent[500]}33`;
    if (state === "hover") bg = T.accent[400];
    if (state === "active") {
      bg = T.accent[600];
      shadow = `inset 0 1px 2px ${T.accent[800]}`;
    }
  } else if (variant === "secondary") {
    bg = T.overlay.whiteSoft;
    color = T.text.primary;
    border = `1px solid ${T.border.default}`;
    if (state === "hover") bg = T.overlay.whiteFill;
    if (state === "active") bg = T.overlay.whiteSubtle;
  } else if (variant === "ghost") {
    bg = "transparent";
    color = T.text.secondary;
    if (state === "hover") {
      bg = T.overlay.whiteSubtle;
      color = T.text.primary;
    }
  } else if (variant === "destructive") {
    bg = T.semantic.danger;
    color = T.fg.onDanger;
    border = `1px solid ${T.semantic.danger}`;
    shadow = `0 4px 12px ${T.semantic.danger}33`;
    if (state === "hover") bg = T.semantic.dangerHover;
  } else if (variant === "warm") {
    bg = T.accent2[500];
    color = T.fg.onWarm;
    border = `1px solid ${T.accent2[300]}`;
    shadow = `0 4px 12px ${T.accent2[500]}33`;
    if (state === "hover") bg = T.accent2[300];
  }

  return (
    <button
      disabled={state === "disabled"}
      className="inline-flex items-center justify-center gap-1.5 font-medium transition-colors whitespace-nowrap"
      style={{
        background: bg,
        color,
        border,
        boxShadow: shadow,
        padding: `${padY} ${padX}`,
        borderRadius: T.radius.sm,
        fontSize,
        fontFamily: T.font.sans,
        opacity: state === "disabled" ? 0.4 : 1,
        cursor: state === "disabled" ? "not-allowed" : "pointer",
      }}
    >
      {state === "loading" ? (
        <RefreshCw size={fontSize - 1} className="animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

const IconBtn = ({
  variant = "secondary",
  state = "default",
  size = "md",
  children,
}: {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "warm";
  state?: "default" | "hover" | "active" | "disabled" | "loading";
  size?: "sm" | "md";
  children: React.ReactNode;
}) => {
  const dim = size === "sm" ? T.size.controlSm : T.size.controlMd;
  let bg: string = "transparent";
  let color: string = T.text.secondary;
  let border: string = `1px solid transparent`;
  let shadow: string = "none";
  if (variant === "primary") {
    bg = T.accent[500];
    color = T.fg.onAccent;
    border = `1px solid ${T.accent[400]}`;
    shadow = `0 4px 12px ${T.accent[500]}33`;
    if (state === "hover") bg = T.accent[400];
    if (state === "active") bg = T.accent[600];
  } else if (variant === "secondary") {
    bg = T.overlay.whiteSoft;
    color = T.text.primary;
    border = `1px solid ${T.border.default}`;
    if (state === "hover") bg = T.overlay.whiteFill;
    if (state === "active") bg = T.overlay.whiteSubtle;
  } else if (variant === "ghost") {
    if (state === "hover") {
      bg = T.overlay.whiteSubtle;
      color = T.text.primary;
    }
  } else if (variant === "destructive") {
    bg = T.semantic.danger;
    color = T.fg.onDanger;
    border = `1px solid ${T.semantic.danger}`;
    if (state === "hover") bg = T.semantic.dangerHover;
  } else if (variant === "warm") {
    bg = T.accent2[500];
    color = T.fg.onWarm;
    border = `1px solid ${T.accent2[300]}`;
    if (state === "hover") bg = T.accent2[300];
  }
  return (
    <button
      disabled={state === "disabled"}
      className="inline-flex items-center justify-center"
      style={{
        width: dim,
        height: dim,
        background: bg,
        color,
        border,
        boxShadow: shadow,
        borderRadius: T.radius.sm,
        opacity: state === "disabled" ? 0.4 : 1,
        cursor: state === "disabled" ? "not-allowed" : "pointer",
      }}
    >
      {state === "loading" ? (
        <RefreshCw size={T.size.iconMd} className="animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

const TextInput = ({
  state = "default",
  placeholder,
  value,
  icon,
  trailing,
}: {
  state?: "default" | "focused" | "disabled";
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}) => (
  <div
    className="flex items-center gap-2 px-3"
    style={{
      height: 34,
      background: state === "disabled" ? T.surface[1] : T.surface[2],
      border: `1px solid ${
        state === "focused" ? T.accent[500] + "80" : T.border.default
      }`,
      boxShadow:
        state === "focused"
          ? `0 0 0 3px ${T.accent[500]}26`
          : "none",
      borderRadius: T.radius.sm,
      opacity: state === "disabled" ? 0.5 : 1,
    }}
  >
    {icon && <span style={{ color: T.text.muted }}>{icon}</span>}
    <input
      defaultValue={value}
      placeholder={placeholder}
      disabled={state === "disabled"}
      className="flex-1 bg-transparent outline-none text-[13px]"
      style={{
        color: T.text.primary,
        fontFamily: T.font.sans,
      }}
    />
    {trailing}
  </div>
);

const ColorRow = ({
  label,
  scale,
  keys,
}: {
  label: string;
  scale: Record<number, string>;
  keys: number[];
}) => (
  <div className="flex flex-col gap-2">
    <div className="text-[11px] font-mono" style={{ color: T.text.muted }}>
      {label}
    </div>
    <div className="flex gap-1">
      {keys.map((k) => (
        <RampSwatch key={k} k={k} hex={scale[k]} showRatio />
      ))}
    </div>
  </div>
);

type TypeKey = keyof typeof T.type;
const TypeRow = ({
  name,
  spec,
  sample,
}: {
  name: TypeKey;
  spec: (typeof T.type)[TypeKey];
  sample: string;
}) => (
  <div
    className="flex items-baseline gap-6 py-2"
    style={{ borderBottom: `1px dashed ${T.border.subtle}` }}
  >
    <div className="w-36 shrink-0">
      <div
        className="text-[11px] font-mono"
        style={{ color: T.text.secondary }}
      >
        {name}
      </div>
      <div
        className="text-[10px] font-mono mt-0.5"
        style={{ color: T.text.disabled }}
      >
        {spec.size}px · {Math.round(spec.size * spec.leading * 10) / 10}px lh · {spec.weight}
      </div>
    </div>
    <div
      className="flex-1 truncate"
      style={{
        fontFamily: fontFamilyOf(spec.family),
        fontSize: spec.size,
        fontWeight: spec.weight,
        lineHeight: spec.leading,
        letterSpacing: spec.tracking,
        color: T.text.primary,
      }}
    >
      {sample}
    </div>
  </div>
);

const TrackRow = ({
  selected,
  index,
  bpm,
  title,
  artist,
  genre,
  rating,
  ext,
  source,
}: {
  selected?: boolean;
  index: number;
  bpm: number;
  title: string;
  artist: string;
  genre: string;
  rating: number;
  ext: string;
  source: "Local" | "Swinsian";
}) => (
  <div
    className="grid items-center text-[12px] relative"
    style={{
      gridTemplateColumns: "40px 60px 1fr 180px 120px 80px 60px 80px",
      gap: 8,
      height: 34,
      padding: "0 12px",
      background: selected ? `${T.accent[500]}10` : "transparent",
      borderBottom: `1px solid ${T.border.subtle}`,
      fontFamily: T.font.mono,
    }}
  >
    {selected && (
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: 2,
          background: T.accent[500],
          boxShadow: `0 0 8px ${T.accent[500]}99`,
        }}
      />
    )}
    <div
      className="text-right"
      style={{ color: selected ? T.accent[300] : T.text.disabled }}
    >
      {index.toString().padStart(2, "0")}
    </div>
    <div
      className="text-right"
      style={{ color: selected ? T.accent[300] : T.semantic.success + "b3" }}
    >
      {bpm}
    </div>
    <div
      style={{
        color: selected ? T.text.primary : T.text.secondary,
        fontFamily: T.font.sans,
        fontWeight: selected ? 500 : 400,
      }}
    >
      {title}
    </div>
    <div
      style={{
        color: selected ? T.text.secondary : T.text.muted,
        fontFamily: T.font.sans,
      }}
    >
      {artist}
    </div>
    <div
      style={{
        color: selected ? T.text.muted : T.text.disabled,
        fontFamily: T.font.sans,
      }}
    >
      {genre}
    </div>
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={9}
          style={{
            color:
              i < rating
                ? selected
                  ? T.accent[400]
                  : T.text.secondary
                : T.surface[4],
            fill: i < rating ? "currentColor" : "none",
          }}
        />
      ))}
    </div>
    <div style={{ color: T.text.muted }}>{ext}</div>
    <div>
      <span
        className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold"
        style={{
          background:
            source === "Local"
              ? T.overlay.whiteSoft
              : `${T.accent2[500]}1a`,
          color: source === "Local" ? T.text.muted : T.accent2[300],
          borderRadius: T.radius.xs,
        }}
      >
        {source}
      </span>
    </div>
  </div>
);

const ElevationCard = ({
  level,
  hex,
  label,
  description,
}: {
  level: number;
  hex: string;
  label: string;
  description: string;
}) => (
  <div
    className="flex-1 p-4"
    style={{
      background: hex,
      borderRadius: T.radius.md,
      border: `1px solid ${T.border.default}`,
      boxShadow:
        level >= 3
          ? `0 ${level * 4}px ${level * 8}px ${T.overlay.blackScrim40}`
          : "none",
    }}
  >
    <div
      className="text-[11px] font-mono mb-1"
      style={{ color: T.text.muted }}
    >
      {label}
    </div>
    <div
      className="text-[13px] font-medium mb-1"
      style={{ color: T.text.primary }}
    >
      Surface {level}
    </div>
    <div
      className="text-[11px]"
      style={{ color: T.text.muted, fontFamily: T.font.sans }}
    >
      {description}
    </div>
    <div
      className="text-[10px] font-mono mt-2"
      style={{ color: T.text.disabled }}
    >
      {hex}
    </div>
  </div>
);

const Toggle = ({ on, disabled }: { on?: boolean; disabled?: boolean }) => (
  <div
    className="relative transition-colors"
    style={{
      opacity: disabled ? 0.4 : 1,
      width: 32,
      height: 18,
      borderRadius: 999,
      background: on ? T.accent[500] : T.overlay.whiteFill,
      border: `1px solid ${on ? T.accent[400] : T.border.default}`,
    }}
  >
    <div
      className="absolute top-[1px] transition-all"
      style={{
        left: on ? 14 : 1,
        width: 14,
        height: 14,
        borderRadius: 999,
        background: T.fg.onAccent,
        boxShadow: `0 1px 2px ${T.overlay.blackScrim40}`,
      }}
    />
  </div>
);

const Checkbox = ({
  checked,
  disabled,
  focused,
}: {
  checked?: boolean;
  disabled?: boolean;
  focused?: boolean;
}) => (
  <div
    className="flex items-center justify-center"
    style={{
      opacity: disabled ? 0.4 : 1,
      width: 16,
      height: 16,
      borderRadius: T.radius.xs,
      background: checked ? T.accent[500] : T.overlay.whiteSubtle,
      border: `1px solid ${
        focused ? T.accent[400] : checked ? T.accent[400] : T.border.default
      }`,
      boxShadow: focused ? `0 0 0 3px ${T.accent[500]}26` : "none",
    }}
  >
    {checked && <Check size={11} color={T.fg.onAccent} strokeWidth={3} />}
  </div>
);

const Radio = ({
  checked,
  disabled,
  focused,
}: {
  checked?: boolean;
  disabled?: boolean;
  focused?: boolean;
}) => (
  <div
    className="flex items-center justify-center"
    style={{
      opacity: disabled ? 0.4 : 1,
      width: 16,
      height: 16,
      borderRadius: 999,
      background: T.overlay.whiteSubtle,
      border: `1px solid ${
        focused ? T.accent[400] : checked ? T.accent[500] : T.border.default
      }`,
      boxShadow: focused ? `0 0 0 3px ${T.accent[500]}26` : "none",
    }}
  >
    {checked && (
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: T.accent[500],
        }}
      />
    )}
  </div>
);

const Slider = ({
  pct = 0.45,
  disabled,
  focused,
}: {
  pct?: number;
  disabled?: boolean;
  focused?: boolean;
}) => (
  <div
    className="relative h-1.5 w-full"
    style={{
      opacity: disabled ? 0.4 : 1,
      background: T.overlay.whiteSoft,
      borderRadius: 999,
      boxShadow: focused ? `0 0 0 3px ${T.accent[500]}26` : "none",
    }}
  >
    <div
      className="absolute top-0 left-0 h-full"
      style={{
        width: `${pct * 100}%`,
        background: T.accent[500],
        borderRadius: 999,
      }}
    />
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{
        left: `${pct * 100}%`,
        marginLeft: -7,
        width: 14,
        height: 14,
        borderRadius: 999,
        background: T.fg.onAccent,
        border: `1px solid ${T.accent[400]}`,
        boxShadow: `0 0 0 3px ${T.accent[500]}33`,
      }}
    />
  </div>
);

const PaletteResultRow = ({
  selected,
  icon,
  label,
  meta,
  shortcut,
  iconColor,
}: {
  selected?: boolean;
  icon: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  shortcut?: React.ReactNode;
  iconColor?: string;
}) => (
  <div
    className="flex items-center px-3 py-2 text-[12.5px] relative cursor-pointer transition-colors"
    style={{
      background: selected ? `${T.accent[500]}1c` : "transparent",
      color: selected ? T.accent[100] : T.text.secondary,
      borderRadius: T.radius.md,
      fontFamily: T.font.sans,
    }}
  >
    {selected && (
      <div
        className="absolute left-0 top-1.5 bottom-1.5"
        style={{ width: 2, background: T.accent[500], borderRadius: 1 }}
      />
    )}
    <span
      className="mr-3 flex items-center"
      style={{ color: iconColor || (selected ? T.accent[300] : T.text.muted) }}
    >
      {icon}
    </span>
    <span className="font-medium">{label}</span>
    <div className="ml-auto flex items-center gap-2">
      {meta && (
        <span
          className="text-[11px] font-mono"
          style={{ color: selected ? T.accent[300] : T.text.disabled }}
        >
          {meta}
        </span>
      )}
      {shortcut}
    </div>
  </div>
);

export function DesignSystem() {
  return (
    <div
      className="h-screen w-full overflow-auto"
      style={{
        background: T.surface[1],
        color: T.text.secondary,
        fontFamily: T.font.sans,
      }}
    >
      {/* HEADER */}
      <header
        className="px-10 pt-10 pb-8"
        style={{ background: T.surface[1] }}
      >
        <div className="flex items-baseline gap-4">
          <div
            className="w-9 h-9 flex items-center justify-center font-bold font-mono text-base"
            style={{
              background: T.accent[500],
              color: T.fg.onAccent,
              borderRadius: T.radius.md,
              boxShadow: `0 0 20px ${T.accent[500]}66`,
            }}
          >
            R
          </div>
          <div>
            <h1
              className="text-[24px] font-semibold tracking-tight"
              style={{ color: T.text.primary }}
            >
              Raga Design System
            </h1>
            <p
              className="text-[13px] mt-1"
              style={{ color: T.text.muted }}
            >
              v0.1 · Derived from CommandBar — Floating Refined · brighter base, friendlier accent, keyboard-first
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Chip>tokens · 64</Chip>
            <Chip>components · 18</Chip>
            <Chip accent>dark · v0.1</Chip>
          </div>
        </div>
      </header>

      {/* 01 — COLOR */}
      <Section
        num="01"
        title="Color"
        hint="Surfaces are slightly cool-neutral and a touch brighter than near-black. The accent ramp is a vivid iris-blue; a warm coral is reserved for friendly emphasis."
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <div
              className="text-[11px] font-mono mb-3"
              style={{ color: T.text.muted }}
            >
              Surface scale
            </div>
            <div className="grid grid-cols-5 gap-3">
              <Swatch name="surface-0" hex={T.surface[0]} textHex={T.text.muted} />
              <Swatch name="surface-1" hex={T.surface[1]} textHex={T.text.muted} />
              <Swatch name="surface-2" hex={T.surface[2]} textHex={T.text.secondary} />
              <Swatch name="surface-3" hex={T.surface[3]} textHex={T.text.secondary} />
              <Swatch name="surface-4" hex={T.surface[4]} textHex={T.text.primary} />
            </div>

            <div
              className="text-[11px] font-mono mb-3 mt-6"
              style={{ color: T.text.muted }}
            >
              Text & border on surface-1
            </div>
            <div
              className="grid grid-cols-2 gap-3 p-4"
              style={{
                background: T.surface[1],
                border: `1px solid ${T.border.default}`,
                borderRadius: T.radius.md,
              }}
            >
              <div>
                <div style={{ color: T.text.primary, fontSize: 14 }}>
                  text-primary
                </div>
                <div style={{ color: T.text.secondary, fontSize: 13 }}>
                  text-secondary
                </div>
                <div style={{ color: T.text.muted, fontSize: 12 }}>
                  text-muted
                </div>
                <div style={{ color: T.text.disabled, fontSize: 12 }}>
                  text-disabled
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className="text-[11px]"
                  style={{
                    color: T.text.muted,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${T.border.subtle}`,
                  }}
                >
                  border-subtle
                </div>
                <div
                  className="text-[11px]"
                  style={{
                    color: T.text.muted,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${T.border.default}`,
                  }}
                >
                  border-default
                </div>
                <div
                  className="text-[11px]"
                  style={{
                    color: T.text.muted,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${T.border.strong}`,
                  }}
                >
                  border-strong
                </div>
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
              <div
                className="text-[11px] font-mono mb-2"
                style={{ color: T.text.muted }}
              >
                Semantic
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill color={T.semantic.success} label="ready" />
                <StatusPill color={T.semantic.warning} label="analyzing" />
                <StatusPill color={T.semantic.danger} label="error" />
                <StatusPill color={T.semantic.info} label="info" />
                <StatusPill color={T.semantic.idle} label="idle" />
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
            <div
              className="text-[11px] font-mono mb-2"
              style={{ color: T.text.muted }}
            >
              Sans · Inter
            </div>
            <TypeRow name="display"  spec={T.type.display}  sample="House Sets 2025" />
            <TypeRow name="headline" spec={T.type.headline} sample="Tonight's set, sorted by energy" />
            <TypeRow name="title"    spec={T.type.title}    sample="Selected Ambient Works 85–92" />
            <TypeRow name="body"     spec={T.type.body}     sample="Drag a folder here to start your library." />
            <TypeRow name="bodySm"   spec={T.type.bodySm}   sample="245 tracks · last analyzed 10m ago" />
            <TypeRow name="caption"  spec={T.type.caption}  sample="Updated automatically" />
            <TypeRow name="micro"    spec={T.type.micro}    sample="OVERLINE · LABEL · TINY" />
          </div>
          <div>
            <div
              className="text-[11px] font-mono mb-2"
              style={{ color: T.text.muted }}
            >
              Mono · JetBrains Mono
            </div>
            <TypeRow name="monoLg" spec={T.type.monoLg} sample="BPM 124.5" />
            <TypeRow name="monoMd" spec={T.type.monoMd} sample="Autechre — VLetrmx" />
            <TypeRow name="monoSm" spec={T.type.monoSm} sample="12,847 tracks · 0.3 GB index" />
            <TypeRow name="monoXs" spec={T.type.monoXs} sample="LIBRARY · ANALYZER · EXPORT" />
            <div className="mt-6">
              <div
                className="text-[11px] font-mono mb-2"
                style={{ color: T.text.muted }}
              >
                Sample paragraph
              </div>
              <p
                style={{
                  color: T.text.secondary,
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                Raga is a keyboard-first crate digger. Hit{" "}
                <Kbd>⌘</Kbd> <Kbd>K</Kbd> from anywhere to filter, jump, or
                trigger any action. The interface stays out of the way so you
                can focus on the music.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 03 — SPACING & RADIUS */}
      <Section num="03" title="Spacing & Radius">
        <div className="grid grid-cols-2 gap-10">
          <div>
            <div
              className="text-[11px] font-mono mb-3"
              style={{ color: T.text.muted }}
            >
              Spacing scale (px)
            </div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(T.spacing).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <span
                    className="w-12 text-[11px] font-mono"
                    style={{ color: T.text.muted }}
                  >
                    space-{k}
                  </span>
                  <div
                    style={{
                      width: v,
                      height: 12,
                      background: T.accent[500],
                      borderRadius: 2,
                    }}
                  />
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: T.text.disabled }}
                  >
                    {v}px
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div
              className="text-[11px] font-mono mb-3"
              style={{ color: T.text.muted }}
            >
              Radius scale (px)
            </div>
            <div className="flex items-end gap-4">
              {Object.entries(T.radius).map(([k, v]) => (
                <div key={k} className="flex flex-col items-center gap-2">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      background: T.surface[3],
                      border: `1px solid ${T.border.default}`,
                      borderRadius: v,
                    }}
                  />
                  <div
                    className="text-[10px] font-mono"
                    style={{ color: T.text.secondary }}
                  >
                    radius-{k}
                  </div>
                  <div
                    className="text-[9px] font-mono"
                    style={{ color: T.text.disabled }}
                  >
                    {v}px
                  </div>
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
          {(["default", "hover", "active", "disabled", "loading"] as const).map(
            (state) => (
              <div key={state} className="flex flex-col gap-3">
                <div
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: T.text.disabled }}
                >
                  {state}
                </div>
                <Btn variant="primary" state={state} icon={<Play size={12} />}>
                  Play set
                </Btn>
                <Btn variant="secondary" state={state}>
                  Open folder
                </Btn>
                <Btn variant="warm" state={state} icon={<Zap size={12} />}>
                  Analyze
                </Btn>
                <Btn variant="ghost" state={state}>
                  Cancel
                </Btn>
                <Btn variant="destructive" state={state} icon={<X size={12} />}>
                  Remove
                </Btn>
                <IconBtn variant="primary" state={state}>
                  <Play size={T.size.iconMd} fill="currentColor" />
                </IconBtn>
                <IconBtn variant="secondary" state={state}>
                  <Settings size={T.size.iconMd} />
                </IconBtn>
                <IconBtn variant="ghost" state={state}>
                  <Filter size={T.size.iconMd} />
                </IconBtn>
                <IconBtn variant="destructive" state={state}>
                  <X size={T.size.iconMd} />
                </IconBtn>
                <IconBtn variant="warm" state={state}>
                  <Zap size={T.size.iconMd} />
                </IconBtn>
              </div>
            )
          )}
        </div>

        <div
          className="flex items-center gap-3 mt-8 pt-6"
          style={{ borderTop: `1px solid ${T.border.subtle}` }}
        >
          <span
            className="text-[10px] font-mono uppercase tracking-wider mr-2"
            style={{ color: T.text.disabled }}
          >
            sizes
          </span>
          <Btn size="sm" variant="primary">
            Small
          </Btn>
          <Btn size="md" variant="primary">
            Medium
          </Btn>
          <Btn size="sm" variant="secondary" icon={<Filter size={11} />}>
            With icon
          </Btn>
          <button
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              background: T.overlay.whiteSoft,
              border: `1px solid ${T.border.default}`,
              borderRadius: T.radius.sm,
              color: T.text.secondary,
            }}
          >
            <Settings size={14} />
          </button>
          <button
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              background: T.accent[500],
              border: `1px solid ${T.accent[400]}`,
              borderRadius: T.radius.sm,
              color: T.fg.onAccent,
              boxShadow: `0 4px 12px ${T.accent[500]}33`,
            }}
          >
            <Play size={14} className="ml-0.5" fill="currentColor" />
          </button>
        </div>
      </Section>

      {/* 05 — INPUTS */}
      <Section num="05" title="Form Controls">
        <div className="grid grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                text inputs
              </div>
              <div className="flex flex-col gap-2">
                <TextInput placeholder="Folder name…" />
                <TextInput
                  state="focused"
                  value="House Sets 2025"
                />
                <TextInput state="disabled" value="Read-only field" />
              </div>
            </div>

            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                search with shortcut
              </div>
              <TextInput
                icon={<Search size={14} />}
                placeholder="Search library, playlists, or commands…"
                trailing={<Kbd>⌘ K</Kbd>}
              />
            </div>

            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                select · default / focused / disabled
              </div>
              <div className="flex flex-col gap-2">
                {(["default", "focused", "disabled"] as const).map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between px-3"
                    style={{
                      height: T.size.controlMd,
                      background:
                        s === "disabled" ? T.surface[1] : T.surface[2],
                      border: `1px solid ${
                        s === "focused" ? T.accent[500] + "80" : T.border.default
                      }`,
                      boxShadow:
                        s === "focused" ? `0 0 0 3px ${T.accent[500]}26` : "none",
                      borderRadius: T.radius.sm,
                      color: T.text.primary,
                      fontSize: T.type.body.size,
                      opacity: s === "disabled" ? 0.5 : 1,
                    }}
                  >
                    <span>Sort by · BPM ascending</span>
                    <span style={{ color: T.text.muted }}>▾</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                textarea · default / focused / disabled
              </div>
              <div className="flex flex-col gap-2">
                {(["default", "focused", "disabled"] as const).map((s) => (
                  <div
                    key={s}
                    className="px-3 py-2"
                    style={{
                      background:
                        s === "disabled" ? T.surface[1] : T.surface[2],
                      border: `1px solid ${
                        s === "focused" ? T.accent[500] + "80" : T.border.default
                      }`,
                      boxShadow:
                        s === "focused" ? `0 0 0 3px ${T.accent[500]}26` : "none",
                      borderRadius: T.radius.sm,
                      color: T.text.secondary,
                      fontSize: T.type.body.size,
                      lineHeight: T.type.body.leading,
                      minHeight: 56,
                      fontFamily: T.font.sans,
                      opacity: s === "disabled" ? 0.5 : 1,
                    }}
                  >
                    Closing set for the warehouse — keep BPM under 124, lean dubby.
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                checkbox · default / focused / disabled
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.primary }}>
                  <Checkbox checked /> on
                </label>
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.secondary }}>
                  <Checkbox /> off
                </label>
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.primary }}>
                  <Checkbox checked focused /> focused
                </label>
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.muted }}>
                  <Checkbox checked disabled /> disabled
                </label>
              </div>
            </div>

            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                radio · default / focused / disabled
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.primary }}>
                  <Radio checked /> on
                </label>
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.secondary }}>
                  <Radio /> off
                </label>
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.primary }}>
                  <Radio checked focused /> focused
                </label>
                <label className="flex items-center gap-2 text-[13px]" style={{ color: T.text.muted }}>
                  <Radio checked disabled /> disabled
                </label>
              </div>
            </div>

            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                switch · default / focused / disabled
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: T.text.primary }}>
                  <Toggle on /> on
                </div>
                <div className="flex items-center gap-2 text-[13px]" style={{ color: T.text.secondary }}>
                  <Toggle /> off
                </div>
                <div className="flex items-center gap-2 text-[13px]" style={{ color: T.text.muted }}>
                  <Toggle on disabled /> disabled
                </div>
              </div>
            </div>

            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: T.text.disabled }}
              >
                slider · default / focused / disabled
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Volume2 size={T.size.iconMd} style={{ color: T.text.muted }} />
                  <div className="flex-1">
                    <Slider pct={0.62} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={T.size.iconMd} style={{ color: T.accent[300] }} />
                  <div className="flex-1">
                    <Slider pct={0.62} focused />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={T.size.iconMd} style={{ color: T.text.disabled }} />
                  <div className="flex-1">
                    <Slider pct={0.62} disabled />
                  </div>
                  <span
                    className="text-[11px] font-mono w-8 text-right"
                    style={{ color: T.text.disabled }}
                  >
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
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: T.text.disabled }}
            >
              filter chip
            </span>
            <div className="flex items-center gap-2">
              <Chip accent>BPM &gt; 120</Chip>
              <Chip accent>Genre · House</Chip>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: T.text.disabled }}
            >
              tag chip
            </span>
            <div className="flex items-center gap-2">
              <Chip removable>House</Chip>
              <Chip removable>Late-night</Chip>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: T.text.disabled }}
            >
              status pill
            </span>
            <div className="flex items-center gap-2">
              <StatusPill color={T.semantic.success} label="library ready" />
              <StatusPill color={T.semantic.warning} label="analyzing 12" />
              <StatusPill color={T.semantic.danger} label="reload failed" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: T.text.disabled }}
            >
              keyboard
            </span>
            <div className="flex items-center gap-1.5">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span style={{ color: T.text.muted }} className="text-[11px] mx-1">
                command
              </span>
              <Kbd>J</Kbd>
              <Kbd>K</Kbd>
              <span style={{ color: T.text.muted }} className="text-[11px] mx-1">
                nav
              </span>
              <Kbd>Space</Kbd>
              <span style={{ color: T.text.muted }} className="text-[11px] ml-1">
                play
              </span>
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

      {/* 08 — TRACK ROW PREVIEW */}
      <Section num="08" title="Track row · in context">
        <div
          style={{
            background: T.surface[1],
            border: `1px solid ${T.border.default}`,
            borderRadius: T.radius.md,
            overflow: "hidden",
          }}
        >
          <div
            className="grid items-center text-[10px] uppercase tracking-wider font-semibold"
            style={{
              gridTemplateColumns: "40px 60px 1fr 180px 120px 80px 60px 80px",
              gap: 8,
              padding: "8px 12px",
              background: T.surface[2],
              color: T.text.muted,
              fontFamily: T.font.mono,
              borderBottom: `1px solid ${T.border.default}`,
            }}
          >
            <div className="text-right">#</div>
            <div className="text-right">BPM</div>
            <div>Title</div>
            <div>Artist</div>
            <div>Genre</div>
            <div>Rating</div>
            <div>Ext</div>
            <div>Source</div>
          </div>
          <TrackRow
            index={1}
            bpm={124}
            title="VLetrmx"
            artist="Autechre"
            genre="IDM"
            rating={5}
            ext="FLAC"
            source="Local"
          />
          <TrackRow
            selected
            index={2}
            bpm={123}
            title="One More Time"
            artist="Daft Punk"
            genre="House"
            rating={5}
            ext="FLAC"
            source="Swinsian"
          />
          <TrackRow
            index={3}
            bpm={128}
            title="Strobe"
            artist="deadmau5"
            genre="Progressive House"
            rating={4}
            ext="MP3"
            source="Local"
          />
          <TrackRow
            index={4}
            bpm={140}
            title="Born Slippy (Nuxx)"
            artist="Underworld"
            genre="Techno"
            rating={5}
            ext="WAV"
            source="Swinsian"
          />
        </div>
      </Section>

      {/* 09 — COMMAND PALETTE */}
      <Section
        num="09"
        title="Command palette"
        hint="surface-3 with a soft scrim. Selected row uses accent left-bar + tinted fill."
      >
        <div className="flex gap-8">
          <div
            className="flex-1 p-8 flex items-start justify-center relative"
            style={{
              background: `linear-gradient(180deg, ${T.surface[0]} 0%, ${T.surface[1]} 100%)`,
              borderRadius: T.radius.lg,
              border: `1px solid ${T.border.subtle}`,
              minHeight: 380,
            }}
          >
            <div
              className="w-full max-w-[520px] flex flex-col overflow-hidden"
              style={{
                background: T.surface[3],
                border: `1px solid ${T.border.strong}`,
                borderRadius: T.radius.lg,
                boxShadow: `0 24px 48px ${T.overlay.blackScrim50}, 0 0 0 1px ${T.overlay.blackScrim40}`,
              }}
            >
              <div
                className="flex items-center px-4"
                style={{ borderBottom: `1px solid ${T.border.default}` }}
              >
                <Search
                  className="mr-3 shrink-0"
                  size={18}
                  style={{ color: T.accent[400] }}
                />
                <input
                  className="flex-1 bg-transparent outline-none py-3.5 text-[14px]"
                  style={{ color: T.text.primary }}
                  defaultValue="House"
                  placeholder="Search library, playlists, or commands…"
                />
              </div>
              <div className="p-2 flex flex-col gap-0.5">
                <div
                  className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
                  style={{ color: T.text.disabled }}
                >
                  Recent
                </div>
                <PaletteResultRow
                  icon={<History size={15} />}
                  label={
                    <>
                      Export <span style={{ color: T.text.muted }}>"House Sets 2025"</span>
                    </>
                  }
                  meta="10m ago"
                />
                <div
                  className="px-3 py-2 mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
                  style={{ color: T.text.disabled }}
                >
                  Playlists
                </div>
                <PaletteResultRow
                  selected
                  icon={<FolderDot size={15} />}
                  label="House Sets 2025"
                  meta="245 tracks"
                  shortcut={<Kbd>↵</Kbd>}
                />
                <PaletteResultRow
                  icon={<Music size={15} />}
                  label="Deep House Classics"
                  meta="112 tracks"
                />
                <div
                  className="px-3 py-2 mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
                  style={{ color: T.text.disabled }}
                >
                  Actions
                </div>
                <PaletteResultRow
                  icon={<ActivitySquare size={15} />}
                  iconColor={T.accent2[500]}
                  label="Analyze BPM for filtered tracks"
                  shortcut={
                    <span className="flex gap-1">
                      <Kbd>⌘</Kbd>
                      <Kbd>⇧</Kbd>
                      <Kbd>A</Kbd>
                    </span>
                  }
                />
              </div>
              <div
                className="flex items-center justify-end gap-4 px-4 py-2"
                style={{
                  borderTop: `1px solid ${T.border.default}`,
                  background: T.overlay.blackScrim25,
                  color: T.text.muted,
                  fontSize: 10,
                  fontFamily: T.font.mono,
                }}
              >
                <span className="flex items-center gap-1.5">
                  <Kbd>↵</Kbd> open
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>⌘</Kbd>
                  <Kbd>↵</Kbd> open in new
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>esc</Kbd> close
                </span>
              </div>
            </div>
          </div>

          {/* Annotations */}
          <div className="w-64 flex flex-col gap-4 pt-4">
            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-1"
                style={{ color: T.text.disabled }}
              >
                surface
              </div>
              <div className="text-[12px]" style={{ color: T.text.secondary }}>
                surface-3 / radius-lg / border-strong
              </div>
            </div>
            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-1"
                style={{ color: T.text.disabled }}
              >
                section header
              </div>
              <div className="text-[12px]" style={{ color: T.text.secondary }}>
                mono-xs / text-disabled / 0.18em tracking
              </div>
            </div>
            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-1"
                style={{ color: T.text.disabled }}
              >
                selected row
              </div>
              <div className="text-[12px]" style={{ color: T.text.secondary }}>
                accent-500 @ 11% fill + 2px left bar + accent-100 text
              </div>
            </div>
            <div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-1"
                style={{ color: T.text.disabled }}
              >
                action icon
              </div>
              <div className="text-[12px]" style={{ color: T.text.secondary }}>
                accent2 (warm coral) — friendly emphasis only
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 10 — APP CHROME SLICES */}
      <Section num="10" title="App chrome · mini-player & status bar">
        <div className="flex flex-col gap-6">
          {/* Mini player */}
          <div>
            <div
              className="text-[10px] font-mono uppercase tracking-wider mb-2"
              style={{ color: T.text.disabled }}
            >
              mini-player
            </div>
            <div
              className="inline-flex items-center gap-4 pl-1 pr-4 py-1"
              style={{
                background: T.surface[2],
                border: `1px solid ${T.border.default}`,
                borderRadius: 999,
                boxShadow: `0 4px 16px ${T.overlay.blackScrim30}`,
              }}
            >
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{
                  background: T.accent[500],
                  color: T.fg.onAccent,
                  boxShadow: `0 0 12px ${T.accent[500]}66`,
                }}
              >
                <Play size={13} className="ml-0.5" fill="currentColor" />
              </button>
              <div className="flex flex-col w-52">
                <span
                  className="text-[12px] font-medium leading-tight truncate"
                  style={{ color: T.text.primary }}
                >
                  Autechre — VLetrmx
                </span>
                <div className="flex items-center gap-2 h-3 mt-1">
                  <span
                    className="text-[10px] font-mono leading-none"
                    style={{ color: T.accent[300] }}
                  >
                    124
                  </span>
                  <div className="flex-1 flex items-end gap-[1px] h-full opacity-80">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 2,
                          height: `${Math.max(20, ((i * 37) % 100))}%`,
                          background: T.accent[500],
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[9px] font-mono leading-none"
                    style={{ color: T.text.disabled }}
                  >
                    2:45
                  </span>
                </div>
              </div>
              <div
                className="w-px h-6"
                style={{ background: T.border.default }}
              />
              <Volume2 size={14} style={{ color: T.text.muted }} />
            </div>
          </div>

          {/* Status bar */}
          <div>
            <div
              className="text-[10px] font-mono uppercase tracking-wider mb-2"
              style={{ color: T.text.disabled }}
            >
              status bar
            </div>
            <div
              className="flex items-center justify-between px-4"
              style={{
                height: 28,
                background: T.surface[0],
                border: `1px solid ${T.border.default}`,
                borderRadius: T.radius.sm,
                fontFamily: T.font.mono,
                fontSize: 10,
                color: T.text.muted,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: T.semantic.success,
                      boxShadow: `0 0 4px ${T.semantic.success}66`,
                    }}
                  />
                  <span>Library: 12,847 tracks</span>
                </div>
                <div className="w-px h-3" style={{ background: T.border.default }} />
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: T.semantic.idle }}
                  />
                  <span>Analyzer: idle</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <Kbd>J</Kbd>
                  <Kbd>K</Kbd>
                  <span className="opacity-70">nav</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd>Space</Kbd>
                  <span className="opacity-70">play</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                  <span className="opacity-70">command</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 11 — ICONOGRAPHY */}
      <Section
        num="11"
        title="Iconography"
        hint="Lucide, 18px in nav, 14px inline. Default text-secondary; accent-400 when active."
      >
        <div className="grid grid-cols-12 gap-3">
          {[
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
          ].map(({ I, label, accent }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-3"
              style={{
                background: T.surface[2],
                border: `1px solid ${T.border.subtle}`,
                borderRadius: T.radius.sm,
              }}
            >
              <I
                size={18}
                style={{
                  color: accent ? T.accent[400] : T.text.secondary,
                }}
              />
              <span
                className="text-[10px] font-mono"
                style={{ color: T.text.disabled }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <footer
        className="px-10 py-6 mt-4 flex items-center justify-between"
        style={{
          borderTop: `1px solid ${T.border.subtle}`,
          background: T.surface[0],
          fontFamily: T.font.mono,
          fontSize: 10,
          color: T.text.disabled,
        }}
      >
        <div>raga · design system spec sheet · all values from a single TOKENS object</div>
        <div className="flex items-center gap-4">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span style={{ color: T.text.muted }}>tweak a token, the whole sheet updates</span>
        </div>
      </footer>
    </div>
  );
}

export default DesignSystem;
