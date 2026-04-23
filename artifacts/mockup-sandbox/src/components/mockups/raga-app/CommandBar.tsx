import React, { useState, useEffect } from "react";
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
  RefreshCw
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
];

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-800 bg-neutral-950 px-1.5 font-mono text-[10px] font-medium text-neutral-400">
    {children}
  </kbd>
);

export function CommandBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="h-screen w-full bg-black text-neutral-300 font-sans flex overflow-hidden selection:bg-blue-900 selection:text-blue-50">
      
      {/* THIN ICON RAIL SIDEBAR */}
      <div className="w-14 flex-shrink-0 border-r border-neutral-900 flex flex-col items-center py-4 gap-6 bg-[#050505] z-10 relative">
        <div className="flex flex-col gap-2 w-full px-2">
          <div className="h-10 w-full rounded flex items-center justify-center text-blue-500 bg-blue-500/10 cursor-pointer relative group">
            <Terminal size={18} />
            <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono">
              Tracks <Kbd>1</Kbd>
            </div>
          </div>
          <div className="h-10 w-full rounded flex items-center justify-center text-neutral-500 hover:text-white transition-colors cursor-pointer relative group">
            <FolderTree size={18} />
            <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono">
              Playlists <Kbd>2</Kbd>
            </div>
          </div>
        </div>

        <div className="w-6 h-px bg-neutral-900 my-2" />

        <div className="flex flex-col gap-2 w-full px-2">
          <div className="h-10 w-full rounded flex items-center justify-center text-neutral-500 hover:text-white transition-colors cursor-pointer relative group">
            <HardDrive size={18} />
            <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono">
              Export Mode <Kbd>E</Kbd>
            </div>
          </div>
        </div>
        
        <div className="flex-1" />
        <div className="h-10 w-full px-2 rounded flex items-center justify-center text-neutral-500 hover:text-white transition-colors cursor-pointer relative group">
          <Settings size={18} />
          <div className="absolute left-12 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 text-white font-mono">
            Settings <Kbd>,</Kbd>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* COMMAND PALETTE (Overlay / Always open for mockup) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-xl">
          <div className="flex items-center px-4 border-b border-neutral-800/50">
            <Search className="mr-2 h-4 w-4 shrink-0 text-blue-500" />
            <input 
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-100 font-mono" 
              placeholder="Search library, playlists, or commands..." 
              autoFocus
              defaultValue="House"
            />
            <Badge variant="outline" className="font-mono text-[10px] bg-neutral-900 border-neutral-800 text-neutral-400">CMD+K</Badge>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 font-mono">Playlists</div>
            <div className="flex items-center px-2 py-1.5 text-sm rounded-md bg-blue-500/10 text-blue-400 cursor-pointer">
              <FolderDot className="mr-2 h-4 w-4" />
              <span>House Sets 2025</span>
              <span className="ml-auto text-xs text-neutral-500 font-mono">245 tracks</span>
            </div>
            <div className="flex items-center px-2 py-1.5 text-sm rounded-md text-neutral-300 hover:bg-neutral-900 hover:text-white cursor-pointer">
              <FolderDot className="mr-2 h-4 w-4" />
              <span>Deep House Classics</span>
              <span className="ml-auto text-xs text-neutral-500 font-mono">112 tracks</span>
            </div>

            <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-neutral-500 font-mono">Actions</div>
            <div className="flex items-center px-2 py-1.5 text-sm rounded-md text-neutral-300 hover:bg-neutral-900 hover:text-white cursor-pointer group">
              <ActivitySquare className="mr-2 h-4 w-4 text-neutral-400 group-hover:text-blue-400" />
              <span>Analyze BPM for "House Sets 2025"</span>
              <span className="ml-auto"><Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>A</Kbd></span>
            </div>
            <div className="flex items-center px-2 py-1.5 text-sm rounded-md text-neutral-300 hover:bg-neutral-900 hover:text-white cursor-pointer group">
              <RefreshCw className="mr-2 h-4 w-4 text-neutral-400 group-hover:text-blue-400" />
              <span>Reload library from Swinsian</span>
              <span className="ml-auto"><Kbd>⌘</Kbd> <Kbd>R</Kbd></span>
            </div>
          </div>
        </div>

        {/* HEADER / CHROME */}
        <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 bg-black/50 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold tracking-wide text-white">House Sets 2025</h1>
            <div className="flex items-center gap-2 border border-neutral-800 rounded bg-neutral-900/50 px-2 py-1">
              <Filter size={12} className="text-neutral-500" />
              <span className="text-xs font-mono text-neutral-400">BPM &gt; 120</span>
              <div className="w-px h-3 bg-neutral-700 mx-1" />
              <Kbd>F</Kbd>
            </div>
          </div>

          {/* MINI PLAYER */}
          <div className="flex items-center gap-4 border border-neutral-800 bg-neutral-950 rounded-full pl-1 pr-4 py-1">
            <button 
              className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-400 transition-colors"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
            </button>
            
            <div className="flex flex-col justify-center w-48">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white truncate pr-2">{activeTrack.name}</span>
                <span className="text-[10px] font-mono text-blue-400 shrink-0">{activeTrack.bpm} BPM</span>
              </div>
              <div className="flex items-center gap-2 h-3 mt-0.5">
                {/* Fake Waveform */}
                <div className="flex-1 flex items-end gap-[1px] h-full opacity-60">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-[2px] bg-blue-500 rounded-t-[1px]" 
                      style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-neutral-500">2:45</span>
              </div>
            </div>
            
            <div className="w-px h-6 bg-neutral-800 mx-1" />
            <Volume2 size={14} className="text-neutral-400" />
          </div>
        </header>

        {/* TRACK TABLE */}
        <div className="flex-1 overflow-auto bg-black">
          <Table className="font-mono text-xs whitespace-nowrap">
            <TableHeader className="bg-[#050505] sticky top-0 z-10 border-b border-neutral-900 shadow-sm">
              <TableRow className="border-none hover:bg-transparent text-neutral-500">
                <TableHead className="w-12 text-center text-neutral-600">#</TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-20">BPM</TableHead>
                <TableHead className="min-w-[250px]">TITLE</TableHead>
                <TableHead className="min-w-[200px]">ARTIST</TableHead>
                <TableHead className="w-32">GENRE</TableHead>
                <TableHead className="w-24">RATING</TableHead>
                <TableHead className="w-16">EXT</TableHead>
                <TableHead className="w-24">SOURCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRACKS.map((track, i) => (
                <TableRow 
                  key={track.id} 
                  className={cn(
                    "border-b border-neutral-900/50 hover:bg-neutral-900/40 cursor-default transition-colors group",
                    selectedIndex === i ? "bg-blue-500/5 hover:bg-blue-500/10" : ""
                  )}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() => {
                    setActiveTrack(track);
                    setIsPlaying(true);
                  }}
                >
                  <TableCell className="text-center text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    {i === selectedIndex && isPlaying ? (
                      <Activity size={12} className="mx-auto text-blue-500 animate-pulse" />
                    ) : (
                      track.index
                    )}
                  </TableCell>
                  <TableCell>
                    {!track.analyzed ? (
                      <button className="text-neutral-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <Zap size={12} />
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className={cn(
                    "font-medium",
                    selectedIndex === i ? "text-blue-400" : (track.analyzed ? "text-emerald-500/80" : "text-neutral-600")
                  )}>
                    {track.bpm || "---"}
                  </TableCell>
                  <TableCell className={cn(
                    "font-sans text-sm tracking-wide",
                    selectedIndex === i ? "text-white" : "text-neutral-300"
                  )}>
                    {track.name}
                  </TableCell>
                  <TableCell className={cn(
                    selectedIndex === i ? "text-neutral-300" : "text-neutral-500"
                  )}>
                    {track.artist}
                  </TableCell>
                  <TableCell className="text-neutral-500">{track.genre}</TableCell>
                  <TableCell>
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
                  <TableCell className="text-neutral-600">{track.type}</TableCell>
                  <TableCell className="text-neutral-600">{track.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* STATUS BAR */}
        <footer className="h-8 border-t border-neutral-900 bg-[#050505] flex items-center justify-between px-4 shrink-0 font-mono text-[10px] text-neutral-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span>Library: 12,847 tracks</span>
            </div>
            <div className="w-px h-3 bg-neutral-800" />
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-neutral-600" />
              <span>Analyzer: idle</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 opacity-50">
            <div className="flex items-center gap-1"><Kbd>J</Kbd><Kbd>K</Kbd> nav</div>
            <div className="flex items-center gap-1"><Kbd>Space</Kbd> play</div>
            <div className="flex items-center gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd> command</div>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default CommandBar;
