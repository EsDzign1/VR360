import React from 'react';
import { Sparkles, Sliders, X, RefreshCw, Sun, Moon, CloudRain, Snowflake } from 'lucide-react';
import { SkyboxWorld, RemixState } from '../types';

interface RemixDrawerProps {
  remixState: RemixState;
  onChangeInfluence: (influence: number) => void;
  onCancelRemix: () => void;
  onApplyPreset: (promptAddition: string) => void;
  onGenerateRemix: () => void;
  isGenerating: boolean;
}

const REMIX_PRESETS = [
  { label: 'Night & Stars', icon: Moon, addition: 'at deep midnight, starry sky, glowing moonlight' },
  { label: 'Golden Hour', icon: Sun, addition: 'during warm golden hour sunset, long dramatic shadows' },
  { label: 'Rain & Fog', icon: CloudRain, addition: 'during heavy misty rainstorm, reflections on ground, fog' },
  { label: 'Winter Snow', icon: Snowflake, addition: 'covered in deep winter snow and frost, freezing atmosphere' },
];

export const RemixDrawer: React.FC<RemixDrawerProps> = ({
  remixState,
  onChangeInfluence,
  onCancelRemix,
  onApplyPreset,
  onGenerateRemix,
  isGenerating,
}) => {
  if (!remixState.isRemixing || !remixState.baseWorld) return null;

  const { baseWorld, influence } = remixState;

  return (
    <div
      id="esdzign-remix-drawer"
      className="mb-2 p-3 sm:p-4 rounded-2xl bg-[#0c0e14]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 animate-in slide-in-from-bottom-3 duration-200 text-zinc-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#212634]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-cyan-500/50 flex-shrink-0 bg-zinc-900">
            <img
              src={baseWorld.thumbnailUrl || baseWorld.textureUrl}
              alt={baseWorld.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold tracking-wider">
                Remix Mode
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                {baseWorld.title}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Iterating on 360 geometry with adjustable influence
            </p>
          </div>
        </div>

        <button
          onClick={onCancelRemix}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Exit Remix Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Influence Slider */}
      <div className="py-2.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-300 font-medium flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Structure Influence
          </span>
          <span className="font-mono text-cyan-400 font-bold">{influence}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="95"
          value={influence}
          onChange={(e) => onChangeInfluence(Number(e.target.value))}
          className="w-full h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
          <span>Creative Freedom (Low)</span>
          <span>Preserve Geometry (High)</span>
        </div>
      </div>

      {/* Quick Atmospheric Conversion Presets */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] text-zinc-400 flex-shrink-0 mr-1">Quick Mood:</span>
        {REMIX_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.label}
              onClick={() => onApplyPreset(preset.addition)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-[#141722] hover:bg-cyan-500/20 hover:text-cyan-300 border border-[#232738] text-zinc-300 whitespace-nowrap transition-all active:scale-95"
            >
              <Icon className="w-3 h-3" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
