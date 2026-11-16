/**
 * 3D Volume Rendering & Multi-Planar Reconstruction (MPR) Graphics Engine
 * Computes isotropic Axial, Coronal, Sagittal slices and Ray-Casted Shaded Volume Rendering (SVR/SSD).
 */

export function getVoxelValue(validSlices, numSlices, cols, rows, x, y, zFloat) {
  if (numSlices <= 0 || !validSlices) return 0;
  const clampedX = Math.max(0, Math.min(cols - 1, x));
  const clampedY = Math.max(0, Math.min(rows - 1, y));
  const clampedZ = Math.max(0, Math.min(numSlices - 1, zFloat));

  const z0 = Math.floor(clampedZ);
  const z1 = Math.min(numSlices - 1, z0 + 1);
  const t = clampedZ - z0;

  const slice0 = validSlices[z0]?.rawPixels;
  const slice1 = validSlices[z1]?.rawPixels;
  if (!slice0) return 0;

  const idx = Math.floor(clampedY) * cols + Math.floor(clampedX);
  const px0 = slice0[idx] || 0;
  if (t === 0 || !slice1) return px0;

  const px1 = slice1[idx] || 0;
  return (1 - t) * px0 + t * px1;
}

export function renderAxialCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, renderRes = 320) {
  if (!canvas || numSlices === 0 || !validSlices) return;
  const ctx = canvas.getContext('2d');
  const zIdx = Math.max(0, Math.min(crosshair.z, numSlices - 1));
  const slice = validSlices[zIdx];
  if (!slice) return;

  canvas.width = renderRes;
  canvas.height = renderRes;
  const imgData = ctx.createImageData(renderRes, renderRes);
  const pixels = slice.rawPixels;

  for (let sy = 0; sy < renderRes; sy++) {
    const srcY = Math.floor((sy / renderRes) * rows);
    for (let sx = 0; sx < renderRes; sx++) {
      const srcX = Math.floor((sx / renderRes) * cols);
      const val = Math.min(255, Math.max(0, pixels[srcY * cols + srcX] || 0));
      const outIdx = (sy * renderRes + sx) * 4;
      imgData.data[outIdx] = val;
      imgData.data[outIdx + 1] = val;
      imgData.data[outIdx + 2] = val;
      imgData.data[outIdx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Crosshairs
  const screenX = (crosshair.x / cols) * renderRes;
  const screenY = (crosshair.y / rows) * renderRes;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(screenX, 0);
  ctx.lineTo(screenX, renderRes);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, screenY);
  ctx.lineTo(renderRes, screenY);
  ctx.stroke();

  // Anatomical Markers: A (Top), P (Bottom), R (Left), L (Right)
  ctx.setLineDash([]);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('A', renderRes / 2 - 4, 16);
  ctx.fillText('P', renderRes / 2 - 4, renderRes - 6);
  ctx.fillText('R', 6, renderRes / 2 + 4);
  ctx.fillText('L', renderRes - 16, renderRes / 2 + 4);
}

export function renderCoronalCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, renderRes = 320) {
  if (!canvas || numSlices === 0 || !validSlices) return;
  const ctx = canvas.getContext('2d');
  canvas.width = renderRes;
  canvas.height = renderRes;
  const imgData = ctx.createImageData(renderRes, renderRes);
  const targetY = Math.max(0, Math.min(crosshair.y, rows - 1));

  for (let sz = 0; sz < renderRes; sz++) {
    const zNorm = sz / renderRes;
    const zFloat = zNorm * (numSlices - 1);
    for (let sx = 0; sx < renderRes; sx++) {
      const srcX = Math.floor((sx / renderRes) * cols);
      const val = Math.min(255, Math.max(0, getVoxelValue(validSlices, numSlices, cols, rows, srcX, targetY, zFloat)));
      const outIdx = (sz * renderRes + sx) * 4;
      imgData.data[outIdx] = val;
      imgData.data[outIdx + 1] = val;
      imgData.data[outIdx + 2] = val;
      imgData.data[outIdx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Crosshairs
  const screenX = (crosshair.x / cols) * renderRes;
  const screenZ = (crosshair.z / Math.max(1, numSlices - 1)) * renderRes;
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(screenX, 0);
  ctx.lineTo(screenX, renderRes);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, screenZ);
  ctx.lineTo(renderRes, screenZ);
  ctx.stroke();

  // Markers: S (Top), I (Bottom), R (Left), L (Right)
  ctx.setLineDash([]);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('S', renderRes / 2 - 4, 16);
  ctx.fillText('I', renderRes / 2 - 4, renderRes - 6);
  ctx.fillText('R', 6, renderRes / 2 + 4);
  ctx.fillText('L', renderRes - 16, renderRes / 2 + 4);
}

export function renderSagittalCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, renderRes = 320) {
  if (!canvas || numSlices === 0 || !validSlices) return;
  const ctx = canvas.getContext('2d');
  canvas.width = renderRes;
  canvas.height = renderRes;
  const imgData = ctx.createImageData(renderRes, renderRes);
  const targetX = Math.max(0, Math.min(crosshair.x, cols - 1));

  for (let sz = 0; sz < renderRes; sz++) {
    const zNorm = sz / renderRes;
    const zFloat = zNorm * (numSlices - 1);
    for (let sy = 0; sy < renderRes; sy++) {
      const srcY = Math.floor((sy / renderRes) * rows);
      const val = Math.min(255, Math.max(0, getVoxelValue(validSlices, numSlices, cols, rows, targetX, srcY, zFloat)));
      const outIdx = (sz * renderRes + sy) * 4;
      imgData.data[outIdx] = val;
      imgData.data[outIdx + 1] = val;
      imgData.data[outIdx + 2] = val;
      imgData.data[outIdx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Crosshairs
  const screenY = (crosshair.y / rows) * renderRes;
  const screenZ = (crosshair.z / Math.max(1, numSlices - 1)) * renderRes;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(screenY, 0);
  ctx.lineTo(screenY, renderRes);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, screenZ);
  ctx.lineTo(renderRes, screenZ);
  ctx.stroke();

  // Markers: S (Top), I (Bottom), A (Left), P (Right)
  ctx.setLineDash([]);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('S', renderRes / 2 - 4, 16);
  ctx.fillText('I', renderRes / 2 - 4, renderRes - 6);
  ctx.fillText('A', 6, renderRes / 2 + 4);
  ctx.fillText('P', renderRes - 16, renderRes / 2 + 4);
}

/**
 * 3D Iso-Surface Ray-Casting & Shaded Surface Display Engine (SVR/SSD)
 * Eliminates slice gaps and contour artifacts via trilinear volumetric ray marching.
 */
export function renderVolume3DCanvas(
  canvas,
  validSlices,
  rot3D,
  threshold3D,
  colorMode3D,
  cols,
  rows,
  numSlices,
  renderRes = 300,
  isFastDrag = false
) {
  if (!canvas || numSlices === 0 || !validSlices) return;
  const ctx = canvas.getContext('2d');

  const actualRes = isFastDrag ? 150 : Math.min(renderRes, 300);
  canvas.width = actualRes;
  canvas.height = actualRes;

  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, actualRes, actualRes);

  const imgData = ctx.createImageData(actualRes, actualRes);

  const radY = (rot3D.angleY * Math.PI) / 180;
  const radX = (rot3D.angleX * Math.PI) / 180;
  const cosY = Math.cos(radY), sinY = Math.sin(radY);
  const cosX = Math.cos(radX), sinX = Math.sin(radX);

  // Camera Ray Direction in World Space
  const rdx = sinY * cosX;
  const rdy = -sinX;
  const rdz = cosY * cosX;

  // Proportional Z physical aspect ratio (defaults to isotropic head/body volume)
  const aspectZ = Math.min(1.4, Math.max(0.65, (numSlices * 4.8) / rows));

  // Ray-AABB Bounding Box [-1, 1] x [-1, 1] x [-aspectZ, aspectZ]
  const invRdx = 1 / (Math.abs(rdx) < 1e-6 ? 1e-6 : rdx);
  const invRdy = 1 / (Math.abs(rdy) < 1e-6 ? 1e-6 : rdy);
  const invRdz = 1 / (Math.abs(rdz) < 1e-6 ? 1e-6 : rdz);

  // Light Direction: Upper-Right-Front (World Space)
  const lx = 0.55, ly = -0.55, lz = 0.62;
  const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1;
  const nlx = lx / lLen, nly = ly / lLen, nlz = lz / lLen;

  const isMIP = colorMode3D === 'bone' || colorMode3D === 'grayscale' || colorMode3D === 'rainbow';
  const rayStep = isFastDrag ? 0.032 : 0.016;

  for (let py = 0; py < actualRes; py++) {
    const v = (py / actualRes - 0.5) * 2;
    for (let px = 0; px < actualRes; px++) {
      const u = (px / actualRes - 0.5) * 2;

      // Ray Origin in World Space
      const ox = u * cosY - v * sinX * sinY - rdx * 1.6;
      const oy = v * cosX - rdy * 1.6;
      const oz = u * sinY + v * sinX * cosY - rdz * 1.6;

      // Ray-AABB intersection
      const t1 = (-1 - ox) * invRdx, t2 = (1 - ox) * invRdx;
      const t3 = (-1 - oy) * invRdy, t4 = (1 - oy) * invRdy;
      const t5 = (-aspectZ - oz) * invRdz, t6 = (aspectZ - oz) * invRdz;

      const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4), Math.min(t5, t6));
      const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4), Math.max(t5, t6));

      if (tmax <= tmin || tmax <= 0) continue;

      let t = Math.max(0, tmin);
      const tend = tmax;
      const pixelIdx = (py * actualRes + px) * 4;
      let maxMIPVal = 0;

      while (t < tend) {
        const wx = ox + t * rdx;
        const wy = oy + t * rdy;
        const wz = oz + t * rdz;
        t += rayStep;

        const vx = ((wx + 1) * 0.5) * (cols - 1);
        const vy = ((wy + 1) * 0.5) * (rows - 1);
        const vz = ((wz / aspectZ + 1) * 0.5) * (numSlices - 1);

        const val = getVoxelValue(validSlices, numSlices, cols, rows, vx, vy, vz);

        if (isMIP) {
          if (val > maxMIPVal && val >= threshold3D) {
            maxMIPVal = val;
          }
        } else if (val >= threshold3D) {
          // HIT SURFACE: Compute gradient normal
          const deltaX = 1.2;
          const deltaY = 1.2;
          const deltaZ = 0.8;

          const gx = getVoxelValue(validSlices, numSlices, cols, rows, vx + deltaX, vy, vz) -
                     getVoxelValue(validSlices, numSlices, cols, rows, vx - deltaX, vy, vz);
          const gy = getVoxelValue(validSlices, numSlices, cols, rows, vx, vy + deltaY, vz) -
                     getVoxelValue(validSlices, numSlices, cols, rows, vx - deltaY, vz);
          const gz = (getVoxelValue(validSlices, numSlices, cols, rows, vx, vy, vz + deltaZ) -
                      getVoxelValue(validSlices, numSlices, cols, rows, vx, vy, vz - deltaZ)) / aspectZ;

          const gLen = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
          const nx = -gx / gLen;
          const ny = -gy / gLen;
          const nz = -gz / gLen;

          // Phong lighting
          const dot = Math.max(0, nx * nlx + ny * nly + nz * nlz);
          const diffuse = dot;
          // Halfway specular
          const hx = nlx - rdx, hy = nly - rdy, hz = nlz - rdz;
          const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
          const specDot = Math.max(0, nx * (hx / hLen) + ny * (hy / hLen) + nz * (hz / hLen));
          const specular = Math.pow(specDot, 14) * 0.42;

          const shade = Math.min(1.4, 0.28 + 0.72 * diffuse + specular);

          if (colorMode3D === 'bone_shaded') {
            // Ivory Bone Tone (Matching Clinical CT PACS reference)
            imgData.data[pixelIdx] = Math.min(255, Math.floor((val * 0.95 + 65) * shade * 1.05));
            imgData.data[pixelIdx + 1] = Math.min(255, Math.floor((val * 0.85 + 48) * shade * 0.96));
            imgData.data[pixelIdx + 2] = Math.min(255, Math.floor((val * 0.65 + 32) * shade * 0.82));
          } else if (colorMode3D === 'vascular') {
            imgData.data[pixelIdx] = Math.min(255, Math.floor((val * 1.25 + 50) * shade * 1.1));
            imgData.data[pixelIdx + 1] = Math.min(255, Math.floor((val * 0.42) * shade));
            imgData.data[pixelIdx + 2] = Math.min(255, Math.floor((val * 0.2) * shade));
          } else {
            // Soft tissue / Skin
            imgData.data[pixelIdx] = Math.min(255, Math.floor((val * 1.05 + 55) * shade * 1.0));
            imgData.data[pixelIdx + 1] = Math.min(255, Math.floor((val * 0.72 + 35) * shade * 0.85));
            imgData.data[pixelIdx + 2] = Math.min(255, Math.floor((val * 0.6 + 25) * shade * 0.75));
          }
          imgData.data[pixelIdx + 3] = 255;
          break;
        }
      }

      if (isMIP && maxMIPVal > 0) {
        if (colorMode3D === 'bone') {
          imgData.data[pixelIdx] = Math.min(255, maxMIPVal * 1.15);
          imgData.data[pixelIdx + 1] = Math.min(255, maxMIPVal * 0.88);
          imgData.data[pixelIdx + 2] = Math.min(255, maxMIPVal * 0.58);
        } else if (colorMode3D === 'rainbow') {
          const norm = maxMIPVal / 255;
          imgData.data[pixelIdx] = Math.min(255, Math.floor(Math.sin(norm * Math.PI) * 255));
          imgData.data[pixelIdx + 1] = Math.min(255, Math.floor(Math.sin((norm + 0.33) * Math.PI) * 255));
          imgData.data[pixelIdx + 2] = Math.min(255, Math.floor(Math.sin((norm + 0.66) * Math.PI) * 255));
        } else {
          imgData.data[pixelIdx] = maxMIPVal;
          imgData.data[pixelIdx + 1] = maxMIPVal;
          imgData.data[pixelIdx + 2] = maxMIPVal;
        }
        imgData.data[pixelIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Anatomical Cues: RA (Right-Anterior), LP (Left-Posterior), S (Superior), I (Inferior)
  ctx.font = 'italic bold 13px serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('S', actualRes / 2 - 4, 18);
  ctx.fillText('I', actualRes / 2 - 4, actualRes - 8);
  ctx.fillText('RA', 12, actualRes / 2 + 4);
  ctx.fillText('LP', actualRes - 30, actualRes / 2 + 4);
}
