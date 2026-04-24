import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { THEMES,type Tokens } from "../src/tokens/tokens.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../src/styles/tokens.css");
const PACKAGE_ROOT = resolve(here, "..");

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

function emitTypographyFor(theme: Tokens): Line[] {
  const out: Line[] = [];
  for (const [name, spec] of Object.entries(theme.type)) {
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

function sectionsFor(theme: Tokens): string {
  const surface = emitColors("surface", theme.surface);
  const text = emitColors("text", theme.text);
  const border = emitColors("border", theme.border);
  const accent = Object.entries(theme.accent).map(([k, v]) => ({
    name: `--accent-${k}`,
    value: v,
  }));
  const accent2 = Object.entries(theme.accent2).map(([k, v]) => ({
    name: `--accent2-${k}`,
    value: v,
  }));
  const semantic = emitColors("semantic", theme.semantic);
  const fg = emitColors("fg", theme.fg);
  const overlay: Line[] = Object.entries(theme.overlay).map(([k, v]) => {
    const name =
      "--overlay-" +
      k
        .replace(/^(white|black)/, "$1-")
        .replace(/(scrim)(\d+)/i, "$1-$2")
        .toLowerCase();
    return { name, value: v };
  });

  const radius = emitNumeric("radius", theme.radius);
  const spacing: Line[] = Object.entries(theme.spacing).map(([k, v]) => ({
    name: `--spacing-${k}`,
    value: px(v),
  }));
  const size = emitNumeric("size", theme.size);
  const shadow = emitStrings("shadow", theme.shadow);
  const font = emitStrings("font", theme.font);
  const tracking = emitStrings("tracking", theme.tracking);
  const type = emitTypographyFor(theme);

  return [
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
  ].join("\n\n");
}

function generate(): string {
  return [
    "/*",
    " * AUTO-GENERATED — DO NOT EDIT BY HAND.",
    " * Generated from `src/tokens/tokens.ts` by `scripts/generate-tokens-css.ts`.",
    " * Run `yarn workspace @adahiya/raga-design-system run gen:tokens` to refresh.",
    " */",
    "",
    `:root,`,
    `:root[data-theme="dark"] {`,
    sectionsFor(THEMES.dark),
    "}",
    "",
    `:root[data-theme="light"] {`,
    sectionsFor(THEMES.light),
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

export function checkTokensCss(): { ok: boolean; path: string; expected: string; actual: string } {
  const expected = generate();
  let actual = "";
  try {
    actual = readFileSync(OUT, "utf8");
  } catch {
    actual = "";
  }
  return { ok: actual === expected, path: OUT, expected, actual };
}

const entry = process.argv[1];
if (entry && fileURLToPath(import.meta.url) === resolve(entry)) {
  const isCheck = process.argv.slice(2).includes("--check");
  if (isCheck) {
    const { ok, path: outPath } = checkTokensCss();
    const rel = relative(PACKAGE_ROOT, outPath);
    if (ok) {
      console.log(`[design-system] ${rel} is up to date`);
    } else {
      console.error(
        `[design-system] ${rel} is out of date with src/tokens/tokens.ts.\n` +
          `  Run \`yarn workspace @adahiya/raga-design-system run gen:tokens\` and commit the result.`,
      );
      process.exit(1);
    }
  } else {
    const out = writeTokensCss();
    console.log(`[design-system] wrote ${out}`);
  }
}
