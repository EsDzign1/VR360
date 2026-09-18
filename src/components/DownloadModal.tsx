import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  Box,
  Layers,
  Video,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { SkyboxWorld } from '../types';
import {
  exportEquirectangularImage,
  generateCubemapFaces,
  generateDepthMap,
  CubeFace,
} from '../utils/cubemapExporter';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  world: SkyboxWorld;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  world,
}) => {
  const [activeTab, setActiveTab] = useState<'equirect' | 'cubemap' | 'depth' | 'share'>('equirect');
  const [cubemapFaces, setCubemapFaces] = useState<CubeFace[]>([]);
  const [depthUrl, setDepthUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Pre-generate cubemap and depth map when modal opens
    setIsProcessing(true);
    Promise.all([
      generateCubemapFaces(world.textureUrl, 512)
        .then(setCubemapFaces)
        .catch(console.error),
      generateDepthMap(world.textureUrl)
        .then(setDepthUrl)
        .catch(console.error),
    ]).finally(() => setIsProcessing(false));
  }, [isOpen, world.textureUrl]);

  if (!isOpen) return null;

  const sanitizedTitle = world.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const handleDownloadFace = (face: CubeFace) => {
    exportEquirectangularImage(face.dataUrl, `${sanitizedTitle}-face-${face.name}.jpg`);
  };

  const handleDownloadAllFaces = () => {
    cubemapFaces.forEach((face, idx) => {
      setTimeout(() => {
        handleDownloadFace(face);
      }, idx * 250);
    });
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
    } catch {
      // ignore
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = async () => {
    const embedCode = `<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" allow="fullscreen" allowfullscreen></iframe>`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(embedCode);
      } else {
        const input = document.createElement('input');
        input.value = embedCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
    } catch {
      // ignore
    }
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div
      id="download-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="download-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-[#0d0f15] border border-[#232736] shadow-2xl overflow-hidden text-zinc-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212533]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">
                Export 360° Assets
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-[280px]">
                {world.title} • {world.style}
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

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 px-6 pt-4 border-b border-[#212533] overflow-x-auto pb-3">
          <button
            onClick={() => setActiveTab('equirect')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'equirect'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'bg-[#141720] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Equirectangular</span>
          </button>

          <button
            onClick={() => setActiveTab('cubemap')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'cubemap'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'bg-[#141720] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Cube Map (6 Faces)</span>
          </button>

          <button
            onClick={() => setActiveTab('depth')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'depth'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'bg-[#141720] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Depth Map</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'share'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'bg-[#141720] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Share & Embed</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Equirectangular Tab */}
          {activeTab === 'equirect' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#232736] aspect-2/1 bg-black">
                <img
                  src={world.textureUrl}
                  alt={world.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                  2:1 Panoramic Equirectangular (2048 x 1024)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => exportEquirectangularImage(world.textureUrl, `${sanitizedTitle}-panorama.jpg`)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-all active:scale-95 shadow-md shadow-cyan-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JPG</span>
                </button>

                <button
                  onClick={() => exportEquirectangularImage(world.textureUrl, `${sanitizedTitle}-panorama.png`)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-[#1a1f2c] hover:bg-zinc-700 text-white border border-[#2b3145] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
                Standard 360° projection compatible with Facebook 360, YouTube 360, Three.js, Unreal Engine, Blender, and Unity ESDzign shaders.
              </p>
            </div>
          )}

          {/* Cubemap Tab */}
          {activeTab === 'cubemap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-300 font-medium">
                  6 Individual Cube Map Faces (Right, Left, Top, Bottom, Front, Back)
                </span>
                <button
                  onClick={handleDownloadAllFaces}
                  disabled={cubemapFaces.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all font-semibold"
                >
                  <Download className="w-3 h-3" />
                  <span>Download All Faces</span>
                </button>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs">Computing 3D Cube Projection...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {cubemapFaces.map((face) => (
                    <div
                      key={face.name}
                      className="group relative rounded-xl border border-[#232736] overflow-hidden aspect-square bg-black"
                    >
                      <img
                        src={face.dataUrl}
                        alt={face.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <span className="text-[10px] font-mono uppercase text-white font-bold">
                          {face.name}
                        </span>
                        <button
                          onClick={() => handleDownloadFace(face)}
                          className="p-1.5 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-transform active:scale-95"
                          title="Download face"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1.5 text-[9px] font-mono uppercase text-zinc-300 bg-black/70 px-1.5 rounded">
                        {face.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-zinc-400 text-center">
                Ready for seamless import into Unity ESDzign material, Unreal Engine cubemaps, and Godot 4 sky textures.
              </p>
            </div>
          )}

          {/* Depth Map Tab */}
          {activeTab === 'depth' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#232736] aspect-2/1 bg-black">
                {depthUrl ? (
                  <img
                    src={depthUrl}
                    alt="Depth map"
                    className="w-full h-full object-cover filter contrast-125"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-zinc-400 text-xs">
                    Synthesizing depth map...
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
                  Spherical Depth Map (Displacement)
                </div>
              </div>

              <button
                onClick={() => depthUrl && exportEquirectangularImage(depthUrl, `${sanitizedTitle}-depth.jpg`)}
                disabled={!depthUrl}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-all active:scale-95 shadow-md shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Depth Map</span>
              </button>

              <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
                Use this depth buffer for 3D parallax effects, volumetric point clouds, displacement meshes, and VR headset stereo estimation.
              </p>
            </div>
          )}

          {/* Share & Embed Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Share Direct URL
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141720] border border-[#232736]">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full bg-transparent text-zinc-200 outline-none text-xs font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  Embed in Webpage (iFrame 360 Viewer)
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141720] border border-[#232736]">
                  <input
                    type="text"
                    readOnly
                    value={`<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`}
                    className="w-full bg-transparent text-zinc-200 outline-none text-xs font-mono"
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors whitespace-nowrap"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmbed ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
