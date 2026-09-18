export type AmbianceType = 'wind' | 'synth' | 'cosmic' | 'water' | 'forest' | 'cavern';

export type SkyboxModelVersion = 'model-3' | 'model-3.2' | 'model-4';

export interface WorldLighting {
  zenithColor: string;
  horizonColor: string;
  nadirColor: string;
  sunColor: string;
  sunElevation?: number;
  sunAzimuth?: number;
  fogDensity?: number;
  ambientIntensity: number;
}

export interface SkyboxWorld {
  id: string;
  title: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  style: string;
  textureUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  isFavorite?: boolean;
  lighting: WorldLighting;
  ambiance: AmbianceType;
  tags: string[];
  elements?: string[];
  isCustom?: boolean;
  depthUrl?: string;
  remixedFrom?: string;
  remixInfluence?: number;
  modelUsed?: SkyboxModelVersion;
}

export interface SkyboxStyle {
  id: string;
  name: string;
  category: 'Realistic' | 'Painterly' | 'Sci-Fi & Fantasy' | 'Stylized' | 'Interior & Architecture';
  previewGradient: string;
  description: string;
  promptModifier: string;
  negativePromptModifier?: string;
  badge?: string;
  modelSupport?: SkyboxModelVersion[];
}

export interface ViewerSettings {
  autoRotate: boolean;
  rotateSpeed: number;
  fov: number;
  showGrid: boolean;
  showCompass: boolean;
  audioEnabled: boolean;
  audioVolume: number;
  invertDrag: boolean;
  exposure: number;
}

export interface RemixState {
  isRemixing: boolean;
  baseWorld: SkyboxWorld | null;
  influence: number; // 0 to 100
}

export interface SketchToolState {
  active: boolean;
  tool: 'brush' | 'eraser';
  color: string;
  size: number;
  hasDrawing: boolean;
  visible: boolean;
}
