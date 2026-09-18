/**
 * Utility to project 2:1 Equirectangular 360 panorama onto a 6-sided cube map.
 * Faces: POS_X (Right), NEG_X (Left), POS_Y (Top), NEG_Y (Bottom), POS_Z (Front), NEG_Z (Back)
 */

export interface CubeFace {
  name: 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back';
  dataUrl: string;
}

export function exportEquirectangularImage(dataUrl: string, filename: string = 'esdzign-panorama.jpg') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateDepthMap(equirectUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      if (!equirectUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 1024;
          canvas.height = img.height || 512;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('');
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imgData.data;

          // Convert RGB to depth representation (luminance + spherical distance gradient)
          for (let y = 0; y < canvas.height; y++) {
            const v = y / canvas.height; // 0 (zenith/sky) to 1 (nadir/ground)

            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              // Depth calculation: Sky = white/far (255), Ground close = black/near (0)
              let depthVal = 255 - Math.min(255, Math.max(0, Math.floor(v * 180 + (255 - lum) * 0.3)));
              if (v < 0.45) {
                depthVal = Math.min(255, depthVal + 40); // Far distance for sky
              }

              pixels[idx] = depthVal;
              pixels[idx + 1] = depthVal;
              pixels[idx + 2] = depthVal;
              pixels[idx + 3] = 255;
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = equirectUrl;
    } catch (e) {
      resolve('');
    }
  });
}

// Convert 3D vector to equirectangular UV coordinates
function outVectorToEquirectUV(x: number, y: number, z: number): [number, number] {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.atan2(z, x); // -PI to PI
  const phi = Math.asin(Math.max(-1, Math.min(1, y / r))); // -PI/2 to PI/2

  // Map to 0..1
  let u = (theta + Math.PI) / (2 * Math.PI);
  let v = (phi + Math.PI * 0.5) / Math.PI;

  // Invert v because image y is top-down
  v = 1.0 - v;
  return [u, v];
}

export async function generateCubemapFaces(equirectUrl: string, faceSize: number = 512): Promise<CubeFace[]> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      if (!equirectUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = img.width || 1024;
          srcCanvas.height = img.height || 512;
          const srcCtx = srcCanvas.getContext('2d');
          if (!srcCtx) {
            resolve([]);
            return;
          }
          srcCtx.drawImage(img, 0, 0);
          const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
          const srcPixels = srcData.data;

          const facesConfig: { name: CubeFace['name']; transform: (u: number, v: number) => [number, number, number] }[] = [
            {
              name: 'right', // +X
              transform: (u, v) => [1, -(v * 2 - 1), -(u * 2 - 1)],
            },
            {
              name: 'left', // -X
              transform: (u, v) => [-1, -(v * 2 - 1), u * 2 - 1],
            },
            {
              name: 'top', // +Y
              transform: (u, v) => [u * 2 - 1, 1, v * 2 - 1],
            },
            {
              name: 'bottom', // -Y
              transform: (u, v) => [u * 2 - 1, -1, -(v * 2 - 1)],
            },
            {
              name: 'front', // +Z
              transform: (u, v) => [u * 2 - 1, -(v * 2 - 1), 1],
            },
            {
              name: 'back', // -Z
              transform: (u, v) => [-(u * 2 - 1), -(v * 2 - 1), -1],
            },
          ];

          const outputFaces: CubeFace[] = [];

          facesConfig.forEach((face) => {
            const faceCanvas = document.createElement('canvas');
            faceCanvas.width = faceSize;
            faceCanvas.height = faceSize;
            const faceCtx = faceCanvas.getContext('2d');
            if (!faceCtx) return;

            const faceData = faceCtx.createImageData(faceSize, faceSize);
            const facePixels = faceData.data;

            for (let y = 0; y < faceSize; y++) {
              const v = y / (faceSize - 1);
              for (let x = 0; x < faceSize; x++) {
                const u = x / (faceSize - 1);

                const [vecX, vecY, vecZ] = face.transform(u, v);
                const [eqU, eqV] = outVectorToEquirectUV(vecX, vecY, vecZ);

                const srcX = Math.floor(Math.max(0, Math.min(srcCanvas.width - 1, eqU * srcCanvas.width)));
                const srcY = Math.floor(Math.max(0, Math.min(srcCanvas.height - 1, eqV * srcCanvas.height)));

                const srcIdx = (srcY * srcCanvas.width + srcX) * 4;
                const dstIdx = (y * faceSize + x) * 4;

                facePixels[dstIdx] = srcPixels[srcIdx];
                facePixels[dstIdx + 1] = srcPixels[srcIdx + 1];
                facePixels[dstIdx + 2] = srcPixels[srcIdx + 2];
                facePixels[dstIdx + 3] = 255;
              }
            }

            faceCtx.putImageData(faceData, 0, 0);
            outputFaces.push({
              name: face.name,
              dataUrl: faceCanvas.toDataURL('image/jpeg', 0.92),
            });
          });

          resolve(outputFaces);
        } catch (err) {
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = equirectUrl;
    } catch {
      resolve([]);
    }
  });
}
