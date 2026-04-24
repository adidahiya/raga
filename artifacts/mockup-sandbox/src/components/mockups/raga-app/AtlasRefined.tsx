import { useMemo, useState } from "react";
import {
  Search,
  Sliders,
  Layers,
  Disc3,
  Music,
  Calendar,
  Zap,
  Heart,
  Play,
  ChevronRight,
  Maximize2,
  ListMusic,
} from "lucide-react";
import { TOKENS } from "./DesignSystem";

const T = TOKENS;

// ---------- deterministic synthetic library ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GENRES = [
  { key: "ambient",     label: "Ambient",     color: T.accent[300],   cx: 0.18, cy: 0.30 },
  { key: "electronic",  label: "Electronic",  color: T.accent[500],   cx: 0.40, cy: 0.22 },
  { key: "house",       label: "House",       color: T.accent[700],   cx: 0.62, cy: 0.18 },
  { key: "techno",      label: "Techno",      color: "#8b5cf6",       cx: 0.78, cy: 0.32 },
  { key: "indie",       label: "Indie",       color: T.accent2[400],  cx: 0.30, cy: 0.62 },
  { key: "jazz",        label: "Jazz",        color: T.accent2[600],  cx: 0.55, cy: 0.72 },
  { key: "hiphop",      label: "Hip-Hop",     color: T.semantic.warning, cx: 0.74, cy: 0.62 },
  { key: "classical",   label: "Classical",   color: T.semantic.info,    cx: 0.16, cy: 0.82 },
  { key: "world",       label: "World",       color: T.semantic.success, cx: 0.86, cy: 0.78 },
] as const;

type Album = {
  id: number;
  x: number;
  y: number;
  r: number;
  genre: typeof GENRES[number]["key"];
  color: string;
  title: string;
  artist: string;
  year: number;
  plays: number;
  bpm: number;
  energy: number;
};

const ARTISTS = [
  "Aphex Twin", "Boards of Canada", "Kiasmos", "Jon Hopkins", "Four Tet",
  "Caribou", "DJ Shadow", "Bonobo", "Floating Points", "Nils Frahm",
  "Tycho", "Burial", "Jamie xx", "Mount Kimbie", "Daphni",
  "Pearson Sound", "Joy Orbison", "Skee Mask", "Objekt", "Andy Stott",
];
const TITLES = [
  "Selected Works", "Music Has the Right", "Blooms", "Singularity", "There Is Love",
  "Suddenly", "Endtroducing", "Migration", "Crush", "Spaces",
  "Awake", "Untrue", "In Colour", "Cold Spring Fault", "Joli Mai",
  "Pearson Sound", "Hinba", "ISS006", "Cocoon Crush", "Faith in Strangers",
];

function generateAlbums(seed: number, count: number): Album[] {
  const rng = mulberry32(seed);
  const out: Album[] = [];
  for (let i = 0; i < count; i++) {
    const gIdx = Math.floor(rng() * GENRES.length);
    const g = GENRES[gIdx];
    // tight gaussian-ish clustering around the genre's anchor
    const jitter = () => (rng() - 0.5 + (rng() - 0.5)) * 0.18;
    const x = Math.max(0.04, Math.min(0.96, g.cx + jitter()));
    const y = Math.max(0.04, Math.min(0.96, g.cy + jitter()));
    const plays = Math.floor(Math.pow(rng(), 2.2) * 480);
    out.push({
      id: i,
      x, y,
      r: 3 + Math.sqrt(plays) * 0.32,
      genre: g.key,
      color: g.color,
      title: TITLES[(i + gIdx) % TITLES.length],
      artist: ARTISTS[(i * 7 + gIdx) % ARTISTS.length],
      year: 1992 + Math.floor(rng() * 33),
      plays,
      bpm: 60 + Math.floor(rng() * 120),
      energy: 1 + Math.floor(rng() * 10),
    });
  }
  return out;
}

const ALBUMS = generateAlbums(2026, 320);

// ---------- shared bits ----------
const Section = ({ children, style, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; }) => (
  <div
    className={className}
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

const ControlRow = ({
  icon,
  label,
  active,
  onClick,
  trailingColor,
}: {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  trailingColor?: string;
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between text-left w-full transition-colors"
    style={{
      padding: `${T.spacing[2]}px ${T.spacing[3]}px`,
      borderRadius: T.radius.md,
      background: active ? T.overlay.whiteFill : "transparent",
      color: active ? T.text.primary : T.text.secondary,
      fontSize: T.type.bodySm.size,
    }}
  >
    <div className="flex items-center gap-2">
      {icon && <div style={{ color: active ? T.text.primary : T.text.muted }}>{icon}</div>}
      <span className="capitalize">{label}</span>
    </div>
    {active && !trailingColor && (
      <div
        style={{
          width: T.size.indicatorDot,
          height: T.size.indicatorDot,
          borderRadius: T.radius.pill,
          background: T.text.primary,
        }}
      />
    )}
    {trailingColor && (
      <div
        style={{
          width: T.size.indicatorDot + 2,
          height: T.size.indicatorDot + 2,
          borderRadius: T.radius.pill,
          background: trailingColor,
          opacity: active ? 1 : 0.2,
          border: active ? "none" : `1px solid ${T.border.default}`,
        }}
      />
    )}
  </button>
);

// ---------- main ----------
export default function AtlasRefined() {
  const [groupBy, setGroupBy] = useState<"genre" | "decade" | "mood" | "key">("genre");
  const [colorBy, setColorBy] = useState<"genre" | "energy" | "decade">("genre");
  const [activeGenres, setActiveGenres] = useState<Set<string>>(
    new Set(GENRES.map((g) => g.key)),
  );
  const [hovered, setHovered] = useState<Album | null>(null);
  const [selected, setSelected] = useState<Album | null>(ALBUMS[42]);

  const peeked = hovered ?? selected;

  const visible = useMemo(
    () => ALBUMS.filter((a) => activeGenres.has(a.genre)),
    [activeGenres],
  );

  const W = 720;
  const H = 540;

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
        <div className="flex items-center" style={{ gap: T.spacing[4] }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              background: T.surface[3],
              borderRadius: T.radius.md,
              border: `1px solid ${T.border.default}`,
            }}
          >
            <Disc3 size={T.size.iconLg} color={T.accent[300]} />
          </div>
          <div className="flex flex-col">
            <div
              style={{
                fontSize: T.type.title.size,
                fontWeight: T.type.title.weight,
                letterSpacing: T.type.title.tracking,
                lineHeight: 1.1,
              }}
            >
              Library Atlas
            </div>
            <div
              className="font-mono text-xs mt-0.5"
              style={{ color: T.text.muted, fontSize: T.type.monoXs.size }}
            >
              {visible.length.toLocaleString()} of {ALBUMS.length.toLocaleString()} items
            </div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: T.spacing[3] }}>
          <div
            className="flex items-center"
            style={{
              gap: T.spacing[2],
              padding: `${T.spacing[1] + 1}px ${T.spacing[3]}px`,
              background: T.surface[2],
              border: `1px solid ${T.border.default}`,
              borderRadius: T.radius.pill,
              width: 260,
              transition: "all 0.2s ease",
            }}
          >
            <Search size={T.size.iconMd} color={T.text.muted} />
            <input
              placeholder="Search library..."
              className="bg-transparent outline-none flex-1"
              style={{
                fontSize: T.type.bodySm.size,
                color: T.text.primary,
              }}
            />
            <span
              className="font-mono"
              style={{ fontSize: T.type.monoXs.size, color: T.text.disabled }}
            >
              ⌘F
            </span>
          </div>
          <button
            className="flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{
              width: 34,
              height: 34,
              border: `1px solid ${T.border.default}`,
              borderRadius: T.radius.pill,
              color: T.text.secondary,
            }}
          >
            <Sliders size={T.size.iconMd} />
          </button>
        </div>
      </div>

      {/* body */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "220px 1fr 340px",
          gap: T.spacing[5],
          padding: T.spacing[5],
        }}
      >
        {/* left rail */}
        <Section className="flex flex-col py-4" style={{ gap: 0 }}>
          <div className="px-4 pb-4" style={{ borderBottom: `1px solid ${T.border.default}` }}>
            <RailLabel>Group by</RailLabel>
            <div className="flex flex-col" style={{ gap: 2 }}>
              {(["genre", "decade", "mood", "key"] as const).map((k) => (
                <ControlRow
                  key={k}
                  label={k}
                  active={groupBy === k}
                  onClick={() => setGroupBy(k)}
                />
              ))}
            </div>
          </div>

          <div className="p-4" style={{ borderBottom: `1px solid ${T.border.default}` }}>
            <RailLabel>Color by</RailLabel>
            <div className="flex flex-col" style={{ gap: 2 }}>
              {[
                { k: "genre", icon: <Music size={T.size.iconMd} /> },
                { k: "energy", icon: <Zap size={T.size.iconMd} /> },
                { k: "decade", icon: <Calendar size={T.size.iconMd} /> },
              ].map((o) => (
                <ControlRow
                  key={o.k}
                  icon={o.icon}
                  label={o.k}
                  active={colorBy === o.k}
                  onClick={() => setColorBy(o.k as any)}
                />
              ))}
            </div>
          </div>

          <div className="p-4" style={{ borderBottom: `1px solid ${T.border.default}` }}>
            <RailLabel>Size by</RailLabel>
            <div className="flex flex-col" style={{ gap: 2 }}>
              <ControlRow icon={<Heart size={T.size.iconMd} />} label="Play count" active />
            </div>
          </div>

          <div className="p-4 flex-1">
            <RailLabel>Filters</RailLabel>
            <div className="flex flex-col" style={{ gap: 2 }}>
              {GENRES.map((g) => (
                <ControlRow
                  key={g.key}
                  label={g.label}
                  active={activeGenres.has(g.key)}
                  trailingColor={g.color}
                  onClick={() => {
                    const next = new Set(activeGenres);
                    if (next.has(g.key)) next.delete(g.key);
                    else next.add(g.key);
                    setActiveGenres(next);
                  }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* canvas */}
        <Section style={{ position: "relative", overflow: "hidden", background: T.surface[1] }}>
          {/* axis hints */}
          <div
            className="absolute font-mono uppercase pointer-events-none flex items-center gap-2 opacity-60"
            style={{
              fontSize: T.type.micro.size,
              letterSpacing: T.type.micro.tracking,
              color: T.text.muted,
              left: T.spacing[4],
              top: T.spacing[4],
            }}
          >
            <span>↑ slower / mellower</span>
          </div>
          <div
            className="absolute font-mono uppercase pointer-events-none flex items-center gap-2 opacity-60"
            style={{
              fontSize: T.type.micro.size,
              letterSpacing: T.type.micro.tracking,
              color: T.text.muted,
              right: T.spacing[4],
              bottom: T.spacing[4],
            }}
          >
            <span>faster / louder →</span>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            style={{ display: "block" }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <radialGradient id="bgglow" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={T.surface[3]} stopOpacity="0.4" />
                <stop offset="100%" stopColor={T.surface[1]} stopOpacity="0" />
              </radialGradient>
              {GENRES.map(g => (
                <radialGradient key={`halo-${g.key}`} id={`halo-${g.key}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={g.color} stopOpacity="0.25" />
                  <stop offset="70%" stopColor={g.color} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={g.color} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>
            <rect
              x={0} y={0} width={W} height={H}
              fill="url(#bgglow)"
            />
            {/* grid */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`vx${i}`}
                x1={(W / 8) * i} y1={0}
                x2={(W / 8) * i} y2={H}
                stroke={T.border.default}
                strokeDasharray="4 4"
              />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={`hx${i}`}
                x1={0} y1={(H / 6) * i}
                x2={W} y2={(H / 6) * i}
                stroke={T.border.default}
                strokeDasharray="4 4"
              />
            ))}

            {/* genre cluster halos */}
            {GENRES.filter((g) => activeGenres.has(g.key)).map((g) => (
              <circle
                key={g.key}
                cx={g.cx * W}
                cy={g.cy * H}
                r={120}
                fill={`url(#halo-${g.key})`}
                style={{ mixBlendMode: "screen" }}
              />
            ))}

            {/* genre labels with contrast plates */}
            {GENRES.filter((g) => activeGenres.has(g.key)).map((g) => {
              const textY = Math.max(30, g.cy * H - 90);
              return (
                <g key={`lbl-${g.key}`} style={{ pointerEvents: "none" }}>
                  <rect
                    x={g.cx * W - 35}
                    y={textY - 10}
                    width={70}
                    height={16}
                    rx={8}
                    fill={T.surface[1]}
                    opacity={0.6}
                  />
                  <text
                    x={g.cx * W}
                    y={textY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontFamily={T.font.mono}
                    fontSize={T.type.monoXs.size}
                    letterSpacing={T.type.monoXs.tracking}
                    fill={g.color}
                    opacity={0.8}
                    style={{ textTransform: "uppercase" }}
                  >
                    {g.label}
                  </text>
                </g>
              );
            })}

            {/* peek guides */}
            {peeked && (
              <g pointerEvents="none">
                <line x1={0} y1={peeked.y * H} x2={W} y2={peeked.y * H} stroke={T.text.muted} strokeOpacity={0.2} strokeDasharray="2 4" />
                <line x1={peeked.x * W} y1={0} x2={peeked.x * W} y2={H} stroke={T.text.muted} strokeOpacity={0.2} strokeDasharray="2 4" />
                <rect x={peeked.x * W + 12} y={peeked.y * H - 24} width={120} height={18} rx={4} fill={T.surface[2]} stroke={T.border.default} />
                <text
                  x={peeked.x * W + 18}
                  y={peeked.y * H - 12}
                  fontFamily={T.font.mono}
                  fontSize={9}
                  fill={T.text.secondary}
                  alignmentBaseline="middle"
                >
                  {peeked.x.toFixed(2)} · {peeked.y.toFixed(2)} · {peeked.genre}
                </text>
              </g>
            )}

            {/* points */}
            {visible.map((a) => {
              const isPeek = peeked?.id === a.id;
              return (
                <g key={a.id}>
                  <circle
                    cx={a.x * W}
                    cy={a.y * H}
                    r={a.r}
                    fill={a.color}
                    opacity={isPeek ? 1 : 0.85}
                    stroke={isPeek ? T.text.primary : "none"}
                    strokeWidth={isPeek ? 1.5 : 0}
                    style={{ cursor: "pointer", transition: "all 0.1s ease" }}
                    onMouseEnter={() => setHovered(a)}
                    onClick={() => setSelected(a)}
                  />
                  {isPeek && (
                    <circle
                      cx={a.x * W}
                      cy={a.y * H}
                      r={a.r + 6}
                      fill="none"
                      stroke={T.text.primary}
                      strokeOpacity={0.6}
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </Section>

        {/* right peek panel */}
        <div className="flex flex-col h-full" style={{ gap: T.spacing[4] }}>
          {peeked && (
            <Section style={{ overflow: "hidden", display: "flex", flexDirection: "col" }}>
              {/* gradient art */}
              <div
                style={{
                  height: 220,
                  position: "relative",
                  background: T.surface[1],
                }}
              >
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                  <defs>
                    <linearGradient id="artGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={peeked.color} />
                      <stop offset="50%" stopColor={T.surface[3]} />
                      <stop offset="100%" stopColor={T.surface[0]} />
                    </linearGradient>
                    <radialGradient id="artRad" cx="30%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                    </radialGradient>
                    <filter id="noiseFilter">
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                      <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#artGrad)" />
                  <rect width="100%" height="100%" fill="url(#artRad)" />
                  <rect width="100%" height="100%" filter="url(#noiseFilter)" style={{ mixBlendMode: "overlay" }} />
                </svg>
                
                {/* Year caption strip */}
                <div
                  className="absolute top-3 right-3 font-mono"
                  style={{
                    fontSize: T.type.micro.size,
                    color: T.surface[0],
                    background: "rgba(255,255,255,0.7)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {peeked.year}
                </div>

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "inherit" }}
                />
                
                <button
                  className="absolute flex items-center justify-center hover:scale-105 transition-transform"
                  style={{
                    right: T.spacing[4],
                    bottom: T.spacing[4],
                    width: 44,
                    height: 44,
                    borderRadius: T.radius.pill,
                    background: T.text.primary,
                    color: T.surface[0],
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <Play size={T.size.iconLg} fill={T.surface[0]} style={{ marginLeft: 2 }} />
                </button>
              </div>

              <div style={{ padding: T.spacing[5] }}>
                <div
                  className="truncate"
                  style={{
                    fontSize: T.type.headline.size,
                    fontWeight: T.type.headline.weight,
                    letterSpacing: T.type.headline.tracking,
                    marginBottom: 2,
                    color: T.text.primary,
                  }}
                >
                  {peeked.title}
                </div>
                <div
                  style={{
                    fontSize: T.type.body.size,
                    color: T.text.secondary,
                    marginBottom: T.spacing[5],
                  }}
                >
                  {peeked.artist}
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: T.spacing[2],
                    marginBottom: T.spacing[5],
                  }}
                >
                  {[
                    { label: "BPM", value: peeked.bpm },
                    { label: "Energy", value: `${peeked.energy}/10` },
                    { label: "Plays", value: peeked.plays },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col"
                      style={{
                        padding: T.spacing[3],
                        background: T.overlay.whiteSubtle,
                        borderRadius: T.radius.md,
                      }}
                    >
                      <div
                        className="font-mono uppercase mb-1"
                        style={{
                          fontSize: T.type.micro.size,
                          letterSpacing: T.type.micro.tracking,
                          color: T.text.muted,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: T.type.monoMd.size,
                          color: T.text.primary,
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap" style={{ gap: T.spacing[2] }}>
                  <span className="inline-flex items-center px-2 py-1 text-[11px] font-mono rounded-md" style={{ background: `${peeked.color}22`, color: peeked.color, border: `1px solid ${peeked.color}44` }}>
                    {GENRES.find(g => g.key === peeked.genre)!.label}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 text-[11px] font-mono rounded-md" style={{ background: T.overlay.whiteSubtle, color: T.text.secondary, border: `1px solid ${T.border.default}` }}>late-night</span>
                  <span className="inline-flex items-center px-2 py-1 text-[11px] font-mono rounded-md" style={{ background: T.overlay.whiteSubtle, color: T.text.secondary, border: `1px solid ${T.border.default}` }}>deep</span>
                </div>
              </div>
            </Section>
          )}

          <Section style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: T.border.default }}>
              <div className="flex items-center justify-between">
                <RailLabel>Nearby in atlas</RailLabel>
                <ListMusic size={T.size.iconMd} color={T.text.muted} style={{ marginBottom: 8 }} />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-2" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {visible
                .filter((a) => a.genre === (peeked?.genre ?? "house") && a.id !== peeked?.id)
                .slice(0, 10)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelected(a)}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${a.color}, ${T.surface[3]})`,
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="truncate" style={{ fontSize: T.type.bodySm.size, color: T.text.primary, fontWeight: 500 }}>
                        {a.title}
                      </span>
                      <span className="truncate" style={{ fontSize: 11, color: T.text.muted }}>
                        {a.artist}
                      </span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: T.text.disabled }}>
                      '{a.year.toString().slice(2)}
                    </span>
                  </div>
                ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
