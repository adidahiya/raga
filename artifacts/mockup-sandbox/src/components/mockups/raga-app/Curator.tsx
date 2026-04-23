import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Settings,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Heart,
  Clock,
  Library,
  Disc,
  FolderOpen,
  Headphones,
  Radio,
  Sliders,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// --- Mock Data ---

const PLAYLISTS = [
  { category: "Recent", items: ["Recently Added", "Recently Played", "Favorites"] },
  { category: "Mixes", items: ["Sunday Morning", "Deep Focus", "House Sets 2025", "Late Night Drive"] },
  { category: "By Mood", items: ["Ambient & Chill", "Upbeat / Workout", "Crate Diggers", "Melancholy"] },
  { category: "Folders", items: ["Archived 2023", "Vinyl Rips", "To Analyze"] },
];

const TRACKS = [
  { id: 1, title: "Luminance", artist: "Elias", album: "Structures", genre: "Ambient", bpm: 95, rating: 4, coverColor: "from-amber-100 to-amber-200", textColor: "text-amber-800" },
  { id: 2, title: "Midnight Sun", artist: "Kaelin", album: "Urban Decay", genre: "Electronic", bpm: 122, rating: 5, coverColor: "from-emerald-100 to-emerald-200", textColor: "text-emerald-800" },
  { id: 3, title: "Pulse", artist: "Vera & The City", album: "Neon Heart", genre: "Synthwave", bpm: 110, rating: 3, coverColor: "from-rose-100 to-rose-200", textColor: "text-rose-800" },
  { id: 4, title: "Echoes", artist: "Mount Kimbie", album: "Love What Survives", genre: "Electronic", bpm: 130, rating: 5, coverColor: "from-indigo-100 to-indigo-200", textColor: "text-indigo-800" },
  { id: 5, title: "Drift", artist: "Tycho", album: "Awake", genre: "IDM", bpm: 115, rating: 4, coverColor: "from-orange-100 to-orange-200", textColor: "text-orange-800" },
  { id: 6, title: "Currents", artist: "Bonobo", album: "Migration", genre: "Electronic", bpm: 105, rating: 4, coverColor: "from-teal-100 to-teal-200", textColor: "text-teal-800" },
  { id: 7, title: "Orbit", artist: "Jon Hopkins", album: "Singularity", genre: "Techno", bpm: 124, rating: 5, coverColor: "from-cyan-100 to-cyan-200", textColor: "text-cyan-800" },
  { id: 8, title: "Cascade", artist: "Rival Consoles", album: "Persona", genre: "IDM", bpm: 118, rating: 4, coverColor: "from-fuchsia-100 to-fuchsia-200", textColor: "text-fuchsia-800" },
  { id: 9, title: "Horizon", artist: "Bicep", album: "Isles", genre: "House", bpm: 125, rating: 5, coverColor: "from-violet-100 to-violet-200", textColor: "text-violet-800" },
  { id: 10, title: "Ascent", artist: "Floating Points", album: "Crush", genre: "Electronic", bpm: 128, rating: 4, coverColor: "from-sky-100 to-sky-200", textColor: "text-sky-800" },
  { id: 11, title: "Vertex", artist: "Kiasmos", album: "Blurred", genre: "Techno", bpm: 120, rating: 4, coverColor: "from-blue-100 to-blue-200", textColor: "text-blue-800" },
  { id: 12, title: "Flux", artist: "Christian Löffler", album: "A Forest", genre: "Ambient Techno", bpm: 112, rating: 5, coverColor: "from-stone-200 to-stone-300", textColor: "text-stone-800" },
  { id: 13, title: "Radiance", artist: "Four Tet", album: "New Energy", genre: "Electronic", bpm: 126, rating: 4, coverColor: "from-green-100 to-green-200", textColor: "text-green-800" },
  { id: 14, title: "Zenith", artist: "Caribou", album: "Suddenly", genre: "House", bpm: 119, rating: 5, coverColor: "from-pink-100 to-pink-200", textColor: "text-pink-800" },
  { id: 15, title: "Aura", artist: "Maribou State", album: "Portraits", genre: "Electronic", bpm: 108, rating: 4, coverColor: "from-yellow-100 to-yellow-200", textColor: "text-yellow-800" },
  { id: 16, title: "Nebula", artist: "Max Cooper", album: "Human", genre: "Techno", bpm: 122, rating: 4, coverColor: "from-red-100 to-red-200", textColor: "text-red-800" },
  { id: 17, title: "Solstice", artist: "Daniel Avery", album: "Song for Alpha", genre: "IDM", bpm: 116, rating: 5, coverColor: "from-purple-100 to-purple-200", textColor: "text-purple-800" },
  { id: 18, title: "Equinox", artist: "Kelly Lee Owens", album: "Inner Song", genre: "Electronic", bpm: 124, rating: 4, coverColor: "from-lime-100 to-lime-200", textColor: "text-lime-800" },
];

const SPOTLIGHT_TRACKS = TRACKS.slice(0, 4);

export function Curator() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-[#FDFCF8] text-[#1A1A1A] font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
      `}} />

      {/* --- Chrome --- */}
      <header className="h-14 border-b border-[#EAE8E0] flex items-center justify-between px-6 shrink-0 bg-[#FDFCF8]/90 backdrop-blur-sm z-10 relative">
        <div className="flex items-center gap-6">
          <h1 className="font-serif-display italic font-semibold text-2xl tracking-tight text-[#2D3A30]">Raga</h1>
          
          <Tabs defaultValue="tracks" className="w-[200px]">
            <TabsList className="h-8 bg-[#F0EFE9]">
              <TabsTrigger value="tracks" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Tracks</TabsTrigger>
              <TabsTrigger value="export" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Export</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mr-4">
            <span className="flex h-2 w-2 rounded-full bg-[#647C66]"></span>
            Library Syncing
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
            <Input 
              placeholder="Search library..." 
              className="h-8 w-64 pl-9 bg-[#F4F3ED] border-none text-sm placeholder:text-[#8E8E8E] focus-visible:ring-1 focus-visible:ring-[#647C66]"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EFE9]">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Sidebar --- */}
        <aside className="w-64 border-r border-[#EAE8E0] flex flex-col shrink-0 bg-[#FDFCF8]">
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="space-y-8">
              {PLAYLISTS.map((section, i) => (
                <div key={i}>
                  <h3 className="font-serif-display text-sm tracking-widest text-[#8E8E8E] uppercase mb-4">{section.category}</h3>
                  <div className="space-y-1.5">
                    {section.items.map((item, j) => (
                      <button 
                        key={j} 
                        className="w-full flex items-center justify-between py-1.5 px-2 rounded-md text-sm text-[#4A4A4A] hover:bg-[#F0EFE9] hover:text-[#1A1A1A] transition-colors group"
                      >
                        <span className="truncate">{item}</span>
                        {/* Fake counts */}
                        <span className="text-xs text-[#A0A0A0] group-hover:text-[#6B6B6B]">
                          {Math.floor(Math.random() * 100) + 10}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-[#EAE8E0] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> DB Ready</span>
              <span>14,203 tracks</span>
            </div>
          </div>
        </aside>

        {/* --- Gallery View --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FDFCF8] overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-10 max-w-6xl mx-auto space-y-12">
              
              {/* Spotlight Strip */}
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="font-serif-display text-4xl mb-2">Recently Played</h2>
                    <p className="text-[#6B6B6B] text-sm">Resuming where you left off</p>
                  </div>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {SPOTLIGHT_TRACKS.map(track => (
                    <div key={track.id} className="group cursor-pointer shrink-0 w-56">
                      <div className={`w-56 h-56 rounded-xl bg-gradient-to-br ${track.coverColor} flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur opacity-0 group-hover:opacity-100 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-5 h-5 text-[#2D3A30] ml-1" />
                          </div>
                        </div>
                        <span className={`font-serif-display italic text-4xl ${track.textColor} opacity-60`}>
                          {track.artist.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-lg truncate leading-tight">{track.title}</h3>
                      <p className="text-sm text-[#6B6B6B] truncate">{track.artist}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Main Collection */}
              <section>
                <div className="flex items-end justify-between mb-8 sticky top-0 bg-[#FDFCF8]/95 backdrop-blur-sm py-4 z-10 border-b border-[#EAE8E0]/50">
                  <div>
                    <h2 className="font-serif-display text-3xl mb-1">Crate Diggers</h2>
                    <p className="text-[#6B6B6B] text-sm tracking-wide">PLAYLIST • 18 TRACKS</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex bg-[#F0EFE9] rounded-md p-1">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#8E8E8E] hover:text-[#4A4A4A]'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#8E8E8E] hover:text-[#4A4A4A]'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                    {TRACKS.map((track) => (
                      <div key={track.id} className="group cursor-pointer">
                        <div className={`aspect-square rounded-xl bg-gradient-to-br ${track.coverColor} flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-all duration-300 relative`}>
                          <span className={`font-serif-display italic text-3xl ${track.textColor} opacity-60`}>
                            {track.artist.substring(0, 2).toUpperCase()}
                          </span>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 bg-white/50 hover:bg-white/80 backdrop-blur rounded-full text-[#2D3A30]">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h4 className="font-serif-display text-base truncate leading-snug">{track.title}</h4>
                            <p className="text-[#6B6B6B] text-xs truncate mt-0.5">{track.artist}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 bg-transparent border-[#EAE8E0] text-[10px] text-[#8E8E8E] font-normal px-1.5 py-0">
                            {track.bpm}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-[#EAE8E0] rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#FDFCF8] text-[#8E8E8E] border-b border-[#EAE8E0]">
                        <tr>
                          <th className="px-4 py-3 font-medium w-12 text-center">#</th>
                          <th className="px-4 py-3 font-medium">Track</th>
                          <th className="px-4 py-3 font-medium">Artist</th>
                          <th className="px-4 py-3 font-medium hidden md:table-cell">Album</th>
                          <th className="px-4 py-3 font-medium text-right">BPM</th>
                          <th className="px-4 py-3 font-medium text-right w-24">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE8E0]/50">
                        {TRACKS.map((track, i) => (
                          <tr key={track.id} className="hover:bg-[#FDFCF8] group transition-colors">
                            <td className="px-4 py-3 text-[#8E8E8E] text-center w-12">{i + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${track.coverColor} flex items-center justify-center shrink-0`}>
                                  <span className={`font-serif-display text-xs italic ${track.textColor} opacity-60`}>
                                    {track.artist.substring(0, 1)}
                                  </span>
                                </div>
                                <span className="font-medium text-[#1A1A1A]">{track.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#4A4A4A]">{track.artist}</td>
                            <td className="px-4 py-3 text-[#6B6B6B] hidden md:table-cell">{track.album}</td>
                            <td className="px-4 py-3 text-right text-[#6B6B6B] font-mono text-xs">{track.bpm}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end text-[#D4CFC4]">
                                {[1,2,3,4,5].map(star => (
                                  <Heart 
                                    key={star} 
                                    className={`w-3 h-3 ${star <= track.rating ? 'fill-[#647C66] text-[#647C66]' : ''}`} 
                                  />
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

            </div>
          </ScrollArea>
        </main>
      </div>

      {/* --- Now Playing Bar --- */}
      <footer className="h-24 bg-[#FDFCF8] border-t border-[#EAE8E0] px-6 py-4 flex items-center justify-between shrink-0 z-20">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm">
             <span className="font-serif-display italic text-indigo-800 opacity-60 text-xl">MK</span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-serif-display text-xl truncate">Echoes</h4>
            <p className="text-[#6B6B6B] text-sm truncate">Mount Kimbie • Love What Survives</p>
          </div>
          <button className="text-[#A0A0A0] hover:text-[#647C66] shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Player Controls & Waveform */}
        <div className="flex-1 max-w-2xl flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-6">
            <button className="text-[#8E8E8E] hover:text-[#1A1A1A] transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#2D3A30] transition-colors shadow-md"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button className="text-[#8E8E8E] hover:text-[#1A1A1A] transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-3">
            <span className="text-xs text-[#8E8E8E] font-mono w-10 text-right">1:24</span>
            <div className="flex-1 h-8 relative flex items-center cursor-pointer group">
              {/* Fake Waveform */}
              <div className="absolute inset-0 flex items-center justify-between gap-[2px]">
                {Array.from({ length: 100 }).map((_, i) => {
                  const height = 20 + Math.random() * 80;
                  const isPlayed = i < 35;
                  return (
                    <div 
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${isPlayed ? 'bg-[#647C66]' : 'bg-[#EAE8E0] group-hover:bg-[#D4CFC4]'}`}
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>
              {/* Playhead */}
              <div className="absolute left-[35%] w-0.5 h-full bg-[#1A1A1A] rounded-full scale-y-125" />
            </div>
            <span className="text-xs text-[#8E8E8E] font-mono w-10">4:12</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <Badge variant="outline" className="bg-[#F0EFE9] border-transparent text-[#6B6B6B] font-mono font-normal">
            130 BPM
          </Badge>
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="w-4 h-4 text-[#8E8E8E]" />
            <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
          </div>
        </div>

      </footer>
    </div>
  );
}
