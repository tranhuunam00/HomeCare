/**
 * 3D Volume Rendering & Multi-Planar Reconstruction (MPR) Graphics Engine
 * Computes isotropic Axial, Coronal, Sagittal slices and Shaded Volume Rendering (SVR/SSD).
 */

export function getVoxelValue(validSlices, numSlices, cols, x, y, zFloat) {
  if (numSlices <= 0) return 0;
  const clampedZ = Math.max(0, Math.min(numSlices - 1, zFloat));
  const z0 = Math.floor(clampedZ);
  const z1 = Math.min(numSlices - 1, z0 + 1);
  const t = clampedZ - z0;

  const slice0 = validSlices[z0]?.rawPixels;
  const slice1 = validSlices[z1]?.rawPixels;
  if (!slice0) return 0;

  const px0 = slice0[y * cols + x] || 0;
  if (t === 0 || !slice1) return px0;

  const px1 = slice1[y * cols + x] || 0;
  return (1 - t) * px0 + t * px1;
}

export function renderAxialCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, renderRes = 320) {
  if (!canvas || numSlices === 0) return;
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
}

export function renderCoronalCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, renderRes = 320) {
  if (!canvas || numSlices === 0) return;
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
      const val = Math.min(255, Math.max(0, getVoxelValue(validSlices, numSlices, cols, srcX, targetY, zFloat)));
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
}

export function renderSagittalCanvas(canvas, validSlices, crosshair, cols, rows, numSlices, renderRes = 320) {
  if (!canvas || numSlices === 0) return;
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
      const val = Math.min(255, Math.max(0, getVoxelValue(validSlices, numSlices, cols, targetX, srcY, zFloat)));
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
}

export function renderVolume3DCanvas(
  canvas,
  validSlices,
  rot3D,
  threshold3D,
  colorMode3D,
  cols,
  rows,
  numSlices,
  renderRes = 320
) {
  if (!canvas || numSlices === 0) return;
  const ctx = canvas.getContext('2d');
  canvas.width = renderRes;
  canvas.height = renderRes;

  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, renderRes, renderRes);

  const imgData = ctx.createImageData(renderRes, renderRes);
  const radY = (rot3D.angleY * Math.PI) / 180;
  const radX = (rot3D.angleX * Math.PI) / 180;
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);

  const depthScale = numSlices >= 32 ? 1 : Math.max(1, Math.min(8, 64 / Math.max(1, numSlices)));
  const centerX = cols / 2;
  const centerY = rows / 2;
  const centerZ = numSlices / 2;

  const zStep = Math.max(1, Math.floor(numSlices / 56));
  const isShadedMode =
    colorMode3D === 'bone_shaded' ||
    colorMode3D === 'vascular' ||
    colorMode3D === 'soft_tissue';

  const zBuffer = new Float32Array(renderRes * renderRes);
  zBuffer.fill(-999999);

  // Light Direction: Upper-right-front
  const lightX = 0.45;
  const lightY = -0.6;
  const lightZ = 0.65;
  const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ) || 1;
  const lx = lightX / lightLen;
  const ly = lightY / lightLen;
  const lz = lightZ / lightLen;

  for (let z = 0; z < numSlices; z += zStep) {
    const slicePixels = validSlices[z]?.rawPixels;
    if (!slicePixels) continue;

    const zRel = (z - centerZ) * depthScale;
    const prevSlice = validSlices[Math.max(0, z - zStep)]?.rawPixels;
    const nextSlice = validSlices[Math.min(numSlices - 1, z + zStep)]?.rawPixels;

    for (let y = 0; y < rows; y += 2) {
      const yRel = y - centerY;
      const yOffset = y * cols;

      for (let x = 0; x < cols; x += 2) {
        const val = slicePixels[yOffset + x] || 0;
        if (val < threshold3D) continue;

        const xRel = x - centerX;

        const rotX1 = xRel * cosY - zRel * sinY;
        const rotZ1 = xRel * sinY + zRel * cosY;

        const rotY2 = yRel * cosX - rotZ1 * sinX;
        const rotZ2 = yRel * sinX + rotZ1 * cosX;

        const projX = Math.round(renderRes / 2 + (rotX1 * renderRes) / (cols * 1.25));
        const projY = Math.round(renderRes / 2 + (rotY2 * renderRes) / (rows * 1.25));

        if (projX >= 0 && projX < renderRes && projY >= 0 && projY < renderRes) {
          const pixelIdx = projY * renderRes + projX;
          const idx = pixelIdx * 4;

          if (isShadedMode) {
            if (rotZ2 > zBuffer[pixelIdx]) {
              zBuffer[pixelIdx] = rotZ2;

              // Surface Gradient Normal
              const gx = (slicePixels[yOffset + Math.min(cols - 1, x + 2)] || val) - (slicePixels[yOffset + Math.max(0, x - 2)] || val);
              const gy = (slicePixels[Math.min(rows - 1, y + 2) * cols + x] || val) - (slicePixels[Math.max(0, y - 2) * cols + x] || val);
              const gz = (nextSlice ? nextSlice[yOffset + x] || val : val) - (prevSlice ? prevSlice[yOffset + x] || val : val);

              const nx1 = gx * cosY - gz * sinY;
              const nz1 = gx * sinY + gz * cosY;
              const ny2 = gy * cosX - nz1 * sinX;
              const nz2 = gy * sinX + nz1 * cosX;

              const nLen = Math.sqrt(nx1 * nx1 + ny2 * ny2 + nz2 * nz2) || 1;
              const nx = nx1 / nLen;
              const ny = ny2 / nLen;
              const nz = Math.abs(nz2 / nLen);

              // Phong Lighting Model
              const dot = Math.max(0, nx * lx + ny * ly + nz * lz);
              const diffuse = dot;
              const specular = Math.pow(Math.max(0, nz), 18) * 0.45;
              const shade = Math.min(1.5, 0.35 + 0.65 * diffuse + specular);

              if (colorMode3D === 'bone_shaded') {
                imgData.data[idx] = Math.min(255, Math.floor((val * 1.08 + 40) * shade));
                imgData.data[idx + 1] = Math.min(255, Math.floor((val * 0.94 + 28) * shade));
                imgData.data[idx + 2] = Math.min(255, Math.floor((val * 0.76 + 18) * shade));
              } else if (colorMode3D === 'vascular') {
                imgData.data[idx] = Math.min(255, Math.floor((val * 1.35 + 40) * shade));
                imgData.data[idx + 1] = Math.min(255, Math.floor((val * 0.45) * shade));
                imgData.data[idx + 2] = Math.min(255, Math.floor((val * 0.25) * shade));
              } else if (colorMode3D === 'soft_tissue') {
                imgData.data[idx] = Math.min(255, Math.floor((val * 1.1 + 45) * shade));
                imgData.data[idx + 1] = Math.min(255, Math.floor((val * 0.75 + 25) * shade));
                imgData.data[idx + 2] = Math.min(255, Math.floor((val * 0.65 + 15) * shade));
              }
              imgData.data[idx + 3] = 255;
            }
          } else {
            // MIP Mode
            const currentR = imgData.data[idx];
            if (val > currentR) {
              if (colorMode3D === 'bone') {
                imgData.data[idx] = Math.min(255, val * 1.15);
                imgData.data[idx + 1] = Math.min(255, val * 0.88);
                imgData.data[idx + 2] = Math.min(255, val * 0.58);
              } else if (colorMode3D === 'rainbow') {
                const norm = val / 255;
                imgData.data[idx] = Math.min(255, Math.floor(Math.sin(norm * Math.PI) * 255));
                imgData.data[idx + 1] = Math.min(255, Math.floor(Math.sin((norm + 0.33) * Math.PI) * 255));
                imgData.data[idx + 2] = Math.min(255, Math.floor(Math.sin((norm + 0.66) * Math.PI) * 255));
              } else {
                imgData.data[idx] = val;
                imgData.data[idx + 1] = val;
                imgData.data[idx + 2] = val;
              }
              imgData.data[idx + 3] = 255;
            }
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Overlay Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '11px monospace';
  const modeLabel =
    colorMode3D === 'bone_shaded'
      ? '3D BONE SHADED VR'
      : colorMode3D === 'vascular'
      ? '3D VASCULAR ANGIO'
      : colorMode3D === 'soft_tissue'
      ? '3D SOFT TISSUE'
      : `3D MIP (${colorMode3D.toUpperCase()})`;
  ctx.fillText(modeLabel, 10, 20);
  ctx.fillText(`SLICES: ${numSlices}`, 10, 36);
  ctx.fillText(`ISO-VOXEL: ${cols}x${rows}x${numSlices}`, 10, 52);
}
