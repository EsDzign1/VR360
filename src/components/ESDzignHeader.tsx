import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Compass,
  Paintbrush,
  Download,
  Share2,
  Maximize,
  Minimize,
  Upload,
  Volume2,
  VolumeX,
  RotateCcw,
  Grid,
  Play,
  Pause,
  Sliders,
  ChevronDown,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SkyboxWorld, ViewerSettings } from '../types';

interface ESDzignHeaderProps {
  currentWorld: SkyboxWorld;
  onOpenExplore: () => void;
  onToggleSketch: () => void;
  isSketchActive: boolean;
  onStartRemix: () => void;
  isRemixing: boolean;
  onOpenDownload: () => void;
  onUploadImage: (file: File) => void;
  viewerSettings: ViewerSettings;
  onUpdateViewerSettings: (updates: Partial<ViewerSettings>) => void;
  credits: number;
}

export const ESDzignHeader: React.FC<ESDzignHeaderProps> = ({
  currentWorld,
  onOpenExplore,
  onToggleSketch,
  isSketchActive,
  onStartRemix,
  isRemixing,
  onOpenDownload,
  onUploadImage,
  viewerSettings,
  onUpdateViewerSettings,
  credits,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
      }
    } catch {
      // ignore fullscreen permissions in sandboxed iframes
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  return (
    <header
      id="esdzign-top-header"
      className="fixed top-0 left-0 right-0 z-40 h-14 px-3 sm:px-5 flex items-center justify-between bg-[#0b0d13]/85 backdrop-blur-xl border-b border-[#212635] text-zinc-100 select-none"
    >
      {/* Hidden File Input for 360 Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Left Branding & Primary Navigation */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* ES Design Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={onOpenExplore}>
          {/* Uploaded ES Design Circular Badge Logo */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-md shadow-black/40 border border-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/es-logo-icon.svg"
              alt="ES Design Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-xs sm:text-sm text-white font-mono">
              ES <span className="text-zinc-400 font-normal">DZIGN</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              ESDZIGN AI
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-[1px] h-6 bg-[#212635]" />

        {/* Navigation Tools */}
        <div className="flex items-center gap-1">
          {/* Explore Community Gallery */}
          <button
            id="header-explore-button"
            onClick={onOpenExplore}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#181c28] border border-transparent hover:border-[#2b3247] transition-all"
            title="Explore 360 ESDzign Library"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Explore</span>
          </button>

          {/* Sketch Mode On/Off */}
          <button
            id="header-sketch-button"
            onClick={onToggleSketch}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isSketchActive
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'text-zinc-300 hover:text-white hover:bg-[#181c28] border border-transparent hover:border-[#2b3247]'
            }`}
            title="Toggle 360 Sketch Drawing Mode"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Sketch</span>
          </button>

          {/* Upload 360 */}
          <button
            id="header-upload-360-button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
            title="Upload your own 360 panorama (JPG, PNG)"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="inline font-medium">Upload 360</span>
          </button>
        </div>
      </div>

      {/* Right User Controls & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Credits Counter Pill */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#141722] border border-[#262c3f] text-xs"
          title="Generation Credits Available"
        >
          <span className="text-amber-400 font-bold text-xs">⚡</span>
          <span className="font-mono text-zinc-200 font-semibold text-[11px] sm:text-xs">
            {credits}
          </span>
          <span className="text-[10px] text-zinc-500 hidden md:inline">credits</span>
        </div>

        {/* Remix this button */}
        <button
          id="header-remix-button"
          onClick={onStartRemix}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isRemixing
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'bg-[#151926] hover:bg-[#202538] text-cyan-400 border border-cyan-500/30'
          }`}
          title="Remix current 360 environment"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Remix this</span>
        </button>

        {/* Export / Download Dropdown Button */}
        <button
          id="header-download-button"
          onClick={onOpenDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-all active:scale-95 shadow-md shadow-cyan-500/20"
          title="Download 360 Assets (Equirectangular, Cubemap, Depth)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>

        {/* Ambient Soundscape Button */}
        <button
          onClick={() =>
            onUpdateViewerSettings({ audioEnabled: !viewerSettings.audioEnabled })
          }
          className={`p-2 rounded-xl border transition-colors ${
            viewerSettings.audioEnabled
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-[#141722] hover:bg-[#1e2333] text-zinc-400 border-[#252b3e]'
          }`}
          title={viewerSettings.audioEnabled ? 'Mute 360 Ambiance' : 'Play Immersive Ambiance'}
        >
          {viewerSettings.audioEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Viewport Settings Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isSettingsOpen
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-[#141722] hover:bg-[#1e2333] text-zinc-400 border-[#252b3e]'
            }`}
            title="360 Viewer Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Settings Dropdown Popover */}
          {isSettingsOpen && (
            <div
              className="absolute right-0 top-11 w-64 p-3 rounded-2xl bg-[#0c0e14]/95 backdrop-blur-2xl border border-[#232738] shadow-2xl z-50 text-xs animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212536]">
                <span className="font-semibold text-white">Viewer Controls</span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Auto Rotate */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-300">Auto Orbit 360</span>
                <button
                  onClick={() =>
                    onUpdateViewerSettings({ autoRotate: !viewerSettings.autoRotate })
                  }
                  className={`p-1.5 rounded-lg border ${
                    viewerSettings.autoRotate
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  {viewerSettings.autoRotate ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Grid Wireframe */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-300">Spherical Coordinate Grid</span>
                <button
                  onClick={() =>
                    onUpdateViewerSettings({ showGrid: !viewerSettings.showGrid })
                  }
                  className={`p-1.5 rounded-lg border ${
                    viewerSettings.showGrid
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compass HUD */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-300">Heading & Elevation HUD</span>
                <button
                  onClick={() =>
                    onUpdateViewerSettings({ showCompass: !viewerSettings.showCompass })
                  }
                  className={`p-1.5 rounded-lg border ${
                    viewerSettings.showCompass
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Horizon */}
              <div className="pt-2 mt-2 border-t border-[#212536]">
                <button
                  onClick={() => onUpdateViewerSettings({ fov: 75 })}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-[#171b26] hover:bg-[#222736] text-zinc-300 border border-[#282f42] transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span>Reset Camera & FOV</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-[#141722] hover:bg-[#1e2333] text-zinc-400 border border-[#252b3e] transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-3.5 h-3.5" />
          ) : (
            <Maximize className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  );
};
