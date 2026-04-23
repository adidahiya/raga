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
  Library,
  HelpCircle
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
  { id: "1", index: 1, name: "Autechre - VLetrmx", artist: "Autechre", bpm: 124, key: "Am", genre: "IDM", rating: 5, type: "FLAC", source: "Local", date: "2024-01-12", analyzed: true },
  { id: "2", index: 2, name: "Selected Ambient Works 85-92", artist: "Aphex Twin", bpm: 110, key: "C", genre: "Ambient", rating: 5, type: "MP3", source: "Swinsian", date: "2024-01-13", analyzed: true },
  { id: "3", index: 3, name: "Halcyon On and On", artist: "Orbital", bpm: 126, key: "Gm", genre: "Electronic", rating: 4, type: "WAV", source: "Local", date: "2024-01-14", analyzed: false },
  { id: "4", index: 4, name: "Midnight in a Perfect World", artist: "Moby", bpm: 120, key: "Fm", genre: "Electronic", rating: 5, type: "FLAC", source: "Local", date: "2024-01-15", analyzed: true },
  { id: "5", index: 5, name: "Windowlicker", artist: "Aphex Twin", bpm: 118, key: "Bm", genre: "IDM", rating: 5, type: "WAV", source: "Swinsian", date: "2024-01-16", analyzed: true },
  { id: "6", index: 6, name: "Strobe", artist: "deadmau5", bpm: 128, key: "D#m", genre: "Progressive House", rating: 4, type: "MP3", source: "Local", date: "2024-01-17", analyzed: true },
  { id: "7", index: 7, name: "Blue Monday", artist: "New Order", bpm: 130, key: "Dm", genre: "Synth-pop", rating: 5, type: "FLAC", source: "Swinsian", date: "2024-01-18", analyzed: false },
  { id: "8", index: 8, name: "Born Slippy (Nuxx)", artist: "Underworld", bpm: 140, key: "E", genre: "Techno", rating: 5, type: "WAV", source: "Local", date: "2024-01-19", analyzed: true },
  { id: "9", index: 9, name: "Breathe", artist: "The Prodigy", bpm: 130, key: "F#m", genre: "Breakbeat", rating: 4, type: "MP3", source: "Swinsian", date: "2024-01-20", analyzed: true },
  { id: "10", index: 10, name: "Firestarter", artist: "The Prodigy", bpm: 130, key: "G", genre: "Breakbeat", rating: 5, type: "FLAC", source: "Local", date: "2024-01-21", analyzed: false },
  { id: "11", index: 11, name: "Smack My Bitch Up", artist: "The Prodigy", bpm: 135, key: "A#m", genre: "Breakbeat", rating: 5, type: "WAV", source: "Swinsian", date: "2024-01-22", analyzed: true },
  { id: "12", index: 12, name: "Voodoo People", artist: "The Prodigy", bpm: 145, key: "C#m", genre: "Breakbeat", rating: 4, type: "MP3", source: "Local", date: "2024-01-23", analyzed: true },
  { id: "13", index: 13, name: "Galvanize", artist: "The Chemical Brothers", bpm: 105, key: "Em", genre: "Big Beat", rating: 5, type: "FLAC", source: "Swinsian", date: "2024-01-24", analyzed: true },
  { id: "14", index: 14, name: "Hey Boy Hey Girl", artist: "The Chemical Brothers", bpm: 110, key: "F", genre: "Big Beat", rating: 4, type: "WAV", source: "Local", date: "2024-01-25", analyzed: false },
  { id: "15", index: 15, name: "Block Rockin' Beats", artist: "The Chemical Brothers", bpm: 115, key: "G#m", genre: "Big Beat", rating: 5, type: "MP3", source: "Swinsian", date: "2024-01-26", analyzed: true },
  { id: "16", index: 16, name: "Around the World", artist: "Daft Punk", bpm: 121, key: "Am", genre: "House", rating: 5, type: "FLAC", source: "Local", date: "2024-01-27", analyzed: true },
  { id: "17", index: 17, name: "Da Funk", artist: "Daft Punk", bpm: 111, key: "Bm", genre: "House", rating: 4, type: "WAV", source: "Swinsian", date: "2024-01-28", analyzed: false },
  { id: "18", index: 18, name: "Harder, Better, Faster, Stronger", artist: "Daft Punk", bpm: 123, key: "Cm", genre: "House", rating: 5, type: "MP3", source: "Local", date: "2024-01-29", analyzed: true },
  { id: "19", index: 19, name: "One More Time", artist: "Daft Punk", bpm: 123, key: "Dm", genre: "House", rating: 5, type: "FLAC", source: "Swinsian", date: "2024-01-30", analyzed: true },
  { id: "20", index: 20, name: "Aerodynamic", artist: "Daft Punk", bpm: 123, key: "Em", genre: "House", rating: 4, type: "WAV", source: "Local", date: "2024-01-31", analyzed: true },
];

const Kbd = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <kbd className={cn("pointer-events-none inline-flex h-[18px] select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-neutral-400", className)}>
    {children}
  </kbd>
);

export function CommandBarDocked() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<"tracks" | "export">("tracks");
  const [paletteOpen, setPaletteOpen] = useState(true);

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-neutral-300 font-sans flex overflow-hidden selection:bg-blue-900 selection:text-blue-50">
      
      {/* THIN ICON RAIL SIDEBAR */}
      <div className="w-14 flex-shrink-0 border-r border-white/5 flex flex-col items-center py-4 gap-4 bg-[#0a0a0a] z-20">
        <div className="flex items-center justify-center w-full mb-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold font-mono text-sm shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            R
          </div>
        </div>

        <div className="flex flex-col w-full gap-1">
          {/* Active Item */}
          <div className="h-10 w-full flex items-center justify-center text-blue-500 bg-blue-500/10 cursor-pointer relative group">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500" />
            <Library size={18} />
            <div className="absolute left-14 bg-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-white font-mono z-50">
              All Tracks <Kbd>1</Kbd>
            </div>
          </div>
          
          <div className="h-10 w-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative group">
            <FolderTree size={18} />
            <div className="absolute left-14 bg-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-white font-mono z-50">
              Playlists <Kbd>2</Kbd>
            </div>
          </div>
          
          <div className="h-10 w-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative group">
            <HardDrive size={18} />
            <div className="absolute left-14 bg-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-white font-mono z-50">
              Folders <Kbd>3</Kbd>
            </div>
          </div>

          <div className="h-10 w-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative group">
            <ActivitySquare size={18} />
            <div className="absolute left-14 bg-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-white font-mono z-50">
              Analyzer <Kbd>4</Kbd>
            </div>
          </div>
        </div>

        <div className="flex-1" />
        
        <div className="flex flex-col w-full gap-1">
          <div className="h-10 w-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative group">
            <Settings size={18} />
            <div className="absolute left-14 bg-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-white font-mono z-50">
              Settings <Kbd>,</Kbd>
            </div>
          </div>
          <div className="h-10 w-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative group">
            <HelpCircle size={18} />
            <div className="absolute left-14 bg-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-white font-mono z-50">
              Help <Kbd>?</Kbd>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0a]">
        
        {/* DOCKED COMMAND PALETTE CHROME */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 bg-[#0a0a0a] shrink-0 z-30 relative">
          
          {/* Tracks / Export Toggle */}
          <div className="flex bg-white/5 p-1 rounded-md mr-4 shrink-0">
            <button 
              className={cn("px-3 py-1 text-xs font-medium rounded-sm transition-colors", mode === "tracks" ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300")}
              onClick={() => setMode("tracks")}
            >
              Tracks
            </button>
            <button 
              className={cn("px-3 py-1 text-xs font-medium rounded-sm transition-colors", mode === "export" ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300")}
              onClick={() => setMode("export")}
            >
              Export
            </button>
          </div>

          <div className="h-6 w-px bg-white/5 mr-4" />

          {/* Search/Command Bar */}
          <div className="flex-1 flex items-center group relative" onClick={() => setPaletteOpen(true)}>
            <Badge variant="outline" className="font-mono text-[10px] bg-white/5 border-white/10 text-neutral-400 mr-2 rounded-sm px-1.5 h-5 flex items-center justify-center">⌘K</Badge>
            <span className="text-sm font-semibold tracking-wide text-white mr-2 whitespace-nowrap">House Sets 2025</span>
            <span className="text-neutral-500 text-sm mr-2 font-mono">▸</span>
            
            <div className="flex items-center gap-2 border border-blue-500/30 rounded-sm bg-blue-500/5 px-1.5 py-0.5 mr-2">
              <span className="text-xs font-mono text-blue-400">BPM &gt; 120</span>
            </div>
            
            <div className="flex items-center gap-2 border border-white/10 rounded-sm bg-white/5 px-1.5 py-0.5 mr-2">
              <span className="text-xs font-mono text-neutral-300">Genre: House</span>
            </div>

            <div className="flex-1 flex items-center relative">
              <div className="w-[1px] h-4 bg-blue-500 animate-pulse ml-1" />
              <input 
                className="flex h-10 w-full bg-transparent py-2 text-sm outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-100 font-mono ml-2 absolute inset-0 opacity-0 cursor-pointer" 
                placeholder="Filter or command..." 
                autoFocus
              />
            </div>
          </div>

          {/* MINI PLAYER */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full pl-1 pr-3 py-1 shrink-0 ml-4">
            <button 
              className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.3)]"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current ml-0.5" />}
            </button>
            
            <div className="flex flex-col justify-center w-40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-white truncate pr-2 leading-none">{activeTrack.artist} - {activeTrack.name}</span>
              </div>
              <div className="flex items-center gap-2 h-2.5 mt-1">
                {/* Waveform */}
                <div className="flex-1 flex items-end gap-[1px] h-full opacity-80">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-[2px] bg-blue-500 rounded-t-[1px]" 
                      style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1 rounded-sm leading-none py-0.5">{activeTrack.bpm}</span>
                  <span className="text-[9px] font-mono text-neutral-500 leading-none">2:45</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* INLINE COMMAND RESULTS (Dropdown under chrome) */}
        {paletteOpen && (
          <div className="absolute top-14 left-0 right-0 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 font-mono">Filters</div>
              <div className="flex items-center px-3 py-1.5 text-sm rounded-md bg-blue-500/10 text-blue-400 cursor-pointer">
                <Filter className="mr-3 h-4 w-4" />
                <span>BPM &gt; 120</span>
                <span className="ml-auto text-xs text-neutral-500 font-mono">14 tracks</span>
              </div>
              <div className="flex items-center px-3 py-1.5 text-sm rounded-md text-neutral-300 hover:bg-white/5 cursor-pointer">
                <Filter className="mr-3 h-4 w-4" />
                <span>Genre: House</span>
                <span className="ml-auto text-xs text-neutral-500 font-mono">5 tracks</span>
              </div>

              <div className="px-3 py-1.5 mt-2 text-xs font-semibold text-neutral-500 font-mono">Actions</div>
              <div className="flex items-center px-3 py-1.5 text-sm rounded-md text-neutral-300 hover:bg-white/5 cursor-pointer group">
                <ActivitySquare className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-white" />
                <span>Analyze BPM for filtered tracks</span>
                <span className="ml-auto"><Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>A</Kbd></span>
              </div>
              <div className="flex items-center px-3 py-1.5 text-sm rounded-md text-neutral-300 hover:bg-white/5 cursor-pointer group">
                <RefreshCw className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-white" />
                <span>Reload library</span>
                <span className="ml-auto"><Kbd>⌘</Kbd> <Kbd>R</Kbd></span>
              </div>
            </div>
            {/* Click away layer to close */}
            <div className="absolute inset-0 top-full h-screen" onClick={() => setPaletteOpen(false)} />
          </div>
        )}

        {/* TRACK TABLE */}
        <div className="flex-1 overflow-auto bg-[#0a0a0a]">
          <Table className="font-mono text-xs whitespace-nowrap">
            <TableHeader className="bg-[#0a0a0a] sticky top-0 z-10 border-b border-white/5 shadow-sm">
              <TableRow className="border-none hover:bg-transparent text-neutral-500 h-8">
                <TableHead className="w-12 text-center text-neutral-600 h-8 py-0">#</TableHead>
                <TableHead className="w-8 h-8 py-0"></TableHead>
                <TableHead className="w-16 h-8 py-0">BPM</TableHead>
                <TableHead className="w-16 h-8 py-0">KEY</TableHead>
                <TableHead className="w-24 h-8 py-0">RATING</TableHead>
                <TableHead className="flex-1 min-w-[200px] h-8 py-0">TITLE</TableHead>
                <TableHead className="flex-1 min-w-[150px] h-8 py-0">ARTIST</TableHead>
                <TableHead className="flex-1 min-w-[150px] h-8 py-0">GENRE</TableHead>
                <TableHead className="w-16 h-8 py-0">EXT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRACKS.map((track, i) => (
                <TableRow 
                  key={track.id} 
                  className={cn(
                    "border-b border-white/5 hover:bg-white/[0.02] cursor-default transition-colors group h-8 relative",
                    selectedIndex === i ? "bg-blue-500/[0.08] hover:bg-blue-500/[0.1]" : ""
                  )}
                  onClick={() => {
                    setSelectedIndex(i);
                    setPaletteOpen(false);
                  }}
                  onDoubleClick={() => {
                    setActiveTrack(track);
                    setIsPlaying(true);
                  }}
                >
                  {/* Left Accent Bar for Selected Row */}
                  {selectedIndex === i && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 z-10" />
                  )}
                  
                  <TableCell className="text-center text-neutral-600 group-hover:text-neutral-400 transition-colors py-1">
                    {i === selectedIndex && isPlaying ? (
                      <Activity size={12} className="mx-auto text-blue-500 animate-pulse" />
                    ) : (
                      track.index
                    )}
                  </TableCell>
                  <TableCell className="py-1">
                    {!track.analyzed ? (
                      <button className="text-neutral-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <Zap size={12} />
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className={cn(
                    "font-medium py-1",
                    selectedIndex === i ? "text-blue-400" : (track.analyzed ? "text-neutral-300" : "text-neutral-600")
                  )}>
                    {track.bpm || "---"}
                  </TableCell>
                  <TableCell className={cn(
                    "py-1",
                    selectedIndex === i ? "text-blue-300" : "text-neutral-500"
                  )}>
                    {track.key || "--"}
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star 
                          key={starIdx} 
                          size={10} 
                          className={cn(
                            starIdx < track.rating 
                              ? (selectedIndex === i ? "text-blue-400 fill-current" : "text-neutral-400 fill-current") 
                              : "text-neutral-800"
                          )} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "font-sans text-[13px] tracking-wide py-1",
                    selectedIndex === i ? "text-white" : "text-neutral-200"
                  )}>
                    {track.name}
                  </TableCell>
                  <TableCell className={cn(
                    "font-sans text-[13px] py-1",
                    selectedIndex === i ? "text-neutral-200" : "text-neutral-400"
                  )}>
                    {track.artist}
                  </TableCell>
                  <TableCell className="text-neutral-500 py-1">{track.genre}</TableCell>
                  <TableCell className="text-neutral-600 py-1">{track.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* STATUS BAR */}
        <footer className="h-8 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0 font-mono text-[10px] text-neutral-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
              <span>Library: 12,847</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-neutral-600" />
              <span>Analyzer: idle</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 opacity-70">
            <div className="flex items-center gap-1.5">
              <Kbd className="bg-transparent border-white/5 px-1 h-4">J</Kbd>
              <Kbd className="bg-transparent border-white/5 px-1 h-4">K</Kbd>
              <span>nav</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd className="bg-transparent border-white/5 h-4">Space</Kbd>
              <span>play</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd className="bg-transparent border-white/5 px-1 h-4">/</Kbd>
              <span>filter</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400/80">
              <Kbd className="bg-blue-500/10 text-blue-400 border-blue-500/20 h-4">⌘K</Kbd>
              <span>palette</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default CommandBarDocked;
