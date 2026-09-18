import { WorldLighting } from '../types';

interface GenerationParams {
  prompt: string;
  style: string;
  lighting?: Partial<WorldLighting>;
  seed?: number;
  width?: number;
  height?: number;
}

// Deterministic pseudo-random based on seed using standard 32-bit unsigned LCG
function createRandom(seed: number) {
  let s = (Math.abs(Math.floor(seed)) || 1234567) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Seamless periodic noise in 2D using 3D cylinder projection
function periodicNoise(x: number, y: number, width: number, scale: number, random: () => number): number {
  const angle = (x / width) * Math.PI * 2;
  const nx = Math.cos(angle) * scale;
  const nz = Math.sin(angle) * scale;
  const ny = y * scale;
  return (Math.sin(nx * 2.5 + ny * 1.5) * Math.cos(nz * 2.5) + Math.sin(ny * 3.0 + nx * 1.2)) * 0.5 + 0.5;
}

export function generateProceduralSkybox(params: GenerationParams): { textureUrl: string; thumbnailUrl: string } {
  const width = params.width || 2048;
  const height = params.height || 1024;
  const seed = params.seed || Math.floor(Math.random() * 1000000);
  const rnd = createRandom(seed);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { textureUrl: '', thumbnailUrl: '' };
  }

  const promptLower = params.prompt.toLowerCase();
  const styleLower = params.style.toLowerCase();

  // Determine aesthetic palette & theme
  const isCyberpunk = styleLower.includes('cyber') || promptLower.includes('cyber') || promptLower.includes('neon');
  const isSpace = styleLower.includes('space') || styleLower.includes('nebula') || promptLower.includes('galaxy') || promptLower.includes('planet');
  const isFantasy = styleLower.includes('fantasy') || promptLower.includes('magic') || promptLower.includes('castle') || promptLower.includes('island');
  const isAnime = styleLower.includes('anime') || promptLower.includes('ghibli') || promptLower.includes('shinkai');
  const isVaporwave = styleLower.includes('vapor') || styleLower.includes('synth') || promptLower.includes('retro');
  const isInterior = styleLower.includes('interior') || promptLower.includes('room') || promptLower.includes('apartment') || promptLower.includes('loft');
  const isSunset = promptLower.includes('sunset') || promptLower.includes('dusk') || promptLower.includes('golden hour');

  const horizonY = height * 0.52;

  // 1. Base Atmospheric Sky Gradient (Zenith -> Horizon)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);

  if (isCyberpunk) {
    skyGrad.addColorStop(0, '#05021a');
    skyGrad.addColorStop(0.4, '#180a3a');
    skyGrad.addColorStop(0.75, '#2e1065');
    skyGrad.addColorStop(1, '#06b6d4');
  } else if (isSpace) {
    skyGrad.addColorStop(0, '#02000d');
    skyGrad.addColorStop(0.5, '#0b001a');
    skyGrad.addColorStop(0.85, '#1e0038');
    skyGrad.addColorStop(1, '#3b0764');
  } else if (isVaporwave) {
    skyGrad.addColorStop(0, '#090022');
    skyGrad.addColorStop(0.5, '#3b0764');
    skyGrad.addColorStop(0.8, '#c026d3');
    skyGrad.addColorStop(1, '#fb7185');
  } else if (isSunset) {
    skyGrad.addColorStop(0, '#1e1b4b');
    skyGrad.addColorStop(0.35, '#431407');
    skyGrad.addColorStop(0.7, '#c2410c');
    skyGrad.addColorStop(1, '#fde047');
  } else if (isAnime) {
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.45, '#38bdf8');
    skyGrad.addColorStop(0.8, '#bae6fd');
    skyGrad.addColorStop(1, '#fed7aa');
  } else if (isInterior) {
    skyGrad.addColorStop(0, '#1c1917');
    skyGrad.addColorStop(0.4, '#292524');
    skyGrad.addColorStop(0.85, '#44403c');
    skyGrad.addColorStop(1, '#a8a29e');
  } else {
    // Painterly / Realistic
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.4, '#1e293b');
    skyGrad.addColorStop(0.8, '#334155');
    skyGrad.addColorStop(1, '#cbd5e1');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY);

  // 2. Ground / Nadir Gradient (Horizon -> Nadir)
  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);

  if (isCyberpunk) {
    groundGrad.addColorStop(0, '#0f172a');
    groundGrad.addColorStop(0.4, '#090d16');
    groundGrad.addColorStop(1, '#020617');
  } else if (isSpace) {
    groundGrad.addColorStop(0, '#2e1065');
    groundGrad.addColorStop(0.6, '#0f051d');
    groundGrad.addColorStop(1, '#02000a');
  } else if (isVaporwave) {
    groundGrad.addColorStop(0, '#1e1b4b');
    groundGrad.addColorStop(0.4, '#0f172a');
    groundGrad.addColorStop(1, '#020617');
  } else if (isInterior) {
    groundGrad.addColorStop(0, '#292524');
    groundGrad.addColorStop(0.5, '#1c1917');
    groundGrad.addColorStop(1, '#0c0a09');
  } else if (isAnime || isFantasy) {
    groundGrad.addColorStop(0, '#047857');
    groundGrad.addColorStop(0.35, '#065f46');
    groundGrad.addColorStop(1, '#022c22');
  } else {
    groundGrad.addColorStop(0, '#334155');
    groundGrad.addColorStop(0.5, '#1e293b');
    groundGrad.addColorStop(1, '#090d16');
  }

  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  // 3. Stars and Cosmic Dust in Sky
  if (isSpace || isCyberpunk || isVaporwave || !isAnime) {
    const starCount = isSpace ? 800 : 350;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < starCount; i++) {
      const sx = rnd() * width;
      // Exponentially concentrate stars higher up away from horizon
      const sy = rnd() * (horizonY * 0.85);
      const radius = Math.max(0.5, rnd() < 0.9 ? rnd() * 1.5 + 0.5 : rnd() * 2.5 + 1.5);
      const alpha = Math.max(0.1, rnd() * 0.8 + 0.2);

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSpace && rnd() > 0.6 ? (rnd() > 0.5 ? 'rgba(168, 85, 247, 0.8)' : 'rgba(56, 189, 248, 0.8)') : `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
  }

  // 4. Cosmic Nebula / Auroras (Seamless periodic across X)
  if (isSpace || isFantasy || isVaporwave) {
    const nebulaGlow = ctx.createRadialGradient(width * 0.35, horizonY * 0.4, 20, width * 0.35, horizonY * 0.4, width * 0.35);
    nebulaGlow.addColorStop(0, isVaporwave ? 'rgba(236, 72, 153, 0.45)' : 'rgba(168, 85, 247, 0.45)');
    nebulaGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
    nebulaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGlow;
    ctx.fillRect(0, 0, width, horizonY);

    // Second nebula cluster near opposite horizon for 360 balance
    const nebulaGlow2 = ctx.createRadialGradient(width * 0.85, horizonY * 0.45, 10, width * 0.85, horizonY * 0.45, width * 0.25);
    nebulaGlow2.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    nebulaGlow2.addColorStop(0.6, 'rgba(147, 51, 234, 0.2)');
    nebulaGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGlow2;
    ctx.fillRect(0, 0, width, horizonY);
  }

  // 5. Celestial Bodies (Sun, Moons, or Ringed Planet)
  const sunX = width * 0.42;
  const sunY = horizonY * 0.55;

  if (isVaporwave) {
    // Classic giant Synthwave segmented Sun
    const sunRadius = 140;
    const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#f43f5e');
    sunGrad.addColorStop(1, '#9333ea');

    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Segmented horizontal cut lines
    ctx.strokeStyle = '#090022';
    ctx.lineWidth = 6;
    for (let lineY = sunY - 10; lineY < sunY + sunRadius; lineY += 16) {
      ctx.beginPath();
      ctx.moveTo(sunX - sunRadius, lineY);
      ctx.lineTo(sunX + sunRadius, lineY);
      ctx.stroke();
    }
    ctx.restore();
  } else if (isSpace) {
    // Large Ringed Gas Giant
    const planetX = width * 0.72;
    const planetY = horizonY * 0.38;
    const planetR = 90;

    const pGrad = ctx.createRadialGradient(planetX - 30, planetY - 30, 10, planetX, planetY, planetR);
    pGrad.addColorStop(0, '#fed7aa');
    pGrad.addColorStop(0.5, '#ea580c');
    pGrad.addColorStop(0.9, '#431407');
    pGrad.addColorStop(1, '#1c1917');

    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fillStyle = pGrad;
    ctx.fill();

    // Ring
    ctx.save();
    ctx.translate(planetX, planetY);
    ctx.rotate(-0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, planetR * 2.2, planetR * 0.45, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(253, 186, 116, 0.65)';
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.restore();
  } else {
    // Warm Sun or Ethereal Moon
    const sunRadius = isSunset ? 90 : 65;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius * 4);
    sunGlow.addColorStop(0, isFantasy ? 'rgba(224, 231, 255, 0.95)' : 'rgba(254, 240, 138, 0.95)');
    sunGlow.addColorStop(0.2, isFantasy ? 'rgba(165, 180, 252, 0.5)' : 'rgba(251, 146, 60, 0.45)');
    sunGlow.addColorStop(0.6, isFantasy ? 'rgba(99, 102, 241, 0.15)' : 'rgba(244, 63, 94, 0.12)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Seamless Horizon Panorama (Distant Silhouettes: Mountains or Cyberpunk Megacity)
  ctx.save();
  const step = 4;
  const numSteps = Math.ceil(width / step);

  if (isCyberpunk) {
    // 360 Cyberpunk City Skyline
    const buildingWidth = 32;
    const numBuildings = Math.ceil(width / buildingWidth);

    // Layer 1: Distant dark towers with neon windows
    for (let b = 0; b <= numBuildings; b++) {
      const bx = b * buildingWidth;
      // Periodic hash so left and right edges match seamlessly
      const bAngle = (bx / width) * Math.PI * 2;
      const bHeight = 80 + Math.abs(Math.sin(bAngle * 5) * 160 + Math.cos(bAngle * 3) * 110);
      const by = horizonY - bHeight;

      // Dark metallic tower
      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx, by, buildingWidth - 2, bHeight + 40);

      // Neon roof beacons
      ctx.fillStyle = Math.sin(bAngle * 7) > 0 ? '#06b6d4' : '#ec4899';
      ctx.fillRect(bx + 4, by, 4, 4);

      // Window strips
      ctx.fillStyle = Math.sin(bAngle * 11) > 0 ? 'rgba(6, 182, 212, 0.7)' : 'rgba(253, 224, 71, 0.6)';
      for (let wy = by + 20; wy < horizonY; wy += 14) {
        if (Math.sin(wy + bAngle * 20) > 0.1) {
          ctx.fillRect(bx + 4, wy, buildingWidth - 10, 3);
        }
      }
    }
  } else if (isInterior) {
    // Architectural Floor-to-Ceiling Panoramic Window Mullions (360)
    const mullionSpacing = width / 8;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 18;
    for (let x = 0; x <= width; x += mullionSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Cross beams
    ctx.beginPath();
    ctx.moveTo(0, height * 0.15);
    ctx.lineTo(width, height * 0.15);
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.stroke();
  } else {
    // Mountains / Landscape Silhouettes (360 Seamless Wrap using periodic sines)
    // Layer 1: Distant mountains
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let i = 0; i <= numSteps; i++) {
      const x = i * step;
      const theta = (x / width) * Math.PI * 2;
      const elevation =
        Math.sin(theta * 3) * 70 +
        Math.cos(theta * 6) * 35 +
        Math.sin(theta * 12) * 18;
      const y = horizonY - 40 - Math.max(0, elevation);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizonY);
    ctx.closePath();
    ctx.fillStyle = isAnime ? '#7dd3fc' : isFantasy ? '#312e81' : '#1e293b';
    ctx.fill();

    // Layer 2: Midground closer mountains / hills
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let i = 0; i <= numSteps; i++) {
      const x = i * step;
      const theta = (x / width) * Math.PI * 2;
      const elevation =
        Math.sin(theta * 4 + 1.2) * 45 +
        Math.cos(theta * 8) * 22;
      const y = horizonY - 15 - Math.max(0, elevation);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizonY);
    ctx.closePath();
    ctx.fillStyle = isAnime ? '#0284c7' : isFantasy ? '#1e1b4b' : '#0f172a';
    ctx.fill();
  }
  ctx.restore();

  // 7. Ground Detail / Reflections / Perspective Grid
  if (isVaporwave) {
    // 360 Synthwave Perspective Grid
    ctx.save();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;

    // Horizontal receding lines
    for (let gy = horizonY; gy < height; gy += 18) {
      const distRatio = (gy - horizonY) / (height - horizonY);
      const alpha = Math.min(1, distRatio * 1.4);
      ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Vertical radial perspective lines
    const gridCols = 32;
    for (let c = 0; c < gridCols; c++) {
      const gx = (c / gridCols) * width;
      ctx.beginPath();
      ctx.moveTo(gx, horizonY);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    ctx.restore();
  } else if (isCyberpunk) {
    // Wet road reflection highlights
    ctx.save();
    const wetGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    wetGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    wetGrad.addColorStop(0.3, 'rgba(236, 72, 153, 0.25)');
    wetGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = wetGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);
    ctx.restore();
  }

  // 8. Generate Crisp Thumbnail Data URL and Main Texture
  const textureUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Generate smaller 400x200 thumbnail
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 400;
  thumbCanvas.height = 200;
  const tCtx = thumbCanvas.getContext('2d');
  if (tCtx) {
    tCtx.drawImage(canvas, 0, 0, 400, 200);
  }
  const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);

  return { textureUrl, thumbnailUrl };
}
