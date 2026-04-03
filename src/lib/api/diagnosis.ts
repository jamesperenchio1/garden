export interface DiagnosisResult {
  name: string;
  probability: number;
  description: string;
  treatment: DiagnosisTreatment;
  similarImages?: string[];
}

export interface DiagnosisTreatment {
  biological: string[];
  chemical: string[];
  prevention: string[];
  thaiAvailable: string[];
}

export interface PlantIdentification {
  name: string;
  probability: number;
  commonNames: string[];
  scientificName: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Diagnose plant health issues from a photo using plant.id API.
 * Requires NEXT_PUBLIC_PLANT_ID_TOKEN to be set.
 */
export async function diagnosePlant(imageBase64: string): Promise<DiagnosisResult[]> {
  const token = process.env.NEXT_PUBLIC_PLANT_ID_TOKEN;
  if (!token) {
    throw new Error('Plant.id API token not configured. Set NEXT_PUBLIC_PLANT_ID_TOKEN in .env.local');
  }

  const response = await fetch('https://plant.id/api/v3/health_assessment', {
    method: 'POST',
    headers: {
      'Api-Key': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: [imageBase64],
      similar_images: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Plant.id API error: ${response.statusText}`);
  }

  const data = await response.json();
  return transformDiagnosisResults(data);
}

/**
 * Identify a plant from a photo using plant.id API.
 */
export async function identifyPlant(imageBase64: string): Promise<PlantIdentification[]> {
  const token = process.env.NEXT_PUBLIC_PLANT_ID_TOKEN;
  if (!token) {
    throw new Error('Plant.id API token not configured');
  }

  const response = await fetch('https://plant.id/api/v3/identification', {
    method: 'POST',
    headers: {
      'Api-Key': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: [imageBase64],
      similar_images: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Plant.id API error: ${response.statusText}`);
  }

  const data = await response.json();
  const suggestions = data.result?.classification?.suggestions || [];

  return suggestions.map((s: Record<string, unknown>) => ({
    name: s.name as string,
    probability: s.probability as number,
    commonNames: (s.details as Record<string, unknown>)?.common_names as string[] || [],
    scientificName: s.name as string,
    description: ((s.details as Record<string, unknown>)?.description as Record<string, unknown>)?.value as string || undefined,
    imageUrl: ((s.similar_images as Record<string, unknown>[])?.[0] as Record<string, unknown>)?.url as string || undefined,
  }));
}

function transformDiagnosisResults(data: Record<string, unknown>): DiagnosisResult[] {
  const result = data.result as Record<string, unknown> | undefined;
  const disease = result?.disease as Record<string, unknown> | undefined;
  const diseases = (disease?.suggestions as Record<string, unknown>[]) || [];

  return diseases.map((d) => {
    const details = d.details as Record<string, unknown> || {};
    const treatment = details.treatment as Record<string, string[]> || {};

    return {
      name: d.name as string,
      probability: d.probability as number,
      description: (details.description as string) || '',
      treatment: {
        biological: treatment.biological || [],
        chemical: treatment.chemical || [],
        prevention: treatment.prevention || [],
        thaiAvailable: generateThaiTreatments(d.name as string, treatment),
      },
      similarImages: (d.similar_images as Record<string, string>[])?.map((img) => img.url) || [],
    };
  });
}

function generateThaiTreatments(
  diseaseName: string,
  treatment: Record<string, string[]>
): string[] {
  // Common treatments available in Thailand
  const thaiTreatments: string[] = [];

  if (treatment.biological?.length) {
    thaiTreatments.push('Neem oil (available at Thai garden centers)');
    thaiTreatments.push('Trichoderma (ไตรโคเดอร์มา) - available from DOA Thailand');
  }

  if (treatment.chemical?.length) {
    thaiTreatments.push('Consult local agricultural office (สำนักงานเกษตร) for approved pesticides');
  }

  thaiTreatments.push('Local remedy: Fermented plant juice (น้ำหมักชีวภาพ)');

  return thaiTreatments;
}
