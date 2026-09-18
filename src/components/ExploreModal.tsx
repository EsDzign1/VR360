import React, { useState } from 'react';
import {
  X,
  Search,
  Compass,
  Sparkles,
  Download,
  Heart,
  Eye,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { SkyboxWorld } from '../types';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  worlds: SkyboxWorld[];
  currentWorldId: string;
  onSelectWorld: (world: SkyboxWorld) => void;
  onRemixWorld: (world: SkyboxWorld) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDownload: (world: SkyboxWorld) => void;
}

export const ExploreModal: React.FC<ExploreModalProps> = ({
  isOpen,
  onClose,
  worlds,
  currentWorldId,
  onSelectWorld,
  onRemixWorld,
  onToggleFavorite,
  onOpenDownload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Trending', 'Cyberpunk', 'Fantasy', 'Anime', 'Sci-Fi', 'Realism', 'Architecture', 'Favorites'];

  const filteredWorlds = worlds.filter((w) => {
    if (activeCategory === 'Favorites' && !w.isFavorite) return false;
    if (activeCategory !== 'All' && activeCategory !== 'Favorites' && activeCategory !== 'Trending') {
      const matchCat =
        w.style.toLowerCase().includes(activeCategory.toLowerCase()) ||
        w.tags.some((t) => t.toLowerCase().includes(activeCategory.toLowerCase()));
      if (!matchCat) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.prompt.toLowerCase().includes(q) ||
        w.style.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      id="explore-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="explore-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0c0e14] border border-[#232738] shadow-2xl overflow-hidden text-zinc-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212536]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">Explore ESDzign Worlds</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {worlds.length} Environments
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Browse, discover, and remix curated 360-degree panoramic realms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-6 py-3 border-b border-[#212536] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#10131d]/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                    : 'bg-[#151824] hover:bg-[#1f2436] text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative flex items-center px-3 py-1.5 rounded-xl bg-[#141724] border border-[#262c3e] min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prompt or tag..."
              className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* Worlds Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorlds.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-zinc-500">
              <Compass className="w-10 h-10 opacity-30 mb-2" />
              <p className="text-sm">No ESDzign environments found matching your criteria.</p>
            </div>
          ) : (
            filteredWorlds.map((world) => {
              const isSelected = world.id === currentWorldId;
              return (
                <div
                  key={world.id}
                  className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 bg-[#121520] ${
                    isSelected
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'border-[#222739] hover:border-cyan-500/50'
                  }`}
                >
                  {/* Thumbnail & Quick Actions */}
                  <div className="relative aspect-16/9 overflow-hidden bg-black">
                    <img
                      src={world.thumbnailUrl || world.textureUrl}
                      alt={world.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/15">
                        {world.style}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(world.id);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          world.isFavorite
                            ? 'bg-rose-500 text-white'
                            : 'bg-black/60 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Quick View Button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <button
                        onClick={() => {
                          onSelectWorld(world);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Enter 360 View</span>
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5">
                      <h3 className="text-xs font-bold text-white truncate">{world.title}</h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {world.prompt}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#202536] text-xs">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {world.createdAt}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onRemixWorld(world);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1a1f2e] hover:bg-cyan-500/20 hover:text-cyan-300 border border-[#293047] text-zinc-300 text-[11px] transition-colors"
                          title="Remix this world"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Remix</span>
                        </button>

                        <button
                          onClick={() => onOpenDownload(world)}
                          className="p-1 rounded-lg bg-[#1a1f2e] hover:bg-[#272e45] text-zinc-300 border border-[#293047] transition-colors"
                          title="Export assets"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
