import type { PlantingWindow } from '@/types/calendar';

/**
 * Thailand-specific planting calendar data.
 * Month numbers: 1=Jan, 12=Dec
 * Thai seasons: Cool (Nov-Feb), Hot (Mar-May), Rainy (Jun-Oct)
 */
export const thaiPlantingCalendar: PlantingWindow[] = [
  // Vegetables
  { plantName: 'Kale', plantCategory: 'vegetable', sowOutdoors: { start: 10, end: 2 }, harvest: { start: 12, end: 4 }, notes: 'Best in cool season. Bolts quickly in heat.' },
  { plantName: 'Lettuce', plantCategory: 'vegetable', sowOutdoors: { start: 10, end: 1 }, harvest: { start: 11, end: 3 }, notes: 'Cool season only. Use shade cloth for extended season.' },
  { plantName: 'Tomato', plantCategory: 'vegetable', sowIndoors: { start: 9, end: 10 }, transplant: { start: 10, end: 11 }, harvest: { start: 1, end: 3 }, notes: 'Start in late rainy season, transplant for cool season harvest.' },
  { plantName: 'Chili Pepper', plantCategory: 'vegetable', sowIndoors: { start: 5, end: 7 }, transplant: { start: 7, end: 9 }, harvest: { start: 10, end: 3 }, notes: 'Year-round in Thailand, but best started in rainy season.' },
  { plantName: 'Cucumber', plantCategory: 'vegetable', sowOutdoors: { start: 6, end: 9 }, harvest: { start: 8, end: 11 }, notes: 'Loves rain and heat. Provide trellis for climbing.' },
  { plantName: 'Eggplant', plantCategory: 'vegetable', sowIndoors: { start: 5, end: 8 }, transplant: { start: 7, end: 10 }, harvest: { start: 10, end: 2 }, notes: 'Thai eggplant thrives in warm weather. Many varieties available.' },
  { plantName: 'Water Spinach', plantCategory: 'vegetable', sowOutdoors: { start: 3, end: 10 }, harvest: { start: 4, end: 11 }, notes: 'Morning glory/kangkong. Extremely fast growing in Thai climate. Year-round possible.' },
  { plantName: 'Chinese Cabbage', plantCategory: 'vegetable', sowOutdoors: { start: 10, end: 1 }, harvest: { start: 12, end: 3 }, notes: 'Cool season crop. Bolts quickly in warm weather.' },
  { plantName: 'Long Bean', plantCategory: 'vegetable', sowOutdoors: { start: 3, end: 9 }, harvest: { start: 5, end: 11 }, notes: 'Year-round in Thailand. Very productive in rainy season.' },
  { plantName: 'Bitter Melon', plantCategory: 'vegetable', sowOutdoors: { start: 3, end: 8 }, harvest: { start: 5, end: 10 }, notes: 'Loves heat and humidity. Needs strong trellis.' },
  { plantName: 'Okra', plantCategory: 'vegetable', sowOutdoors: { start: 3, end: 8 }, harvest: { start: 5, end: 11 }, notes: 'Thrives in Thai heat. Very productive.' },
  { plantName: 'Sweet Potato', plantCategory: 'vegetable', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 9, end: 12 }, notes: 'Plant cuttings in early rainy season. Excellent ground cover.' },
  { plantName: 'Corn', plantCategory: 'vegetable', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 7, end: 10 }, notes: 'Plant with onset of rains. Both sweet and field corn grow well.' },
  { plantName: 'Pumpkin', plantCategory: 'vegetable', sowOutdoors: { start: 6, end: 9 }, harvest: { start: 10, end: 1 }, notes: 'Thai pumpkins are smaller and sweeter. Love rainy season.' },
  { plantName: 'Radish', plantCategory: 'vegetable', sowOutdoors: { start: 10, end: 1 }, harvest: { start: 11, end: 2 }, notes: 'Very fast crop (30 days). Cool season for best results.' },
  { plantName: 'Carrot', plantCategory: 'vegetable', sowOutdoors: { start: 10, end: 12 }, harvest: { start: 1, end: 3 }, notes: 'Cool season only. Tropical varieties perform better.' },
  { plantName: 'Spinach', plantCategory: 'vegetable', sowOutdoors: { start: 10, end: 1 }, harvest: { start: 11, end: 3 }, notes: 'Cool season. Consider Malabar spinach for year-round heat-tolerant alternative.' },
  { plantName: 'Malabar Spinach', plantCategory: 'vegetable', sowOutdoors: { start: 3, end: 9 }, harvest: { start: 5, end: 11 }, notes: 'Heat-loving spinach alternative. Climbing vine, very productive.' },

  // Herbs
  { plantName: 'Thai Basil', plantCategory: 'herb', sowOutdoors: { start: 3, end: 10 }, harvest: { start: 4, end: 12 }, notes: 'Year-round in Thailand. Pinch flowers for continuous leaf production.' },
  { plantName: 'Holy Basil', plantCategory: 'herb', sowOutdoors: { start: 3, end: 10 }, harvest: { start: 4, end: 12 }, notes: 'Krapao. Essential for Thai cooking. Year-round growing.' },
  { plantName: 'Cilantro', plantCategory: 'herb', sowOutdoors: { start: 10, end: 1 }, harvest: { start: 11, end: 3 }, notes: 'Cool season only. Bolts very quickly in heat. Succession sow every 2 weeks.' },
  { plantName: 'Lemongrass', plantCategory: 'herb', sowOutdoors: { start: 5, end: 9 }, harvest: { start: 8, end: 12 }, notes: 'Plant divisions in rainy season. Extremely hardy once established.' },
  { plantName: 'Galangal', plantCategory: 'herb', sowOutdoors: { start: 4, end: 7 }, harvest: { start: 10, end: 2 }, notes: 'Plant rhizome pieces. Takes 8-10 months to mature.' },
  { plantName: 'Turmeric', plantCategory: 'herb', sowOutdoors: { start: 4, end: 6 }, harvest: { start: 12, end: 2 }, notes: 'Plant rhizomes at start of rainy season. Harvest when leaves yellow.' },
  { plantName: 'Ginger', plantCategory: 'herb', sowOutdoors: { start: 3, end: 5 }, harvest: { start: 11, end: 1 }, notes: 'Plant rhizomes early rainy season. Partial shade preferred.' },
  { plantName: 'Mint', plantCategory: 'herb', sowOutdoors: { start: 10, end: 2 }, harvest: { start: 11, end: 4 }, notes: 'Prefers cool season. Keep in containers - very invasive.' },
  { plantName: 'Pandan', plantCategory: 'herb', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Plant divisions. Year-round harvest once established. Loves moisture.' },
  { plantName: 'Kaffir Lime', plantCategory: 'herb', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Leaves harvestable year-round. Fruits primarily in rainy season.' },

  // Fruits
  { plantName: 'Papaya', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Fast growing. Fruits 8-10 months from seed. Year-round production.' },
  { plantName: 'Banana', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Plant suckers in rainy season. Many Thai varieties available.' },
  { plantName: 'Dragon Fruit', plantCategory: 'fruit', sowOutdoors: { start: 3, end: 6 }, harvest: { start: 6, end: 11 }, notes: 'Needs strong post/trellis. Fruits mainly in rainy/cool season.' },
  { plantName: 'Passion Fruit', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 10, end: 3 }, notes: 'Fast growing vine. Needs sturdy trellis. Fruits in 6-8 months.' },
  { plantName: 'Mango', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 3, end: 6 }, notes: 'Thailand has many varieties. Fruits in hot season. Grafted trees produce faster.' },
  { plantName: 'Guava', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Year-round fruiting in Thailand. Very hardy and productive.' },
  { plantName: 'Starfruit', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Year-round fruiting. Prefers partial shade when young.' },
  { plantName: 'Lime', plantCategory: 'fruit', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Essential in Thai cooking. Year-round production. Many Thai varieties.' },

  // Flowers
  { plantName: 'Marigold', plantCategory: 'flower', sowOutdoors: { start: 6, end: 10 }, harvest: { start: 9, end: 2 }, notes: 'Used in Thai ceremonies (ดอกดาวเรือง). Also excellent pest deterrent.' },
  { plantName: 'Jasmine', plantCategory: 'flower', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Thai national flower (ดอกมะลิ). Year-round flowering. Fragrant.' },
  { plantName: 'Orchid', plantCategory: 'flower', sowOutdoors: { start: 3, end: 6 }, harvest: { start: 1, end: 12 }, notes: 'Thailand is a major orchid producer. Many varieties available. Mount on trees or in baskets.' },
  { plantName: 'Sunflower', plantCategory: 'flower', sowOutdoors: { start: 10, end: 1 }, harvest: { start: 12, end: 3 }, notes: 'Cool season for best results. Popular in Lopburi and Saraburi.' },

  // Medicinal
  { plantName: 'Aloe Vera', plantCategory: 'medicinal', sowOutdoors: { start: 1, end: 12 }, harvest: { start: 1, end: 12 }, notes: 'Year-round planting and harvesting. Needs well-draining soil.' },
  { plantName: 'Moringa', plantCategory: 'medicinal', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 1, end: 12 }, notes: 'Extremely fast growing. Leaves harvestable year-round once established.' },
  { plantName: 'Butterfly Pea', plantCategory: 'medicinal', sowOutdoors: { start: 5, end: 8 }, harvest: { start: 7, end: 12 }, notes: 'อัญชัน - used for blue tea and food coloring. Easy to grow climbing vine.' },
  { plantName: 'Centella Asiatica', plantCategory: 'medicinal', sowOutdoors: { start: 5, end: 9 }, harvest: { start: 1, end: 12 }, notes: 'บัวบก - Traditional Thai medicinal herb. Ground cover. Loves moisture.' },
];

export function getPlantingWindowsForMonth(month: number): PlantingWindow[] {
  return thaiPlantingCalendar.filter((p) => {
    const inWindow = (window?: { start: number; end: number }) => {
      if (!window) return false;
      if (window.start <= window.end) {
        return month >= window.start && month <= window.end;
      }
      // Wraps around year (e.g., Oct-Feb = 10-2)
      return month >= window.start || month <= window.end;
    };

    return inWindow(p.sowIndoors) || inWindow(p.sowOutdoors) || inWindow(p.transplant) || inWindow(p.harvest);
  });
}

export function getActivityForPlant(plant: PlantingWindow, month: number): string[] {
  const activities: string[] = [];

  const inWindow = (window?: { start: number; end: number }) => {
    if (!window) return false;
    if (window.start <= window.end) {
      return month >= window.start && month <= window.end;
    }
    return month >= window.start || month <= window.end;
  };

  if (inWindow(plant.sowIndoors)) activities.push('Sow indoors');
  if (inWindow(plant.sowOutdoors)) activities.push('Sow outdoors');
  if (inWindow(plant.transplant)) activities.push('Transplant');
  if (inWindow(plant.harvest)) activities.push('Harvest');

  return activities;
}
