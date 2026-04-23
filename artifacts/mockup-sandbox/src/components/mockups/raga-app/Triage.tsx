import { useMemo, useState } from "react";
import {
  Sparkles,
  Music,
  ChevronRight,
  ChevronLeft,
  Play,
  SkipForward,
  Plus,
  Check,
  X,
  Tag,
  FolderInput,
  Wand2,
  Volume2,
  Disc3,
} from "lucide-react";
import { TOKENS } from "./DesignSystem";

const T = TOKENS;

// ---------- synthetic queue ----------
type SuggestedTag = { label: string; conf: number; category: TagCat };
type TagCat = "genre" | "mood" | "energy" | "use";

type IncomingTrack = {
  id: number;
  title: string;
  artist: string;
  album: string;
  source: string;
  bpm: number;
  key: string;
  duration: string;
  hue: string;
  hue2: string;
  suggested: SuggestedTag[];
};

const QUEUE: IncomingTrack[] = [
  {
    id: 1,
    title: "Kaiku",
    artist: "Kiasmos",
    album: "Blurred EP",
    source: "~/Downloads/2026-04 Bandcamp/",
    bpm: 116,
    key: "9A · F minor",
    duration: "6:42",
    hue: TOKENS.accent[400],
    hue2: TOKENS.accent2[500],
    suggested: [
      { label: "Minimal Techno", conf: 0.94, category: "genre" },
      { label: "Late Night",     conf: 0.88, category: "mood"  },
      { label: "Mid Energy",     conf: 0.71, category: "energy"},
      { label: "Focus",          conf: 0.66, category: "use"   },
      { label: "Cinematic",      conf: 0.58, category: "mood"  },
    ],
  },
  { id: 2, title: "Drift Code",       artist: "Andy Stott",      album: "Faith in Strangers", source: "~/Downloads/2026-04 Bandcamp/", bpm: 92,  key: "5A · D minor",   duration: "5:31", hue: "#8b5cf6",          hue2: TOKENS.accent[600],  suggested: [] },
  { id: 3, title: "Two Thousand and Seventeen", artist: "Four Tet", album: "New Energy",     source: "~/Downloads/2026-04 Bandcamp/", bpm: 124, key: "11B · A major",  duration: "4:12", hue: TOKENS.accent2[400], hue2: TOKENS.semantic.warning, suggested: [] },
  { id: 4, title: "Subeo",            artist: "Nicolas Jaar",    album: "Sirens",            source: "~/Downloads/2026-04 Bandcamp/", bpm: 105, key: "7A · A minor",   duration: "8:02", hue: TOKENS.accent[300],  hue2: "#8b5cf6",           suggested: [] },
  { id: 5, title: "Surround",         artist: "Floating Points", album: "Crush",             source: "~/Downloads/2026-04 Bandcamp/", bpm: 88,  key: "3B · D♭ major",  duration: "3:48", hue: TOKENS.semantic.info, hue2: TOKENS.accent[500], suggested: [] },
];

// per-category palettes for tags
const CAT_COLOR: Record<TagCat, string> = {
  genre:  TOKENS.accent[400],
  mood:   TOKENS.accent2[400],
  energy: TOKENS.semantic.warning,
  use:    TOKENS.semantic.info,
};

// ---------- subcomponents ----------
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

const TagPill = ({
  label,
  conf,
  color,
  selected,
  onClick,
}: {
  label: string;
  conf?: number;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center transition-colors"
    style={{
      gap: T.spacing[1] + 2,
      padding: `${T.spacing[1] + 1}px ${T.spacing[2] + 2}px`,
      borderRadius: T.radius.pill,
      background: selected ? color : `color-mix(in srgb, ${color} 14%, transparent)`,
      border: `1px solid ${selected ? color : `color-mix(in srgb, ${color} 38%, transparent)`}`,
      color: selected ? T.fg.onAccent : T.text.primary,
      fontSize: T.type.bodySm.size,
      fontWeight: selected ? 600 : 500,
    }}
  >
    {selected && <Check size={T.size.iconSm} />}
    {label}
    {conf != null && (
      <span
        className="font-mono"
        style={{
          fontSize: T.type.monoXs.size,
          letterSpacing: T.type.monoXs.tracking,
          color: selected ? T.fg.onAccent : T.text.muted,
          opacity: selected ? 0.85 : 1,
        }}
      >
        {Math.round(conf * 100)}%
      </span>
    )}
  </button>
);

// procedural waveform
function makeWaveform(seed: number, n: number): number[] {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const env = Math.sin((i / n) * Math.PI) * 0.7 + 0.3;
    out.push(0.15 + r * 0.85 * env);
  }
  return out;
}

const Waveform = ({
  seed,
  progress,
  color,
}: {
  seed: number;
  progress: number;
  color: string;
}) => {
  const bars = useMemo(() => makeWaveform(seed, 110), [seed]);
  return (
    <div
      className="flex items-center"
      style={{
        gap: 2,
        height: 64,
        padding: T.spacing[2],
        background: T.surface[1],
        border: `1px solid ${T.border.subtle}`,
        borderRadius: T.radius.md,
      }}
    >
      {bars.map((h, i) => {
        const played = i / bars.length < progress;
        return (
          <div
            key={i}
            style={{
              width: 3,
              flex: 1,
              height: `${h * 100}%`,
              background: played ? color : T.overlay.whiteFill,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
};

// ---------- main ----------
export default function Triage() {
  const [idx, setIdx] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Record<TagCat, Set<string>>>({
    genre:  new Set(["Minimal Techno"]),
    mood:   new Set(["Late Night"]),
    energy: new Set(["Mid Energy"]),
    use:    new Set(),
  });

  const track = QUEUE[idx];
  const remaining = QUEUE.length - idx - 1;

  // pretend later tracks have similar suggestions (mockup)
  const suggested = track.suggested.length
    ? track.suggested
    : QUEUE[0].suggested;

  const toggle = (cat: TagCat, label: string) => {
    setSelectedTags((s) => {
      const next = { ...s, [cat]: new Set(s[cat]) };
      if (next[cat].has(label)) next[cat].delete(label);
      else next[cat].add(label);
      return next;
    });
  };

  const advance = () => {
    setIdx((i) => Math.min(QUEUE.length - 1, i + 1));
  };

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
          <FolderInput size={T.size.iconLg} color={T.accent2[400]} />
          <div
            style={{
              fontSize: T.type.title.size,
              fontWeight: T.type.title.weight,
            }}
          >
            Import Triage
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
            ~/Downloads/2026-04 Bandcamp
          </div>
        </div>

        <div className="flex items-center" style={{ gap: T.spacing[3] }}>
          {/* progress */}
          <div className="flex items-center" style={{ gap: T.spacing[2] }}>
            <span
              className="font-mono"
              style={{
                fontSize: T.type.monoSm.size,
                color: T.text.secondary,
              }}
            >
              {idx + 1} / {QUEUE.length}
            </span>
            <div
              style={{
                width: 160,
                height: 4,
                background: T.overlay.whiteFill,
                borderRadius: T.radius.pill,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${((idx + 1) / QUEUE.length) * 100}%`,
                  height: "100%",
                  background: T.accent[400],
                  borderRadius: T.radius.pill,
                }}
              />
            </div>
          </div>

          {/* mode toggle */}
          <div
            className="flex items-center"
            style={{
              padding: 2,
              background: T.surface[2],
              border: `1px solid ${T.border.default}`,
              borderRadius: T.radius.md,
            }}
          >
            {["1-by-1", "batch grid"].map((m, i) => (
              <button
                key={m}
                style={{
                  padding: `${T.spacing[1] + 1}px ${T.spacing[3]}px`,
                  borderRadius: T.radius.sm,
                  background: i === 0 ? T.overlay.whiteFill : "transparent",
                  color: i === 0 ? T.text.primary : T.text.muted,
                  fontSize: T.type.caption.size,
                  textTransform: "capitalize",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* body */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 320px",
          gap: T.spacing[4],
          padding: T.spacing[4],
        }}
      >
        {/* main triage card */}
        <div className="flex flex-col" style={{ gap: T.spacing[4] }}>
          <Section style={{ overflow: "hidden" }}>
            {/* hero */}
            <div
              className="relative"
              style={{
                height: 160,
                background: `linear-gradient(125deg, ${track.hue}, ${track.hue2} 70%, ${T.surface[2]})`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.18), transparent 60%)",
                }}
              />
              <div
                className="absolute flex items-end justify-between"
                style={{
                  inset: 0,
                  padding: T.spacing[5],
                }}
              >
                <div>
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: T.type.micro.size,
                      letterSpacing: T.type.micro.tracking,
                      color: T.overlay.whiteFill,
                      marginBottom: T.spacing[1],
                      mixBlendMode: "screen",
                    }}
                  >
                    Now reviewing
                  </div>
                  <div
                    style={{
                      fontSize: T.type.display.size,
                      fontWeight: T.type.display.weight,
                      letterSpacing: T.type.display.tracking,
                      color: "#fff",
                      lineHeight: 1.05,
                      textShadow: `0 2px 8px ${T.overlay.blackScrim40}`,
                    }}
                  >
                    {track.title}
                  </div>
                  <div
                    style={{
                      fontSize: T.type.body.size,
                      color: "rgba(255,255,255,0.85)",
                      marginTop: T.spacing[1],
                    }}
                  >
                    {track.artist} · {track.album}
                  </div>
                </div>

                <button
                  className="flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: T.radius.pill,
                    background: T.text.primary,
                    color: T.surface[0],
                    boxShadow: `0 6px 20px ${T.overlay.blackScrim40}`,
                  }}
                >
                  <Play size={20} fill={T.surface[0]} />
                </button>
              </div>
            </div>

            <div style={{ padding: T.spacing[5] }}>
              {/* metadata strip */}
              <div
                className="flex items-center"
                style={{
                  gap: T.spacing[4],
                  paddingBottom: T.spacing[4],
                  borderBottom: `1px solid ${T.border.subtle}`,
                  marginBottom: T.spacing[4],
                }}
              >
                {[
                  { label: "BPM",      value: track.bpm.toString() },
                  { label: "Key",      value: track.key },
                  { label: "Length",   value: track.duration },
                  { label: "Source",   value: track.source.replace("~/Downloads/", "…/") },
                ].map((s) => (
                  <div key={s.label}>
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
                        fontSize: T.type.monoMd.size,
                        color: T.text.primary,
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* waveform */}
              <div className="flex items-center" style={{ gap: T.spacing[3], marginBottom: T.spacing[5] }}>
                <Volume2 size={T.size.iconMd} color={T.text.muted} />
                <div className="flex-1">
                  <Waveform seed={track.id * 99} progress={0.42} color={T.accent[400]} />
                </div>
                <span
                  className="font-mono"
                  style={{ fontSize: T.type.monoSm.size, color: T.text.muted }}
                >
                  2:51 / {track.duration}
                </span>
              </div>

              {/* AI suggested row */}
              <div style={{ marginBottom: T.spacing[5] }}>
                <div
                  className="flex items-center"
                  style={{ gap: T.spacing[2], marginBottom: T.spacing[3] }}
                >
                  <Sparkles size={T.size.iconMd} color={T.accent[400]} />
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: T.type.micro.size,
                      letterSpacing: T.type.micro.tracking,
                      color: T.text.muted,
                    }}
                  >
                    Suggested by analyzer
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    className="flex items-center"
                    style={{
                      gap: T.spacing[1],
                      padding: `${T.spacing[1]}px ${T.spacing[2]}px`,
                      borderRadius: T.radius.sm,
                      background: T.overlay.whiteSubtle,
                      color: T.text.secondary,
                      fontSize: T.type.caption.size,
                    }}
                  >
                    <Wand2 size={T.size.iconSm} /> Accept all ≥ 80%
                  </button>
                </div>
                <div className="flex flex-wrap" style={{ gap: T.spacing[2] }}>
                  {suggested.map((s) => (
                    <TagPill
                      key={s.label}
                      label={s.label}
                      conf={s.conf}
                      color={CAT_COLOR[s.category]}
                      selected={selectedTags[s.category].has(s.label)}
                      onClick={() => toggle(s.category, s.label)}
                    />
                  ))}
                </div>
              </div>

              {/* tag categories */}
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: T.spacing[4] }}>
                {(["genre", "mood", "energy", "use"] as TagCat[]).map((cat) => (
                  <div key={cat}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: T.spacing[2] }}
                    >
                      <div className="flex items-center" style={{ gap: T.spacing[2] }}>
                        <span
                          style={{
                            width: T.size.indicatorDot,
                            height: T.size.indicatorDot,
                            borderRadius: T.radius.pill,
                            background: CAT_COLOR[cat],
                          }}
                        />
                        <span
                          className="font-mono uppercase"
                          style={{
                            fontSize: T.type.micro.size,
                            letterSpacing: T.type.micro.tracking,
                            color: T.text.muted,
                          }}
                        >
                          {cat}
                        </span>
                      </div>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: T.type.monoXs.size,
                          color: T.text.disabled,
                        }}
                      >
                        {selectedTags[cat].size} selected
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap items-center"
                      style={{
                        gap: T.spacing[1] + 2,
                        padding: T.spacing[3],
                        background: T.surface[1],
                        border: `1px dashed ${T.border.subtle}`,
                        borderRadius: T.radius.md,
                        minHeight: 78,
                      }}
                    >
                      {[...selectedTags[cat]].map((label) => (
                        <TagPill key={label} label={label} color={CAT_COLOR[cat]} selected />
                      ))}
                      <button
                        className="inline-flex items-center justify-center"
                        style={{
                          gap: T.spacing[1],
                          padding: `${T.spacing[1] + 1}px ${T.spacing[2] + 2}px`,
                          borderRadius: T.radius.pill,
                          border: `1px dashed ${T.border.strong}`,
                          color: T.text.muted,
                          fontSize: T.type.caption.size,
                        }}
                      >
                        <Plus size={T.size.iconSm} />
                        add tag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* action bar */}
          <Section
            style={{
              padding: `${T.spacing[3]}px ${T.spacing[4]}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="flex items-center" style={{ gap: T.spacing[3] }}>
              {[
                { k: "←", l: "Back" },
                { k: "→", l: "Save & next" },
                { k: "Space", l: "Play/Pause" },
                { k: "T", l: "Tag" },
                { k: "S", l: "Skip" },
              ].map((s) => (
                <div key={s.k} className="flex items-center" style={{ gap: T.spacing[1] + 2 }}>
                  <kbd
                    className="font-mono"
                    style={{
                      fontSize: T.type.monoXs.size,
                      padding: `2px 6px`,
                      background: T.overlay.whiteFill,
                      border: `1px solid ${T.border.default}`,
                      borderRadius: T.radius.xs,
                      color: T.text.secondary,
                    }}
                  >
                    {s.k}
                  </kbd>
                  <span style={{ fontSize: T.type.caption.size, color: T.text.muted }}>
                    {s.l}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center" style={{ gap: T.spacing[2] }}>
              <button
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                className="flex items-center justify-center"
                style={{
                  width: T.size.controlMd,
                  height: T.size.controlMd,
                  borderRadius: T.radius.md,
                  background: T.overlay.whiteSubtle,
                  border: `1px solid ${T.border.default}`,
                  color: T.text.secondary,
                }}
              >
                <ChevronLeft size={T.size.iconMd} />
              </button>
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
                <SkipForward size={T.size.iconMd} />
                Skip
              </button>
              <button
                onClick={advance}
                className="flex items-center"
                style={{
                  gap: T.spacing[2],
                  height: T.size.controlMd,
                  padding: `0 ${T.spacing[4]}px`,
                  borderRadius: T.radius.md,
                  background: T.accent[500],
                  color: T.fg.onAccent,
                  fontSize: T.type.body.size,
                  fontWeight: 600,
                  boxShadow: `0 4px 16px ${T.overlay.blackScrim30}`,
                }}
              >
                Save & next
                <ChevronRight size={T.size.iconMd} />
              </button>
            </div>
          </Section>
        </div>

        {/* upcoming queue */}
        <div className="flex flex-col" style={{ gap: T.spacing[3] }}>
          <RailLabel>Up next · {remaining}</RailLabel>
          {QUEUE.slice(idx + 1).map((t) => (
            <Section
              key={t.id}
              style={{ padding: T.spacing[3], display: "flex", alignItems: "center", gap: T.spacing[3] }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: T.radius.md,
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${t.hue}, ${t.hue2})`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Disc3
                  size={20}
                  color="rgba(255,255,255,0.6)"
                  style={{ position: "absolute", right: 4, bottom: 4 }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{ fontSize: T.type.bodySm.size, color: T.text.primary }}
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
                  {t.artist} · {t.bpm} BPM · {t.key.split(" · ")[0]}
                </div>
              </div>
              <Tag size={T.size.iconSm} color={T.text.disabled} />
            </Section>
          ))}

          {/* batch summary */}
          <Section
            style={{
              padding: T.spacing[4],
              background: T.surface[1],
              border: `1px dashed ${T.border.default}`,
            }}
          >
            <div className="flex items-center" style={{ gap: T.spacing[2], marginBottom: T.spacing[3] }}>
              <Music size={T.size.iconMd} color={T.accent[400]} />
              <div className="font-mono uppercase" style={{
                fontSize: T.type.micro.size, letterSpacing: T.type.micro.tracking,
                color: T.text.muted,
              }}>
                Session summary
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: T.spacing[2] }}>
              {[
                { k: "Tagged",   v: idx },
                { k: "Skipped",  v: 0 },
                { k: "Remaining", v: remaining + 1 },
                { k: "AI accepted", v: Math.floor(idx * 0.6) },
              ].map((s) => (
                <div key={s.k}>
                  <div
                    style={{ fontSize: T.type.caption.size, color: T.text.muted }}
                  >
                    {s.k}
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: T.type.monoLg.size, color: T.text.primary }}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full flex items-center justify-center mt-4"
              style={{
                gap: T.spacing[2],
                height: T.size.controlMd,
                marginTop: T.spacing[3],
                borderRadius: T.radius.md,
                background: T.overlay.whiteFill,
                border: `1px solid ${T.border.strong}`,
                color: T.text.primary,
                fontSize: T.type.bodySm.size,
              }}
            >
              <X size={T.size.iconSm} />
              Stop & finalize
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}
