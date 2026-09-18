import React, { useState } from 'react';
import { X, Search, Check, Sparkles, Sliders } from 'lucide-react';
import { SkyboxStyle } from '../types';
import { SKYBOX_STYLES } from '../data/styles';

interface StyleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: SkyboxStyle;
  onSelectStyle: (style: SkyboxStyle) => void;
}

export const StyleSelectorModal: React.FC<StyleSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedStyle,
  onSelectStyle,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    'All',
    'Realistic',
    'Painterly',
    'Sci-Fi & Fantasy',
    'Stylized',
    'Interior & Architecture',
  ];

  const filteredStyles = SKYBOX_STYLES.filter((style) => {
    const matchesCategory = activeCategory === 'All' || style.category === activeCategory;
    const matchesSearch =
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      id="style-selector-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="style-selector-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0c0e14] border border-[#232738] shadow-2xl overflow-hidden text-zinc-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212536]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Choose 360° Style</h2>
              <p className="text-xs text-zinc-400">
                ES Dzign aesthetic presets engineered for spherical equirectangular generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row gap-3 border-b border-[#212536] bg-[#10131d]/60">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : 'bg-[#151824] hover:bg-[#1f2436] text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 flex items-center px-3 py-1.5 rounded-xl bg-[#141724] border border-[#262c3e]">
            <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search style or keyword..."
              className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* Style Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredStyles.map((style) => {
            const isSelected = selectedStyle.id === style.id;
            return (
              <div
                key={style.id}
                onClick={() => {
                  onSelectStyle(style);
                  onClose();
                }}
                className={`group relative flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-[#121520] hover:bg-[#171b28] border-[#222739] hover:border-cyan-500/40'
                }`}
              >
                {/* Visual Thumbnail */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${style.previewGradient} flex-shrink-0 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Sparkles className="w-6 h-6 opacity-90" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
                      {style.name}
                    </span>
                    {style.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                        {style.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
