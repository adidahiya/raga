import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  FolderOpen,
  Folder,
  Music,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Activity,
  HardDrive,
  Cpu,
  Repeat,
  Shuffle,
  ChevronDown,
  ChevronRight,
  Plus
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock Data
const PLAYLISTS = [
  {
    name: "Sets 2025",
    type: "folder",
    expanded: true,
    children: [
      { name: "House Sets 2025", count: 124 },
      { name: "Techno Grooves", count: 89 },
      { name: "Ambient Warmups", count: 45 },
    ]
  },
  {
    name: "Crate Digging",
    type: "folder",
    expanded: false,
    children: []
  },
  { name: "Sunday Morning", type: "playlist", count: 32 },
  { name: "Acid Classics", type: "playlist", count: 118 },
  { name: "Unanalyzed", type: "smart-playlist", count: 412 }
];

const TRACKS = [
  { id: "1", title: "Subterranean", artist: "Kite & Kompass", bpm: 124.0, key: "8A", genre: "Deep House", rating: 5, type: "AIFF", source: "Bandcamp", date: "2025-01-10", analyzed: true },
  { id: "2", title: "Midnight Transit", artist: "DJ Overdrive", bpm: 126.5, key: "8A", genre: "Techno", rating: 4, type: "WAV", source: "Beatport", date: "2025-01-12", analyzed: true },
  { id: "3", title: "Oceans", artist: "Marina Tone", bpm: 124.0, key: "7A", genre: "Deep House", rating: 5, type: "FLAC", source: "Bandcamp", date: "2024-12-05", analyzed: true },
  { id: "4", title: "Neural Net", artist: "SysAdmin", bpm: 132.0, key: "9A", genre: "Electro", rating: 3, type: "MP3", source: "Promo", date: "2024-11-20", analyzed: true },
  { id: "5", title: "Analog Dreams", artist: "The Synthesist", bpm: 120.0, key: "5B", genre: "House", rating: 4, type: "WAV", source: "Vinyl Rip", date: "2024-10-15", analyzed: false },
  { id: "6", title: "Resonance", artist: "Echo Chamber", bpm: 125.0, key: "8B", genre: "Tech House", rating: 5, type: "AIFF", source: "Beatport", date: "2025-01-02", analyzed: true },
  { id: "7", title: "Shifted Reality", artist: "Phase 3", bpm: 128.0, key: "10A", genre: "Techno", rating: 4, type: "FLAC", source: "Bandcamp", date: "2024-12-28", analyzed: true },
  { id: "8", title: "Neon Grids", artist: "Cyberspace", bpm: 118.0, key: "4A", genre: "Synthwave", rating: 5, type: "MP3", source: "Web", date: "2024-11-11", analyzed: true },
  { id: "9", title: "Deep State", artist: "Underground", bpm: 122.0, key: "8A", genre: "Deep House", rating: 3, type: "WAV", source: "Beatport", date: "2025-01-08", analyzed: true },
  { id: "10", title: "Velocity", artist: "Speed Demon", bpm: 135.0, key: "11B", genre: "Hard Techno", rating: 4, type: "AIFF", source: "Promo", date: "2024-12-19", analyzed: false },
  { id: "11", title: "Ambient 1", artist: "Chillout", bpm: 90.0, key: "2B", genre: "Ambient", rating: 5, type: "FLAC", source: "Bandcamp", date: "2024-10-01", analyzed: true },
  { id: "12", title: "Jazz Cuts", artist: "Smooth Operator", bpm: 105.0, key: "6A", genre: "Jazz House", rating: 4, type: "WAV", source: "Vinyl Rip", date: "2024-11-30", analyzed: true },
  { id: "13", title: "Breakbeat", artist: "The Breaker", bpm: 130.0, key: "9B", genre: "Breaks", rating: 3, type: "MP3", source: "Beatport", date: "2025-01-05", analyzed: true },
  { id: "14", title: "Glitch Art", artist: "Error 404", bpm: 115.0, key: "3A", genre: "Glitch", rating: 5, type: "AIFF", source: "Promo", date: "2024-12-10", analyzed: true },
  { id: "15", title: "Sunrise", artist: "Morning Glory", bpm: 120.0, key: "7B", genre: "House", rating: 4, type: "FLAC", source: "Bandcamp", date: "2024-11-25", analyzed: true },
  { id: "16", title: "Dark Matter", artist: "Void", bpm: 128.0, key: "8A", genre: "Techno", rating: 5, type: "WAV", source: "Beatport", date: "2025-01-15", analyzed: true },
  { id: "17", title: "Electric", artist: "Voltage", bpm: 126.0, key: "10B", genre: "Electro", rating: 4, type: "AIFF", source: "Promo", date: "2024-12-01", analyzed: true },
  { id: "18", title: "Liquid", artist: "Flow State", bpm: 174.0, key: "5A", genre: "Drum & Bass", rating: 5, type: "FLAC", source: "Bandcamp", date: "2024-11-05", analyzed: false },
  { id: "19", title: "Dubplate", artist: "Selector", bpm: 140.0, key: "1A", genre: "Dubstep", rating: 3, type: "WAV", source: "Vinyl Rip", date: "2024-10-20", analyzed: true },
  { id: "20", title: "Minimalism", artist: "Less Is More", bpm: 123.0, key: "8B", genre: "Minimal", rating: 4, type: "MP3", source: "Beatport", date: "2025-01-09", analyzed: true },
];

export function Studio() {
  const [activeTab, setActiveTab] = useState("Tracks");
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="h-screen w-full bg-[#121212] text-neutral-300 font-sans flex flex-col overflow-hidden selection:bg-cyan-500/30">
      
      {/* Top Chrome */}
      <header className="h-12 border-b border-neutral-800 bg-[#0A0A0A] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Activity className="w-5 h-5" />
            <span>RAGA</span>
          </div>
          <div className="h-4 w-px bg-neutral-800" />
          <div className="flex gap-1 bg-neutral-900 p-1 rounded-md border border-neutral-800">
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${activeTab === 'Tracks' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setActiveTab('Tracks')}
            >
              Tracks
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${activeTab === 'Export' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setActiveTab('Export')}
            >
              Export
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input 
              placeholder="Search tracks, BPM, Key..." 
              className="h-7 w-full bg-neutral-900 border-neutral-800 text-xs pl-8 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-sm font-mono"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-cyan-400">
            <Filter className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2 border-r border-neutral-800 pr-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Analyzed: 94%</span>
          </div>
          <div className="flex items-center gap-2 border-r border-neutral-800 pr-4">
            <HardDrive className="w-3.5 h-3.5" />
            <span>14.2 GB</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-cyan-400 rounded-sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Playlists */}
        <div className="w-64 border-r border-neutral-800 bg-[#0F0F0F] flex flex-col shrink-0">
          <div className="p-3 border-b border-neutral-800 flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Library</span>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-neutral-500 hover:text-cyan-400">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5 text-sm">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-neutral-800/50 text-cyan-400 font-medium cursor-pointer">
                <Music className="w-4 h-4" />
                <span>All Tracks</span>
              </div>
              
              <div className="mt-4 mb-1 px-2 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Playlists</div>
              
              {PLAYLISTS.map((item, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 cursor-pointer group">
                    <div className="flex items-center gap-2">
                      {item.type === 'folder' ? (
                        item.expanded ? <FolderOpen className="w-4 h-4 text-neutral-500" /> : <Folder className="w-4 h-4 text-neutral-500" />
                      ) : item.type === 'smart-playlist' ? (
                        <Settings className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ListMusic className="w-4 h-4 text-neutral-500" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-[10px] font-mono text-neutral-600 group-hover:text-neutral-400">{item.count}</span>
                    )}
                  </div>
                  
                  {item.expanded && item.children && (
                    <div className="ml-4 pl-2 border-l border-neutral-800 space-y-0.5">
                      {item.children.map((child, j) => (
                        <div key={j} className="flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 cursor-pointer group">
                          <span className="truncate text-sm">{child.name}</span>
                          <span className="text-[10px] font-mono text-neutral-600 group-hover:text-neutral-400">{child.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center: Track Table */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#121212]">
          <div className="h-10 border-b border-neutral-800 flex items-center px-4 justify-between bg-[#0A0A0A] shrink-0">
            <div className="text-sm font-medium">All Tracks <span className="text-neutral-500 ml-2 font-mono text-xs">4,812 items</span></div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-900 text-cyan-400 bg-cyan-950/20 text-[10px] rounded-sm py-0 h-5 font-mono">BPM: 120-130</Badge>
              <Badge variant="outline" className="border-neutral-800 text-neutral-400 bg-neutral-900 text-[10px] rounded-sm py-0 h-5 font-mono">Key: 8A</Badge>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <Table className="w-full text-xs border-collapse">
              <TableHeader className="bg-[#0F0F0F] sticky top-0 z-10 shadow-[0_1px_0_0_#262626]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-8 text-center h-8 px-1 text-neutral-500">#</TableHead>
                  <TableHead className="w-8 text-center h-8 px-1"></TableHead>
                  <TableHead className="h-8 px-2 font-mono text-neutral-500 font-normal">BPM</TableHead>
                  <TableHead className="h-8 px-2 font-mono text-neutral-500 font-normal">Key</TableHead>
                  <TableHead className="h-8 px-2 font-normal text-neutral-500">Title</TableHead>
                  <TableHead className="h-8 px-2 font-normal text-neutral-500">Artist</TableHead>
                  <TableHead className="h-8 px-2 font-normal text-neutral-500">Genre</TableHead>
                  <TableHead className="w-24 h-8 px-2 font-normal text-neutral-500">Rating</TableHead>
                  <TableHead className="h-8 px-2 font-normal text-neutral-500">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRACKS.map((track, i) => (
                  <TableRow 
                    key={track.id} 
                    className={`border-b border-neutral-800/50 h-7 hover:bg-neutral-800/50 cursor-default transition-none ${selectedTrack.id === track.id ? 'bg-cyan-950/20 text-cyan-50' : 'text-neutral-400'}`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <TableCell className="p-0 text-center text-[10px] font-mono text-neutral-600">{i + 1}</TableCell>
                    <TableCell className="p-0 text-center">
                      {track.analyzed ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 mx-auto" />
                      ) : (
                        <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-neutral-700 text-neutral-500" title="Analyze">
                          <Activity className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className={`p-0 px-2 font-mono ${selectedTrack.id === track.id ? 'text-cyan-400' : 'text-cyan-500/70'}`}>
                      {track.bpm.toFixed(1)}
                    </TableCell>
                    <TableCell className="p-0 px-2 font-mono">{track.key}</TableCell>
                    <TableCell className={`p-0 px-2 font-medium ${selectedTrack.id === track.id ? 'text-white' : 'text-neutral-200'}`}>{track.title}</TableCell>
                    <TableCell className="p-0 px-2">{track.artist}</TableCell>
                    <TableCell className="p-0 px-2">
                      <span className="bg-neutral-800/80 text-neutral-300 px-1.5 py-0.5 rounded-[2px] text-[10px] whitespace-nowrap">
                        {track.genre}
                      </span>
                    </TableCell>
                    <TableCell className="p-0 px-2">
                      <div className="flex text-cyan-500/50">
                        {"★".repeat(track.rating)}{"☆".repeat(5 - track.rating)}
                      </div>
                    </TableCell>
                    <TableCell className="p-0 px-2 text-[10px] font-mono text-neutral-500">{track.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Right Rail: Track Inspector */}
        <div className="w-72 border-l border-neutral-800 bg-[#0F0F0F] flex flex-col shrink-0">
          <div className="p-4 border-b border-neutral-800 bg-[#0A0A0A]">
            <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1">Inspector</div>
            <h2 className="text-lg font-bold text-white leading-tight truncate">{selectedTrack.title}</h2>
            <div className="text-sm text-neutral-400 truncate">{selectedTrack.artist}</div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 flex flex-col items-center justify-center">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">BPM</div>
                  <div className="text-2xl font-mono font-light text-cyan-400">{selectedTrack.bpm.toFixed(1)}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 flex flex-col items-center justify-center">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Key</div>
                  <div className="text-2xl font-mono font-light text-magenta-400">{selectedTrack.key}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Harmonic Mix</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-neutral-900 border-neutral-700 rounded-sm text-xs font-mono font-normal">8B</Badge>
                  <Badge variant="outline" className="bg-neutral-900 border-neutral-700 rounded-sm text-xs font-mono font-normal">9A</Badge>
                  <Badge variant="outline" className="bg-neutral-900 border-neutral-700 rounded-sm text-xs font-mono font-normal">7A</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tags</div>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded-sm text-[10px]">{selectedTrack.genre}</span>
                  <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded-sm text-[10px]">Vocals</span>
                  <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded-sm text-[10px]">Peak Time</span>
                  <Button variant="ghost" className="h-6 w-6 p-0 border border-dashed border-neutral-700 rounded-sm text-neutral-500 hover:text-white">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-neutral-800" />

              <div className="space-y-2 text-xs font-mono text-neutral-500">
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <span>File:</span>
                  <span className="text-neutral-300 truncate">/Volumes/Music/2025/{selectedTrack.artist} - {selectedTrack.title}.{selectedTrack.type.toLowerCase()}</span>
                </div>
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <span>Source:</span>
                  <span className="text-neutral-300">{selectedTrack.source}</span>
                </div>
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <span>Added:</span>
                  <span className="text-neutral-300">{selectedTrack.date}</span>
                </div>
              </div>
              
              <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-sm text-xs h-8">
                Edit ID3 Tags
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Transport Bar */}
      <footer className="h-24 bg-[#050505] border-t border-neutral-800 flex items-center px-4 gap-6 shrink-0 relative">
        
        {/* Track Info */}
        <div className="w-64 shrink-0 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-900 to-neutral-900 border border-neutral-800 rounded-sm flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-cyan-500/50">{selectedTrack.title.substring(0,2).toUpperCase()}</span>
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-sm font-bold text-white truncate leading-tight">{selectedTrack.title}</div>
            <div className="text-xs text-neutral-400 truncate">{selectedTrack.artist}</div>
          </div>
        </div>

        {/* Controls & Waveform */}
        <div className="flex-1 flex items-center gap-6 h-full py-4">
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-cyan-400">
              <SkipBack className="w-4 h-4 fill-current" />
            </Button>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shrink-0"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-cyan-400">
              <SkipForward className="w-4 h-4 fill-current" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1 group relative">
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>01:24</span>
              <span>-04:12</span>
            </div>
            
            {/* Waveform placeholder */}
            <div className="h-8 w-full bg-neutral-900/50 rounded-sm relative overflow-hidden flex items-center">
              {/* Fake waveform bars */}
              <div className="absolute inset-0 flex items-end gap-[1px] opacity-30 px-1 pb-1">
                {Array.from({length: 100}).map((_, i) => (
                  <div key={i} className="flex-1 bg-neutral-400 rounded-t-sm" style={{height: `${20 + Math.random() * 80}%`}} />
                ))}
              </div>
              
              {/* Played portion overlay */}
              <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-cyan-500/20 mix-blend-screen" />
              
              {/* Playhead */}
              <div className="absolute left-1/3 top-0 bottom-0 w-[2px] bg-cyan-400 z-10" />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center shrink-0 w-16">
            <div className="text-xl font-mono text-cyan-400 leading-none">{selectedTrack.bpm.toFixed(1)}</div>
            <div className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1">BPM</div>
          </div>

        </div>

        {/* Volume & Extras */}
        <div className="w-48 shrink-0 flex items-center justify-end gap-4 border-l border-neutral-800 pl-6 h-12">
          <div className="flex items-center gap-2 text-neutral-400">
            <Volume2 className="w-4 h-4" />
            <Slider defaultValue={[75]} max={100} step={1} className="w-20" />
          </div>
        </div>
      </footer>
    </div>
  );
}
