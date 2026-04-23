import React, { useState } from "react";
import {
  Search,
  FolderDot,
  Terminal,
  FolderTree,
  HardDrive,
  Settings,
  Play,
  Pause,
  Volume2,
  Filter,
  Activity,
  Zap,
  Star,
  ActivitySquare,
  RefreshCw,
  Clock,
  History,
  AlignLeft,
  Music,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TRACKS = [
  { id: "1", index: 1, name: "Autechre - VLetrmx", artist: "Autechre", bpm: 124, genre: "IDM", rating: 5, type: "FLAC", source: "Local", date: "2024-01-12", analyzed: true },
  { id: "2", index: 2, name: "Selected Ambient Works 85-92", artist: "Aphex Twin", bpm: 110, genre: "Ambient", rating: 5, type: "MP3", source: "Swinsian", date: "2024-01-13", analyzed: true },
  { id: "3", index: 3, name: "Halcyon On and On", artist: "Orbital", bpm: 126, genre: "Electronic", rating: 4, type: "WAV", source: "Local", date: "2024-01-14", analyzed: false },
  { id: "4", index: 4, name: "Midnight in a Perfect World", artist: "Moby", bpm: 120, genre: "Electronic", rating: 5, type: "FLAC", source: "Local", date: "2024-01-15", analyzed: true },
  { id: "5", index: 5, name: "Windowlicker", artist: "Aphex Twin", bpm: 118, genre: "IDM", rating: 5, type: "WAV", source: "Swinsian", date: "2024-01-16", analyzed: true },
  { id: "6", index: 6, name: "Strobe", artist: "deadmau5", bpm: 128, genre: "Progressive House", rating: 4, type: "MP3", source: "Local", date: "2024-01-17", analyzed: true },
  { id: "7", index: 7, name: "Blue Monday", artist: "New Order", bpm: 130, genre: "Synth-pop", rating: 5, type: "FLAC", source: "Swinsian", date: "2024-01-18", analyzed: false },
  { id: "8", index: 8, name: "Born Slippy (Nuxx)", artist: "Underworld", bpm: 140, genre: "Techno", rating: 5, type: "WAV", source: "Local", date: "2024-01-19", analyzed: true },
  { id: "9", index: 9, name: "Breathe", artist: "The Prodigy", bpm: 130, genre: "Breakbeat", rating: 4, type: "MP3", source: "Swinsian", date: "2024-01-20", analyzed: true },
  { id: "10", index: 10, name: "Firestarter", artist: "The Prodigy", bpm: 130, genre: "Breakbeat", rating: 5, type: "FLAC", source: "Local", date: "2024-01-21", analyzed: false },
  { id: "11", index: 11, name: "Smack My Bitch Up", artist: "The Prodigy", bpm: 135, genre: "Breakbeat", rating: 5, type: "WAV", source: "Swinsian", date: "2024-01-22", analyzed: true },
  { id: "12", index: 12, name: "Voodoo People", artist: "The Prodigy", bpm: 145, genre: "Breakbeat", rating: 4, type: "MP3", source: "Local", date: "2024-01-23", analyzed: true },
  { id: "13", index: 13, name: "Galvanize", artist: "The Chemical Brothers", bpm: 105, genre: "Big Beat", rating: 5, type: "FLAC", source: "Swinsian", date: "2024-01-24", analyzed: true },
  { id: "14", index: 14, name: "Hey Boy Hey Girl", artist: "The Chemical Brothers", bpm: 110, genre: "Big Beat", rating: 4, type: "WAV", source: "Local", date: "2024-01-25", analyzed: false },
  { id: "15", index: 15, name: "Block Rockin' Beats", artist: "The Chemical Brothers", bpm: 115, genre: "Big Beat", rating: 5, type: "MP3", source: "Swinsian", date: "2024-01-26", analyzed: true },
  { id: "16", index: 16, name: "Around the World", artist: "Daft Punk", bpm: 121, genre: "House", rating: 5, type: "FLAC", source: "Local", date: "2024-01-27", analyzed: true },
  { id: "17", index: 17, name: "Da Funk", artist: "Daft Punk", bpm: 111, genre: "House", rating: 4, type: "WAV", source: "Swinsian", date: "2024-01-28", analyzed: false },
  { id: "18", index: 18, name: "Harder, Better, Faster, Stronger", artist: "Daft Punk", bpm: 123, genre: "House", rating: 5, type: "MP3", source: "Local", date: "2024-01-29", analyzed: true },
  { id: "19", index: 19, name: "One More Time", artist: "Daft Punk", bpm: 123, genre: "House", rating: 5, type: "FLAC", source: "Swinsian", date: "2024-01-30", analyzed: true },
  { id: "20", index: 20, name: "Aerodynamic", artist: "Daft Punk", bpm: 123, genre: "House", rating: 4, type: "WAV", source: "Local", date: "2024-01-31", analyzed: true },
  { id: "21", index: 21, name: "Digital Love", artist: "Daft Punk", bpm: 123, genre: "House", rating: 4, type: "FLAC", source: "Swinsian", date: "2024-02-01", analyzed: true },
];

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-800 bg-neutral-900/50 px-1.5 font-mono text-[10px] font-medium text-neutral-400">
    {children}
  </kbd>
);

export function CommandBarFloating() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [selectedIndex, setSelectedIndex] = useState(5);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"tracks" | "export">("tracks");

  return (
    <div className="h-screen w-full bg-black text-neutral-300 font-sans flex overflow-hidden selection:bg-blue-900 selection:text-blue-50 relative">
      
      {/* THIN ICON RAIL SIDEBAR */}
      <div className="w-14 flex-shrink-0 border-r border-neutral-900/80 flex flex-col items-center py-4 gap-6 bg-[#030303] z-10 relative">
        <div className="flex flex-col gap-2 w-full px-2">
          {/* Active state: blue glowing left bar */}
          <div className="h-10 w-full rounded flex items-center justify-center text-blue-400 bg-blue-500/10 cursor-pointer relative group">
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-blue-500 rounded-r shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <Terminal size={18} />
            <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono shadow-lg">
              Tracks <Kbd>1</Kbd>
            </div>
          </div>
          <div className="h-10 w-full rounded flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50 transition-colors cursor-pointer relative group">
            <FolderTree size={18} />
            <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono shadow-lg">
              Playlists <Kbd>2</Kbd>
            </div>
          </div>
        </div>

        <div className="flex-1" />
        <div className="h-10 w-full px-2 rounded flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50 transition-colors cursor-pointer relative group">
          <Settings size={18} />
          <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono shadow-lg">
            Settings <Kbd>,</Kbd>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
        
        {/* HEADER / CHROME */}
        <header className="h-14 flex items-center justify-between px-6 bg-[#030303] border-b border-neutral-900/80 shrink-0 z-20">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-semibold tracking-wide text-white">House Sets 2025</h1>
            
            {/* View Mode Toggle */}
            <div className={cn(
              "flex items-center bg-neutral-900/50 border border-neutral-800 rounded p-0.5",
              paletteOpen ? "opacity-30 pointer-events-none" : ""
            )}>
              <button 
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
                  viewMode === "tracks" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
                )}
                onClick={() => setViewMode("tracks")}
              >
                Tracks
              </button>
              <button 
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
                  viewMode === "export" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
                )}
                onClick={() => setViewMode("export")}
              >
                Export
              </button>
            </div>
            
            <div className={cn(
              "flex items-center gap-2 border border-neutral-800 rounded bg-neutral-900/30 px-2 py-1 transition-opacity",
              paletteOpen ? "opacity-30" : ""
            )}>
              <Filter size={12} className="text-neutral-500" />
              <span className="text-xs font-mono text-neutral-400">BPM &gt; 120</span>
              <div className="w-px h-3 bg-neutral-800 mx-1" />
              <Kbd>F</Kbd>
            </div>
          </div>

          {/* MINI PLAYER - Always visible, outside palette dimming */}
          <div className="flex items-center gap-4 border border-neutral-800 bg-[#0a0a0a] rounded-full pl-1 pr-4 py-1 shadow-lg relative z-50 ring-1 ring-white/5">
            <button 
              className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors shadow-sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
            </button>
            
            <div className="flex flex-col justify-center w-48">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white truncate pr-2 leading-tight">{activeTrack.name}</span>
              </div>
              <div className="flex items-center gap-2 h-3 mt-1">
                <span className="text-[10px] font-mono text-blue-400 shrink-0 leading-none">{activeTrack.bpm}</span>
                {/* Fake Waveform */}
                <div className="flex-1 flex items-end gap-[1px] h-full opacity-70">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-[2px] bg-blue-500 rounded-t-[1px]" 
                      style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-neutral-500 leading-none">2:45</span>
              </div>
            </div>
            
            <div className="w-px h-6 bg-neutral-800 mx-1" />
            <Volume2 size={14} className="text-neutral-400 hover:text-white transition-colors cursor-pointer" />
          </div>
        </header>

        {/* TRACK TABLE - Dimmed when palette is open */}
        <div className={cn(
          "flex-1 overflow-auto bg-black transition-all duration-300 relative",
          paletteOpen ? "opacity-40 blur-[2px] pointer-events-none select-none scale-[0.995]" : ""
        )}>
          <Table className="font-mono text-xs whitespace-nowrap">
            <TableHeader className="bg-[#030303] sticky top-0 z-10 shadow-sm before:content-[''] before:absolute before:inset-0 before:border-b before:border-neutral-900/80">
              <TableRow className="border-none hover:bg-transparent text-neutral-500 h-9">
                <TableHead className="w-12 text-right pr-4 text-neutral-600 font-mono font-medium tracking-wider">#</TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16 text-right pr-4 font-medium tracking-wider">BPM</TableHead>
                <TableHead className="min-w-[280px] font-medium tracking-wider">TITLE</TableHead>
                <TableHead className="min-w-[200px] font-medium tracking-wider">ARTIST</TableHead>
                <TableHead className="w-32 font-medium tracking-wider">GENRE</TableHead>
                <TableHead className="w-24 font-medium tracking-wider">RATING</TableHead>
                <TableHead className="w-16 font-medium tracking-wider">EXT</TableHead>
                <TableHead className="w-24 font-medium tracking-wider">SOURCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRACKS.map((track, i) => (
                <TableRow 
                  key={track.id} 
                  className={cn(
                    "border-b border-neutral-900/40 hover:bg-neutral-900/40 cursor-default transition-colors group h-10",
                    selectedIndex === i ? "bg-blue-500/5 hover:bg-blue-500/10 border-b-transparent relative" : ""
                  )}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() => {
                    setActiveTrack(track);
                    setIsPlaying(true);
                  }}
                >
                  {selectedIndex === i && (
                    <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] z-10" />
                  )}
                  <TableCell className={cn(
                    "text-right pr-4 transition-colors font-mono",
                    selectedIndex === i ? "text-blue-400 font-medium" : "text-neutral-600 group-hover:text-neutral-500"
                  )}>
                    {i === selectedIndex && isPlaying ? (
                      <Activity size={12} className="ml-auto text-blue-500 animate-pulse" />
                    ) : (
                      track.index.toString().padStart(2, '0')
                    )}
                  </TableCell>
                  <TableCell className="p-0">
                    {!track.analyzed ? (
                      <button className="text-neutral-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center w-full h-full">
                        <Zap size={12} />
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right pr-4 font-mono font-medium",
                    selectedIndex === i ? "text-blue-400" : (track.analyzed ? "text-emerald-500/70" : "text-neutral-600")
                  )}>
                    {track.bpm || "---"}
                  </TableCell>
                  <TableCell className={cn(
                    "font-sans text-[13px] tracking-wide",
                    selectedIndex === i ? "text-white font-medium" : "text-neutral-300"
                  )}>
                    {track.name}
                  </TableCell>
                  <TableCell className={cn(
                    "font-sans text-[13px]",
                    selectedIndex === i ? "text-neutral-300" : "text-neutral-500"
                  )}>
                    {track.artist}
                  </TableCell>
                  <TableCell className={cn(
                    "font-sans text-[12px]",
                    selectedIndex === i ? "text-neutral-400" : "text-neutral-600"
                  )}>
                    {track.genre}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star 
                          key={starIdx} 
                          size={10} 
                          className={cn(
                            starIdx < track.rating 
                              ? (selectedIndex === i ? "text-blue-500 fill-current drop-shadow-[0_0_2px_rgba(59,130,246,0.5)]" : "text-neutral-400 fill-current") 
                              : "text-neutral-800"
                          )} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    selectedIndex === i ? "text-neutral-400" : "text-neutral-600"
                  )}>
                    {track.type}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-semibold",
                      track.source === "Local" ? "bg-neutral-800/80 text-neutral-400" : "bg-indigo-900/30 text-indigo-400"
                    )}>
                      {track.source}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* STATUS BAR */}
        <footer className={cn(
          "h-8 border-t border-neutral-900/80 bg-[#030303] flex items-center justify-between px-4 shrink-0 font-mono text-[10px] text-neutral-500 z-20 transition-all",
          paletteOpen ? "opacity-30 pointer-events-none" : ""
        )}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
              <span>Library: 12,847 tracks</span>
            </div>
            <div className="w-px h-3 bg-neutral-800" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <span>Analyzer: idle</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5"><div className="flex gap-0.5"><Kbd>J</Kbd><Kbd>K</Kbd></div> <span className="opacity-60">nav</span></div>
            <div className="flex items-center gap-1.5"><Kbd>Space</Kbd> <span className="opacity-60">play</span></div>
            <div className="flex items-center gap-1.5"><Kbd>⌘</Kbd><Kbd>K</Kbd> <span className="opacity-60">command</span></div>
          </div>
        </footer>

        {/* COMMAND PALETTE SCRIM & OVERLAY */}
        {paletteOpen && (
          <div className="absolute inset-0 z-40 flex items-start justify-center pt-[10vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent pointer-events-none" />
            
            <div className="w-full max-w-[640px] bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,1)] flex flex-col backdrop-blur-2xl overflow-hidden relative">
              {/* Inner highlight ring */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/[0.02] pointer-events-none" />

              <div className="flex items-center px-4 py-1 border-b border-white/[0.06] relative">
                <Search className="mr-3 h-5 w-5 shrink-0 text-blue-500" />
                <input 
                  className="flex h-14 w-full rounded-md bg-transparent py-3 text-[15px] outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-100 font-sans tracking-wide" 
                  placeholder="Search library, playlists, or commands..." 
                  autoFocus
                  defaultValue="House"
                />
              </div>
              
              <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-hide">
                
                <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-neutral-600 font-mono uppercase mb-1">Recent</div>
                <div className="flex items-center px-3 py-2.5 text-[13px] rounded-lg text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer group transition-colors">
                  <History className="mr-3 h-4 w-4 text-neutral-500 group-hover:text-neutral-400" />
                  <span className="font-medium">Export "House Sets 2025"</span>
                  <span className="ml-auto text-[11px] text-neutral-600 font-mono">10m ago</span>
                </div>
                <div className="flex items-center px-3 py-2.5 text-[13px] rounded-lg text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer group transition-colors">
                  <Music className="mr-3 h-4 w-4 text-neutral-500 group-hover:text-neutral-400" />
                  <span className="font-medium">Play "Bicep - Glue"</span>
                  <span className="ml-auto text-[11px] text-neutral-600 font-mono">2h ago</span>
                </div>

                <div className="px-3 py-2 mt-2 text-[10px] font-bold tracking-widest text-neutral-600 font-mono uppercase mb-1">Playlists</div>
                <div className="flex items-center px-3 py-2.5 text-[13px] rounded-lg bg-blue-500/15 text-blue-100 cursor-pointer relative group overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                  <FolderDot className="mr-3 h-4 w-4 text-blue-400" />
                  <span className="font-medium">House Sets 2025</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[11px] text-blue-400/60 font-mono">245 tracks</span>
                    <Kbd>↵</Kbd>
                  </div>
                </div>
                <div className="flex items-center px-3 py-2.5 text-[13px] rounded-lg text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer group transition-colors">
                  <FolderDot className="mr-3 h-4 w-4 text-neutral-500 group-hover:text-neutral-400" />
                  <span className="font-medium">Deep House Classics</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[11px] text-neutral-600 font-mono">112 tracks</span>
                  </div>
                </div>

                <div className="px-3 py-2 mt-2 text-[10px] font-bold tracking-widest text-neutral-600 font-mono uppercase mb-1">Actions</div>
                <div className="flex items-center px-3 py-2.5 text-[13px] rounded-lg text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer group transition-colors">
                  <ActivitySquare className="mr-3 h-4 w-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                  <span className="font-medium">Analyze BPM for "House Sets 2025"</span>
                  <span className="ml-auto flex gap-1"><Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>A</Kbd></span>
                </div>
                <div className="flex items-center px-3 py-2.5 text-[13px] rounded-lg text-neutral-300 hover:bg-white/[0.04] hover:text-white cursor-pointer group transition-colors">
                  <RefreshCw className="mr-3 h-4 w-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                  <span className="font-medium">Reload library from Swinsian</span>
                  <span className="ml-auto flex gap-1"><Kbd>⌘</Kbd> <Kbd>R</Kbd></span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] px-4 py-2 bg-black/40 flex items-center justify-end gap-4 font-mono text-[10px] text-neutral-500">
                <div className="flex items-center gap-1.5"><Kbd>↵</Kbd> open</div>
                <div className="flex items-center gap-1.5"><Kbd>⌘</Kbd><Kbd>↵</Kbd> open in new</div>
                <div className="flex items-center gap-1.5"><Kbd>esc</Kbd> close</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CommandBarFloating;
