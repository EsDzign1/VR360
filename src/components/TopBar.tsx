import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Download,
  FolderOpen,
  Sparkles,
  Upload,
  Layers,
  Check,
  Maximize2,
  Minimize2,
  Share2,
} from 'lucide-react';
import { SkyboxWorld } from '../types';
import { exportEquirectangularImage, generateCubemapFaces } from '../utils/cubemapExporter';

interface TopBarProps {
  currentWorld: SkyboxWorld;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenGallery: () => void;
  onRemix: (world: SkyboxWorld) => void;
  onUploadCustom360: (file: File) => void;
  galleryCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentWorld,
  darkMode,
  onToggleDarkMode,
  onOpenGallery,
  onRemix,
  onUploadCustom360,
  galleryCount,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExportingCubemap, setIsExportingCubemap] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleExportEquirect = () => {
    const filename = `${currentWorld.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-360.jpg`;
    exportEquirectangularImage(currentWorld.textureUrl, filename);
    setShowExportMenu(false);
  };

  const handleExportCubemap = async () => {
    try {
      setIsExportingCubemap(true);
      const faces = await generateCubemapFaces(currentWorld.textureUrl, 512);
      // Download each face
      faces.forEach((face) => {
        const link = document.createElement('a');
        link.href = face.dataUrl;
        link.download = `${currentWorld.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cubemap-${face.name}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (err) {
      console.error('Failed to export cubemap:', err);
    } finally {
      setIsExportingCubemap(false);
      setShowExportMenu(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentWorld.enhancedPrompt || currentWorld.prompt);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustom360(file);
    }
  };

  return (
    <header
      id="skybox-top-bar"
      className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3 transition-colors duration-300 pointer-events-none`}
    >
      {/* Brand & World Title */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-xl border transition-all ${
            darkMode
              ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 shadow-lg shadow-black/20'
              : 'bg-white/80 border-zinc-200 text-zinc-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
              E
            </div>
            <span className="font-semibold tracking-tight text-sm">ESDzign</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-zinc-400/50" />

          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-[160px] sm:max-w-[240px] truncate">
            {currentWorld.title}
          </span>

          <span
            className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
              darkMode ? 'bg-zinc-800 text-cyan-400' : 'bg-zinc-100 text-indigo-600'
            }`}
          >
            {currentWorld.style}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Gallery / Worlds Button */}
        <button
          id="gallery-drawer-toggle"
          onClick={onOpenGallery}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all active:scale-95 ${
            darkMode
              ? 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 text-zinc-200'
              : 'bg-white/80 hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-sm'
          }`}
          title="World Library & History"
        >
          <FolderOpen className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden sm:inline">Worlds</span>
          <span
            className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {galleryCount}
          </span>
        </button>

        {/* Remix Current World */}
        <button
          id="remix-world-button"
          onClick={() => onRemix(currentWorld)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all active:scale-95 ${
            darkMode
              ? 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 text-zinc-200'
              : 'bg-white/80 hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-sm'
          }`}
          title="Remix this 360 environment"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Remix</span>
        </button>

        {/* Upload 360 File */}
        <button
          id="upload-360-button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-full backdrop-blur-xl border transition-all active:scale-95 ${
            darkMode
              ? 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 text-zinc-200'
              : 'bg-white/80 hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-sm'
          }`}
          title="Upload personal 360 Equirectangular photo"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            id="export-menu-button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all active:scale-95 ${
              darkMode
                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {showExportMenu && (
            <div
              className={`absolute right-0 mt-2 w-56 p-1.5 rounded-2xl backdrop-blur-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                darkMode
                  ? 'bg-zinc-900/95 border-zinc-800 text-zinc-200'
                  : 'bg-white/95 border-zinc-200 text-zinc-800'
              }`}
            >
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Export 360 Formats
              </div>

              <button
                onClick={handleExportEquirect}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-zinc-500/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <div className="font-medium">Equirectangular 360°</div>
                    <div className="text-[10px] text-zinc-400">2:1 Panoramic Image (JPG)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportCubemap}
                disabled={isExportingCubemap}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-zinc-500/10 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <div>
                    <div className="font-medium">
                      {isExportingCubemap ? 'Rendering Cubemap...' : '6-Face Cubemap'}
                    </div>
                    <div className="text-[10px] text-zinc-400">Unity / Unreal / WebGL faces</div>
                  </div>
                </div>
              </button>

              <div className="my-1 border-t border-zinc-500/20" />

              <button
                onClick={handleCopyPrompt}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-zinc-500/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="font-medium">Copy World Prompt</div>
                    <div className="text-[10px] text-zinc-400">Share generation prompt</div>
                  </div>
                </div>
                {copiedLink && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Minimalist Dark / Light Mode Switch */}
        <button
          id="theme-toggle-button"
          onClick={onToggleDarkMode}
          className={`p-2 rounded-full backdrop-blur-xl border transition-all active:scale-90 ${
            darkMode
              ? 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 text-amber-300'
              : 'bg-white/80 hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-sm'
          }`}
          title={darkMode ? 'Switch to Minimalist Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          id="fullscreen-toggle-button"
          onClick={handleFullscreenToggle}
          className={`p-2 rounded-full backdrop-blur-xl border transition-all active:scale-95 ${
            darkMode
              ? 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 text-zinc-300'
              : 'bg-white/80 hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-sm'
          }`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 360'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
