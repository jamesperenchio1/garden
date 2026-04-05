import { NextRequest, NextResponse } from 'next/server';

/**
 * Seed-packet OCR via Google Gemini 2.5 Flash.
 *
 * Expects a multipart/form-data POST with a single `image` field.
 * Returns a structured JSON object with fields extracted from the packet.
 *
 * Env: GEMINI_API_KEY (get free at https://aistudio.google.com/apikey).
 *
 * Runs on Vercel's Node serverless functions — Hobby tier is fine, no paid
 * services required.
 */

export const runtime = 'nodejs';
export const maxDuration = 30;

export interface SeedPacketOcrResult {
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
  rawText?: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    plantName: { type: 'string', description: 'Main crop or plant name on the packet (e.g. "Cucumber").' },
    variety: { type: 'string', description: 'Specific variety (e.g. "Marketmore 76").' },
    brand: { type: 'string', description: 'Seed company / brand name.' },
    daysToGermination: { type: 'integer', description: 'Days until seeds germinate (single number; use the upper end if a range).' },
    daysToMaturity: { type: 'integer', description: 'Days from planting/transplant to harvest (single number; upper end of range).' },
    plantingDepth: { type: 'string', description: 'How deep to sow the seed, e.g. "1/2 inch".' },
    spacing: { type: 'string', description: 'Plant-to-plant spacing.' },
    rowSpacing: { type: 'string', description: 'Row-to-row spacing.' },
    sunRequirement: { type: 'string', description: 'E.g. "Full sun", "Partial shade".' },
    sowingMethod: { type: 'string', description: 'E.g. "Direct sow", "Start indoors".' },
    whenToPlant: { type: 'string', description: 'When to sow, e.g. "After last frost".' },
    notes: { type: 'string', description: 'Any other useful growing info worth surfacing to the gardener.' },
    rawText: { type: 'string', description: 'Full text transcribed from the packet, for reference.' },
  },
};

const PROMPT = `You are analyzing a photo of a seed packet. Extract the planting information into the provided JSON schema.

Rules:
- Only fill fields you are confident about. Omit fields you can't read.
- For "daysToGermination" and "daysToMaturity", extract a single integer. If the packet lists a range (e.g. "55-65 days"), use the upper number.
- Normalize measurements exactly as printed (e.g. "1/2 inch", "12 inches").
- "rawText" should contain the full visible text on the packet (front and any back text visible), separated by newlines.
- If the image is not a seed packet, return an object with only "notes": "Image does not appear to be a seed packet.".`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY is not configured on the server. Add it to your .env.local (dev) or Vercel project environment variables. Get a free key at https://aistudio.google.com/apikey.',
      },
      { status: 500 },
    );
  }

  let file: File | null = null;
  try {
    const formData = await req.formData();
    const entry = formData.get('image');
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No image field in request.' }, { status: 400 });
  }

  // Convert to base64 for Gemini inline_data.
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = file.type || 'image/jpeg';

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach Gemini: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return NextResponse.json(
      { error: `Gemini API error (${geminiRes.status}): ${errText.slice(0, 500)}` },
      { status: 502 },
    );
  }

  const geminiJson = await geminiRes.json();
  const text: string | undefined =
    geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return NextResponse.json(
      { error: 'Gemini returned no content.', raw: geminiJson },
      { status: 502 },
    );
  }

  let parsed: SeedPacketOcrResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: 'Gemini returned non-JSON content.', raw: text },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: parsed });
}
