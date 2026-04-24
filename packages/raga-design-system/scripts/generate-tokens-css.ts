import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { TOKENS } from "../src/tokens/tokens.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../src/styles/tokens.css");

interface Line {
  name: string;
  value: string;
}

const px = (n: number) => `${String(n)}px`;
const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const block = (label: string, lines: Line[]) =>
  `  /* ${label} */\n` +
  lines.map((l) => `  ${l.name}: ${l.value};`).join("\n");

const emitColors = (prefix: string, obj: Record<string, string>): Line[] =>
  Object.entries(obj).map(([k, v]) => ({ name: `--${prefix}-${kebab(k)}`, value: v }));

const emitNumeric = (prefix: string, obj: Record<string, number>): Line[] =>
  Object.entries(obj).map(([k, v]) => ({ name: `--${prefix}-${kebab(k)}`, value: px(v) }));

const emitStrings = (prefix: string, obj: Record<string, string>): Line[] =>
  Object.entries(obj).map(([k, v]) => ({ name: `--${prefix}-${kebab(k)}`, value: v }));

function emitTypography(): Line[] {
  const out: Line[] = [];
  for (const [name, spec] of Object.entries(TOKENS.type)) {
    const k = kebab(name);
    out.push({ name: `--type-${k}-size`, value: px(spec.size) });
    out.push({ name: `--type-${k}-leading`, value: String(spec.leading) });
    out.push({ name: `--type-${k}-weight`, value: String(spec.weight) });
    out.push({ name: `--type-${k}-tracking`, value: spec.tracking });
    out.push({
      name: `--type-${k}-family`,
      value: spec.family === "mono" ? "var(--font-mono)" : "var(--font-sans)",
    });
  }
  return out;
}

function generate(): string {
  const surface = emitColors("surface", TOKENS.surface);
  const text = emitColors("text", TOKENS.text);
  const border = emitColors("border", TOKENS.border);
  const accent = Object.entries(TOKENS.accent).map(([k, v]) => ({
    name: `--accent-${k}`,
    value: v,
  }));
  const accent2 = Object.entries(TOKENS.accent2).map(([k, v]) => ({
    name: `--accent2-${k}`,
    value: v,
  }));
  const semantic = emitColors("semantic", TOKENS.semantic);
  const fg = emitColors("fg", TOKENS.fg);
  const overlay: Line[] = Object.entries(TOKENS.overlay).map(([k, v]) => {
    const name =
      "--overlay-" +
      k
        .replace(/^(white|black)/, "$1-")
        .replace(/(scrim)(\d+)/i, "$1-$2")
        .toLowerCase();
    return { name, value: v };
  });

  const radius = emitNumeric("radius", TOKENS.radius);
  const spacing: Line[] = Object.entries(TOKENS.spacing).map(([k, v]) => ({
    name: `--spacing-${k}`,
    value: px(v as number),
  }));
  const size = emitNumeric("size", TOKENS.size);
  const shadow = emitStrings("shadow", TOKENS.shadow);
  const font = emitStrings("font", TOKENS.font);
  const tracking = emitStrings("tracking", TOKENS.tracking);
  const type = emitTypography();

  const sections = [
    block("surfaces", surface),
    block("text", text),
    block("borders", border),
    block("accent ramp", accent),
    block("accent2 ramp", accent2),
    block("semantic", semantic),
    block("foreground on tinted surfaces", fg),
    block("overlays / scrims", overlay),
    block("radii", radius),
    block("spacing scale", spacing),
    block("control / icon / chrome sizes", size),
    block("named shadows", shadow),
    block("font families", font),
    block("letter-spacing", tracking),
    block("typography scale", type),
  ];

  return [
    "/*",
    " * AUTO-GENERATED — DO NOT EDIT BY HAND.",
    " * Generated from `src/tokens/tokens.ts` by `scripts/generate-tokens-css.ts`.",
    " * Run `yarn workspace @adahiya/raga-design-system run gen:tokens` to refresh.",
    " */",
    "",
    `:root,`,
    `:root[data-theme="dark"] {`,
    sections.join("\n\n"),
    "}",
    "",
  ].join("\n");
}

export function writeTokensCss(): string {
  const css = generate();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, css, "utf8");
  return OUT;
}

const entry = process.argv[1];
if (entry && fileURLToPath(import.meta.url) === resolve(entry)) {
  const out = writeTokensCss();
  console.log(`[design-system] wrote ${out}`);
}
