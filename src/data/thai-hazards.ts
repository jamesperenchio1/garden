export interface ThaiHazard {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  farmingImpact: string;
}

function monthFromDate(date: Date): number {
  return date.getMonth() + 1;
}

/**
 * Evaluate Thai weather hazards based on current conditions.
 * @param date - Current date (used for seasonality)
 * @param temp - Temperature in °C
 * @param precipitation - Precipitation in mm (past 24h or forecast)
 * @param humidity - Relative humidity in %
 * @param windSpeed - Wind speed in km/h
 */
export function evaluateThaiHazards(
  date: Date,
  temp: number,
  precipitation: number,
  humidity: number,
  windSpeed: number
): ThaiHazard[] {
  const hazards: ThaiHazard[] = [];
  const month = monthFromDate(date);

  // --- Temperature hazards ---
  if (temp >= 42) {
    hazards.push({
      title: 'Extreme Heatwave',
      severity: 'extreme',
      description: `Temperature reached ${temp}°C. Critical heat stress for most crops. Risk of leaf scorch and sunburn.`,
      farmingImpact: 'Suspend all outdoor work. Shade cloth essential. Increase irrigation frequency; water early morning and evening. Risk of flower drop in chili, tomato, and eggplant. Harvest sensitive fruits immediately.',
    });
  } else if (temp >= 38) {
    hazards.push({
      title: 'Severe Heat Stress',
      severity: 'high',
      description: `Temperature at ${temp}°C. Prolonged exposure will damage heat-sensitive crops and reduce pollen viability.`,
      farmingImpact: 'Apply shade cloth (30-50%) over delicate crops. Mulch heavily to preserve soil moisture. Avoid fertilizing during peak heat. Increase misting for hydroponic systems to prevent reservoir overheating.',
    });
  } else if (temp >= 35) {
    hazards.push({
      title: 'Heat Stress Warning',
      severity: 'medium',
      description: `Temperature at ${temp}°C. Warm-season crops tolerate this, but cool-season crops and seedlings may suffer.`,
      farmingImpact: 'Monitor soil moisture closely. Provide afternoon shade for lettuce, coriander, and brassicas. Check hydroponic EC; plants drink more and concentrate nutrients.',
    });
  }

  if (temp <= 8) {
    hazards.push({
      title: 'Cold Snap / Frost Risk',
      severity: 'high',
      description: `Temperature dropped to ${temp}°C. Unusual for most of Thailand except northern highlands. Tropical crops at severe risk.`,
      farmingImpact: 'Cover tender tropical plants with frost cloth or banana leaves. Move container plants indoors. Harvest mature fruits immediately. Hydroponic systems may need reservoir heaters in Chiang Rai/Mae Hong Son highlands.',
    });
  } else if (temp <= 15) {
    hazards.push({
      title: 'Cool Temperature Alert',
      severity: 'medium',
      description: `Temperature at ${temp}°C. Slows germination and growth of warm-season crops.`,
      farmingImpact: 'Delay sowing of chili, eggplant, and basil until temperatures recover. Good window for Chinese kale, coriander, and peas. Reduce irrigation frequency.',
    });
  }

  // --- Precipitation / Flood hazards ---
  if (precipitation >= 150) {
    hazards.push({
      title: 'Extreme Rainfall / Flash Flood',
      severity: 'extreme',
      description: `${precipitation}mm of rain in a short period. Risk of root rot, erosion, and infrastructure damage.`,
      farmingImpact: 'Ensure drainage channels are clear. Raised beds critical for papaya and eggplant. Empty excess hydroponic reservoir overflow. Check aquaponics for system contamination. Postpone fertilizing—nutrients will leach. Inspect for landslide risk on slopes.',
    });
  } else if (precipitation >= 80) {
    hazards.push({
      title: 'Heavy Rainfall Warning',
      severity: 'high',
      description: `${precipitation}mm of rain. Soil saturation increases disease pressure and nutrient leaching.`,
      farmingImpact: 'Improve drainage around beds. Stake tall plants (tomato, papaya) against lodging. Apply fungicide preventively for downy mildew and Phytophthora. Check NFT hydroponic channels for overflow.',
    });
  } else if (precipitation >= 40) {
    hazards.push({
      title: 'Moderate Heavy Rain',
      severity: 'medium',
      description: `${precipitation}mm of rain. Beneficial for most crops but watch for waterlogging in low areas.`,
      farmingImpact: 'Monitor soil drainage. Delay direct-seeding small seeds until soil firms up. Good time for transplanting provided beds are well-drained. Check for standing water in DWC systems.',
    });
  }

  if (precipitation === 0 && temp >= 33 && humidity < 40) {
    hazards.push({
      title: 'Drought / Dry Spell',
      severity: 'medium',
      description: 'No rain combined with high temperature and low humidity. Rapid soil drying and plant wilting.',
      farmingImpact: 'Increase drip irrigation frequency. Mulch all exposed soil. Prioritize water for fruiting crops. Hydroponic systems should top up reservoirs. Shade young seedlings during midday.',
    });
  }

  // --- Humidity hazards ---
  if (humidity >= 95 && temp >= 26) {
    hazards.push({
      title: 'Severe Humidity / Fungal Outbreak Risk',
      severity: 'high',
      description: `Humidity at ${humidity}% with warm temperatures. Ideal conditions for fungal and bacterial diseases.`,
      farmingImpact: 'Prune lower leaves for air circulation. Avoid overhead watering. Apply copper-based or bio-fungicide preventively. Harvest susceptible crops (tomato, cucumber) early to avoid fruit rot. Increase airflow in greenhouses and hydroponic setups.',
    });
  } else if (humidity >= 90 && temp >= 24) {
    hazards.push({
      title: 'High Humidity Warning',
      severity: 'medium',
      description: `Humidity at ${humidity}%. Powdery mildew, downy mildew, and anthracnose risk elevated.`,
      farmingImpact: 'Space plants for ventilation. Remove infected leaves promptly. Water at soil level only. In hydroponics, check for algae growth in humid reservoirs.',
    });
  }

  if (humidity <= 25 && temp >= 32) {
    hazards.push({
      title: 'Low Humidity / Desiccation Risk',
      severity: 'medium',
      description: `Humidity at ${humidity}% with high heat. Rapid transpiration and tip burn in leafy greens.`,
      farmingImpact: 'Mist sensitive crops (coriander, lettuce, basil) during midday. Increase irrigation. Hydroponic leafy greens may need lower EC to reduce osmotic stress.',
    });
  }

  // --- Wind hazards ---
  if (windSpeed >= 80) {
    hazards.push({
      title: 'Typhoon / Severe Storm',
      severity: 'extreme',
      description: `Sustained winds ${windSpeed} km/h. Structural damage, uprooting, and flying debris likely.`,
      farmingImpact: 'Evacuate if instructed. Harvest all mature produce. Secure or relocate light hydroponic equipment. Stake tall trees (papaya, banana) with guy ropes if time permits. After storm: check aquaponics for dead fish from oxygen depletion; inspect all structures.',
    });
  } else if (windSpeed >= 50) {
    hazards.push({
      title: 'Strong Wind Warning',
      severity: 'high',
      description: `Winds ${windSpeed} km/h. Risk of lodging in tall crops and damage to trellises and shade structures.`,
      farmingImpact: 'Stake tall crops (corn, papaya, banana). Secure greenhouse plastic and shade nets. Move container plants to sheltered areas. Delay spraying—drift will be severe.',
    });
  } else if (windSpeed >= 30) {
    hazards.push({
      title: 'Moderate Wind Alert',
      severity: 'medium',
      description: `Winds ${windSpeed} km/h. May desiccate young leaves and cause minor lodging.`,
      farmingImpact: 'Check trellis stability for beans and bitter melon. Young seedlings may need windbreaks. Aquaponics surface agitation may increase evaporation—top up water.',
    });
  }

  // --- Seasonal monsoon hazards ---
  if ((month >= 5 && month <= 10) && precipitation >= 60 && temp >= 28) {
    hazards.push({
      title: 'Monsoon Intensification',
      severity: 'medium',
      description: 'Southwest monsoon conditions with heavy rain and warm temperatures. Peak disease and pest pressure season.',
      farmingImpact: 'Focus on drainage infrastructure. Scout daily for caterpillars, fruit flies, and fungal spots. Harvest before prolonged wet spells. Post-hon drying critical for seeds and herbs.',
    });
  }

  if ((month >= 11 || month <= 2) && precipitation < 5 && temp >= 30) {
    hazards.push({
      title: 'Cool-Season Drought (Northeast Monsoon)',
      severity: 'medium',
      description: 'Dry northeast monsoon with high daytime temperatures and cool nights. Soil moisture depletes rapidly.',
      farmingImpact: 'Concentrate irrigation in early morning. Heavy mulch reduces evaporation. Good season for drought-tolerant crops (pineapple, aloe, bougainvillea). Reduce nitrogen fertilization to lower water demand.',
    });
  }

  // --- Regional specific (March–April pre-monsoon heat) ---
  if ((month === 3 || month === 4) && temp >= 36) {
    hazards.push({
      title: 'Pre-Monsoon Heat Spike',
      severity: 'high',
      description: 'April is typically the hottest month in Thailand. Intense solar radiation and dry air before rains arrive.',
      farmingImpact: 'Critical period for reservoir management. Shade cloth on all sensitive crops. Delay transplanting until evening. In hydroponics, use reservoir chillers or bury tanks to keep solution below 26°C.',
    });
  }

  return hazards.sort((a, b) => {
    const order = { extreme: 4, high: 3, medium: 2, low: 1 };
    return order[b.severity] - order[a.severity];
  });
}
