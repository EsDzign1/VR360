import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Grid,
  Volume2,
  VolumeX,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { ViewerSettings } from '../types';

interface ViewerControlsProps {
  settings: ViewerSettings;
  onUpdateSettings: (newSettings: Partial<ViewerSettings>) => void;
  orientation: { yaw: number; pitch: number; fov: number };
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  settings,
  onUpdateSettings,
  orientation,
}) => {
  // Convert yaw to cardinal direction (N, NE, E, SE, S, SW, W, NW)
  const getCardinalDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  const cardinal = getCardinalDirection(orientation.yaw);

  return (
    <div
      id="skybox-viewer-controls"
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto select-none"
    >
      {/* Compass / Orientation HUD Pill */}
      {settings.showCompass && (
        <div
          className="flex flex-col items-center px-2.5 py-2 rounded-2xl bg-[#0c0e14]/90 backdrop-blur-2xl border border-[#232738] shadow-2xl text-zinc-300 mb-1"
          title="Panoramic Heading & Elevation"
        >
          <Compass className="w-4 h-4 text-cyan-400 mb-1" />
          <span className="text-[11px] font-mono font-bold text-white">{cardinal}</span>
          <span className="text-[9px] font-mono text-zinc-400">
            {Math.round(orientation.yaw)}°
          </span>
          <span className="text-[8px] font-mono text-zinc-500">
            {orientation.pitch >= 0 ? `+${Math.round(orientation.pitch)}` : Math.round(orientation.pitch)}°
          </span>
        </div>
      )}

      {/* Floating Vertical Tool Island */}
      <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c0e14]/90 backdrop-blur-2xl border border-[#232738] shadow-2xl text-zinc-300">
        {/* Zoom In */}
        <button
          onClick={() => onUpdateSettings({ fov: Math.max(35, settings.fov - 10) })}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-90"
          title="Zoom In (Decrease FOV)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => onUpdateSettings({ fov: Math.min(95, settings.fov + 10) })}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-90"
          title="Zoom Out (Increase FOV)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-4 h-[1px] bg-[#232738] my-0.5" />

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => onUpdateSettings({ autoRotate: !settings.autoRotate })}
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            settings.autoRotate
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
          title={settings.autoRotate ? 'Pause 360 Orbit' : 'Auto Rotate 360'}
        >
          {settings.autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Polar Grid Wireframe Overlay */}
        <button
          onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            settings.showGrid
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
          title="Toggle Spherical Coordinate Grid"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Ambient Soundscape Toggle */}
        <button
          onClick={() => onUpdateSettings({ audioEnabled: !settings.audioEnabled })}
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            settings.audioEnabled
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
          title={settings.audioEnabled ? 'Mute Ambiance Sound' : 'Play Immersive 360 Ambiance'}
        >
          {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Camera View to Center Horizon */}
        <button
          onClick={() => onUpdateSettings({ fov: 75 })}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-90"
          title="Reset Camera FOV & Horizon"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
