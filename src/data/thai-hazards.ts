import type { ThaiHazard } from '@/types/weather';

/**
 * Evaluate Thai-specific weather hazards based on current conditions and date.
 */
export function evaluateThaiHazards(
  date: Date,
  temperature: number,
  precipitation: number,
  humidity: number,
  windSpeed: number
): ThaiHazard[] {
  const month = date.getMonth() + 1;
  const hazards: ThaiHazard[] = [];

  // Burning season (Feb-Apr) - Air quality
  if (month >= 2 && month <= 4) {
    const severity = month === 3 ? 'high' : 'moderate';
    hazards.push({
      type: 'burning_season',
      severity,
      title: 'Burning Season (หมอกควัน)',
      description: `Northern Thailand burning season is active. Crop burning and forest fires cause poor air quality, especially in ${month === 3 ? 'March (peak)' : month === 2 ? 'February' : 'April'}.`,
      farmingImpact: 'Reduced sunlight may slow growth. Ash deposits can affect leaf health. Consider covering sensitive crops. Wash produce thoroughly.',
      active: true,
    });
  }

  // Monsoon season (May-Oct)
  if (month >= 5 && month <= 10) {
    const isHeavy = precipitation > 20 || (month >= 8 && month <= 9);
    hazards.push({
      type: 'monsoon',
      severity: isHeavy ? 'high' : 'moderate',
      title: 'Monsoon Season (ฤดูฝน)',
      description: `Southwest monsoon brings heavy rainfall. ${month >= 8 && month <= 9 ? 'August-September typically sees heaviest rain.' : ''}`,
      farmingImpact: 'Ensure proper drainage for all beds. Check hydroponic water levels frequently. Root rot risk increases. Fungal diseases more common. Great time for water-loving crops.',
      active: true,
    });
  }

  // Flood risk
  if (precipitation > 50 || (month >= 9 && month <= 11 && precipitation > 30)) {
    hazards.push({
      type: 'flood_risk',
      severity: precipitation > 80 ? 'extreme' : 'high',
      title: 'Flood Risk (เสี่ยงน้ำท่วม)',
      description: `Heavy rainfall increases flooding risk. ${precipitation > 80 ? 'Extreme precipitation detected.' : 'Monitor local water levels.'}`,
      farmingImpact: 'Elevate containers and equipment. Disconnect outdoor hydroponic systems if flooding expected. Harvest ready crops immediately. Protect seedlings.',
      active: true,
    });
  }

  // Extreme heat (Mar-May)
  if (temperature > 38 || (month >= 3 && month <= 5 && temperature > 35)) {
    hazards.push({
      type: 'extreme_heat',
      severity: temperature > 40 ? 'extreme' : temperature > 38 ? 'high' : 'moderate',
      title: 'Extreme Heat (อากาศร้อนจัด)',
      description: `Temperature at ${temperature}°C. Thailand's hot season peaks in April. Heat stress likely for many crops.`,
      farmingImpact: 'Water more frequently, especially containers. Use shade cloth for sensitive crops. Hydroponic water temperatures may rise - monitor EC and pH closely. Consider mulching soil beds.',
      active: true,
    });
  }

  // Storm warning
  if (windSpeed > 40 || (precipitation > 30 && windSpeed > 25)) {
    hazards.push({
      type: 'storm',
      severity: windSpeed > 60 ? 'extreme' : 'high',
      title: 'Storm Warning (พายุ)',
      description: `Strong winds at ${windSpeed} km/h with heavy precipitation. Possible tropical storm activity.`,
      farmingImpact: 'Secure greenhouse structures. Stake tall plants. Move containers to sheltered areas. Disconnect and protect hydroponic equipment from water damage.',
      active: true,
    });
  }

  return hazards;
}
