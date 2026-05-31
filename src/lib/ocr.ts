/**
 * OCR utility for extracting text from seed packet images using Tesseract.js.
 * Enhanced with multi-language support, better parsing, and validation.
 */

export interface SeedPacketData {
  plantName?: string;
  variety?: string;
  scientificName?: string;
  daysToGermination?: number;
  daysToGerminationRange?: [number, number];
  daysToMaturity?: number;
  daysToMaturityRange?: [number, number];
  plantingDepth?: string;
  plantingDepthMm?: number;
  spacing?: string;
  spacingCm?: number;
  sunRequirement?: string;
  temperatureRange?: string;
  weight?: string;
  lotNumber?: string;
  expiryDate?: string;
  company?: string;
  rawText: string;
  confidence: number;
  language: string;
}

/**
 * Extract seed packet data with improved accuracy.
 * Attempts English first, then falls back to Thai if confidence is low.
 */
export async function extractSeedPacketData(imageBlob: Blob): Promise<SeedPacketData> {
  const Tesseract = await import('tesseract.js');

  // Try English first
  const workerEng = await Tesseract.createWorker('eng');
  let bestResult: { text: string; confidence: number; lang: string } = { text: '', confidence: 0, lang: 'eng' };

  try {
    const imageUrl = URL.createObjectURL(imageBlob);
    const { data } = await workerEng.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);
    bestResult = { text: data.text, confidence: data.confidence, lang: 'eng' };
  } finally {
    await workerEng.terminate();
  }

  // If English confidence is poor (< 40), try Thai
  if (bestResult.confidence < 40) {
    try {
      const workerTha = await Tesseract.createWorker('tha');
      const imageUrl = URL.createObjectURL(imageBlob);
      const { data } = await workerTha.recognize(imageUrl);
      URL.revokeObjectURL(imageUrl);
      if (data.confidence > bestResult.confidence) {
        bestResult = { text: data.text, confidence: data.confidence, lang: 'tha' };
      }
      await workerTha.terminate();
    } catch {
      /* Thai OCR not available or failed, use English result */
    }
  }

  return parsePacketText(bestResult.text, bestResult.confidence, bestResult.lang);
}

function parsePacketText(text: string, confidence: number, language: string): SeedPacketData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const joined = text.toLowerCase().replace(/\s+/g, ' ');
  const result: SeedPacketData = { rawText: text, confidence, language };

  // Plant name detection — first substantial line that isn't a company/weight
  for (const line of lines) {
    const clean = line.trim();
    if (clean.length < 2) continue;
    if (/^(net wt|weight|lot|exp|date|\d+g|company|brand)/i.test(clean)) continue;
    if (/^\d/.test(clean) && clean.length < 5) continue;
    result.plantName = clean;
    break;
  }

  // Scientific name (Latin binomial)
  const sciMatch = text.match(/\b([A-Z][a-z]+\s+[a-z]+(?:\s+var\.\s+\w+)?)\b/);
  if (sciMatch && sciMatch[1].length > 5) {
    result.scientificName = sciMatch[1];
  }

  // Variety — look after "variety" or in parentheses
  const varietyMatch = text.match(/variety[:\s]+([^\n,]+)/i);
  if (varietyMatch) result.variety = varietyMatch[1].trim();

  const parenVariety = text.match(/\(([^)]+variety[^)]*)\)/i);
  if (parenVariety && !result.variety) result.variety = parenVariety[1].trim();

  // Days to germination — handle ranges like "7-14 days" or "germination: 10 days"
  const germPatterns = [
    /germinat\w*[\s:]*(\d+)[\s-]*(\d+)?\s*(?:days?)?/i,
    /sprout[\s:]*(\d+)[\s-]*(\d+)?\s*(?:days?)?/i,
    /(?: emerge|emergence)[\s:]*(\d+)[\s-]*(\d+)?\s*(?:days?)?/i,
  ];
  for (const pattern of germPatterns) {
    const match = joined.match(pattern);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      result.daysToGermination = max;
      result.daysToGerminationRange = [min, max];
      break;
    }
  }

  // Days to maturity / harvest
  const maturityPatterns = [
    /(?:matur|harvest)[\s:]*(\d+)[\s-]*(\d+)?\s*(?:days?)?/i,
    /(?:days?\s+to\s+(?:matur|harvest))[\s:]*(\d+)[\s-]*(\d+)?/i,
  ];
  for (const pattern of maturityPatterns) {
    const match = joined.match(pattern);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      result.daysToMaturity = max;
      result.daysToMaturityRange = [min, max];
      break;
    }
  }

  // Planting depth — parse both text and numeric mm
  const depthPatterns = [
    /(?:sowing\s+)?depth[\s:]+([^\n,]+)/i,
    /plant[\s:]+(\d+\s*(?:mm|cm|in|inch)[^\n,]*)/i,
    /(\d+\s*(?:mm|cm|in|inch)\s*(?:deep)?)/i,
  ];
  for (const pattern of depthPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.plantingDepth = match[1].trim();
      const mmMatch = result.plantingDepth.match(/(\d+)\s*mm/);
      const cmMatch = result.plantingDepth.match(/(\d+)\s*cm/);
      const inMatch = result.plantingDepth.match(/(\d+(?:\.\d+)?)\s*(?:in|inch)/);
      if (mmMatch) result.plantingDepthMm = parseInt(mmMatch[1]);
      else if (cmMatch) result.plantingDepthMm = parseInt(cmMatch[1]) * 10;
      else if (inMatch) result.plantingDepthMm = Math.round(parseFloat(inMatch[1]) * 25.4);
      break;
    }
  }

  // Spacing — parse both text and numeric cm
  const spacingPatterns = [
    /spac\w*[\s:]+([^\n,]+)/i,
    /(\d+\s*(?:cm|mm|m|in|inch|ft|foot)\s*(?:apart|between)?)/i,
  ];
  for (const pattern of spacingPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.spacing = match[1].trim();
      const cmMatch = result.spacing.match(/(\d+)\s*cm/);
      const mMatch = result.spacing.match(/(\d+)\s*m/);
      const inMatch = result.spacing.match(/(\d+(?:\.\d+)?)\s*(?:in|inch)/);
      if (cmMatch) result.spacingCm = parseInt(cmMatch[1]);
      else if (mMatch) result.spacingCm = parseInt(mMatch[1]) * 100;
      else if (inMatch) result.spacingCm = Math.round(parseFloat(inMatch[1]) * 2.54);
      break;
    }
  }

  // Sun requirement
  const sunPatterns = [
    /(full\s+sun|partial\s+shade|full\s+shade|partial\s+sun|shade\s+tolerant)/i,
    /sun[\s:]*(full|partial|shade)/i,
  ];
  for (const pattern of sunPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.sunRequirement = match[1].trim();
      break;
    }
  }

  // Temperature range
  const tempMatch = text.match(/(?:temp|temperature)[\s:]*([^\n,°]+(?:°[CF])?[^\n,]*)/i);
  if (tempMatch) result.temperatureRange = tempMatch[1].trim();

  // Weight / Net Wt
  const weightMatch = text.match(/(?:net\s*wt|weight)[\.:\s]*([^\n]+)/i);
  if (weightMatch) result.weight = weightMatch[1].trim();

  // Lot number
  const lotMatch = text.match(/(?:lot\s*(?:no|Number)?)[\.:\s#]*([A-Za-z0-9-]+)/i);
  if (lotMatch) result.lotNumber = lotMatch[1].trim();

  // Expiry / Best Before
  const expMatch = text.match(/(?:exp|expiry|best\s*before|use\s*by)[\.:\s]*([^\n]+)/i);
  if (expMatch) result.expiryDate = expMatch[1].trim();

  // Company / Brand
  const companyPatterns = [
    /(?:by|from|company|brand)[\s:]*([A-Z][A-Za-z0-9\s&]+)(?:\n|$)/,
    /^([A-Z][A-Za-z0-9\s&]+(?:Seeds?|Co\.?|Ltd\.?|Inc\.?))/m,
  ];
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.company = match[1].trim();
      break;
    }
  }

  return result;
}

/**
 * Validate extracted data and return warnings for suspicious values.
 */
export function validateSeedPacketData(data: SeedPacketData): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!data.plantName || data.plantName.length < 3) {
    warnings.push('Plant name not detected clearly. Please verify.');
  }

  if (data.daysToGermination && (data.daysToGermination < 1 || data.daysToGermination > 90)) {
    warnings.push(`Germination time (${data.daysToGermination} days) seems unusual. Please verify.`);
  }

  if (data.daysToMaturity && (data.daysToMaturity < 10 || data.daysToMaturity > 730)) {
    warnings.push(`Maturity time (${data.daysToMaturity} days) seems unusual. Please verify.`);
  }

  if (data.plantingDepthMm && (data.plantingDepthMm < 1 || data.plantingDepthMm > 100)) {
    warnings.push(`Planting depth (${data.plantingDepthMm}mm) seems unusual. Please verify.`);
  }

  if (data.spacingCm && (data.spacingCm < 1 || data.spacingCm > 1000)) {
    warnings.push(`Spacing (${data.spacingCm}cm) seems unusual. Please verify.`);
  }

  if (data.confidence < 50) {
    warnings.push('OCR confidence was low. Please double-check all extracted values.');
  }

  return { valid: warnings.length === 0, warnings };
}
