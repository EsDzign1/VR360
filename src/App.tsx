import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  SkyboxWorld,
  SkyboxStyle,
  ViewerSettings,
  RemixState,
  SketchToolState,
  SkyboxModelVersion,
} from './types';
import { getDefaultWorlds } from './data/defaultWorlds';
import { SKYBOX_STYLES } from './data/styles';
import { SURPRISE_PROMPTS } from './data/prompts';
import { generateProceduralSkybox } from './utils/proceduralSkybox';
import { ambianceAudio } from './utils/audioSynthesizer';
import { PanoramaViewer } from './components/PanoramaViewer';
import { ESDzignHeader } from './components/ESDzignHeader';
import { BottomPromptBar } from './components/BottomPromptBar';
import { StyleSelectorModal } from './components/StyleSelectorModal';
import { ExploreModal } from './components/ExploreModal';
import { DownloadModal } from './components/DownloadModal';
import { RemixDrawer } from './components/RemixDrawer';
import { SketchOverlay } from './components/SketchOverlay';
import { ViewerControls } from './components/ViewerControls';

export default function App() {
  // Worlds collection & current active 360 world
  const [worlds, setWorlds] = useState<SkyboxWorld[]>(() => {
    const defaults = getDefaultWorlds();
    const showroom = defaults.find((w) => w.id === 'world-showroom-mtrl2') || defaults[0];
    try {
      const saved = localStorage.getItem('skybox_custom_worlds');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure showroom is at the top of the worlds list
        const filteredSaved = parsed.filter((p: SkyboxWorld) => p.id !== 'world-showroom-mtrl2');
        const otherDefaults = defaults.filter((d) => d.id !== 'world-showroom-mtrl2');
        return [showroom, ...filteredSaved, ...otherDefaults];
      }
    } catch {
      // ignore
    }
    return defaults;
  });

  const [currentWorld, setCurrentWorld] = useState<SkyboxWorld>(() => worlds[0]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Prompt input and generation states
  const [prompt, setPrompt] = useState<string>(currentWorld.prompt);
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [currentStyle, setCurrentStyle] = useState<SkyboxStyle>(() => {
    const found = SKYBOX_STYLES.find(
      (s) => s.name.toLowerCase() === currentWorld.style.toLowerCase()
    );
    return found || SKYBOX_STYLES[0];
  });
  const [modelVersion, setModelVersion] = useState<SkyboxModelVersion>('model-3.2');
  const [credits, setCredits] = useState<number>(15);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Modals & Sub-features
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadTargetWorld, setDownloadTargetWorld] = useState<SkyboxWorld>(currentWorld);

  // Remix State
  const [remixState, setRemixState] = useState<RemixState>({
    isRemixing: false,
    baseWorld: null,
    influence: 50,
  });

  // Sketch Tool State
  const [sketchState, setSketchState] = useState<SketchToolState>({
    active: false,
    tool: 'brush',
    color: '#00f2fe',
    size: 6,
    hasDrawing: false,
    visible: true,
  });

  // Viewer settings & orientation tracking
  const [viewerSettings, setViewerSettings] = useState<ViewerSettings>({
    autoRotate: true,
    rotateSpeed: 0.12,
    fov: 75,
    showGrid: false,
    showCompass: true,
    audioEnabled: false,
    audioVolume: 0.45,
    invertDrag: false,
    exposure: 1.0,
  });

  const [orientation, setOrientation] = useState({ yaw: 0, pitch: 0, fov: 75 });

  // Update audio when enabled state or world ambiance changes
  useEffect(() => {
    if (viewerSettings.audioEnabled) {
      ambianceAudio.play(currentWorld.ambiance, viewerSettings.audioVolume);
    } else {
      ambianceAudio.stop();
    }
    return () => {
      ambianceAudio.stop();
    };
  }, [viewerSettings.audioEnabled, currentWorld.ambiance]);

  // Save custom worlds to localStorage
  const persistCustomWorlds = (updatedWorlds: SkyboxWorld[]) => {
    const customOnly = updatedWorlds.filter((w) => w.isCustom);
    localStorage.setItem('skybox_custom_worlds', JSON.stringify(customOnly));
  };

  // Switch world from explore or history
  const handleSelectWorld = (world: SkyboxWorld) => {
    setCurrentWorld(world);
    setPrompt(world.prompt);
    const matchedStyle = SKYBOX_STYLES.find(
      (s) => s.name.toLowerCase() === world.style.toLowerCase()
    );
    if (matchedStyle) {
      setCurrentStyle(matchedStyle);
    }
  };

  // Trigger Remix Mode
  const handleStartRemix = (worldToRemix?: SkyboxWorld) => {
    const target = worldToRemix || currentWorld;
    setRemixState({
      isRemixing: true,
      baseWorld: target,
      influence: 60,
    });
    setPrompt(`Remix of ${target.title}: ${target.prompt}`);
  };

  const handleCancelRemix = () => {
    setRemixState({
      isRemixing: false,
      baseWorld: null,
      influence: 50,
    });
  };

  const handleApplyRemixPreset = (addition: string) => {
    setPrompt((prev) => `${prev.trim()}, ${addition}`);
  };

  // Generate 360 World
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(15);

    const progressTimer = setInterval(() => {
      setGenerationProgress((p) => (p < 85 ? p + Math.floor(Math.random() * 12) + 5 : p));
    }, 400);

    try {
      // 1. Query server for world metadata & atmosphere lighting via Gemini (with static GitHub Pages fallback)
      let meta: any = null;
      try {
        const metaRes = await fetch('/api/generate-world-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: remixState.isRemixing
              ? `[Remix influence: ${remixState.influence}%] ${prompt}`
              : prompt,
            style: currentStyle.name,
          }),
        });
        if (metaRes.ok) {
          meta = await metaRes.json();
        }
      } catch {
        // Safe static host fallback
      }

      if (!meta || !meta.lighting) {
        meta = {
          title: prompt.slice(0, 26) || 'Custom 360 ESDzign',
          description: prompt,
          lighting: {
            zenithColor: '#090d16',
            horizonColor: '#38bdf8',
            nadirColor: '#020617',
            sunColor: '#fde047',
            ambientIntensity: 0.9,
          },
          ambiance: 'wind',
        };
      }

      setGenerationProgress(90);

      // 2. Synthesize seamless 2048x1024 equirectangular texture
      const { textureUrl, thumbnailUrl } = generateProceduralSkybox({
        prompt,
        style: currentStyle.name,
        lighting: meta.lighting,
        seed: Math.floor(Math.random() * 1000000),
        width: 2048,
        height: 1024,
      });

      const newWorld: SkyboxWorld = {
        id: `custom-${Date.now()}`,
        title: meta.title || prompt.slice(0, 26) || 'Custom 360 ESDzign',
        prompt,
        enhancedPrompt: meta.description || prompt,
        negativePrompt: negativePrompt || undefined,
        style: currentStyle.name,
        textureUrl,
        thumbnailUrl,
        createdAt: new Date().toISOString().split('T')[0],
        lighting: meta.lighting || {
          zenithColor: '#090d16',
          horizonColor: '#38bdf8',
          nadirColor: '#020617',
          sunColor: '#fde047',
          ambientIntensity: 0.9,
        },
        ambiance: meta.ambiance || 'wind',
        tags: [currentStyle.name.toLowerCase(), 'custom', '360'],
        isCustom: true,
        isFavorite: true,
        remixedFrom: remixState.isRemixing ? remixState.baseWorld?.id : undefined,
        remixInfluence: remixState.isRemixing ? remixState.influence : undefined,
        modelUsed: modelVersion,
      };

      setGenerationProgress(100);

      // Deduct credit
      setCredits((prev) => Math.max(0, prev - 1));

      // Confetti burst for creative synthesis
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.85 },
          colors: ['#00f2fe', '#4facfe', '#a855f7'],
        });
      } catch {
        // ignore
      }

      setWorlds((prev) => {
        const next = [newWorld, ...prev];
        persistCustomWorlds(next);
        return next;
      });

      setCurrentWorld(newWorld);
      if (remixState.isRemixing) {
        handleCancelRemix();
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      clearInterval(progressTimer);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // AI Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: currentStyle.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setPrompt(data.enhancedPrompt);
          return;
        }
      }
    } catch {
      // Safe fallback for static GitHub Pages hosting
    }

    // Static intelligent enhancement fallback
    setPrompt(
      `${prompt}, 360-degree seamless panorama, ${currentStyle.name.toLowerCase()} atmosphere, cinematic lighting, ultra-detailed horizon, equirectangular projection`
    );
    setIsEnhancing(false);
  };

  // Surprise Me / Random Inspiration
  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * SURPRISE_PROMPTS.length);
    const chosen = SURPRISE_PROMPTS[randomIndex];
    setPrompt(chosen.prompt);
    const matchedStyle = SKYBOX_STYLES.find(
      (s) => s.name.toLowerCase() === chosen.style.toLowerCase()
    );
    if (matchedStyle) {
      setCurrentStyle(matchedStyle);
    }
  };

  // Upload personal 360 photo
  const handleUploadCustom360 = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const uploadedWorld: SkyboxWorld = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, '').slice(0, 24) || 'Uploaded 360 Panorama',
        prompt: `Custom uploaded 360 photo: ${file.name}`,
        style: 'Photorealistic',
        textureUrl: dataUrl,
        thumbnailUrl: dataUrl,
        createdAt: new Date().toISOString().split('T')[0],
        lighting: {
          zenithColor: '#1e293b',
          horizonColor: '#94a3b8',
          nadirColor: '#0f172a',
          sunColor: '#ffffff',
          ambientIntensity: 1.0,
        },
        ambiance: 'wind',
        tags: ['uploaded', '360'],
        isCustom: true,
      };

      setWorlds((prev) => {
        const next = [uploadedWorld, ...prev];
        persistCustomWorlds(next);
        return next;
      });

      setCurrentWorld(uploadedWorld);
    };
    reader.readAsDataURL(file);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setWorlds((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
      persistCustomWorlds(next);
      return next;
    });
    if (currentWorld.id === id) {
      setCurrentWorld((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const handleOpenDownload = (world?: SkyboxWorld) => {
    setDownloadTargetWorld(world || currentWorld);
    setIsDownloadOpen(true);
  };

  const handleUpdateViewerSettings = useCallback((newSettings: Partial<ViewerSettings>) => {
    setViewerSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleOrientationChange = useCallback((yaw: number, pitch: number, fov: number) => {
    setOrientation({ yaw, pitch, fov });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only turn off if leaving window/container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadCustom360(files[0]);
    }
  };

  return (
    <div
      id="skybox-app-root"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-screen h-screen overflow-hidden select-none bg-[#090b10] text-zinc-100"
    >
      {/* Visual Drag and Drop 360 Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md border-2 border-dashed border-cyan-400 m-4 rounded-3xl pointer-events-none transition-all animate-in fade-in duration-150">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white">Drop 360 Image to Load in VR360°</p>
          <p className="text-xs text-zinc-400 mt-1">Supports equirectangular JPG, PNG, WEBP (e.g. MtrL2-7.JPG)</p>
        </div>
      )}

      {/* 360 Interactive Spherical Panorama Canvas */}
      <PanoramaViewer
        textureUrl={currentWorld.textureUrl}
        lighting={currentWorld.lighting}
        settings={viewerSettings}
        onOrientationChange={handleOrientationChange}
        isGenerating={isGenerating}
      />

      {/* 360 Sketch Drawing Overlay */}
      <SketchOverlay
        sketchState={sketchState}
        onChangeSketchState={(updates) => setSketchState((prev) => ({ ...prev, ...updates }))}
        onClose={() => setSketchState((prev) => ({ ...prev, active: false }))}
      />

      {/* Generation Synthesizer Progress Bar */}
      {isGenerating && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center p-3 rounded-2xl bg-[#0c0e15]/95 backdrop-blur-2xl border border-cyan-500/50 shadow-2xl shadow-cyan-950/60 min-w-[320px] animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between w-full mb-1.5 text-xs">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Synthesizing 360° Spherical Canvas...
            </span>
            <span className="font-mono text-cyan-400 font-bold">{generationProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141724] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Authentic ES Dzign Top Bar */}
      <ESDzignHeader
        currentWorld={currentWorld}
        onOpenExplore={() => setIsExploreOpen(true)}
        onToggleSketch={() =>
          setSketchState((prev) => ({ ...prev, active: !prev.active }))
        }
        isSketchActive={sketchState.active}
        onStartRemix={() => handleStartRemix(currentWorld)}
        isRemixing={remixState.isRemixing}
        onOpenDownload={() => handleOpenDownload(currentWorld)}
        onUploadImage={handleUploadCustom360}
        viewerSettings={viewerSettings}
        onUpdateViewerSettings={handleUpdateViewerSettings}
        credits={credits}
      />

      {/* Floating Viewer Tools Island (Right Side) */}
      <ViewerControls
        settings={viewerSettings}
        onUpdateSettings={handleUpdateViewerSettings}
        orientation={orientation}
      />

      {/* Bottom Console Deck (Houses Remix Drawer & Prompt Bar) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[96%] max-w-4xl pointer-events-auto">
        {/* ES Dzign Remix Mode Drawer */}
        <RemixDrawer
          remixState={remixState}
          onChangeInfluence={(influence) =>
            setRemixState((prev) => ({ ...prev, influence }))
          }
          onCancelRemix={handleCancelRemix}
          onApplyPreset={handleApplyRemixPreset}
          onGenerateRemix={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Prompt Input & Generation Deck */}
        <BottomPromptBar
          prompt={prompt}
          onChangePrompt={setPrompt}
          negativePrompt={negativePrompt}
          onChangeNegativePrompt={setNegativePrompt}
          currentStyle={currentStyle}
          onOpenStyleModal={() => setIsStyleModalOpen(true)}
          onGenerate={handleGenerate}
          onEnhancePrompt={handleEnhancePrompt}
          onSurpriseMe={handleSurpriseMe}
          isEnhancing={isEnhancing}
          isGenerating={isGenerating}
          model={modelVersion}
          onChangeModel={setModelVersion}
          hasSketch={sketchState.hasDrawing}
        />
      </div>

      {/* Style Selector Modal */}
      <StyleSelectorModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        selectedStyle={currentStyle}
        onSelectStyle={(style) => setCurrentStyle(style)}
      />

      {/* Explore Showcase Gallery Modal */}
      <ExploreModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        worlds={worlds}
        currentWorldId={currentWorld.id}
        onSelectWorld={handleSelectWorld}
        onRemixWorld={handleStartRemix}
        onToggleFavorite={handleToggleFavorite}
        onOpenDownload={handleOpenDownload}
      />

      {/* Asset Export / Download Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        world={downloadTargetWorld}
      />
    </div>
  );
}
