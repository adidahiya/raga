/**
 * Single source of truth for the Raga visual language.
 *
 * `src/styles/tokens.css` is generated from this file by
 * `scripts/generate-tokens-css.ts`. Do not edit `tokens.css` by hand.
 * The kitchen-sink page reads tokens from this file at runtime, while
 * component markup uses Tailwind utilities that resolve to the matching
 * CSS variables emitted into `tokens.css`.
 */
export const TOKENS = {
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
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40 },
  size: {
    controlSm: 28,
    controlMd: 34,
    controlLg: 40,
    iconXs: 10,
    iconSm: 12,
    iconMd: 14,
    iconLg: 18,
    swatchH: 64,
    knob: 14,
    railThumb: 14,
    indicatorDot: 6,
    switchH: 18,
    switchW: 32,
    switchThumb: 14,
    railH: 6,
    statusDot: 6,
    meterRowH: 12,
    meterLabelW: 32,
    selectMinW: 128,
    kbdMinW: 18,
    avatarMd: 36,
    iconPill: 32,
    miniPlayerW: 208,
    focusRing: 3,
    elevationSurfaceH: 56,
    radiusSwatchH: 56,
    checkbox: 16,
    checkmark: 12,
    radio: 16,
    radioDot: 8,
    kbdH: 20,
    textareaMinH: 56,
    specLabelW: 144,
    meterNumW: 48,
    spectrumBarW: 2,
    separatorMdH: 24,
    sliderTrackH: 6,
    sectionPx: 40,
    sectionPy: 32,
    cardP: 16,
    pillPx: 8,
    pillPy: 2,
    pillGap: 6,
    controlPx: 12,
    controlPy: 8,
    tooltipPx: 8,
    tooltipPy: 4,
    selectItemPy: 6,
    selectItemPl: 28,
    selectItemPr: 8,
    kbdPx: 6,
    controlGap: 6,
    buttonPxSm: 10,
    buttonPxMd: 14,
    buttonPxLg: 16,
    iconNudge: 2,
    popoverOffset: 4,
    tooltipOffset: 6,
    popoverP: 4,
    separatorThickness: 1,
  },
  spectrumBar: { minPct: 20, stride: 37, range: 100 },
  type: {
    display: { size: 32, leading: 1.15, weight: 600, family: "sans", tracking: "-0.02em" },
    headline: { size: 20, leading: 1.25, weight: 600, family: "sans", tracking: "-0.01em" },
    title: { size: 15, leading: 1.35, weight: 600, family: "sans", tracking: "0" },
    body: { size: 13, leading: 1.55, weight: 400, family: "sans", tracking: "0" },
    bodySm: { size: 12, leading: 1.5, weight: 400, family: "sans", tracking: "0" },
    caption: { size: 11, leading: 1.4, weight: 500, family: "sans", tracking: "0.01em" },
    micro: { size: 10, leading: 1.3, weight: 600, family: "sans", tracking: "0.06em" },
    nano: { size: 9, leading: 1.3, weight: 600, family: "sans", tracking: "0.04em" },
    h1: { size: 24, leading: 1.2, weight: 600, family: "sans", tracking: "-0.01em" },
    h2: { size: 16, leading: 1.3, weight: 600, family: "sans", tracking: "0" },
    monoLg: { size: 16, leading: 1.3, weight: 500, family: "mono", tracking: "0" },
    monoMd: { size: 13, leading: 1.4, weight: 500, family: "mono", tracking: "0" },
    monoSm: { size: 11, leading: 1.4, weight: 500, family: "mono", tracking: "0" },
    monoXs: { size: 10, leading: 1.3, weight: 600, family: "mono", tracking: "0.12em" },
  },
  font: {
    sans: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", "IBM Plex Mono", "SF Mono", Menlo, monospace',
  },
  tracking: {
    label: "0.18em",
    header: "0.16em",
  },
  shadow: {
    buttonPrimary:
      "0 1px 0 var(--accent-700), 0 4px 12px color-mix(in srgb, var(--accent-500) 20%, transparent)",
    buttonWarm: "0 4px 12px color-mix(in srgb, var(--accent2-500) 20%, transparent)",
    buttonDanger: "0 4px 12px color-mix(in srgb, var(--semantic-danger) 20%, transparent)",
    knobGlow: "0 0 0 3px color-mix(in srgb, var(--accent-500) 20%, transparent)",
    switchThumb: "0 1px 2px var(--overlay-black-scrim-40)",
    pillSuccess: "0 0 6px color-mix(in srgb, var(--semantic-success) 60%, transparent)",
    pillWarning: "0 0 6px color-mix(in srgb, var(--semantic-warning) 60%, transparent)",
    pillDanger: "0 0 6px color-mix(in srgb, var(--semantic-danger) 60%, transparent)",
    pillInfo: "0 0 6px color-mix(in srgb, var(--semantic-info) 60%, transparent)",
    tooltip: "0 8px 24px var(--overlay-black-scrim-40)",
    popover: "0 24px 48px var(--overlay-black-scrim-50)",
    cardElevated: "0 4px 16px var(--overlay-black-scrim-30)",
    avatarGlow: "0 0 20px color-mix(in srgb, var(--accent-500) 40%, transparent)",
    iconPillGlow: "0 0 12px color-mix(in srgb, var(--accent-500) 40%, transparent)",
  },
} as const;

/**
 * Light-theme overrides. Same shape as TOKENS for the colour-bearing
 * categories (surface / text / border / semantic / fg / overlay); every
 * other category is theme-independent and inherited from TOKENS via the
 * THEMES map below. Accent ramps are intentionally shared so brand colour
 * stays stable across themes.
 *
 * Note on overlay naming: the `overlay-white-*` tokens represent the
 * "subtle interactive overlay" used for hover/active fills on raised
 * surfaces. In dark mode they're white-with-alpha (lighten); in light
 * mode they flip to black-with-alpha (darken). The `overlay-black-scrim-*`
 * tokens stay black, but at lower alpha so shadows feel softer over the
 * brighter background.
 */
const LIGHT_OVERRIDES = {
  surface: {
    0: "#ffffff",
    1: "#f7f7f9",
    2: "#eef0f3",
    3: "#e3e6ec",
    4: "#d6dae2",
  },
  text: {
    primary: "#0e1014",
    secondary: "#2c2f37",
    muted: "#5d6170",
    disabled: "#9ea1ab",
  },
  border: {
    subtle: "rgba(0,0,0,0.05)",
    default: "rgba(0,0,0,0.10)",
    strong: "rgba(0,0,0,0.18)",
  },
  semantic: {
    success: "#16a34a",
    warning: "#b45309",
    danger: "#dc2626",
    dangerHover: "#ef4444",
    info: "#2563eb",
    idle: "#9ea1ab",
  },
  fg: {
    onAccent: "#ffffff",
    onWarm: "#2a0e05",
    onDanger: "#1a0606",
  },
  overlay: {
    whiteSubtle: "rgba(0,0,0,0.04)",
    whiteSoft: "rgba(0,0,0,0.06)",
    whiteFill: "rgba(0,0,0,0.08)",
    blackScrim25: "rgba(0,0,0,0.10)",
    blackScrim30: "rgba(0,0,0,0.12)",
    blackScrim40: "rgba(0,0,0,0.16)",
    blackScrim50: "rgba(0,0,0,0.22)",
  },
} as const;

type DarkTokens = typeof TOKENS;

/**
 * Public tokens shape — widened from the dark-theme literal types so that
 * sibling theme maps (light, future high-contrast, etc.) can satisfy the
 * same contract without TypeScript narrowing them away.
 */
export type Tokens = {
  -readonly [K in keyof DarkTokens]: {
    -readonly [P in keyof DarkTokens[K]]: DarkTokens[K][P] extends number
      ? number
      : DarkTokens[K][P] extends string
        ? string
        : DarkTokens[K][P];
  };
};

export const LIGHT_TOKENS: Tokens = {
  ...TOKENS,
  ...LIGHT_OVERRIDES,
};

export type ThemeName = "dark" | "light";

export const THEMES: Record<ThemeName, Tokens> = {
  dark: TOKENS,
  light: LIGHT_TOKENS,
};

export type TypeKey = keyof typeof TOKENS.type;
export type TypeSpec = (typeof TOKENS.type)[TypeKey];

export const SURFACE_REF = TOKENS.surface[1];

export function surfaceRefFor(theme: ThemeName): string {
  return THEMES[theme].surface[1];
}
