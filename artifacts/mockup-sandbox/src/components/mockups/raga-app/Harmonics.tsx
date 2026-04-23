import { useMemo, useState } from "react";
import {
  Compass,
  Activity,
  Zap,
  Music,
  Disc3,
  ArrowRight,
  Headphones,
  Radio,
} from "lucide-react";
import { TOKENS } from "./DesignSystem";

const T = TOKENS;

// ---------- Camelot wheel ----------
// 12 positions, A = inner (minor), B = outer (major)
const CAMELOT = [
  { pos: 1,  major: "B",  minor: "Ab" },
  { pos: 2,  major: "F#", minor: "Eb" },
  { pos: 3,  major: "Db", minor: "Bb" },
  { pos: 4,  major: "Ab", minor: "F"  },
  { pos: 5,  major: "Eb", minor: "C"  },
  { pos: 6,  major: "Bb", minor: "G"  },
  { pos: 7,  major: "F",  minor: "D"  },
  { pos: 8,  major: "C",  minor: "A"  },
  { pos: 9,  major: "G",  minor: "E"  },
  { pos: 10, major: "D",  minor: "B"  },
  { pos: 11, major: "A",  minor: "F#" },
  { pos: 12, major: "E",  minor: "Db" },
];

// 12 hues evenly spaced around the wheel — warm at top, cool at bottom
function wheelColor(pos: number): string {
  const hue = ((pos - 1) / 12) * 360;
  return `hsl(${hue}, 65%, 60%)`;
}

// ---------- synthetic library ----------
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Track = {
  id: number;
  pos: number;            // 1..12
  ring: "A" | "B";        // minor / major
  bpm: number;
  energy: number;         // 1..10
  title: string;
  artist: string;
};

const TITLES = [
  "Midnight Channel", "Soft Static", "Dialect", "Refraction", "Azimuth",
  "Citadel", "Glassbeam", "Marina", "Tidewater", "Lowlands",
  "Cobalt", "Fluorite", "Halcyon", "Northwind", "Echo Park",
];
const ARTISTS = ["Skee Mask","Daphni","Joy Orbison","Pearson Sound","Andy Stott","Objekt","Floating Points","Burial","Jamie xx","Mount Kimbie"];

const LIBRARY: Track[] = (() => {
  const r = rng(7);
  return Array.from({ length: 140 }, (_, i) => ({
    id: i,
    pos: 1 + Math.floor(r() * 12),
    ring: r() > 0.55 ? "B" : "A",
    bpm: 80 + Math.floor(r() * 80),
    energy: 1 + Math.floor(r() * 10),
    title: TITLES[i % TITLES.length],
    artist: ARTISTS[(i * 3) % ARTISTS.length],
  }));
})();

const SELECTED_ID = 23;
const SELECTED = LIBRARY[SELECTED_ID];

// harmonic neighbors of a Camelot key
function neighbors(pos: number, ring: "A" | "B") {
  const wrap = (p: number) => ((p - 1 + 12) % 12) + 1;
  return [
    { pos, ring, kind: "same" as const },
    { pos: wrap(pos + 1), ring, kind: "energy +" as const },
    { pos: wrap(pos - 1), ring, kind: "energy −" as const },
    { pos, ring: ring === "A" ? "B" : "A" as const, kind: "mood flip" as const },
  ];
}

function isCompatibleWith(t: Track, ns: ReturnType<typeof neighbors>) {
  return ns.some((n) => n.pos === t.pos && n.ring === t.ring);
}

// ---------- shared ----------
const Section = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div
    style={{
      background: T.surface[2],
      border: `1px solid ${T.border.default}`,
      borderRadius: T.radius.lg,
      ...style,
    }}
  >
    {children}
  </div>
);
const RailLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    className="font-mono uppercase"
    style={{
      fontSize: T.type.micro.size,
      letterSpacing: T.type.micro.tracking,
      color: T.text.muted,
      marginBottom: T.spacing[2],
    }}
  >
    {children}
  </div>
);

// ---------- Wheel SVG ----------
function CamelotWheel({
  selected,
  activeNeighbors,
  onPick,
}: {
  selected: { pos: number; ring: "A" | "B" };
  activeNeighbors: ReturnType<typeof neighbors>;
  onPick: (pos: number, ring: "A" | "B") => void;
}) {
  const cx = 200;
  const cy = 200;
  const R_OUT = 180;       // outer ring B (major) outer edge
  const R_MID = 130;       // boundary
  const R_IN  = 80;        // inner ring A (minor) inner edge

  const slice = (i: number, rOuter: number, rInner: number) => {
    const a0 = ((i - 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
    const x0o = cx + Math.cos(a0) * rOuter;
    const y0o = cy + Math.sin(a0) * rOuter;
    const x1o = cx + Math.cos(a1) * rOuter;
    const y1o = cy + Math.sin(a1) * rOuter;
    const x0i = cx + Math.cos(a0) * rInner;
    const y0i = cy + Math.sin(a0) * rInner;
    const x1i = cx + Math.cos(a1) * rInner;
    const y1i = cy + Math.sin(a1) * rInner;
    return `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 0 0 ${x0i} ${y0i} Z`;
  };

  const labelPos = (i: number, r: number) => {
    const a = ((i - 1) / 12) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };

  const isSelected = (pos: number, ring: "A" | "B") =>
    selected.pos === pos && selected.ring === ring;
  const isNeighbor = (pos: number, ring: "A" | "B") =>
    activeNeighbors.some((n) => n.pos === pos && n.ring === ring);

  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {/* Outer ring B = major */}
      {CAMELOT.map((k) => {
        const sel = isSelected(k.pos, "B");
        const nb = isNeighbor(k.pos, "B");
        return (
          <path
            key={`B${k.pos}`}
            d={slice(k.pos, R_OUT, R_MID)}
            fill={wheelColor(k.pos)}
            opacity={sel ? 1 : nb ? 0.55 : 0.2}
            stroke={T.surface[1]}
            strokeWidth={2}
            style={{ cursor: "pointer" }}
            onClick={() => onPick(k.pos, "B")}
          />
        );
      })}
      {/* Inner ring A = minor */}
      {CAMELOT.map((k) => {
        const sel = isSelected(k.pos, "A");
        const nb = isNeighbor(k.pos, "A");
        return (
          <path
            key={`A${k.pos}`}
            d={slice(k.pos, R_MID, R_IN)}
            fill={wheelColor(k.pos)}
            opacity={sel ? 1 : nb ? 0.55 : 0.14}
            stroke={T.surface[1]}
            strokeWidth={2}
            style={{ cursor: "pointer" }}
            onClick={() => onPick(k.pos, "A")}
          />
        );
      })}

      {/* Center disc */}
      <circle cx={cx} cy={cy} r={R_IN - 4} fill={T.surface[1]} stroke={T.border.default} />

      {/* Position labels */}
      {CAMELOT.map((k) => {
        const [bx, by] = labelPos(k.pos, (R_OUT + R_MID) / 2);
        const [ax, ay] = labelPos(k.pos, (R_MID + R_IN) / 2);
        return (
          <g key={`lbl${k.pos}`}>
            <text
              x={bx} y={by + 4}
              textAnchor="middle"
              fontFamily={T.font.mono}
              fontSize={11}
              fontWeight={700}
              fill={T.text.primary}
              opacity={0.95}
            >
              {k.pos}B
            </text>
            <text
              x={bx} y={by + 17}
              textAnchor="middle"
              fontFamily={T.font.mono}
              fontSize={9}
              fill={T.text.primary}
              opacity={0.75}
            >
              {k.major}
            </text>
            <text
              x={ax} y={ay + 3}
              textAnchor="middle"
              fontFamily={T.font.mono}
              fontSize={10}
              fontWeight={700}
              fill={T.text.primary}
              opacity={0.9}
            >
              {k.pos}A
            </text>
            <text
              x={ax} y={ay + 14}
              textAnchor="middle"
              fontFamily={T.font.mono}
              fontSize={8}
              fill={T.text.primary}
              opacity={0.65}
            >
              {k.minor}m
            </text>
          </g>
        );
      })}

      {/* Selected key in center */}
      <text
        x={cx} y={cy - 8}
        textAnchor="middle"
        fontFamily={T.font.mono}
        fontSize={10}
        letterSpacing="0.12em"
        fill={T.text.muted}
        style={{ textTransform: "uppercase" }}
      >
        Selected
      </text>
      <text
        x={cx} y={cy + 18}
        textAnchor="middle"
        fontFamily={T.font.sans}
        fontSize={26}
        fontWeight={700}
        fill={T.text.primary}
      >
        {selected.pos}{selected.ring}
      </text>
      <text
        x={cx} y={cy + 38}
        textAnchor="middle"
        fontFamily={T.font.mono}
        fontSize={11}
        fill={T.text.secondary}
      >
        {selected.ring === "A" ? CAMELOT[selected.pos - 1].minor + "m" : CAMELOT[selected.pos - 1].major}
      </text>
    </svg>
  );
}

// ---------- BPM × Energy heatmap ----------
function BpmEnergyGrid({ tracks, focused }: { tracks: Track[]; focused: Track }) {
  // bins: BPM 80..160 in 10-wide bins -> 8 bins; energy 1..10 -> 10 rows
  const bpmBins = 8;
  const energyRows = 10;
  const grid: number[][] = Array.from({ length: energyRows }, () =>
    Array.from({ length: bpmBins }, () => 0),
  );
  tracks.forEach((t) => {
    const bi = Math.min(bpmBins - 1, Math.max(0, Math.floor((t.bpm - 80) / 10)));
    const ei = Math.min(energyRows - 1, Math.max(0, t.energy - 1));
    grid[energyRows - 1 - ei][bi]++;
  });
  const max = Math.max(1, ...grid.flat());

  const focusBi = Math.min(bpmBins - 1, Math.max(0, Math.floor((focused.bpm - 80) / 10)));
  const focusEi = energyRows - 1 - (focused.energy - 1);

  return (
    <div className="w-full">
      <div className="grid" style={{ gridTemplateColumns: `auto repeat(${bpmBins}, 1fr)`, gap: 2 }}>
        <div />
        {Array.from({ length: bpmBins }).map((_, i) => (
          <div
            key={i}
            className="font-mono uppercase text-center"
            style={{
              fontSize: T.type.micro.size,
              letterSpacing: T.type.micro.tracking,
              color: T.text.disabled,
              paddingBottom: T.spacing[1],
            }}
          >
            {80 + i * 10}
          </div>
        ))}
        {grid.map((row, r) =>
          row.map((v, c) => {
            const intensity = v / max;
            const isFocus = r === focusEi && c === focusBi;
            const cells: React.ReactNode[] = [];
            if (c === 0) {
              cells.push(
                <div
                  key={`label-${r}`}
                  className="font-mono"
                  style={{
                    fontSize: T.type.micro.size,
                    color: T.text.disabled,
                    textAlign: "right",
                    paddingRight: T.spacing[2],
                    alignSelf: "center",
                  }}
                >
                  {energyRows - r}
                </div>,
              );
            }
            cells.push(
              <div
                key={`cell-${r}-${c}`}
                style={{
                  height: 24,
                  borderRadius: T.radius.xs,
                  background: isFocus
                    ? T.accent[400]
                    : `color-mix(in srgb, ${T.accent[400]} ${Math.round(intensity * 70)}%, ${T.surface[1]})`,
                  border: isFocus
                    ? `1px solid ${T.text.primary}`
                    : `1px solid ${T.border.subtle}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: T.type.monoXs.size,
                  fontFamily: T.font.mono,
                  color: intensity > 0.5 ? T.fg.onAccent : T.text.muted,
                }}
              >
                {v > 0 ? v : ""}
              </div>,
            );
            return cells;
          }),
        )}
      </div>
      <div
        className="flex items-center justify-between"
        style={{
          marginTop: T.spacing[2],
          fontSize: T.type.caption.size,
          color: T.text.muted,
        }}
      >
        <span className="font-mono uppercase" style={{ letterSpacing: T.type.micro.tracking }}>
          ↑ energy
        </span>
        <span className="font-mono uppercase" style={{ letterSpacing: T.type.micro.tracking }}>
          BPM →
        </span>
      </div>
    </div>
  );
}

// ---------- main ----------
export default function Harmonics() {
  const [sel, setSel] = useState<{ pos: number; ring: "A" | "B" }>({
    pos: SELECTED.pos,
    ring: SELECTED.ring,
  });

  const activeNeighbors = useMemo(() => neighbors(sel.pos, sel.ring), [sel]);
  const compatible = useMemo(
    () => LIBRARY.filter((t) => isCompatibleWith(t, activeNeighbors)).slice(0, 8),
    [activeNeighbors],
  );

  return (
    <div
      className="w-full min-h-screen"
      style={{
        background: T.surface[0],
        color: T.text.primary,
        fontFamily: T.font.sans,
      }}
    >
      {/* top bar */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: `${T.spacing[3]}px ${T.spacing[5]}px`,
          borderBottom: `1px solid ${T.border.default}`,
          background: T.surface[1],
        }}
      >
        <div className="flex items-center" style={{ gap: T.spacing[3] }}>
          <Compass size={T.size.iconLg} color={T.accent2[400]} />
          <div
            style={{
              fontSize: T.type.title.size,
              fontWeight: T.type.title.weight,
            }}
          >
            Harmonics
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: T.type.monoSm.size,
              color: T.text.muted,
              padding: `${T.spacing[1]}px ${T.spacing[2]}px`,
              background: T.overlay.whiteSubtle,
              borderRadius: T.radius.sm,
            }}
          >
            Camelot · {LIBRARY.length} tracks
          </div>
        </div>

        <div className="flex items-center" style={{ gap: T.spacing[2] }}>
          <button
            className="flex items-center"
            style={{
              gap: T.spacing[2],
              height: T.size.controlMd,
              padding: `0 ${T.spacing[3]}px`,
              borderRadius: T.radius.md,
              background: T.overlay.whiteSubtle,
              border: `1px solid ${T.border.default}`,
              color: T.text.secondary,
              fontSize: T.type.bodySm.size,
            }}
          >
            <Headphones size={T.size.iconMd} />
            Cue mode
          </button>
          <button
            className="flex items-center"
            style={{
              gap: T.spacing[2],
              height: T.size.controlMd,
              padding: `0 ${T.spacing[3]}px`,
              borderRadius: T.radius.md,
              background: T.accent2[500],
              color: T.fg.onWarm,
              fontSize: T.type.bodySm.size,
              fontWeight: 600,
            }}
          >
            <Radio size={T.size.iconMd} />
            Auto-mix
          </button>
        </div>
      </div>

      {/* body */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(0,1fr) 380px",
          gap: T.spacing[4],
          padding: T.spacing[4],
        }}
      >
        {/* left: wheel */}
        <Section style={{ padding: T.spacing[5], display: "flex", flexDirection: "column" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: T.spacing[3] }}>
            <RailLabel>Camelot wheel</RailLabel>
            <div className="flex items-center" style={{ gap: T.spacing[3], fontSize: T.type.caption.size, color: T.text.muted }}>
              <span className="flex items-center" style={{ gap: T.spacing[1] }}>
                <span style={{ width: 8, height: 8, borderRadius: T.radius.pill, background: wheelColor(sel.pos) }} />
                selected
              </span>
              <span className="flex items-center" style={{ gap: T.spacing[1] }}>
                <span style={{
                  width: 8, height: 8, borderRadius: T.radius.pill,
                  background: wheelColor(sel.pos), opacity: 0.5,
                }} />
                compatible
              </span>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: 460, aspectRatio: "1 / 1" }}>
              <CamelotWheel
                selected={sel}
                activeNeighbors={activeNeighbors}
                onPick={(pos, ring) => setSel({ pos, ring })}
              />
            </div>
          </div>

          <div
            className="flex items-center justify-center"
            style={{
              marginTop: T.spacing[3],
              gap: T.spacing[3],
              padding: `${T.spacing[2]}px ${T.spacing[3]}px`,
              background: T.surface[1],
              border: `1px solid ${T.border.subtle}`,
              borderRadius: T.radius.md,
              fontSize: T.type.caption.size,
              color: T.text.muted,
            }}
          >
            <span>4 harmonic moves available from <strong style={{ color: T.text.primary }}>{sel.pos}{sel.ring}</strong>:</span>
            {[
              { lbl: "stay", color: T.text.primary },
              { lbl: "+1 energy", color: T.accent[400] },
              { lbl: "−1 energy", color: T.accent[300] },
              { lbl: "mood flip", color: T.accent2[400] },
            ].map((m) => (
              <span key={m.lbl} className="flex items-center" style={{ gap: T.spacing[1] + 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: T.radius.pill, background: m.color }} />
                {m.lbl}
              </span>
            ))}
          </div>
        </Section>

        {/* right: BPM/energy + matches */}
        <div className="flex flex-col" style={{ gap: T.spacing[4] }}>
          {/* now playing */}
          <Section style={{ padding: T.spacing[4] }}>
            <RailLabel>Now playing</RailLabel>
            <div className="flex items-center" style={{ gap: T.spacing[3] }}>
              <div
                style={{
                  width: 56, height: 56,
                  borderRadius: T.radius.md,
                  background: `linear-gradient(135deg, ${wheelColor(SELECTED.pos)}, ${T.surface[3]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Disc3 size={24} color="rgba(255,255,255,0.85)" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontSize: T.type.headline.size,
                    fontWeight: T.type.headline.weight,
                    letterSpacing: T.type.headline.tracking,
                  }}
                >
                  {SELECTED.title}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: T.type.bodySm.size,
                    color: T.text.secondary,
                  }}
                >
                  {SELECTED.artist}
                </div>
              </div>
              <div className="flex" style={{ gap: T.spacing[2] }}>
                {[
                  { l: "BPM",     v: SELECTED.bpm,   icon: <Activity size={T.size.iconSm} /> },
                  { l: "ENERGY",  v: SELECTED.energy, icon: <Zap size={T.size.iconSm} /> },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      padding: `${T.spacing[1] + 1}px ${T.spacing[2] + 2}px`,
                      borderRadius: T.radius.md,
                      background: T.overlay.whiteSubtle,
                      border: `1px solid ${T.border.subtle}`,
                      textAlign: "center",
                      minWidth: 64,
                    }}
                  >
                    <div className="flex items-center justify-center" style={{
                      gap: 3, fontSize: T.type.micro.size, letterSpacing: T.type.micro.tracking,
                      color: T.text.muted, textTransform: "uppercase",
                    }}>
                      {s.icon}{s.l}
                    </div>
                    <div className="font-mono" style={{ fontSize: T.type.monoLg.size }}>
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section style={{ padding: T.spacing[4] }}>
            <RailLabel>BPM × Energy density</RailLabel>
            <BpmEnergyGrid tracks={LIBRARY} focused={SELECTED} />
          </Section>

          <Section style={{ padding: T.spacing[4] }}>
            <div className="flex items-center justify-between" style={{ marginBottom: T.spacing[3] }}>
              <RailLabel>Harmonic matches</RailLabel>
              <span
                className="font-mono"
                style={{ fontSize: T.type.monoXs.size, color: T.text.disabled }}
              >
                {compatible.length} found
              </span>
            </div>
            <div className="flex flex-col" style={{ gap: T.spacing[1] }}>
              {compatible.map((t, i) => {
                const matchKind = activeNeighbors.find(
                  (n) => n.pos === t.pos && n.ring === t.ring,
                )?.kind ?? "same";
                const bpmDelta = t.bpm - SELECTED.bpm;
                return (
                  <div
                    key={t.id}
                    className="flex items-center"
                    style={{
                      gap: T.spacing[2],
                      padding: `${T.spacing[2]}px ${T.spacing[2] + 2}px`,
                      borderRadius: T.radius.md,
                      background: i === 0 ? T.overlay.whiteFill : "transparent",
                      border: i === 0 ? `1px solid ${T.border.strong}` : `1px solid transparent`,
                    }}
                  >
                    <div
                      className="font-mono text-center"
                      style={{
                        width: 38,
                        padding: `2px 0`,
                        background: wheelColor(t.pos),
                        color: T.surface[0],
                        borderRadius: T.radius.sm,
                        fontSize: T.type.monoSm.size,
                        fontWeight: 700,
                      }}
                    >
                      {t.pos}{t.ring}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate"
                        style={{ fontSize: T.type.bodySm.size }}
                      >
                        {t.title}
                      </div>
                      <div
                        className="truncate font-mono"
                        style={{
                          fontSize: T.type.monoXs.size,
                          color: T.text.muted,
                          letterSpacing: T.type.monoXs.tracking,
                        }}
                      >
                        {t.artist} · {t.bpm} BPM ({bpmDelta >= 0 ? "+" : ""}{bpmDelta}) · E{t.energy}
                      </div>
                    </div>
                    <span
                      className="font-mono uppercase"
                      style={{
                        fontSize: T.type.micro.size,
                        letterSpacing: T.type.micro.tracking,
                        color:
                          matchKind === "same"      ? T.text.primary :
                          matchKind === "energy +"  ? T.accent[400] :
                          matchKind === "energy −"  ? T.accent[300] :
                                                      T.accent2[400],
                      }}
                    >
                      {matchKind}
                    </span>
                    <ArrowRight size={T.size.iconSm} color={T.text.disabled} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section
            style={{
              padding: T.spacing[3],
              background: T.surface[1],
              border: `1px dashed ${T.border.default}`,
              display: "flex",
              alignItems: "center",
              gap: T.spacing[2],
            }}
          >
            <Music size={T.size.iconMd} color={T.accent2[400]} />
            <div style={{ fontSize: T.type.bodySm.size, color: T.text.secondary }}>
              Build a 60-min set from <strong style={{ color: T.text.primary }}>{sel.pos}{sel.ring}</strong>
              <span style={{ color: T.text.muted }}> · curve energy 4 → 8 → 6</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
