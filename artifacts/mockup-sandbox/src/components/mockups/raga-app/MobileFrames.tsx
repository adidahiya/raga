import React from "react";
import {
  Signal,
  Wifi,
  BatteryFull,
  Disc3,
  Search,
  Library,
  ListMusic,
  Edit3,
  Settings,
  ChevronLeft,
  MoreHorizontal,
  Plus,
  UploadCloud,
  GripVertical,
  Star,
  Check,
  Loader2,
  X,
  Lock,
} from "lucide-react";
import { TOKENS } from "./DesignSystem";

const T = TOKENS;

const SAMPLE_TRACKS = [
  { id: 1, title: "Vocoder", artist: "Floating Points", bpm: 130, key: "Am", genre: "Electronic", rating: 5, tags: ["gig-ready"], syncState: "synced" },
  { id: 2, title: "Pick Up", artist: "DJ Koze", bpm: 124, key: "F#m", genre: "House", rating: 4, tags: ["deep"], syncState: "pending" },
  { id: 3, title: "Gosh", artist: "Jamie xx", bpm: 137, key: "Em", genre: "UK Garage", rating: 5, tags: ["peak-time"], syncState: "synced" },
  { id: 4, title: "Rev8617", artist: "Skee Mask", bpm: 135, key: "Bm", genre: "Techno", rating: 4, tags: [], syncState: "synced" },
  { id: 5, title: "Archangel", artist: "Burial", bpm: 134, key: "Cm", genre: "Dubstep", rating: 5, tags: ["late-night"], syncState: "conflict" },
  { id: 6, title: "Blanked", artist: "Pearson Sound", bpm: 132, key: "Dm", genre: "Bass", rating: 4, tags: [], syncState: "synced" },
  { id: 7, title: "Joli Mai", artist: "Daphni", bpm: 126, key: "Gm", genre: "House", rating: 4, tags: ["warmup"], syncState: "synced" },
  { id: 8, title: "Baby", artist: "Four Tet", bpm: 127, key: "A#m", genre: "Electronic", rating: 5, tags: [], syncState: "synced" },
];

function getGenreColor(genre: string) {
  const hash = genre.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [T.accent[400], T.accent2[400], T.semantic.info, T.semantic.success, T.semantic.warning, T.semantic.danger, T.accent2[200]];
  return colors[hash % colors.length];
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        borderRadius: 44,
        background: T.surface[1],
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), 0 8px 24px -4px rgba(0,0,0,0.4)",
        border: `1px solid ${T.border.strong}`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 44,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 50,
        }}
      >
        <div style={{ fontFamily: T.font.mono, fontSize: 14, fontWeight: 600, color: T.text.primary }}>
          9:41
        </div>
        <div
          style={{
            width: 110,
            height: 28,
            borderRadius: 999,
            background: T.surface[0],
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div style={{ display: "flex", gap: 6, color: T.text.secondary }}>
          <Signal size={14} />
          <Wifi size={14} />
          <BatteryFull size={14} />
        </div>
      </div>

      <div style={{ width: "100%", height: "100%", paddingTop: 44, paddingBottom: 34, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {children}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 134,
          height: 5,
          borderRadius: 999,
          background: T.text.muted,
          opacity: 0.4,
          zIndex: 50,
        }}
      />
    </div>
  );
}

function AppBar({
  title,
  showBack = false,
  trailing,
}: {
  title: string;
  showBack?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
      <div style={{ width: 40, display: "flex", alignItems: "center" }}>
        {showBack && <ChevronLeft size={22} color={T.text.secondary} />}
      </div>
      <div style={{ fontSize: T.type.title.size, fontWeight: T.type.title.weight, fontFamily: T.font.sans }}>
        {title}
      </div>
      <div style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
        {trailing}
      </div>
    </div>
  );
}

export default function MobileFrames() {
  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: T.surface[0], color: T.text.primary, fontFamily: T.font.sans }}>
      <div style={{ height: 64, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border.default}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Disc3 size={24} color={T.accent[400]} />
          <div style={{ fontSize: T.type.headline.size, fontWeight: T.type.headline.weight }}>Raga Mobile</div>
          <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Phase 1 — companion to the desktop</div>
        </div>
        <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted, padding: "4px 8px", background: T.surface[2], borderRadius: 4, border: `1px solid ${T.border.default}` }}>
          iOS · dark
        </div>
      </div>

      <div style={{ display: "flex", gap: T.spacing[8], padding: `24px ${T.spacing[8]}px`, flex: 1, alignItems: "center", overflowX: "auto" }}>
        {/* Screen 01 - Library */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, shrink: 0 }}>
          <Phone>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <AppBar
                title="Library"
                trailing={
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.surface[2], padding: "4px 8px", borderRadius: 999, border: `1px solid ${T.border.default}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.semantic.success }} />
                    <span style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.secondary, whiteSpace: "nowrap" }}>Synced 2m ago</span>
                  </div>
                }
              />

              <div style={{ display: "flex", padding: "0 16px", borderBottom: `1px solid ${T.border.default}` }}>
                <div style={{ padding: "12px 16px", fontSize: T.type.body.size, fontWeight: 500, color: T.text.primary, borderBottom: `2px solid ${T.accent[500]}` }}>Tracks</div>
                <div style={{ padding: "12px 16px", fontSize: T.type.body.size, fontWeight: 500, color: T.text.muted }}>Playlists</div>
              </div>

              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", background: T.surface[2], borderRadius: 999, padding: "8px 12px", border: `1px solid ${T.border.default}` }}>
                  <Search size={18} color={T.text.muted} />
                  <div style={{ flex: 1, marginLeft: 8, fontSize: T.type.body.size, color: T.text.muted }}>Search title, artist, album</div>
                  <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted }}>12,438</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, padding: "0 16px 16px 16px", overflowX: "auto" }}>
                {["BPM", "Key", "Rating ≥ 4", "Tag · gig-ready", "Genre"].map(chip => {
                  const active = chip === "Rating ≥ 4";
                  return (
                    <div key={chip} style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                      fontSize: T.type.bodySm.size,
                      background: active ? `${T.accent[500]}33` : T.surface[2],
                      color: active ? T.fg.onAccent : T.text.secondary,
                      border: `1px solid ${active ? T.accent[500] : T.border.subtle}`
                    }}>
                      {chip}
                    </div>
                  );
                })}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
                {SAMPLE_TRACKS.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border.subtle}` }}>
                    <div style={{ width: 12, display: "flex", justifyContent: "center" }}>
                      {t.syncState === "pending" && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.semantic.warning }} />}
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: T.radius.md, marginRight: 12,
                      background: `linear-gradient(135deg, ${getGenreColor(t.genre)}, ${T.surface[3]})`
                    }} />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: T.type.body.size, color: T.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                      <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.artist}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.secondary }}>{t.bpm}</div>
                      <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.secondary }}>{t.key}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: 60, borderTop: `1px solid ${T.border.subtle}`, background: T.surface[2], display: "flex", paddingBottom: 16 }}>
                {[
                  { icon: Library, label: "Library", active: true },
                  { icon: ListMusic, label: "Playlists" },
                  { icon: Search, label: "Search" },
                  { icon: Edit3, label: "Edits" },
                  { icon: Settings, label: "Settings" }
                ].map(tab => (
                  <div key={tab.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: tab.active ? T.accent[500] : T.text.muted }}>
                    <tab.icon size={22} />
                    <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, marginTop: 4, textTransform: "uppercase" }}>{tab.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Phone>
          <div style={{ textAlign: "center", maxWidth: 300 }}>
            <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 4 }}>01 / LIBRARY</div>
            <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Browse the full library, search and filter the way the desktop does.</div>
          </div>
        </div>

        {/* Screen 02 - Tonight's Playlist */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, shrink: 0 }}>
          <Phone>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <AppBar
                title="Tonight"
                showBack
                trailing={
                  <>
                    <MoreHorizontal size={22} color={T.text.primary} />
                    <Plus size={22} color={T.text.primary} />
                  </>
                }
              />

              <div style={{ padding: 16, background: `linear-gradient(180deg, ${T.accent[500]}1a 0%, ${T.surface[2]} 100%)` }}>
                <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted, marginBottom: 8 }}>PLAYLIST · 47 tracks · 3h 12m</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: T.text.primary, marginBottom: 4 }}>Tonight</div>
                <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted, marginBottom: 16 }}>Friday at Bossa · 22:30</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 999, background: T.accent[500], color: T.fg.onAccent, fontSize: T.type.bodySm.size, fontWeight: 500 }}>Edit order</div>
                  <div style={{ padding: "8px 16px", borderRadius: 999, background: T.surface[3], color: T.text.primary, fontSize: T.type.bodySm.size, fontWeight: 500 }}>Add tracks</div>
                </div>
              </div>

              <div style={{ margin: "0 16px 16px 16px", padding: 12, background: T.surface[2], borderRadius: 8, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${T.border.default}` }}>
                <UploadCloud size={16} color={T.semantic.warning} />
                <div style={{ flex: 1, fontSize: T.type.bodySm.size, color: T.text.primary }}>3 edits queued · will sync when you're back online</div>
                <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, padding: "2px 6px", borderRadius: 4, background: `${T.semantic.warning}33`, color: T.semantic.warning }}>Pending</div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                {SAMPLE_TRACKS.slice(0, 6).map((t, i) => {
                  const moved = i === 1 || i === 4;
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${T.border.subtle}`, borderLeft: moved ? `1.5px solid ${T.accent[500]}80` : "1.5px solid transparent", background: moved ? `${T.accent[500]}0a` : "transparent" }}>
                      <GripVertical size={16} color={T.text.disabled} style={{ marginRight: 12 }} />
                      <div style={{ width: 24, fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.muted }}>{i + 1}</div>
                      <div style={{ flex: 1, overflow: "hidden", marginRight: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: T.type.body.size, color: T.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                          {moved && <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.accent[400] }}>·moved</div>}
                        </div>
                        <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.artist}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.secondary }}>{t.bpm}</div>
                        <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.secondary, padding: "2px 6px", background: T.surface[3], borderRadius: 4 }}>{t.key}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ height: 60, background: `linear-gradient(180deg, transparent, ${T.surface[1]})`, position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }} />
              </div>
            </div>
          </Phone>
          <div style={{ textAlign: "center", maxWidth: 300 }}>
            <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 4 }}>02 / TONIGHT</div>
            <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Reorder playlists and queue edits while offline.</div>
          </div>
        </div>

        {/* Screen 03 - Track Detail */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, shrink: 0 }}>
          <Phone>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <AppBar
                title="Track"
                showBack
                trailing={<div style={{ color: T.accent[300], fontSize: T.type.body.size, fontWeight: 500 }}>Done</div>}
              />

              <div style={{ margin: 16, height: 240, position: "relative", borderRadius: 16, overflow: "hidden", background: `linear-gradient(135deg, ${T.accent[700]}, ${T.accent2[800]})` }}>
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.15, mixBlendMode: "overlay" }}>
                  <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
                  </filter>
                  <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
                <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: T.type.headline.size, fontWeight: 600, color: T.fg.onAccent, marginBottom: 4 }}>Vocoder</div>
                    <div style={{ fontSize: T.type.bodySm.size, color: T.text.secondary }}>Floating Points</div>
                  </div>
                  <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.secondary }}>2022</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 24 }}>
                <div style={{ flex: 1, background: T.surface[2], padding: 12, borderRadius: 8, border: `1px solid ${T.border.default}` }}>
                  <div style={{ fontSize: T.type.monoLg.size, fontFamily: T.font.mono, color: T.text.primary, marginBottom: 4 }}>130</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Lock size={10} color={T.text.muted} />
                    <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted }}>from desktop</div>
                  </div>
                </div>
                <div style={{ flex: 1, background: T.surface[2], padding: 12, borderRadius: 8, border: `1px solid ${T.border.default}` }}>
                  <div style={{ fontSize: T.type.monoLg.size, fontFamily: T.font.mono, color: T.text.primary, marginBottom: 4 }}>Am</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Lock size={10} color={T.text.muted} />
                    <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted }}>from desktop</div>
                  </div>
                </div>
                <div style={{ flex: 1, background: T.surface[2], padding: 12, borderRadius: 8, border: `1px solid ${T.border.default}` }}>
                  <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.secondary, marginBottom: 8 }}>ENERGY</div>
                  <div style={{ width: "100%", height: 4, background: T.surface[3], borderRadius: 2 }}>
                    <div style={{ width: "70%", height: "100%", background: T.accent[500], borderRadius: 2 }} />
                  </div>
                </div>
              </div>

              <div style={{ padding: "0 16px", marginBottom: 24 }}>
                <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 8 }}>RATING</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={28} color={i <= 4 ? T.semantic.warning : T.text.disabled} fill={i <= 4 ? T.semantic.warning : "none"} />
                  ))}
                </div>
              </div>

              <div style={{ padding: "0 16px", flex: 1 }}>
                <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 8 }}>TAGS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["gig-ready", "late-night", "deep"].map(tag => (
                    <div key={tag} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: T.surface[2], borderRadius: 4, border: `1px solid ${T.border.strong}`, fontSize: T.type.bodySm.size, color: T.text.primary }}>
                      {tag}
                      <X size={12} color={T.text.muted} />
                    </div>
                  ))}
                  <div style={{ padding: "6px 10px", borderRadius: 4, border: `1px dashed ${T.border.strong}`, fontSize: T.type.bodySm.size, color: T.text.muted }}>+ add tag</div>
                </div>
              </div>

              <div style={{ padding: 16, borderTop: `1px solid ${T.border.default}`, background: T.surface[2] }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Check size={14} color={T.semantic.success} />
                  <div style={{ fontSize: T.type.bodySm.size, color: T.text.primary }}>Synced to cloud · 2 min ago</div>
                </div>
                <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.muted, marginLeft: 20 }}>Last edited from this device</div>
              </div>
            </div>
          </Phone>
          <div style={{ textAlign: "center", maxWidth: 300 }}>
            <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 4 }}>03 / TRACK</div>
            <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Edit metadata safely; derived signals remain read-only.</div>
          </div>
        </div>

        {/* Screen 04 - Sync Status */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, shrink: 0 }}>
          <Phone>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <AppBar
                title="Sync"
                showBack
                trailing={<Settings size={22} color={T.text.primary} />}
              />

              <div style={{ padding: 24, background: T.surface[2], borderBottom: `1px solid ${T.border.default}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: T.semantic.warning }} />
                  <div style={{ fontSize: T.type.title.size, fontWeight: 600, color: T.text.primary }}>1 conflict needs your attention</div>
                </div>
                <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.muted }}>Synced 2 minutes ago · 12,438 tracks · 38 playlists</div>
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ padding: 16, background: T.surface[2], border: `1px solid ${T.semantic.warning}80`, borderRadius: 12, marginBottom: 24 }}>
                  <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.semantic.warning, marginBottom: 8 }}>STRUCTURAL CONFLICT · PLAYLIST</div>
                  <div style={{ fontSize: T.type.title.size, fontWeight: 600, color: T.text.primary, marginBottom: 8 }}>Tonight</div>
                  <div style={{ fontSize: T.type.bodySm.size, color: T.text.secondary, marginBottom: 16, lineHeight: 1.5 }}>You reordered this playlist on iPhone, and removed 3 tracks on Mac. Pick which version to keep — or merge manually.</div>
                  
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1, background: T.surface[3], padding: 12, borderRadius: 8, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: T.type.micro.size, color: T.text.muted, marginBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>1. Vocoder</div>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>2. Baby</div>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>3. Gosh</div>
                      </div>
                      <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted, marginBottom: 12 }}>iPhone · 2m ago</div>
                      <div style={{ padding: "6px 0", textAlign: "center", border: `1px solid ${T.border.strong}`, borderRadius: 4, fontSize: T.type.bodySm.size, color: T.text.primary }}>Keep iPhone</div>
                    </div>
                    <div style={{ flex: 1, background: T.surface[3], padding: 12, borderRadius: 8, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: T.type.micro.size, color: T.text.muted, marginBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>1. Vocoder</div>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>2. Pick Up</div>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>3. Rev8617</div>
                      </div>
                      <div style={{ fontSize: T.type.monoXs.size, fontFamily: T.font.mono, color: T.text.muted, marginBottom: 12 }}>Mac · 8m ago</div>
                      <div style={{ padding: "6px 0", textAlign: "center", border: `1px solid ${T.border.strong}`, borderRadius: 4, fontSize: T.type.bodySm.size, color: T.text.primary }}>Keep Mac</div>
                    </div>
                  </div>
                  
                  <div style={{ width: "100%", padding: 12, textAlign: "center", background: T.accent[500], color: T.fg.onAccent, borderRadius: 8, fontSize: T.type.bodySm.size, fontWeight: 500 }}>Merge manually…</div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 12 }}>PENDING UPLOADS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { icon: Loader2, title: "Pick Up", artist: "DJ Koze", status: "47%" },
                      { icon: UploadCloud, title: "Archangel", artist: "Burial", status: "queued" },
                      { icon: UploadCloud, title: "Blanked", artist: "Pearson Sound", status: "queued" }
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <row.icon size={16} color={row.status === "47%" ? T.accent[400] : T.text.disabled} className={row.status === "47%" ? "animate-spin" : ""} />
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: T.type.bodySm.size, color: T.text.primary }}>{row.title}</div>
                          <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>{row.artist}</div>
                        </div>
                        <div style={{ fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: row.status === "47%" ? T.accent[400] : T.text.muted }}>{row.status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 12 }}>RECENT</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Rated 'In Colour' 5 stars · iPhone · 3m</div>
                    <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Reordered 'Tonight' · iPhone · 4m</div>
                    <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Added tag 'gig-ready' to 'Faith in Strangers' · iPhone · 6m</div>
                  </div>
                </div>
              </div>
            </div>
          </Phone>
          <div style={{ textAlign: "center", maxWidth: 300 }}>
            <div style={{ fontSize: T.type.micro.size, fontFamily: T.font.sans, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", marginBottom: 4 }}>04 / SYNC</div>
            <div style={{ fontSize: T.type.bodySm.size, color: T.text.muted }}>Transparent state. Explicit conflict resolution.</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 32px", borderTop: `1px solid ${T.border.default}`, fontSize: T.type.monoSm.size, fontFamily: T.font.mono, color: T.text.muted, marginTop: "auto" }}>
        All metadata; no audio playback. Audio streaming is Phase 2.
      </div>
    </div>
  );
}
