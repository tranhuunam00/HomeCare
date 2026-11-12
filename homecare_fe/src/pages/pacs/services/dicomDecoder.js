import * as dicomParser from 'dicom-parser';

/**
 * Parses and decodes a DICOM ArrayBuffer into displayable image data and metadata.
 * Supports 8-bit & 16-bit Grayscale (Signed/Unsigned), Window/Level, and Pixel Spacing.
 */
export function parseDicomBuffer(arrayBuffer) {
  let dataSet;
  try {
    const byteArray = new Uint8Array(arrayBuffer);
    dataSet = dicomParser.parseDicom(byteArray);
  } catch (err) {
    return {
      meta: {
        patientName: '',
        patientId: '',
        patientBirthDate: '',
        patientSex: '',
        patientAge: '',
        studyDate: '',
        studyTime: '',
        modality: '',
        studyInstanceUid: '',
        seriesInstanceUid: '',
        sopInstanceUid: '',
        seriesDescription: '',
        laterality: '',
        viewPosition: '',
        institutionName: '',
        rows: 512,
        columns: 512,
        bitsAllocated: 16,
        bitsStored: 12,
        pixelRepresentation: 0,
        photometricInterpretation: 'MONOCHROME2',
        windowCenter: 40,
        windowWidth: 400,
        rescaleSlope: 1,
        rescaleIntercept: 0,
        pixelSpacing: [1.0, 1.0],
      },
      rawPixels: null,
    };
  }

  // 1. Extract Metadata Tags (Strictly from DICOM header; leave empty if absent)
  const rawPatientName = (dataSet.string('x00100010') || '').trim();
  const patientName = rawPatientName && rawPatientName !== 'Unknown' ? rawPatientName : '';
  const patientId = (dataSet.string('x00100020') || '').trim();
  const patientBirthDate = (dataSet.string('x00100030') || '').trim();
  const rawSex = (dataSet.string('x00100040') || '').trim().toUpperCase();
  const patientSex =
    rawSex === 'M' ? 'Nam' : rawSex === 'F' ? 'Nữ' : rawSex === 'O' ? 'Khác' : rawSex;
  const patientAge = (dataSet.string('x00101010') || '').trim();

  const rawStudyDate = (dataSet.string('x00080020') || '').trim();
  const studyDate =
    rawStudyDate.length === 8
      ? `${rawStudyDate.slice(0, 4)}-${rawStudyDate.slice(4, 6)}-${rawStudyDate.slice(6, 8)}`
      : rawStudyDate;
  const rawStudyTime = (dataSet.string('x00080030') || '').trim();
  const studyTime =
    rawStudyTime.length >= 6
      ? `${rawStudyTime.slice(0, 2)}:${rawStudyTime.slice(2, 4)}:${rawStudyTime.slice(4, 6)}`
      : rawStudyTime;

  const modality = (dataSet.string('x00080060') || '').trim();
  const studyInstanceUid = (dataSet.string('x0020000d') || '').trim();
  const seriesInstanceUid = (dataSet.string('x0020000e') || '').trim();
  const sopInstanceUid = (dataSet.string('x00080018') || '').trim();
  const seriesDescription = (dataSet.string('x0008103e') || '').trim();
  const laterality = (dataSet.string('x00200060') || '').trim();
  const viewPosition = (dataSet.string('x00185101') || '').trim();
  const institutionName = (dataSet.string('x00080080') || '').trim();

  const rows = dataSet.uint16('x00280010') || 512;
  const columns = dataSet.uint16('x00280011') || 512;
  const bitsAllocated = dataSet.uint16('x00280100') || 16;
  const bitsStored = dataSet.uint16('x00280101') || 12;
  const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed
  const photometricInterpretation = dataSet.string('x00280004') || 'MONOCHROME2';

  // Window Center & Width
  const wcStr = dataSet.string('x00281050');
  const windowCenter = wcStr ? parseFloat(wcStr.split('\\')[0]) : 40;
  const wwStr = dataSet.string('x00281051');
  const windowWidth = wwStr ? parseFloat(wwStr.split('\\')[0]) : 400;

  // Rescale Slope & Intercept
  const rescaleSlopeStr = dataSet.string('x00281053');
  const rescaleSlope = rescaleSlopeStr ? parseFloat(rescaleSlopeStr) : 1;
  const rescaleInterceptStr = dataSet.string('x00281052');
  const rescaleIntercept = rescaleInterceptStr ? parseFloat(rescaleInterceptStr) : 0;

  // Pixel Spacing: [rowSpacing, colSpacing] in mm
  let pixelSpacing = [1.0, 1.0];
  const spacingStr = dataSet.string('x00280030');
  if (spacingStr) {
    const parts = spacingStr.split('\\').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      pixelSpacing = [parts[0], parts[1]];
    }
  }

  // 2. Extract Pixel Data
  const pixelDataElement = dataSet.elements.x7fe00010;
  let rawPixels = null;

  if (pixelDataElement && pixelDataElement.length > 0) {
    const offset = pixelDataElement.dataOffset;
    const length = pixelDataElement.length;

    if (bitsAllocated === 16) {
      if (pixelRepresentation === 1) {
        rawPixels = new Int16Array(
          arrayBuffer.slice(offset, offset + length)
        );
      } else {
        rawPixels = new Uint16Array(
          arrayBuffer.slice(offset, offset + length)
        );
      }
    } else if (bitsAllocated === 8) {
      rawPixels = new Uint8Array(
        arrayBuffer.slice(offset, offset + length)
      );
    }
  }

  return {
    meta: {
      patientName,
      patientId,
      patientBirthDate,
      patientSex,
      patientAge,
      studyDate,
      studyTime,
      modality,
      studyInstanceUid,
      seriesInstanceUid,
      sopInstanceUid,
      seriesDescription,
      laterality,
      viewPosition,
      institutionName,
      rows,
      columns,
      bitsAllocated,
      bitsStored,
      pixelRepresentation,
      photometricInterpretation,
      windowCenter,
      windowWidth,
      rescaleSlope,
      rescaleIntercept,
      pixelSpacing,
    },
    rawPixels,
  };
}

/**
 * Renders raw DICOM pixels onto an HTML5 Canvas using specific Window Center / Width and Invert flag.
 */
export function renderDicomToCanvas(canvas, rawPixels, meta, options = {}) {
  const { rows, columns, rescaleSlope, rescaleIntercept, photometricInterpretation } = meta;
  const windowCenter = options.windowCenter !== undefined ? options.windowCenter : meta.windowCenter;
  const windowWidth = options.windowWidth !== undefined ? options.windowWidth : meta.windowWidth;
  const invert = options.invert !== undefined ? options.invert : false;
  const colorLut = options.colorLut || 'default'; // 'default', 'inverted', 'rainbow', 'hot_iron'

  canvas.width = columns;
  canvas.height = rows;

  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(columns, rows);
  const data = imageData.data;

  if (!rawPixels || rawPixels.length === 0) {
    // If no raw pixels, fill with placeholder dark gray
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, columns, rows);
    return;
  }

  const numPixels = rows * columns;
  const halfWidth = windowWidth / 2;
  const low = windowCenter - halfWidth;
  const high = windowCenter + halfWidth;
  const isMonochrome1 = photometricInterpretation === 'MONOCHROME1';

  for (let i = 0; i < numPixels; i++) {
    const rawVal = rawPixels[i];
    // Convert to HU / Rescaled value
    const hu = rawVal * rescaleSlope + rescaleIntercept;

    let intensity = 0;
    if (hu <= low) {
      intensity = 0;
    } else if (hu >= high) {
      intensity = 255;
    } else {
      intensity = ((hu - low) / windowWidth) * 255;
    }

    if (isMonochrome1) {
      intensity = 255 - intensity;
    }

    if (invert || colorLut === 'inverted') {
      intensity = 255 - intensity;
    }

    let r = intensity;
    let g = intensity;
    let b = intensity;

    if (colorLut === 'rainbow') {
      if (intensity < 64) {
        r = 0;
        g = Math.round(intensity * 4);
        b = 255;
      } else if (intensity < 128) {
        r = 0;
        g = 255;
        b = Math.round(255 - (intensity - 64) * 4);
      } else if (intensity < 192) {
        r = Math.round((intensity - 128) * 4);
        g = 255;
        b = 0;
      } else {
        r = 255;
        g = Math.round(255 - (intensity - 192) * 4);
        b = 0;
      }
    } else if (colorLut === 'hot_iron') {
      r = Math.min(255, Math.round(intensity * 1.5));
      g = Math.min(255, Math.max(0, Math.round((intensity - 85) * 2)));
      b = Math.min(255, Math.max(0, Math.round((intensity - 170) * 3)));
    }

    const idx = i * 4;
    data[idx] = r;         // R
    data[idx + 1] = g;     // G
    data[idx + 2] = b;     // B
    data[idx + 3] = 255;   // Alpha
  }

  ctx.putImageData(imageData, 0, 0);
}

