import React, { useState } from 'react';
import {
  Wand2,
  Dices,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ArrowRight,
  X,
  Layers,
  Zap,
} from 'lucide-react';
import { SkyboxStyle, SkyboxModelVersion } from '../types';

interface BottomPromptBarProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  negativePrompt: string;
  onChangeNegativePrompt: (val: string) => void;
  currentStyle: SkyboxStyle;
  onOpenStyleModal: () => void;
  onGenerate: () => void;
  onEnhancePrompt: () => void;
  onSurpriseMe: () => void;
  isEnhancing: boolean;
  isGenerating: boolean;
  model: SkyboxModelVersion;
  onChangeModel: (model: SkyboxModelVersion) => void;
  hasSketch: boolean;
}

export const BottomPromptBar: React.FC<BottomPromptBarProps> = ({
  prompt,
  onChangePrompt,
  negativePrompt,
  onChangeNegativePrompt,
  currentStyle,
  onOpenStyleModal,
  onGenerate,
  onEnhancePrompt,
  onSurpriseMe,
  isEnhancing,
  isGenerating,
  model,
  onChangeModel,
  hasSketch,
}) => {
  const [showNegative, setShowNegative] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isGenerating) {
        onGenerate();
      }
    }
  };

  const modelsList: { id: SkyboxModelVersion; name: string; tag: string }[] = [
    { id: 'model-4', name: 'Model 4', tag: 'Latest & Ultra' },
    { id: 'model-3.2', name: 'Model 3.2', tag: 'Default' },
    { id: 'model-3', name: 'Model 3', tag: 'Fast' },
  ];

  return (
    <div
      id="skybox-bottom-console"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[96%] max-w-4xl pointer-events-auto"
    >
      {/* Negative Prompt Drawer (When user clicks "+ Negative Text") */}
      {showNegative && (
        <div className="mb-2 p-3 rounded-2xl bg-[#0c0e14]/95 backdrop-blur-2xl border border-[#232738] shadow-2xl text-zinc-200 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Negative Prompt (Items to exclude from 360 view)
            </span>
            <button
              onClick={() => setShowNegative(false)}
              className="text-zinc-500 hover:text-zinc-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => onChangeNegativePrompt(e.target.value)}
            placeholder="e.g. blur, seam line, text, watermarks, bad anatomy, distortion, low resolution..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#141724] border border-[#262c3e] focus:border-cyan-500 text-zinc-100 placeholder-zinc-500 outline-none"
          />
        </div>
      )}

      {/* Main Console Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 sm:p-2.5 rounded-3xl bg-[#0b0d13]/90 backdrop-blur-2xl border border-[#232738] shadow-2xl shadow-black/80 ring-1 ring-white/5">
        {/* Style Selector Card Button */}
        <button
          id="style-selector-trigger"
          onClick={onOpenStyleModal}
          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#131622] hover:bg-[#1a1f30] border border-[#262c3e] hover:border-cyan-500/40 text-zinc-100 transition-all text-left flex-shrink-0 active:scale-95 group"
          title="Change 360 Style"
        >
          <div
            className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentStyle.previewGradient} flex-shrink-0 flex items-center justify-center text-white text-xs shadow-md group-hover:scale-105 transition-transform`}
          >
            <Sparkles className="w-4 h-4 opacity-90" />
          </div>

          <div className="flex flex-col pr-1">
            <span className="text-[9px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
              Style
            </span>
            <span className="text-xs font-semibold text-white truncate max-w-[120px] leading-tight">
              {currentStyle.name}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white ml-auto" />
        </button>

        {/* Center Prompt Input with Helpers */}
        <div className="relative flex-1 flex flex-col min-w-0">
          <div className="flex items-center">
            <textarea
              id="skybox-prompt-input"
              value={prompt}
              onChange={(e) => onChangePrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the world you want to build... (e.g. Floating crystalline ruins above cloud ocean)"
              rows={1}
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm resize-none outline-none text-zinc-100 font-normal leading-relaxed placeholder-zinc-500"
            />
          </div>

          {/* Sub-toolbar under prompt: Negative prompt toggle, Model tag, character counter */}
          <div className="flex items-center gap-2 px-3 pb-0.5 text-[10px] text-zinc-400 font-mono">
            {hasSketch && (
              <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Sketch Guided
              </span>
            )}

            <button
              onClick={() => setShowNegative(!showNegative)}
              className={`hover:text-zinc-200 transition-colors ${
                negativePrompt ? 'text-cyan-400 font-bold' : 'text-zinc-500'
              }`}
            >
              {negativePrompt ? '✓ Negative Text Active' : '+ Negative Text'}
            </button>

            <span>•</span>

            {/* Model Selector Popover */}
            <div className="relative">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold text-zinc-400"
              >
                <span>{model.toUpperCase()}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showModelPicker && (
                <div
                  className="absolute bottom-6 left-0 w-44 p-1.5 rounded-xl bg-[#0c0e14] border border-[#232738] shadow-2xl z-50 animate-in zoom-in-95 duration-100 font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] uppercase font-mono text-zinc-500 px-2 py-1">
                    AI Generation Model
                  </div>
                  {modelsList.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onChangeModel(m.id);
                        setShowModelPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        model === m.id
                          ? 'bg-cyan-500 text-black font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="text-[9px] opacity-75 font-mono">{m.tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="ml-auto text-zinc-500 hidden sm:inline">
              {prompt.length} / 1000
            </span>
          </div>
        </div>

        {/* Right Tools & Generate Button */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 pl-1 flex-shrink-0">
          {/* AI Enhance Wand */}
          <button
            id="enhance-prompt-button"
            onClick={onEnhancePrompt}
            disabled={!prompt.trim() || isEnhancing}
            className="p-2.5 rounded-xl bg-[#131622] hover:bg-[#1a1f30] border border-[#262c3e] hover:border-amber-400/40 text-amber-400 transition-all active:scale-95 disabled:opacity-40"
            title="Enhance Prompt with 360 atmospheric details"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
          </button>

          {/* Random Prompt Dice */}
          <button
            id="random-prompt-button"
            onClick={onSurpriseMe}
            className="p-2.5 rounded-xl bg-[#131622] hover:bg-[#1a1f30] border border-[#262c3e] hover:border-cyan-400/40 text-cyan-400 transition-all active:scale-95"
            title="Surprise Me (Random Prompt)"
          >
            <Dices className="w-3.5 h-3.5" />
          </button>

          {/* Generate Button (Exact ES Dzign gradient + lightning bolt) */}
          <button
            id="generate-skybox-button"
            onClick={onGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                <span>Creating 360°...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
