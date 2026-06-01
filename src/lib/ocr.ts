import Tesseract from "tesseract.js";

export interface SeedPacketData {
  plantName?: string;
  variety?: string;
  daysToGermination?: number;
  daysToMaturity?: number;
  plantingDepthMm?: number;
  spacingCm?: number;
  sunRequirement?: "full" | "partial" | "shade";
  rawText: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumberBefore(text: string, keyword: string): number | undefined {
  const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:days?|d)?\\s*(?:to|until)?\\s*${keyword}`, "i");
  const match = text.match(regex);
  if (match) return Math.round(parseFloat(match[1]));

  // Try reverse: keyword followed by number
  const reverseRegex = new RegExp(`${keyword}[:\\s]*(\\d+(?:\\.\\d+)?)`, "i");
  const reverseMatch = text.match(reverseRegex);
  if (reverseMatch) return Math.round(parseFloat(reverseMatch[1]));

  return undefined;
}

function extractGenericNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) return Math.round(val);
    }
  }
  return undefined;
}

export async function extractSeedPacketData(imageBlob: Blob): Promise<SeedPacketData> {
  try {
    const result = await Tesseract.recognize(imageBlob, "eng", {
      logger: () => {}, // suppress progress logs
    });

    const rawText = result.data.text;
    const text = normalizeText(rawText);

    const data: SeedPacketData = { rawText: result.data.text };

    // Plant name: look for common patterns
    // Try "variety: xxx" or lines that look like a cultivar
    const varietyMatch = text.match(/variety[:\s]+([a-z0-9\s'-]+)/i);
    if (varietyMatch) {
      data.variety = varietyMatch[1].trim().replace(/\s+/g, " ");
    }

    // Plant name heuristics: first capitalized word on original text, or look for "[Name] seeds"
    const seedMatch = rawText.match(/([A-Za-z\s'-]+?)\s+seeds?/i);
    if (seedMatch) {
      data.plantName = seedMatch[1].trim().replace(/\s+/g, " ");
    }

    // Days to germination
    data.daysToGermination =
      extractNumberBefore(text, "germination") ??
      extractNumberBefore(text, "germinate") ??
      extractGenericNumber(text, [
        /germination[:\s]*(\d+)/i,
        /sprout[:\s]*(\d+)/i,
        /(?:sprouts?|germinates?)\s*in[:\s]*(\d+)/i,
      ]);

    // Days to maturity
    data.daysToMaturity =
      extractNumberBefore(text, "maturity") ??
      extractNumberBefore(text, "harvest") ??
      extractGenericNumber(text, [
        /maturity[:\s]*(\d+)/i,
        /days?\s*to\s*harvest[:\s]*(\d+)/i,
        /harvest[:\s]*(\d+)/i,
      ]);

    // Planting depth
    const depthMmMatch = text.match(/(\d+(?:\.\d+)?)\s*mm?\s*(?:deep|depth)/i);
    const depthCmMatch = text.match(/(\d+(?:\.\d+)?)\s*cm?\s*(?:deep|depth)/i);
    const depthInMatch = text.match(/(\d+(?:\.\d+)?)\s*in?ch(?:es)?\s*(?:deep|depth)/i);
    if (depthMmMatch) data.plantingDepthMm = Math.round(parseFloat(depthMmMatch[1]));
    else if (depthCmMatch) data.plantingDepthMm = Math.round(parseFloat(depthCmMatch[1]) * 10);
    else if (depthInMatch) data.plantingDepthMm = Math.round(parseFloat(depthInMatch[1]) * 25.4);

    // Spacing
    const spacingCmMatch = text.match(/(\d+(?:\.\d+)?)\s*cm?\s*(?:apart|spacing|space)/i);
    const spacingInMatch = text.match(/(\d+(?:\.\d+)?)\s*in?ch(?:es)?\s*(?:apart|spacing|space)/i);
    if (spacingCmMatch) data.spacingCm = Math.round(parseFloat(spacingCmMatch[1]));
    else if (spacingInMatch) data.spacingCm = Math.round(parseFloat(spacingInMatch[1]) * 2.54);

    // Sun requirement
    if (/full\s*sun/i.test(text)) data.sunRequirement = "full";
    else if (/partial\s*sun/i.test(text) || /partial\s*shade/i.test(text)) data.sunRequirement = "partial";
    else if (/full\s*shade/i.test(text) || /shade/i.test(text)) data.sunRequirement = "shade";

    return data;
  } catch (err) {
    console.error("OCR extraction failed:", err);
    throw err instanceof Error ? err : new Error("OCR extraction failed");
  }
}

export function validateSeedPacketData(data: SeedPacketData): {
  valid: boolean;
  missing: string[];
  confidence: "high" | "medium" | "low";
} {
  const missing: string[] = [];

  if (!data.plantName || data.plantName.length < 2) missing.push("plantName");
  if (!data.daysToGermination || data.daysToGermination <= 0 || data.daysToGermination > 60) {
    missing.push("daysToGermination");
  }
  if (!data.daysToMaturity || data.daysToMaturity <= 0 || data.daysToMaturity > 999) {
    missing.push("daysToMaturity");
  }
  if (!data.plantingDepthMm || data.plantingDepthMm <= 0) missing.push("plantingDepthMm");
  if (!data.spacingCm || data.spacingCm <= 0) missing.push("spacingCm");
  if (!data.sunRequirement) missing.push("sunRequirement");

  const fieldCount = 6;
  const presentCount = fieldCount - missing.length;

  let confidence: "high" | "medium" | "low" = "low";
  if (presentCount >= 5) confidence = "high";
  else if (presentCount >= 3) confidence = "medium";

  return {
    valid: missing.length === 0,
    missing,
    confidence,
  };
}
