import type { PlantingWindow, PlantCategory } from '@/types';

export const thaiPlants: PlantingWindow[] = [
  // Vegetables
  {
    plantName: 'Thai Bird Chili (Prik Kee Noo)',
    plantCategory: 'vegetable' as PlantCategory,
    sowIndoors: { start: 1, end: 3 },
    sowOutdoors: { start: 3, end: 6 },
    transplant: { start: 4, end: 7 },
    harvest: { start: 6, end: 11 },
    notes: 'Thai staple. Loves heat. Start indoors early rainy season. Pick frequently to prolong production. Watch for thrips in dry season.',
  },
  {
    plantName: 'Thai Eggplant (Makhuea Pro)',
    plantCategory: 'vegetable' as PlantCategory,
    sowIndoors: { start: 11, end: 2 },
    sowOutdoors: { start: 2, end: 5 },
    transplant: { start: 3, end: 6 },
    harvest: { start: 5, end: 9 },
    notes: 'Small round green-white variety. Needs warm nights above 18°C. Mulch heavily during hot season. Susceptible to fruit and shoot borer.',
  },
  {
    plantName: 'Long Bean (Thua Pluak)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 3, end: 5 },
    harvest: { start: 5, end: 10 },
    notes: 'Fast-growing legume for rainy season. Needs trellis support. Harvest daily when young. Fixes nitrogen; good for crop rotation.',
  },
  {
    plantName: 'Morning Glory (Pak Boong)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 3, end: 10 },
    harvest: { start: 4, end: 11 },
    notes: 'Grows incredibly fast in wet conditions. Can be grown in water or soil. Cut-and-come-again. Watch for caterpillars.',
  },
  {
    plantName: 'Thai Bitter Melon (Mara Khee Nok)',
    plantCategory: 'vegetable' as PlantCategory,
    sowIndoors: { start: 2, end: 4 },
    sowOutdoors: { start: 3, end: 6 },
    transplant: { start: 4, end: 7 },
    harvest: { start: 6, end: 10 },
    notes: 'Vining crop for warm rainy season. Needs strong trellis. Harvest when fruits are firm and light green. Popular in Thai soups.',
  },
  {
    plantName: 'Chinese Kale (Pak Kana)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 10, end: 2 },
    harvest: { start: 11, end: 3 },
    notes: 'Cool-season brassica for Thai highlands and cool months. Bolts quickly above 25°C. Best in Chiang Mai cool season.',
  },
  {
    plantName: 'Winged Bean (Thua Phuu)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 4, end: 7 },
    harvest: { start: 6, end: 11 },
    notes: 'Tropical legume; every part is edible. Needs strong trellis. Loves humidity. Scarify seeds for better germination.',
  },
  {
    plantName: 'Okra (Krachiap Khao)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 2, end: 5 },
    harvest: { start: 4, end: 9 },
    notes: 'Drought-tolerant once established. Harvest pods when 7-10 cm. Pick every 2 days or pods become woody.',
  },
  {
    plantName: 'Yardlong Bean (Thua Fak Yao)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 3, end: 6 },
    harvest: { start: 5, end: 10 },
    notes: 'Classic Thai stir-fry ingredient. Fast-growing. Needs vertical support. High yielder in humid conditions.',
  },
  {
    plantName: 'Thai Cucumber (Taeng Raet)',
    plantCategory: 'vegetable' as PlantCategory,
    sowOutdoors: { start: 2, end: 5 },
    harvest: { start: 4, end: 8 },
    notes: 'Heat-tolerant variety. Needs ample water and afternoon shade in hot season. Harvest before seeds harden.',
  },
  // Herbs
  {
    plantName: 'Thai Basil (Bai Horapha)',
    plantCategory: 'herb' as PlantCategory,
    sowIndoors: { start: 1, end: 12 },
    sowOutdoors: { start: 3, end: 10 },
    harvest: { start: 4, end: 11 },
    notes: 'Anise-licorice aroma. Essential for green curry. Pinch flowers to prolong leaf production. Does not tolerate waterlogging.',
  },
  {
    plantName: 'Holy Basil (Bai Kraphao)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 3, end: 9 },
    harvest: { start: 5, end: 11 },
    notes: 'Peppery, clove-like flavor for pad kraphao. Very heat-tolerant. Drought-hardy once established. Self-seeds readily.',
  },
  {
    plantName: 'Lemongrass (Ta Khai)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 2, end: 5 },
    harvest: { start: 6, end: 12 },
    notes: 'Divide clumps to propagate. Needs rich soil and moisture. Harvest outer stalks. Protect from flooding.',
  },
  {
    plantName: 'Galangal (Kha)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 3, end: 6 },
    harvest: { start: 8, end: 12 },
    notes: 'Plant rhizome pieces with buds. Takes 8-10 months to mature. Shade-tolerant. Leave some rhizomes to regrow.',
  },
  {
    plantName: 'Coriander (Phak Chi)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 10, end: 2 },
    harvest: { start: 11, end: 3 },
    notes: 'Cool-season herb. Bolts rapidly in Thai heat. Sow successively every 2 weeks. Partial shade helps in warmer months.',
  },
  {
    plantName: 'Vietnamese Coriander (Phak Phai)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 4, end: 9 },
    harvest: { start: 6, end: 11 },
    notes: 'Heat-loving alternative to coriander. Grows in wet conditions. Propagate from cuttings. Peppery, citrus flavor.',
  },
  {
    plantName: 'Turmeric (Khamin)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 3, end: 5 },
    harvest: { start: 10, end: 12 },
    notes: 'Plant fresh rhizomes. Needs rich, well-drained soil. Harvest after foliage dies back. Shade-tolerant understory crop.',
  },
  // Fruits
  {
    plantName: 'Papaya (Malako)',
    plantCategory: 'fruit' as PlantCategory,
    sowOutdoors: { start: 2, end: 5 },
    harvest: { start: 8, end: 12 },
    notes: 'Fast-growing tropical fruit. Needs excellent drainage—raised beds essential. Separate male/female plants. Dwarf varieties good for home gardens.',
  },
  {
    plantName: 'Pineapple (Sapparot)',
    plantCategory: 'fruit' as PlantCategory,
    sowOutdoors: { start: 5, end: 7 },
    harvest: { start: 11, end: 3 },
    notes: 'Plant crowns or suckers. Extremely drought-tolerant. Avoid waterlogged soil. Takes 12-18 months to fruit.',
  },
  {
    plantName: 'Banana (Kluai)',
    plantCategory: 'fruit' as PlantCategory,
    sowOutdoors: { start: 3, end: 6 },
    harvest: { start: 10, end: 4 },
    notes: 'Plant suckers during rainy season. Heavy feeder—mulch with banana pseudostem. Protect from strong winds.',
  },
  {
    plantName: 'Dragon Fruit (Kaeo Mangkon)',
    plantCategory: 'fruit' as PlantCategory,
    sowOutdoors: { start: 3, end: 6 },
    harvest: { start: 6, end: 11 },
    notes: 'Cactus—needs support post or trellis. Avoid overwatering. Night-blooming flowers. Self-fertile varieties available.',
  },
  {
    plantName: 'Guava (Farang)',
    plantCategory: 'fruit' as PlantCategory,
    sowOutdoors: { start: 4, end: 7 },
    harvest: { start: 9, end: 3 },
    notes: 'Hardy tropical fruit. Can fruit in first year from grafted trees. Prune for air circulation to prevent fungal issues.',
  },
  // Flowers
  {
    plantName: 'Marigold (Dao Ruang)',
    plantCategory: 'flower' as PlantCategory,
    sowIndoors: { start: 8, end: 10 },
    sowOutdoors: { start: 9, end: 11 },
    harvest: { start: 11, end: 3 },
    notes: 'Popular for religious offerings. Deters nematodes—excellent companion plant. Deadhead for continuous blooms.',
  },
  {
    plantName: 'Jasmine (Mali)',
    plantCategory: 'flower' as PlantCategory,
    sowOutdoors: { start: 5, end: 7 },
    harvest: { start: 8, end: 4 },
    notes: 'National flower of Thailand. Fragrant blooms for garlands. Needs full sun and well-drained soil. Prune after flowering.',
  },
  {
    plantName: 'Bougainvillea (Fueng Fah)',
    plantCategory: 'flower' as PlantCategory,
    sowOutdoors: { start: 4, end: 6 },
    harvest: { start: 6, end: 3 },
    notes: 'Drought-tolerant once established. Stunning bracts in dry season. Do not overwater—stress promotes flowering.',
  },
  {
    plantName: 'Butterfly Pea (Anchan)',
    plantCategory: 'flower' as PlantCategory,
    sowOutdoors: { start: 3, end: 6 },
    harvest: { start: 5, end: 11 },
    notes: 'Edible blue flowers for rice and drinks. Nitrogen-fixing vine. Loves heat and humidity. Trellis recommended.',
  },
  {
    plantName: 'Torch Ginger (Dala)',
    plantCategory: 'flower' as PlantCategory,
    sowOutdoors: { start: 4, end: 6 },
    harvest: { start: 8, end: 3 },
    notes: 'Stunning red inflorescences. Young buds used in Thai salads. Needs shade and very moist, rich soil.',
  },
  // Medicinal
  {
    plantName: 'Andrographis (Fah Talai Jone)',
    plantCategory: 'medicinal' as PlantCategory,
    sowOutdoors: { start: 5, end: 7 },
    harvest: { start: 7, end: 10 },
    notes: 'Thai traditional cold remedy. Very bitter leaves. Fast-growing annual. Harvest before flowering for strongest potency.',
  },
  {
    plantName: 'Aloe Vera (Wan Hang Kharok)',
    plantCategory: 'medicinal' as PlantCategory,
    sowOutdoors: { start: 3, end: 5 },
    harvest: { start: 6, end: 12 },
    notes: 'Succulent for burns and skin care. Needs sandy, well-drained soil. Minimal water. Shade in peak hot season.',
  },
  {
    plantName: 'Gotu Kola (Bua Bok)',
    plantCategory: 'medicinal' as PlantCategory,
    sowOutdoors: { start: 4, end: 9 },
    harvest: { start: 6, end: 11 },
    notes: 'Medicinal ground cover for memory and skin health. Loves moisture and shade. Can grow in boggy areas. Harvest leaves continuously.',
  },
  {
    plantName: 'Noni (Yao)',
    plantCategory: 'medicinal' as PlantCategory,
    sowOutdoors: { start: 5, end: 7 },
    harvest: { start: 10, end: 4 },
    notes: 'Hardy medicinal tree. Fruits year-round once mature. Very tolerant of poor soil and coastal conditions. Strong smell when fruiting.',
  },
  {
    plantName: 'Pandan (Bai Toey)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 4, end: 7 },
    harvest: { start: 7, end: 12 },
    notes: 'Aromatic leaves for desserts and rice. Shade-tolerant. Needs consistent moisture. Propagate by suckers.',
  },
  {
    plantName: 'Chives (Kui Chai)',
    plantCategory: 'herb' as PlantCategory,
    sowOutdoors: { start: 10, end: 2 },
    harvest: { start: 11, end: 4 },
    notes: 'Garlic chives popular in Thai cooking. Cool-season crop. Divide clumps to propagate. Harvest by cutting leaves to base.',
  },
];

export function getPlantingWindowsForMonth(month: number): PlantingWindow[] {
  if (month < 1 || month > 12) return [];
  return thaiPlants.filter((p) => {
    const windows = [p.sowIndoors, p.sowOutdoors, p.transplant, p.harvest].filter(Boolean) as { start: number; end: number }[];
    return windows.some((w) => {
      if (w.start <= w.end) {
        return month >= w.start && month <= w.end;
      }
      // Wraps around year end (e.g., start 11, end 2)
      return month >= w.start || month <= w.end;
    });
  });
}

export function getActivityForPlant(
  plant: PlantingWindow,
  month: number
): { type: 'sow_indoors' | 'sow_outdoors' | 'transplant' | 'harvest' | 'none'; active: boolean; message: string }[] {
  if (month < 1 || month > 12) return [];

  const inWindow = (w?: { start: number; end: number }) => {
    if (!w) return false;
    if (w.start <= w.end) return month >= w.start && month <= w.end;
    return month >= w.start || month <= w.end;
  };

  return [
    {
      type: 'sow_indoors',
      active: inWindow(plant.sowIndoors),
      message: inWindow(plant.sowIndoors) ? 'Ideal time to sow indoors' : 'Not in indoor sowing window',
    },
    {
      type: 'sow_outdoors',
      active: inWindow(plant.sowOutdoors),
      message: inWindow(plant.sowOutdoors) ? 'Ideal time to sow outdoors' : 'Not in outdoor sowing window',
    },
    {
      type: 'transplant',
      active: inWindow(plant.transplant),
      message: inWindow(plant.transplant) ? 'Ideal time to transplant seedlings' : 'Not in transplant window',
    },
    {
      type: 'harvest',
      active: inWindow(plant.harvest),
      message: inWindow(plant.harvest) ? 'Harvest window is open' : 'Not in harvest window',
    },
  ];
}
