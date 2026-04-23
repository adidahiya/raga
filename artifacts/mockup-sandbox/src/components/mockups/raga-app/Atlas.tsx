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

const Chip = ({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active?: boolean;
  color?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 transition-colors"
    style={{
      fontSize: T.type.caption.size,
      fontFamily: T.font.sans,
      letterSpacing: T.type.caption.tracking,
      padding: `${T.spacing[1]}px ${T.spacing[2] + 2}px`,
      borderRadius: T.radius.pill,
      background: active ? T.overlay.whiteFill : T.overlay.whiteSubtle,
      border: `1px solid ${active ? T.border.strong : T.border.default}`,
      color: active ? T.text.primary : T.text.secondary,
    }}
  >
    {color && (
      <span
        style={{
          width: T.size.indicatorDot,
          height: T.size.indicatorDot,
          borderRadius: T.radius.pill,
          background: color,
          display: "inline-block",
        }}
      />
    )}
    {label}
  </button>
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

// ---------- main ----------
export default function Atlas() {
  const [groupBy, setGroupBy] = useState<"genre" | "decade" | "mood" | "key">("genre");
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
        <div className="flex items-center" style={{ gap: T.spacing[3] }}>
          <Disc3 size={T.size.iconLg} color={T.accent[400]} />
          <div
            style={{
              fontSize: T.type.title.size,
              fontWeight: T.type.title.weight,
              letterSpacing: T.type.title.tracking,
            }}
          >
            Library Atlas
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
            {visible.length.toLocaleString()} / {ALBUMS.length.toLocaleString()} albums
          </div>
        </div>

        <div className="flex items-center" style={{ gap: T.spacing[2] }}>
          <div
            className="flex items-center"
            style={{
              gap: T.spacing[2],
              padding: `${T.spacing[1] + 1}px ${T.spacing[3]}px`,
              background: T.surface[2],
              border: `1px solid ${T.border.default}`,
              borderRadius: T.radius.md,
              minWidth: 280,
            }}
          >
            <Search size={T.size.iconMd} color={T.text.muted} />
            <input
              placeholder="Filter by artist, title, tag…"
              className="bg-transparent outline-none flex-1"
              style={{
                fontSize: T.type.body.size,
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
            className="flex items-center"
            style={{
              gap: T.spacing[2],
              height: T.size.controlMd,
              padding: `0 ${T.spacing[3]}px`,
              background: T.overlay.whiteSubtle,
              border: `1px solid ${T.border.default}`,
              borderRadius: T.radius.md,
              color: T.text.secondary,
              fontSize: T.type.bodySm.size,
            }}
          >
            <Sliders size={T.size.iconMd} />
            View
          </button>
        </div>
      </div>

      {/* body */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "200px 1fr 320px",
          gap: T.spacing[4],
          padding: T.spacing[4],
        }}
      >
        {/* left rail */}
        <div className="flex flex-col" style={{ gap: T.spacing[5] }}>
          <div>
            <RailLabel>Group by</RailLabel>
            <div className="flex flex-col" style={{ gap: T.spacing[1] }}>
              {(["genre", "decade", "mood", "key"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setGroupBy(k)}
                  className="flex items-center justify-between text-left"
                  style={{
                    padding: `${T.spacing[2]}px ${T.spacing[3]}px`,
                    borderRadius: T.radius.md,
                    background: groupBy === k ? T.overlay.whiteFill : "transparent",
                    border: `1px solid ${groupBy === k ? T.border.strong : "transparent"}`,
                    color: groupBy === k ? T.text.primary : T.text.secondary,
                    fontSize: T.type.bodySm.size,
                  }}
                >
                  <span className="capitalize">{k}</span>
                  {groupBy === k && (
                    <span
                      style={{
                        width: T.size.indicatorDot,
                        height: T.size.indicatorDot,
                        borderRadius: T.radius.pill,
                        background: T.accent[400],
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <RailLabel>Color by</RailLabel>
            <div className="flex flex-col" style={{ gap: T.spacing[1] }}>
              {[
                { k: "genre", icon: <Music size={T.size.iconMd} /> },
                { k: "energy", icon: <Zap size={T.size.iconMd} /> },
                { k: "decade", icon: <Calendar size={T.size.iconMd} /> },
              ].map((o, i) => (
                <button
                  key={o.k}
                  className="flex items-center"
                  style={{
                    gap: T.spacing[2],
                    padding: `${T.spacing[2]}px ${T.spacing[3]}px`,
                    borderRadius: T.radius.md,
                    background: i === 0 ? T.overlay.whiteFill : "transparent",
                    color: i === 0 ? T.text.primary : T.text.secondary,
                    fontSize: T.type.bodySm.size,
                  }}
                >
                  {o.icon}
                  <span className="capitalize">{o.k}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <RailLabel>Size by</RailLabel>
            <div
              style={{
                padding: `${T.spacing[2]}px ${T.spacing[3]}px`,
                background: T.overlay.whiteSubtle,
                borderRadius: T.radius.md,
                fontSize: T.type.bodySm.size,
                color: T.text.secondary,
                display: "flex",
                alignItems: "center",
                gap: T.spacing[2],
              }}
            >
              <Heart size={T.size.iconMd} />
              Play count
            </div>
          </div>

          <div>
            <RailLabel>Filters</RailLabel>
            <div className="flex flex-wrap" style={{ gap: T.spacing[1] + 2 }}>
              {GENRES.map((g) => (
                <Chip
                  key={g.key}
                  label={g.label}
                  color={g.color}
                  active={activeGenres.has(g.key)}
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
        </div>

        {/* canvas */}
        <Section style={{ padding: T.spacing[2], position: "relative", overflow: "hidden" }}>
          {/* axis hint */}
          <div
            className="absolute font-mono uppercase pointer-events-none"
            style={{
              fontSize: T.type.micro.size,
              letterSpacing: T.type.micro.tracking,
              color: T.text.disabled,
              left: T.spacing[3],
              top: T.spacing[3],
            }}
          >
            ↑ slower / mellower
          </div>
          <div
            className="absolute font-mono uppercase pointer-events-none"
            style={{
              fontSize: T.type.micro.size,
              letterSpacing: T.type.micro.tracking,
              color: T.text.disabled,
              right: T.spacing[3],
              bottom: T.spacing[3],
            }}
          >
            faster / louder →
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="auto"
            style={{ display: "block" }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <radialGradient id="bgglow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={T.surface[3]} stopOpacity="0.6" />
                <stop offset="100%" stopColor={T.surface[1]} stopOpacity="0" />
              </radialGradient>
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
                stroke={T.border.subtle}
              />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={`hx${i}`}
                x1={0} y1={(H / 6) * i}
                x2={W} y2={(H / 6) * i}
                stroke={T.border.subtle}
              />
            ))}

            {/* genre cluster halos */}
            {GENRES.filter((g) => activeGenres.has(g.key)).map((g) => (
              <circle
                key={g.key}
                cx={g.cx * W}
                cy={g.cy * H}
                r={70}
                fill={g.color}
                opacity={0.05}
              />
            ))}

            {/* genre labels */}
            {GENRES.filter((g) => activeGenres.has(g.key)).map((g) => (
              <text
                key={`lbl-${g.key}`}
                x={g.cx * W}
                y={g.cy * H - 80}
                textAnchor="middle"
                fontFamily={T.font.mono}
                fontSize={T.type.monoXs.size}
                letterSpacing={T.type.monoXs.tracking}
                fill={g.color}
                opacity={0.7}
                style={{ textTransform: "uppercase" }}
              >
                {g.label}
              </text>
            ))}

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
                    opacity={isPeek ? 1 : 0.78}
                    stroke={isPeek ? T.text.primary : "none"}
                    strokeWidth={isPeek ? 1.5 : 0}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(a)}
                    onClick={() => setSelected(a)}
                  />
                  {isPeek && (
                    <circle
                      cx={a.x * W}
                      cy={a.y * H}
                      r={a.r + 8}
                      fill="none"
                      stroke={T.text.primary}
                      strokeOpacity={0.35}
                      strokeWidth={1}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* legend strip */}
          <div
            className="absolute flex items-center"
            style={{
              left: T.spacing[3],
              bottom: T.spacing[3],
              gap: T.spacing[3],
              padding: `${T.spacing[1] + 1}px ${T.spacing[3]}px`,
              background: T.overlay.blackScrim40,
              border: `1px solid ${T.border.subtle}`,
              borderRadius: T.radius.pill,
              backdropFilter: "blur(8px)",
            }}
          >
            <Maximize2 size={T.size.iconSm} color={T.text.muted} />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: T.type.micro.size,
                letterSpacing: T.type.micro.tracking,
                color: T.text.muted,
              }}
            >
              scroll to zoom · drag to pan · ⌘ + click to lasso
            </span>
          </div>
        </Section>

        {/* right peek panel */}
        <div className="flex flex-col" style={{ gap: T.spacing[4] }}>
          {peeked && (
            <Section style={{ overflow: "hidden" }}>
              {/* gradient art */}
              <div
                style={{
                  height: 180,
                  background: `linear-gradient(135deg, ${peeked.color}, ${T.surface[3]} 70%, ${T.surface[1]})`,
                  position: "relative",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%)",
                  }}
                />
                <button
                  className="absolute flex items-center justify-center"
                  style={{
                    right: T.spacing[3],
                    bottom: T.spacing[3],
                    width: T.size.controlLg,
                    height: T.size.controlLg,
                    borderRadius: T.radius.pill,
                    background: T.text.primary,
                    color: T.surface[0],
                  }}
                >
                  <Play size={T.size.iconLg} fill={T.surface[0]} />
                </button>
              </div>
              <div style={{ padding: T.spacing[4] }}>
                <div
                  style={{
                    fontSize: T.type.headline.size,
                    fontWeight: T.type.headline.weight,
                    letterSpacing: T.type.headline.tracking,
                    marginBottom: T.spacing[1],
                  }}
                >
                  {peeked.title}
                </div>
                <div
                  style={{
                    fontSize: T.type.body.size,
                    color: T.text.secondary,
                    marginBottom: T.spacing[3],
                  }}
                >
                  {peeked.artist} · {peeked.year}
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: T.spacing[2],
                    marginBottom: T.spacing[3],
                  }}
                >
                  {[
                    { label: "BPM", value: peeked.bpm },
                    { label: "Energy", value: `${peeked.energy}/10` },
                    { label: "Plays", value: peeked.plays },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        padding: T.spacing[2],
                        background: T.overlay.whiteSubtle,
                        borderRadius: T.radius.md,
                        border: `1px solid ${T.border.subtle}`,
                      }}
                    >
                      <div
                        className="font-mono uppercase"
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
                          fontSize: T.type.monoLg.size,
                          color: T.text.primary,
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap" style={{ gap: T.spacing[1] + 2 }}>
                  <Chip label={GENRES.find(g => g.key === peeked.genre)!.label} color={peeked.color} active />
                  <Chip label="late-night" />
                  <Chip label="cinematic" />
                  <Chip label="deep" />
                </div>
              </div>
            </Section>
          )}

          <Section style={{ padding: T.spacing[4] }}>
            <div className="flex items-center justify-between" style={{ marginBottom: T.spacing[2] }}>
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: T.type.micro.size,
                  letterSpacing: T.type.micro.tracking,
                  color: T.text.muted,
                }}
              >
                Nearby in atlas
              </div>
              <ListMusic size={T.size.iconMd} color={T.text.muted} />
            </div>
            {visible
              .filter((a) => a.genre === (peeked?.genre ?? "house") && a.id !== peeked?.id)
              .slice(0, 5)
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="w-full flex items-center text-left"
                  style={{
                    gap: T.spacing[2],
                    padding: `${T.spacing[2]}px ${T.spacing[1]}px`,
                    borderTop: `1px solid ${T.border.subtle}`,
                  }}
                >
                  <span
                    style={{
                      width: 22, height: 22,
                      borderRadius: T.radius.sm,
                      background: `linear-gradient(135deg, ${a.color}, ${T.surface[3]})`,
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="truncate"
                      style={{ fontSize: T.type.bodySm.size, color: T.text.primary }}
                    >
                      {a.title}
                    </div>
                    <div
                      className="truncate"
                      style={{
                        fontSize: T.type.caption.size,
                        color: T.text.muted,
                      }}
                    >
                      {a.artist}
                    </div>
                  </div>
                  <ChevronRight size={T.size.iconSm} color={T.text.disabled} />
                </button>
              ))}
          </Section>

          <Section
            style={{
              padding: T.spacing[3],
              background: T.surface[1],
              border: `1px dashed ${T.border.default}`,
            }}
          >
            <div className="flex items-center" style={{ gap: T.spacing[2] }}>
              <Layers size={T.size.iconMd} color={T.accent[400]} />
              <div style={{ fontSize: T.type.bodySm.size, color: T.text.secondary }}>
                <span style={{ color: T.text.primary }}>3 clusters</span> match your current
                filters · open as smart playlist
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
