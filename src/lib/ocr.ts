/**
 * OCR utilities for seed packet images.
 *
 * Two backends:
 *   1. extractSeedPacketViaGemini — preferred. Uploads to our /api/ocr-seed-packet
 *      server route which calls Google Gemini 2.5 Flash vision with a JSON
 *      schema. Requires GEMINI_API_KEY on the server.
 *   2. extractSeedPacketData — Tesseract.js in the browser, used as an offline
 *      fallback. Less accurate.
 */

export interface SeedPacketData {
  plantName?: string;
  variety?: string;
  brand?: string;
  daysToGermination?: number;
  daysToMaturity?: number;
  plantingDepth?: string;
  spacing?: string;
  rowSpacing?: string;
  sunRequirement?: string;
  sowingMethod?: string;
  whenToPlant?: string;
  notes?: string;
  rawText: string;
}

/**
 * Resize an image blob to at most `maxDim` on its longest side and re-encode
 * as JPEG. Keeps uploads under Vercel's 4.5 MB body limit and speeds up OCR.
 */
async function compressImage(blob: Blob, maxDim = 1280, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return blob;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b ?? blob), 'image/jpeg', quality);
  });
}

/**
 * Send an image to the server-side Gemini OCR route and return the parsed
 * seed packet fields. Throws on network/API errors.
 */
export async function extractSeedPacketViaGemini(imageBlob: Blob): Promise<SeedPacketData> {
  const compressed = await compressImage(imageBlob);
  const form = new FormData();
  form.append('image', compressed, 'seed-packet.jpg');

  const res = await fetch('/api/ocr-seed-packet', { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error ?? `OCR request failed (${res.status})`);
  }
  const data = json.data ?? {};
  return { rawText: '', ...data } as SeedPacketData;
}

export async function extractSeedPacketData(imageBlob: Blob): Promise<SeedPacketData> {
  // Dynamic import to avoid SSR issues
  const Tesseract = await import('tesseract.js');
  const worker = await Tesseract.createWorker('eng');

  try {
    const imageUrl = URL.createObjectURL(imageBlob);
    const { data: { text } } = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);

    return parsePacketText(text);
  } finally {
    await worker.terminate();
  }
}

function parsePacketText(text: string): SeedPacketData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: SeedPacketData = { rawText: text };

  // Try to extract plant name (usually the largest/first text)
  if (lines.length > 0) {
    result.plantName = lines[0];
  }

  // Look for variety
  const varietyMatch = text.match(/variety[:\s]+([^\n]+)/i);
  if (varietyMatch) result.variety = varietyMatch[1].trim();

  // Days to germination
  const germMatch = text.match(/germinat\w*[:\s]*(\d+)[\s-]*(\d+)?/i);
  if (germMatch) {
    result.daysToGermination = parseInt(germMatch[2] || germMatch[1]);
  }

  // Days to maturity/harvest
  const maturityMatch = text.match(/(matur|harvest)\w*[:\s]*(\d+)[\s-]*(\d+)?/i);
  if (maturityMatch) {
    result.daysToMaturity = parseInt(maturityMatch[3] || maturityMatch[2]);
  }

  // Planting depth
  const depthMatch = text.match(/depth[:\s]+([^\n]+)/i);
  if (depthMatch) result.plantingDepth = depthMatch[1].trim();

  // Spacing
  const spacingMatch = text.match(/spac\w*[:\s]+([^\n]+)/i);
  if (spacingMatch) result.spacing = spacingMatch[1].trim();

  // Sun requirement
  const sunMatch = text.match(/(full\s+sun|partial\s+shade|full\s+shade|partial\s+sun)/i);
  if (sunMatch) result.sunRequirement = sunMatch[1].trim();

  return result;
}
