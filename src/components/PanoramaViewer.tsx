import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ViewerSettings, WorldLighting } from '../types';

interface PanoramaViewerProps {
  textureUrl: string;
  lighting?: WorldLighting;
  settings: ViewerSettings;
  onOrientationChange?: (yaw: number, pitch: number, fov: number) => void;
  isGenerating?: boolean;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  textureUrl,
  lighting,
  settings,
  onOrientationChange,
  isGenerating = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Fallback 2D mode if WebGL fails
  const [useFallback2D, setUseFallback2D] = useState(false);

  // Rotation & interaction state refs for 60fps animation loop
  const isUserInteracting = useRef(false);
  const onPointerDownPointerX = useRef(0);
  const onPointerDownPointerY = useRef(0);
  const onPointerDownLon = useRef(0);
  const onPointerDownLat = useRef(0);
  const lon = useRef(0);
  const lat = useRef(0);
  const targetLon = useRef(0);
  const targetLat = useRef(0);
  const targetFov = useRef(settings.fov);
  const autoRotateSpeed = useRef(settings.rotateSpeed || 0.15);

  const [loadingTexture, setLoadingTexture] = useState(true);

  // Setup Three.js Scene with resilient WebGL fallback
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let geometry: THREE.SphereGeometry | null = null;
    let material: THREE.MeshBasicMaterial | null = null;
    let wireframeGeo: THREE.WireframeGeometry | null = null;
    let wireframeMat: THREE.LineBasicMaterial | null = null;
    let animationFrameId: number;

    try {
      // 1. Scene
      scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      camera = new THREE.PerspectiveCamera(settings.fov, width / height, 0.1, 1100);
      cameraRef.current = camera;

      // 3. Renderer with error safety
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = settings.exposure || 1.0;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. Lights
      const ambient = new THREE.AmbientLight(0xffffff, lighting?.ambientIntensity || 0.9);
      scene.add(ambient);
      ambientLightRef.current = ambient;

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
      dirLight.position.set(100, 100, 100);
      scene.add(dirLight);
      lightRef.current = dirLight;

      // 5. Inverted Sphere for 360 Panorama
      geometry = new THREE.SphereGeometry(500, 64, 32);
      geometry.scale(-1, 1, 1);

      material = new THREE.MeshBasicMaterial({
        color: 0x111111,
        side: THREE.FrontSide,
      });

      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      sphereMeshRef.current = sphere;

      // 6. Spherical Wireframe / Polar Grid Helper
      const gridGroup = new THREE.Group();
      wireframeGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(498, 36, 18));
      wireframeMat = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.15,
      });
      const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
      gridGroup.add(wireframeMesh);
      gridGroup.visible = settings.showGrid;
      scene.add(gridGroup);
      gridHelperRef.current = gridGroup;

      // 7. Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (!renderer || !scene || !camera) return;

        // Auto rotation when not dragging
        if (settings.autoRotate && !isUserInteracting.current) {
          targetLon.current += autoRotateSpeed.current;
        }

        // Smooth camera interpolation
        lon.current += (targetLon.current - lon.current) * 0.12;
        lat.current += (targetLat.current - lat.current) * 0.12;
        lat.current = Math.max(-85, Math.min(85, lat.current));

        const phi = THREE.MathUtils.degToRad(90 - lat.current);
        const theta = THREE.MathUtils.degToRad(lon.current);

        cameraTarget.current.x = 500 * Math.sin(phi) * Math.cos(theta);
        cameraTarget.current.y = 500 * Math.cos(phi);
        cameraTarget.current.z = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(cameraTarget.current);

        if (Math.abs(camera.fov - targetFov.current) > 0.05) {
          camera.fov += (targetFov.current - camera.fov) * 0.15;
          camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        if (onOrientationChange) {
          const normalizedYaw = ((lon.current % 360) + 360) % 360;
          onOrientationChange(normalizedYaw, lat.current, camera.fov);
        }
      };

      animate();
    } catch (webglErr) {
      console.warn('WebGL initialization failed, switching to 2D canvas fallback:', webglErr);
      setUseFallback2D(true);
    }

    // 8. Resize Observer with requestAnimationFrame guard
    let resizeRaf: number;
    const resizeObserver = new ResizeObserver((entries) => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && camera && renderer) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        }
      });
    });

    try {
      resizeObserver.observe(container);
    } catch {
      // ignore
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(resizeRaf);
      try {
        resizeObserver.disconnect();
      } catch {
        // ignore
      }
      if (renderer) {
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        try {
          renderer.dispose();
        } catch {
          // ignore
        }
      }
      geometry?.dispose();
      material?.dispose();
      wireframeGeo?.dispose();
      wireframeMat?.dispose();
    };
  }, []);

  // Update Texture whenever textureUrl changes
  useEffect(() => {
    if (!textureUrl) return;

    if (!sphereMeshRef.current) {
      setLoadingTexture(false);
      return;
    }

    setLoadingTexture(true);
    try {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        textureUrl,
        (tex) => {
          tex.mapping = THREE.EquirectangularReflectionMapping;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.colorSpace = THREE.SRGBColorSpace;

          if (sphereMeshRef.current) {
            const oldMat = sphereMeshRef.current.material as THREE.MeshBasicMaterial;
            if (oldMat && oldMat.map) {
              try {
                oldMat.map.dispose();
              } catch {
                // ignore
              }
            }

            sphereMeshRef.current.material = new THREE.MeshBasicMaterial({
              map: tex,
              side: THREE.FrontSide,
            });
          }
          setLoadingTexture(false);
        },
        undefined,
        (err) => {
          console.warn('Texture load warning:', err);
          setLoadingTexture(false);
        }
      );
    } catch (e) {
      console.warn('Texture loader exception:', e);
      setLoadingTexture(false);
    }
  }, [textureUrl]);

  // Update Settings
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = settings.showGrid;
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = settings.exposure;
    }
    targetFov.current = settings.fov;
    autoRotateSpeed.current = settings.rotateSpeed;
  }, [settings]);

  // Pointer Drag Handlers with try/catch
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isUserInteracting.current = true;
      onPointerDownPointerX.current = e.clientX;
      onPointerDownPointerY.current = e.clientY;
      onPointerDownLon.current = targetLon.current;
      onPointerDownLat.current = targetLat.current;
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore in iframe environments
      }
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isUserInteracting.current) return;
      const multiplier = (cameraRef.current ? cameraRef.current.fov / 75 : 1) * (settings.invertDrag ? -1 : 1);
      targetLon.current = (onPointerDownPointerX.current - e.clientX) * 0.16 * multiplier + onPointerDownLon.current;
      targetLat.current = (e.clientY - onPointerDownPointerY.current) * 0.16 * multiplier + onPointerDownLat.current;
    },
    [settings.invertDrag]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isUserInteracting.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  // Wheel Zoom (FoV)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    targetFov.current = Math.max(35, Math.min(95, targetFov.current + zoomDelta));
  }, []);

  return (
    <div
      id="skybox-360-canvas-container"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
    >
      {/* 2D Fallback if WebGL unsupported in container */}
      {useFallback2D && textureUrl && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
          <img
            src={textureUrl}
            alt="360 Panorama"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Loading Overlay */}
      {loadingTexture && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition-opacity pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-mono tracking-wider text-zinc-300">STREAMING 360° TEXTURE</span>
          </div>
        </div>
      )}

      {/* Generating Hologram Pulse Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
          <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-pulse">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white tracking-wide">Synthesizing 360° ESDzign...</p>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Calculating equirectangular coordinates & atmospheric lighting</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
