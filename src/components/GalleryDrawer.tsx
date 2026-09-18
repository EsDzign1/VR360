import React, { useState } from 'react';
import {
  X,
  Heart,
  Download,
  Sparkles,
  Trash2,
  FolderOpen,
  Compass,
} from 'lucide-react';
import { SkyboxWorld } from '../types';
import { exportEquirectangularImage } from '../utils/cubemapExporter';

interface GalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  worlds: SkyboxWorld[];
  currentWorldId: string;
  onSelectWorld: (world: SkyboxWorld) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteWorld: (id: string) => void;
  onRemix: (world: SkyboxWorld) => void;
  darkMode: boolean;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  isOpen,
  onClose,
  worlds,
  currentWorldId,
  onSelectWorld,
  onToggleFavorite,
  onDeleteWorld,
  onRemix,
  darkMode,
}) => {
  const [tab, setTab] = useState<'all' | 'favorites'>('all');

  if (!isOpen) return null;

  const filteredWorlds = worlds.filter((w) => {
    if (tab === 'favorites') return w.isFavorite;
    return true;
  });

  return (
    <div
      id="gallery-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="gallery-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-full flex flex-col backdrop-blur-2xl border-l shadow-2xl animate-in slide-in-from-right duration-300 ${
          darkMode
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
            : 'bg-white/95 border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">World Library</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {worlds.length} panoramic 360° environments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full border transition-colors ${
              darkMode
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-500/10">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              tab === 'all'
                ? darkMode
                  ? 'bg-cyan-500 text-black font-semibold'
                  : 'bg-indigo-600 text-white font-semibold'
                : darkMode
                ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Worlds ({worlds.length})
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              tab === 'favorites'
                ? darkMode
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-rose-600 text-white font-semibold'
                : darkMode
                ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Favorites</span>
          </button>
        </div>

        {/* Worlds List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredWorlds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
              <Compass className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs">No worlds in this view yet.</p>
            </div>
          ) : (
            filteredWorlds.map((world) => {
              const isActive = world.id === currentWorldId;
              return (
                <div
                  key={world.id}
                  onClick={() => onSelectWorld(world)}
                  className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                    isActive
                      ? darkMode
                        ? 'bg-zinc-900 border-cyan-500/80 ring-1 ring-cyan-500 shadow-md'
                        : 'bg-zinc-50 border-indigo-500/80 ring-1 ring-indigo-500 shadow-sm'
                      : darkMode
                      ? 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200'
                  }`}
                >
                  {/* Thumbnail Preview Banner */}
                  <div className="relative w-full h-24 overflow-hidden bg-zinc-950">
                    <img
                      src={world.thumbnailUrl || world.textureUrl}
                      alt={world.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {world.style}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(world.id);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          world.isFavorite
                            ? 'bg-rose-500/80 text-white'
                            : 'bg-black/50 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Heart className="w-3 h-3 fill-current" />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-xs font-semibold text-white truncate">{world.title}</h3>
                    </div>
                  </div>

                  {/* Body Info & Actions */}
                  <div className="p-3">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2.5">
                      {world.prompt}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-500/10 text-xs">
                      <span className="text-[10px] text-zinc-400 font-mono">{world.createdAt}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemix(world);
                            onClose();
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            darkMode
                              ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-amber-400'
                              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-amber-600'
                          }`}
                          title="Remix world"
                        >
                          <Sparkles className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportEquirectangularImage(world.textureUrl, `${world.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`);
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            darkMode
                              ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-cyan-400'
                              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-indigo-600'
                          }`}
                          title="Download 360 image"
                        >
                          <Download className="w-3 h-3" />
                        </button>

                        {world.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteWorld(world.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              darkMode
                                ? 'bg-zinc-800 hover:bg-red-950/50 border-zinc-700 text-zinc-400 hover:text-red-400'
                                : 'bg-zinc-100 hover:bg-red-50 border-zinc-200 text-zinc-500 hover:text-red-600'
                            }`}
                            title="Delete world"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
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
