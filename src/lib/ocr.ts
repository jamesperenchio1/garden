/**
 * OCR utility for extracting text from seed packet images using Tesseract.js.
 * Extracts key planting information from the detected text.
 */

export interface SeedPacketData {
  plantName?: string;
  variety?: string;
  daysToGermination?: number;
  daysToMaturity?: number;
  plantingDepth?: string;
  spacing?: string;
  sunRequirement?: string;
  rawText: string;
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
