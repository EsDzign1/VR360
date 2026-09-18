import React, { useRef, useEffect, useState } from 'react';
import {
  Paintbrush,
  Eraser,
  Trash2,
  Eye,
  EyeOff,
  Sliders,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { SketchToolState } from '../types';

interface SketchOverlayProps {
  sketchState: SketchToolState;
  onChangeSketchState: (updated: Partial<SketchToolState>) => void;
  onClose: () => void;
}

const COLORS = [
  '#ffffff', // White
  '#00f2fe', // Cyan
  '#facc15', // Yellow
  '#22c55e', // Green
  '#ef4444', // Red
  '#a855f7', // Purple
  '#09090b', // Black
];

const BRUSH_SIZES = [2, 6, 14, 28];

export const SketchOverlay: React.FC<SketchOverlayProps> = ({
  sketchState,
  onChangeSketchState,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Resize canvas to match window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const prevData = canvas.toDataURL();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Restore drawing if existed
      if (sketchState.hasDrawing) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
        };
        img.src = prevData;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sketchState.hasDrawing]);

  // Handle Drawing events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!sketchState.active || !sketchState.visible) return;
    isDrawing.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    lastPoint.current = { x, y };

    // Mark that we have drawing
    if (!sketchState.hasDrawing) {
      onChangeSketchState({ hasDrawing: true });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentX, currentY);

    if (sketchState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = sketchState.size * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = sketchState.color;
      ctx.lineWidth = sketchState.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.stroke();
    lastPoint.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChangeSketchState({ hasDrawing: false });
  };

  if (!sketchState.active) return null;

  return (
    <div id="sketch-mode-container" className="absolute inset-0 z-20 pointer-events-none">
      {/* HTML5 Canvas Surface */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`absolute inset-0 w-full h-full ${
          sketchState.visible ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Floating Sketch Tool Palette (Exact ES Dzign style) */}
      <div
        id="sketch-floating-palette"
        className="fixed top-20 left-6 z-30 pointer-events-auto flex flex-col gap-2 p-2.5 rounded-2xl bg-[#0e1015]/90 backdrop-blur-xl border border-[#232733] shadow-2xl text-zinc-100 animate-in slide-in-from-left-4 duration-200"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#232733] px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sketch Mode</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tools: Brush vs Eraser */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#141720] rounded-xl border border-[#232733]">
          <button
            onClick={() => onChangeSketchState({ tool: 'brush' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              sketchState.tool === 'brush'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>

          <button
            onClick={() => onChangeSketchState({ tool: 'eraser' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              sketchState.tool === 'eraser'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Erase</span>
          </button>
        </div>

        {/* Brush Sizes */}
        <div className="flex items-center justify-between gap-1 px-1 py-1">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onChangeSketchState({ size })}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                sketchState.size === size
                  ? 'bg-zinc-700 ring-1 ring-cyan-400'
                  : 'hover:bg-zinc-800 text-zinc-400'
              }`}
              title={`Brush Size: ${size}px`}
            >
              <div
                className="rounded-full bg-white"
                style={{ width: Math.min(18, Math.max(3, size)), height: Math.min(18, Math.max(3, size)) }}
              />
            </button>
          ))}
        </div>

        {/* Color Palette */}
        {sketchState.tool === 'brush' && (
          <div className="flex items-center gap-1.5 px-1 py-1">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onChangeSketchState({ color })}
                className={`w-5 h-5 rounded-full border border-black/50 transition-transform ${
                  sketchState.color === color ? 'scale-125 ring-2 ring-cyan-400' : 'hover:scale-110 opacity-90'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#232733] gap-1.5 text-xs">
          <button
            onClick={() => onChangeSketchState({ visible: !sketchState.visible })}
            className={`p-1.5 rounded-lg border border-[#232733] transition-colors ${
              sketchState.visible ? 'bg-zinc-800 text-zinc-300' : 'bg-red-500/20 text-red-400'
            }`}
            title={sketchState.visible ? 'Hide Sketch Overlay' : 'Show Sketch Overlay'}
          >
            {sketchState.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-[#232733] bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
            title="Clear all strokes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="text-[10px] text-zinc-400 font-mono px-2 py-0.5 bg-[#141720] rounded-md border border-[#232733]">
            Guide AI
          </div>
        </div>
      </div>
    </div>
  );
};
