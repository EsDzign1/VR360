import { SkyboxWorld } from '../types';
import { generateProceduralSkybox } from '../utils/proceduralSkybox';

const baseUrl = import.meta.env.BASE_URL || './';
const showroomUrl = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}showroom-360.jpg`;

export const INITIAL_WORLDS_CONFIG: (Omit<SkyboxWorld, 'textureUrl' | 'thumbnailUrl'> & {
  textureUrl?: string;
  thumbnailUrl?: string;
})[] = [
  {
    id: 'world-showroom-mtrl2',
    title: 'ES Design Showroom Gallery (MtrL2-7)',
    prompt: 'Interior architectural showroom gallery with continuous curved archways, star pattern terrazzo floor, blue accent LED lighting, illuminated glass display showcases, corporate interior',
    enhancedPrompt: 'A 360-degree interior showroom gallery featuring grand archways with blue neon lighting accents, star-shaped terrazzo stone floor inlays, illuminated timber and glass display cabinets, polished reflective ground',
    style: 'Modern Architecture',
    createdAt: '2026-09-18',
    isFavorite: true,
    lighting: {
      zenithColor: '#ffffff',
      horizonColor: '#3b82f6',
      nadirColor: '#78716c',
      sunColor: '#60a5fa',
      sunElevation: 45,
      sunAzimuth: 180,
      fogDensity: 0.005,
      ambientIntensity: 1.0,
    },
    ambiance: 'cavern',
    tags: ['showroom', 'architecture', 'interior', 'es-design', 'archways'],
    elements: ['Curved Archways', 'Star Floor Inlay', 'Blue LED Curves', 'Display Cases'],
    textureUrl: showroomUrl,
    thumbnailUrl: showroomUrl,
  },
  {
    id: 'world-neo-tokyo',
    title: 'Neo-Tokyo Cyber Skyline',
    prompt: 'A towering cyberpunk rooftop overlooking a sprawling neon megacity at midnight, holographic billboards, cyan and magenta searchlights, rain-slicked reflective surfaces',
    enhancedPrompt: 'A breathtaking 360-degree panoramic rooftop in Neo-Tokyo, futuristic skyscrapers wrapped in holographic advertisements, vibrant neon reflections on wet glass pavement, flying aerial vehicles between colossal corporate towers under a purple-black stormy sky',
    style: 'Cyberpunk Sci-Fi',
    createdAt: '2026-09-18',
    isFavorite: true,
    lighting: {
      zenithColor: '#09031c',
      horizonColor: '#06b6d4',
      nadirColor: '#020617',
      sunColor: '#ec4899',
      sunElevation: 25,
      sunAzimuth: 140,
      fogDensity: 0.025,
      ambientIntensity: 0.9,
    },
    ambiance: 'synth',
    tags: ['cyberpunk', 'neon', 'cityscape', 'sci-fi'],
    elements: ['Holographic Tower', 'Neon Billboards', 'Sky Bridge', 'Rain Puddles'],
  },
  {
    id: 'world-floating-isles',
    title: 'Floating Isles of Aethelgard',
    prompt: 'Ancient moss-covered floating monolithic islands suspended in a golden sunset sky, cascading waterfalls pouring into the clouds, mystical glowing runes',
    enhancedPrompt: 'An epic fantasy 360 world of colossal floating islands shrouded in drifting pink and gold sunset clouds, lush ancient flora, glowing crystalline waterfalls tumbling into infinity, distant twin moons on the zenith',
    style: 'Epic Fantasy',
    createdAt: '2026-09-17',
    isFavorite: true,
    lighting: {
      zenithColor: '#1e1b4b',
      horizonColor: '#fb923c',
      nadirColor: '#022c22',
      sunColor: '#fef08a',
      sunElevation: 18,
      sunAzimuth: 45,
      fogDensity: 0.015,
      ambientIntensity: 0.95,
    },
    ambiance: 'wind',
    tags: ['fantasy', 'floating islands', 'sunset', 'magical'],
    elements: ['Ancient Monoliths', 'Cascading Falls', 'Ethereal Cloud Sea', 'Twin Moons'],
  },
  {
    id: 'world-supernova-nebula',
    title: 'Cosmic Orion Deep Nebula',
    prompt: 'Immense interstellar star nursery with swirling violet and cyan hydrogen gas, ringed gas giant planet, thousands of brilliant twinkling distant stars',
    enhancedPrompt: 'A panoramic 360 deep space void surrounded by glowing magenta and aquamarine nebula dust, a colossal ochre ringed gas giant in the foreground, star clusters and gravitational accretion arcs',
    style: 'Deep Space Nebula',
    createdAt: '2026-09-16',
    isFavorite: false,
    lighting: {
      zenithColor: '#02000d',
      horizonColor: '#3b0764',
      nadirColor: '#050014',
      sunColor: '#38bdf8',
      sunElevation: 40,
      sunAzimuth: 260,
      fogDensity: 0.005,
      ambientIntensity: 0.7,
    },
    ambiance: 'cosmic',
    tags: ['space', 'nebula', 'cosmos', 'planet'],
    elements: ['Ringed Gas Giant', 'Glowing Nebula Cloud', 'Star Clusters', 'Cosmic Dust'],
  },
  {
    id: 'world-shinkai-clouds',
    title: 'Azure Summertime Skies',
    prompt: 'Towering sunlit cumulus clouds over emerald green rolling hills, distant coastal sea, vibrant Makoto Shinkai anime aesthetic with lens flare',
    enhancedPrompt: 'An expansive 360 anime scenery panorama, towering white thunderhead clouds glowing in golden sunlight, azure blue skies, wind rippling across grassy plateau overlooking the distant sapphire ocean',
    style: 'Anime Art',
    createdAt: '2026-09-15',
    isFavorite: false,
    lighting: {
      zenithColor: '#0284c7',
      horizonColor: '#bae6fd',
      nadirColor: '#047857',
      sunColor: '#ffffff',
      sunElevation: 55,
      sunAzimuth: 150,
      fogDensity: 0.01,
      ambientIntensity: 1.1,
    },
    ambiance: 'forest',
    tags: ['anime', 'clouds', 'summer', 'vibrant'],
    elements: ['Towering Cumulus Cloud', 'Emerald Hillside', 'Distant Coastline', 'Drifting Petals'],
  },
  {
    id: 'world-synthwave-outrun',
    title: 'Neon Outrun Horizon',
    prompt: 'Retro 80s synthwave horizon with a glowing wireframe grid floor, giant segmented magenta sun on the horizon, purple mountain silhouettes',
    enhancedPrompt: 'Classic 1980s synthwave 360 panoramic world, endless glowing magenta perspective wireframe grid stretching to infinity, giant striped neon setting sun, jagged dark purple vector mountain ranges',
    style: 'Synthwave 80s',
    createdAt: '2026-09-14',
    isFavorite: true,
    lighting: {
      zenithColor: '#090022',
      horizonColor: '#c026d3',
      nadirColor: '#020617',
      sunColor: '#f43f5e',
      sunElevation: 12,
      sunAzimuth: 150,
      fogDensity: 0.02,
      ambientIntensity: 0.85,
    },
    ambiance: 'synth',
    tags: ['synthwave', 'retro', '80s', 'neon grid'],
    elements: ['Segmented Sun', 'Wireframe Grid', 'Vector Mountains', 'Magenta Sunset'],
  },
  {
    id: 'world-nordic-penthouse',
    title: 'Minimalist Nordic Penthouse',
    prompt: 'Floor-to-ceiling 360 panoramic glass windows in a Scandinavian minimalist architectural loft, snowy mountain peaks outside, warm timber and stone interior',
    enhancedPrompt: 'A sleek 360 modern architectural interior with continuous panoramic glass windows showcasing snow-capped alpine mountains, warm recessed lighting, polished concrete and light oak finishes',
    style: 'Modern Architecture',
    createdAt: '2026-09-13',
    isFavorite: false,
    lighting: {
      zenithColor: '#292524',
      horizonColor: '#a8a29e',
      nadirColor: '#1c1917',
      sunColor: '#fef3c7',
      sunElevation: 30,
      sunAzimuth: 90,
      fogDensity: 0.01,
      ambientIntensity: 0.95,
    },
    ambiance: 'cavern',
    tags: ['architecture', 'interior', 'minimalist', 'loft'],
    elements: ['Floor-to-Ceiling Glass', 'Alpine Peaks', 'Warm Oak Beam', 'Polished Concrete'],
  },
];

let cachedWorlds: SkyboxWorld[] | null = null;

export function getDefaultWorlds(): SkyboxWorld[] {
  if (cachedWorlds) return cachedWorlds;

  cachedWorlds = INITIAL_WORLDS_CONFIG.map((config, index) => {
    if (config.textureUrl && config.thumbnailUrl) {
      return {
        ...config,
        textureUrl: config.textureUrl,
        thumbnailUrl: config.thumbnailUrl,
      } as SkyboxWorld;
    }

    const { textureUrl, thumbnailUrl } = generateProceduralSkybox({
      prompt: config.prompt,
      style: config.style,
      lighting: config.lighting,
      seed: 104729 + index * 48271,
      width: 2048,
      height: 1024,
    });

    return {
      ...config,
      textureUrl,
      thumbnailUrl,
    };
  });

  return cachedWorlds;
}
