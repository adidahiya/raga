import { useMemo, useState } from "react";
import {
  Search,
  Sliders,
  Disc3,
  Music,
  Calendar,
  Zap,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Activity,
  BarChart2,
  Maximize2,
  ListMusic,
  ChevronDown
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
  key: string;
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
const KEYS = ["Am", "C", "G", "F#m", "Dm", "Em", "Bb", "D"];

function generateAlbums(seed: number, count: number): Album[] {
  const rng = mulberry32(seed);
  const out: Album[] = [];
  for (let i = 0; i < count; i++) {
    const gIdx = Math.floor(rng() * GENRES.length);
    const g = GENRES[gIdx];
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
      key: KEYS[Math.floor(rng() * KEYS.length)],
    });
  }
  return out;
}

const ALBUMS = generateAlbums(2026, 320);

// ---------- shared bits ----------
const Section = ({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties, className?: string }) => (
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
      padding: `${T.spacing[1]}px ${T.spacing[2]}px`,
      borderRadius: T.radius.xs,
      background: active ? T.overlay.whiteFill : "transparent",
      border: `1px solid ${active ? T.border.strong : T.border.subtle}`,
      color: active ? T.text.primary : T.text.muted,
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
          opacity: active ? 1 : 0.5,
        }}
      />
    )}
    {label}
  </button>
);

const RailLabel = ({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) => (
  <div
    className="flex justify-between items-center"
    style={{ marginBottom: T.spacing[2] }}
  >
    <div
      className="font-mono uppercase"
      style={{
        fontSize: T.type.micro.size,
        letterSpacing: T.type.micro.tracking,
        color: T.text.muted,
      }}
    >
      {children}
    </div>
    {right}
  </div>
);

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div
    className="flex p-1"
    style={{
      background: T.surface[1],
      borderRadius: T.radius.md,
      border: `1px solid ${T.border.default}`,
    }}
  >
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex-1 flex items-center justify-center gap-1.5"
          style={{
            padding: `${T.spacing[1]}px 0`,
            borderRadius: T.radius.sm - 2,
            background: active ? T.surface[3] : "transparent",
            color: active ? T.text.primary : T.text.secondary,
            fontSize: T.type.caption.size,
            fontFamily: T.font.sans,
            fontWeight: active ? 500 : 400,
            boxShadow: active ? `0 1px 2px ${T.overlay.blackScrim25}` : "none",
            border: `1px solid ${active ? T.border.strong : "transparent"}`,
          }}
        >
          {o.icon}
          {o.label}
        </button>
      );
    })}
  </div>
);

// ---------- main ----------
export default function AtlasPro() {
  const [groupBy, setGroupBy] = useState<"genre" | "decade" | "mood">("genre");
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

  const meanBpm = useMemo(() => Math.round(visible.reduce((acc, a) => acc + a.bpm, 0) / (visible.length || 1)), [visible]);
  const meanEnergy = useMemo(() => (visible.reduce((acc, a) => acc + a.energy, 0) / (visible.length || 1)).toFixed(1), [visible]);

  const W = 720;
  const H = 540;

  const toggleAllFilters = () => {
    if (activeGenres.size === GENRES.length) {
      setActiveGenres(new Set());
    } else {
      setActiveGenres(new Set(GENRES.map(g => g.key)));
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{
        background: T.surface[0],
        color: T.text.primary,
        fontFamily: T.font.sans,
      }}
    >
      {/* top bar */}
      <div className="flex flex-col">
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
              Library Atlas <span style={{ color: T.text.disabled, fontWeight: 400 }}>PRO</span>
            </div>
          </div>

          <div className="flex items-center" style={{ gap: T.spacing[2] }}>
            <div
              className="flex items-center"
              style={{
                gap: T.spacing[2],
                padding: `${T.spacing[1]}px ${T.spacing[3]}px`,
                background: T.surface[2],
                border: `1px solid ${T.border.default}`,
                borderRadius: T.radius.sm,
                minWidth: 280,
                height: 28,
              }}
            >
              <Search size={T.size.iconSm} color={T.text.muted} />
              <input
                placeholder="Filter by artist, title, tag…"
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
              className="flex items-center"
              style={{
                gap: T.spacing[2],
                height: 28,
                padding: `0 ${T.spacing[3]}px`,
                background: T.surface[2],
                border: `1px solid ${T.border.default}`,
                borderRadius: T.radius.sm,
                color: T.text.secondary,
                fontSize: T.type.bodySm.size,
              }}
            >
              <Sliders size={T.size.iconSm} />
              View
            </button>
          </div>
        </div>
        
        {/* status strip */}
        <div
          className="flex items-center"
          style={{
            height: 24,
            background: T.surface[0],
            borderBottom: `1px solid ${T.border.subtle}`,
            padding: `0 ${T.spacing[5]}px`,
            gap: T.spacing[6],
            fontFamily: T.font.mono,
            fontSize: T.type.monoXs.size,
            color: T.text.muted,
            textTransform: "uppercase",
            letterSpacing: T.type.monoXs.tracking,
          }}
        >
          <div>
            <span style={{ color: T.text.disabled }}>Showing: </span>
            <span style={{ color: T.text.primary }}>{visible.length}</span> / {ALBUMS.length} ALBUMS
          </div>
          <div>
            <span style={{ color: T.text.disabled }}>Active Filters: </span>
            <span style={{ color: T.text.primary }}>{activeGenres.size}</span> / {GENRES.length} GENRES
          </div>
          <div>
            <span style={{ color: T.text.disabled }}>Mean BPM: </span>
            <span style={{ color: T.text.primary }}>{meanBpm}</span>
          </div>
          <div>
            <span style={{ color: T.text.disabled }}>Mean Energy: </span>
            <span style={{ color: T.text.primary }}>{meanEnergy}</span>
          </div>
        </div>
      </div>

      {/* body */}
      <div
        className="flex-1 grid"
        style={{
          gridTemplateColumns: "220px 1fr 340px",
        }}
      >
        {/* left rail */}
        <div
          className="flex flex-col"
          style={{
            padding: T.spacing[4],
            gap: T.spacing[6],
            borderRight: `1px solid ${T.border.default}`,
            background: T.surface[1],
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <RailLabel>Group by</RailLabel>
              <SegmentedControl
                options={[
                  { label: "Genre", value: "genre" },
                  { label: "Decade", value: "decade" },
                  { label: "Mood", value: "mood" },
                ]}
                value={groupBy}
                onChange={setGroupBy}
              />
            </div>

            <div>
              <RailLabel>Color by</RailLabel>
              <SegmentedControl
                options={[
                  { label: "Genre", value: "genre", icon: <Music size={12} /> },
                  { label: "Energy", value: "energy", icon: <Zap size={12} /> },
                  { label: "Decade", value: "decade", icon: <Calendar size={12} /> },
                ]}
                value={colorBy}
                onChange={setColorBy}
              />
            </div>

            <div>
              <RailLabel>Size by</RailLabel>
              <div
                className="flex items-center justify-between"
                style={{
                  padding: `0 ${T.spacing[2]}px`,
                  height: 32,
                  background: T.surface[2],
                  border: `1px solid ${T.border.default}`,
                  borderRadius: T.radius.sm,
                  fontSize: T.type.caption.size,
                  color: T.text.secondary,
                }}
              >
                <div className="flex items-center gap-2">
                  <Heart size={12} color={T.text.muted} />
                  Play count
                </div>
                <ChevronDown size={12} color={T.text.disabled} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <RailLabel right={
              <button 
                onClick={toggleAllFilters}
                className="hover:text-white transition-colors"
                style={{ fontSize: T.type.micro.size, textTransform: 'lowercase' }}
              >
                {activeGenres.size === GENRES.length ? "none" : "all"}
              </button>
            }>Filters</RailLabel>
            <div className="flex flex-col" style={{ gap: T.spacing[1] }}>
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
        <div style={{ position: "relative", overflow: "hidden", background: T.surface[0] }}>
          {/* axes */}
          <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none flex flex-col justify-between items-center py-8"
            style={{ width: 40, borderRight: `1px solid ${T.border.subtle}`, zIndex: 10 }}
          >
            <div className="font-mono text-[10px] text-muted-foreground rotate-[-90deg] whitespace-nowrap" style={{ color: T.text.disabled }}>INTENSE</div>
            <div className="font-mono text-[10px] text-muted-foreground rotate-[-90deg] whitespace-nowrap" style={{ color: T.text.disabled }}>DRIVING</div>
            <div className="font-mono text-[10px] text-muted-foreground rotate-[-90deg] whitespace-nowrap" style={{ color: T.text.disabled }}>MELLOW</div>
            <div className="font-mono text-[10px] text-muted-foreground rotate-[-90deg] whitespace-nowrap" style={{ color: T.text.disabled }}>CALM</div>
          </div>

          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none flex justify-between px-16"
            style={{ height: 24, borderTop: `1px solid ${T.border.subtle}`, zIndex: 10, alignItems: 'center' }}
          >
            {[60, 90, 120, 150, 180].map(bpm => (
              <div key={bpm} className="font-mono text-[10px]" style={{ color: T.text.disabled }}>
                {bpm} BPM
              </div>
            ))}
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            style={{ display: "block", position: 'absolute', inset: 0 }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <radialGradient id="bgglow" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={T.surface[1]} stopOpacity="0.4" />
                <stop offset="100%" stopColor={T.surface[0]} stopOpacity="1" />
              </radialGradient>
              
              {GENRES.map(g => (
                <radialGradient key={`heat-${g.key}`} id={`heat-${g.key}`} cx={`${g.cx * 100}%`} cy={`${g.cy * 100}%`} r="30%">
                  <stop offset="0%" stopColor={g.color} stopOpacity="0.15" />
                  <stop offset="50%" stopColor={g.color} stopOpacity="0.05" />
                  <stop offset="100%" stopColor={g.color} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            <rect x={0} y={0} width={W} height={H} fill="url(#bgglow)" />
            
            {/* heatmaps */}
            {GENRES.filter(g => activeGenres.has(g.key)).map(g => (
              <rect key={`heatrect-${g.key}`} x={0} y={0} width={W} height={H} fill={`url(#heat-${g.key})`} />
            ))}

            {/* grid */}
            <g opacity={0.3}>
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`vx${i}`} x1={(W / 8) * i} y1={0} x2={(W / 8) * i} y2={H} stroke={T.border.subtle} strokeDasharray="2 4" />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={`hx${i}`} x1={0} y1={(H / 6) * i} x2={W} y2={(H / 6) * i} stroke={T.border.subtle} strokeDasharray="2 4" />
              ))}
            </g>

            {/* leader lines & genre labels */}
            {GENRES.filter((g) => activeGenres.has(g.key)).map((g) => {
              const startX = g.cx * W;
              const startY = g.cy * H - 30;
              const endX = g.cx > 0.5 ? W - 20 : 60;
              const endY = g.cy * H - 60;
              
              return (
                <g key={`lbl-${g.key}`} opacity={0.6}>
                  <path 
                    d={`M ${startX} ${startY} L ${startX} ${endY + 10} L ${endX} ${endY + 10}`} 
                    fill="none" 
                    stroke={g.color} 
                    strokeWidth={1} 
                    opacity={0.3} 
                  />
                  <circle cx={startX} cy={startY} r={2} fill={g.color} opacity={0.5} />
                  <text
                    x={endX}
                    y={endY}
                    textAnchor={g.cx > 0.5 ? "end" : "start"}
                    fontFamily={T.font.mono}
                    fontSize={T.type.monoXs.size}
                    letterSpacing={T.type.monoXs.tracking}
                    fill={g.color}
                    style={{ textTransform: "uppercase" }}
                  >
                    {g.label}
                  </text>
                </g>
              );
            })}

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
                    opacity={isPeek ? 1 : 0.8}
                    stroke={T.surface[0]}
                    strokeWidth={isPeek ? 0 : 0.5}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(a)}
                    onClick={() => setSelected(a)}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Hover HUD */}
          {hovered && (
            <div 
              className="absolute pointer-events-none"
              style={{
                left: Math.min(hovered.x * W + 16, W - 180),
                top: Math.min(hovered.y * H - 16, H - 100),
                width: 160,
                background: T.overlay.blackScrim50,
                backdropFilter: "blur(12px)",
                border: `1px solid ${T.border.default}`,
                borderRadius: T.radius.sm,
                padding: T.spacing[2],
                zIndex: 20,
              }}
            >
              <div style={{ color: T.text.primary, fontSize: T.type.caption.size, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {hovered.title}
              </div>
              <div style={{ color: T.text.secondary, fontSize: T.type.micro.size, marginBottom: T.spacing[2], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {hovered.artist}
              </div>
              <div className="flex gap-3 font-mono" style={{ fontSize: T.type.monoXs.size, color: T.text.muted }}>
                <div><span style={{ color: hovered.color }}>■</span> {hovered.bpm} BPM</div>
                <div>{hovered.key}</div>
                <div>E:{hovered.energy}</div>
              </div>
            </div>
          )}
        </div>

        {/* right peek panel */}
        <div 
          className="flex flex-col border-l relative" 
          style={{ 
            borderColor: T.border.default,
            background: T.surface[1],
          }}
        >
          {peeked ? (
            <div className="flex-1 flex flex-col overflow-y-auto pb-[100px]">
              {/* gradient art header - more physical */}
              <div
                style={{
                  height: 200,
                  background: `linear-gradient(180deg, ${peeked.color}33, ${T.surface[1]} 100%)`,
                  position: "relative",
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: T.spacing[5]
                }}
              >
                {/* stylized noise/grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundSize: '4px 4px',
                    backgroundImage: `radial-gradient(circle, ${T.border.strong} 1px, transparent 1px)`,
                    opacity: 0.3
                  }}
                />
                
                {/* Cover art box */}
                <div 
                  style={{ 
                    width: 100, 
                    height: 100, 
                    background: `linear-gradient(135deg, ${peeked.color}, #222)`,
                    borderRadius: T.radius.sm,
                    boxShadow: `0 8px 24px ${T.overlay.blackScrim40}, 0 1px 2px ${T.overlay.blackScrim50}`,
                    border: `1px solid ${T.border.strong}`,
                    zIndex: 2,
                    position: 'relative'
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-sm">
                    <Play fill="white" size={32} />
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-4">
                <div
                  style={{
                    fontSize: T.type.headline.size,
                    fontWeight: T.type.headline.weight,
                    letterSpacing: T.type.headline.tracking,
                    marginBottom: T.spacing[1],
                    color: T.text.primary
                  }}
                >
                  {peeked.title}
                </div>
                <div
                  style={{
                    fontSize: T.type.bodySm.size,
                    color: T.text.secondary,
                    marginBottom: T.spacing[4],
                  }}
                >
                  {peeked.artist} <span className="mx-2 text-muted-foreground">•</span> <span className="font-mono">{peeked.year}</span>
                </div>

                {/* mini-spectrum viz */}
                <div 
                  className="p-4 mb-6"
                  style={{
                    background: T.surface[2],
                    borderRadius: T.radius.md,
                    border: `1px solid ${T.border.default}`
                  }}
                >
                  <div className="flex justify-between items-end mb-3">
                    <div className="font-mono text-[10px] uppercase text-muted-foreground" style={{ color: T.text.muted }}>Spectral Analysis</div>
                    <div className="font-mono text-[10px]" style={{ color: peeked.color }}>{peeked.key}</div>
                  </div>
                  
                  <div className="flex items-end gap-[2px] h-12 mb-4">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const rng = mulberry32(peeked.id + i);
                      const h = Math.max(10, Math.floor(rng() * 100));
                      return (
                        <div 
                          key={i} 
                          className="flex-1 rounded-t-sm opacity-80" 
                          style={{ 
                            height: `${h}%`, 
                            background: i % 4 === 0 ? peeked.color : T.surface[4]
                          }} 
                        />
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between font-mono text-[10px] mb-1">
                        <span style={{ color: T.text.muted }}>ENERGY</span>
                        <span style={{ color: T.text.primary }}>{peeked.energy}/10</span>
                      </div>
                      <div className="h-1 rounded-full bg-black overflow-hidden border" style={{ borderColor: T.border.subtle }}>
                        <div className="h-full rounded-full" style={{ width: `${peeked.energy * 10}%`, background: peeked.color }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-mono text-[10px] mb-1">
                        <span style={{ color: T.text.muted }}>BPM</span>
                        <span style={{ color: T.text.primary }}>{peeked.bpm}</span>
                      </div>
                      <div className="h-1 rounded-full bg-black overflow-hidden border" style={{ borderColor: T.border.subtle }}>
                        <div className="h-full rounded-full bg-white opacity-80" style={{ width: `${(peeked.bpm / 200) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="font-mono text-[10px] text-muted-foreground self-center mr-1" style={{ color: T.text.muted }}>TAGS</span>
                  <div 
                    className="font-mono text-[10px] px-2 py-1 rounded-sm border" 
                    style={{ borderColor: T.border.default, color: peeked.color, background: `${peeked.color}11` }}
                  >
                    {GENRES.find(g => g.key === peeked.genre)?.label.toUpperCase()}
                  </div>
                  <div className="font-mono text-[10px] px-2 py-1 rounded-sm border" style={{ borderColor: T.border.default, color: T.text.secondary }}>STUDIO</div>
                  <div className="font-mono text-[10px] px-2 py-1 rounded-sm border" style={{ borderColor: T.border.default, color: T.text.secondary }}>LOSSLESS</div>
                </div>
                
                {/* Nearby */}
                <div>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground mb-3" style={{ color: T.text.muted }}>Nearby in cluster</div>
                  <div className="flex flex-col gap-2">
                    {visible
                      .filter((a) => a.genre === (peeked?.genre ?? "house") && a.id !== peeked?.id)
                      .slice(0, 4)
                      .map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2 rounded-sm cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => setSelected(a)}
                          style={{ border: `1px solid transparent` }}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-sm shrink-0" style={{ background: `linear-gradient(135deg, ${a.color}, #333)` }} />
                            <div className="truncate">
                              <div className="text-[12px] truncate" style={{ color: T.text.primary }}>{a.title}</div>
                              <div className="text-[11px] truncate" style={{ color: T.text.secondary }}>{a.artist}</div>
                            </div>
                          </div>
                          <div className="font-mono text-[10px] shrink-0 ml-2" style={{ color: T.text.muted }}>
                            {a.bpm} BPM
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-sm" style={{ color: T.text.muted }}>
              Select an album in the atlas to view detailed telemetry.
            </div>
          )}

          {/* Now playing strip - bottom fixed */}
          {peeked && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-[80px] px-4 flex items-center gap-4"
              style={{
                background: T.surface[2],
                borderTop: `1px solid ${T.border.default}`,
                boxShadow: `0 -10px 40px ${T.overlay.blackScrim30}`
              }}
            >
              <div className="flex items-center gap-2 shrink-0">
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white"><SkipBack size={16} fill="currentColor" /></button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black hover:bg-white/90"><Play size={20} fill="currentColor" className="ml-1" /></button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white"><SkipForward size={16} fill="currentColor" /></button>
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: T.text.muted }}>
                  <span>0:00</span>
                  <span style={{ color: peeked.color }}>ANALYZING...</span>
                  <span>4:23</span>
                </div>
                {/* Fake waveform */}
                <div className="h-4 flex items-end gap-[1px] opacity-40">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-white rounded-t-sm" 
                      style={{ 
                        height: `${Math.max(10, Math.random() * 100)}%`,
                        background: i < 15 ? peeked.color : T.surface[4]
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
