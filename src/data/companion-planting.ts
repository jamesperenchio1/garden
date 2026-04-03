import type { CompanionRelationship, Compatibility } from '@/types/companion';

// Comprehensive companion planting data with focus on Thai garden plants
export const companionData: CompanionRelationship[] = [
  // Tomato companions
  { plant1: 'Tomato', plant2: 'Basil', compatibility: 'beneficial', reason: 'Basil repels aphids, flies, and mosquitoes. Improves tomato flavor and growth.' },
  { plant1: 'Tomato', plant2: 'Carrot', compatibility: 'beneficial', reason: 'Carrots loosen soil for tomato roots. Tomatoes provide shade for carrots.' },
  { plant1: 'Tomato', plant2: 'Marigold', compatibility: 'beneficial', reason: 'Marigolds repel nematodes, whiteflies, and other pests from tomatoes.' },
  { plant1: 'Tomato', plant2: 'Pepper', compatibility: 'beneficial', reason: 'Similar growing requirements. Peppers deter some tomato pests.' },
  { plant1: 'Tomato', plant2: 'Fennel', compatibility: 'harmful', reason: 'Fennel inhibits tomato growth through allelopathic chemicals.' },
  { plant1: 'Tomato', plant2: 'Cabbage', compatibility: 'harmful', reason: 'Both are heavy feeders and compete for nutrients. Tomatoes stunt brassica growth.' },
  { plant1: 'Tomato', plant2: 'Corn', compatibility: 'harmful', reason: 'Both attract the same pests (tomato hornworm/corn earworm).' },

  // Thai Basil companions
  { plant1: 'Thai Basil', plant2: 'Pepper', compatibility: 'beneficial', reason: 'Basil improves pepper flavor and repels aphids, spider mites, and mosquitoes.' },
  { plant1: 'Thai Basil', plant2: 'Tomato', compatibility: 'beneficial', reason: 'Classic companion. Basil repels flies and mosquitoes, enhances tomato flavor.' },
  { plant1: 'Thai Basil', plant2: 'Lettuce', compatibility: 'beneficial', reason: 'Basil repels slugs and aphids that attack lettuce.' },
  { plant1: 'Thai Basil', plant2: 'Sage', compatibility: 'harmful', reason: 'Sage can inhibit basil growth. Both produce strong essential oils that conflict.' },

  // Chili/Pepper companions
  { plant1: 'Chili Pepper', plant2: 'Tomato', compatibility: 'beneficial', reason: 'Similar growing needs. Peppers benefit from tomato shade in hot Thai climate.' },
  { plant1: 'Chili Pepper', plant2: 'Carrot', compatibility: 'beneficial', reason: 'Carrots help break up soil. Peppers provide shade for carrots.' },
  { plant1: 'Chili Pepper', plant2: 'Onion', compatibility: 'beneficial', reason: 'Onions deter many pests. Good ground cover around peppers.' },
  { plant1: 'Chili Pepper', plant2: 'Fennel', compatibility: 'harmful', reason: 'Fennel inhibits pepper growth through root secretions.' },
  { plant1: 'Chili Pepper', plant2: 'Bean', compatibility: 'harmful', reason: 'Beans can shade out peppers and both compete for space.' },

  // Lettuce companions
  { plant1: 'Lettuce', plant2: 'Carrot', compatibility: 'beneficial', reason: 'Lettuce shades soil keeping carrots cool. Different root depths avoid competition.' },
  { plant1: 'Lettuce', plant2: 'Radish', compatibility: 'beneficial', reason: 'Radishes mature fast and break up soil before lettuce needs the space.' },
  { plant1: 'Lettuce', plant2: 'Strawberry', compatibility: 'beneficial', reason: 'Good ground cover combination. Lettuce keeps soil moist for strawberries.' },
  { plant1: 'Lettuce', plant2: 'Celery', compatibility: 'harmful', reason: 'Both are heavy water users and compete in similar root zones.' },

  // Kale companions
  { plant1: 'Kale', plant2: 'Beet', compatibility: 'beneficial', reason: 'Different root depths. Beets add minerals to soil that benefit kale.' },
  { plant1: 'Kale', plant2: 'Celery', compatibility: 'beneficial', reason: 'Celery repels white cabbage butterfly that attacks kale.' },
  { plant1: 'Kale', plant2: 'Onion', compatibility: 'beneficial', reason: 'Onions repel many kale pests including aphids and flea beetles.' },
  { plant1: 'Kale', plant2: 'Marigold', compatibility: 'beneficial', reason: 'Marigolds trap aphids and repel other kale pests.' },
  { plant1: 'Kale', plant2: 'Strawberry', compatibility: 'harmful', reason: 'Kale and strawberries compete for similar nutrients and space.' },
  { plant1: 'Kale', plant2: 'Tomato', compatibility: 'harmful', reason: 'Both are heavy feeders competing for the same nutrients.' },

  // Cucumber companions
  { plant1: 'Cucumber', plant2: 'Bean', compatibility: 'beneficial', reason: 'Beans fix nitrogen that cucumbers love. Good trellis sharing.' },
  { plant1: 'Cucumber', plant2: 'Corn', compatibility: 'beneficial', reason: 'Corn provides natural trellis and shade for cucumbers.' },
  { plant1: 'Cucumber', plant2: 'Dill', compatibility: 'beneficial', reason: 'Dill attracts beneficial predator insects that protect cucumbers.' },
  { plant1: 'Cucumber', plant2: 'Sunflower', compatibility: 'beneficial', reason: 'Sunflowers attract pollinators and provide support structure.' },
  { plant1: 'Cucumber', plant2: 'Potato', compatibility: 'harmful', reason: 'Both are susceptible to blight. Potatoes compete for water.' },
  { plant1: 'Cucumber', plant2: 'Melon', compatibility: 'harmful', reason: 'Cross-pollination risk and same pest susceptibility.' },

  // Lemongrass (Thai staple)
  { plant1: 'Lemongrass', plant2: 'Tomato', compatibility: 'beneficial', reason: 'Lemongrass repels whiteflies, mosquitoes, and other pests from tomatoes.' },
  { plant1: 'Lemongrass', plant2: 'Pepper', compatibility: 'beneficial', reason: 'Strong citronella scent deters many common pepper pests.' },
  { plant1: 'Lemongrass', plant2: 'Marigold', compatibility: 'beneficial', reason: 'Both are excellent pest deterrents. Together they create a pest barrier.' },
  { plant1: 'Lemongrass', plant2: 'Mint', compatibility: 'neutral', reason: 'Both spread aggressively. Keep contained to prevent competition.' },

  // Morning Glory / Kangkong (Water Spinach - Thai staple)
  { plant1: 'Water Spinach', plant2: 'Lettuce', compatibility: 'beneficial', reason: 'Water spinach provides shade for heat-sensitive lettuce in Thai climate.' },
  { plant1: 'Water Spinach', plant2: 'Mint', compatibility: 'neutral', reason: 'Both enjoy moist conditions but can compete if unmanaged.' },

  // Papaya
  { plant1: 'Papaya', plant2: 'Banana', compatibility: 'beneficial', reason: 'Bananas provide wind protection. Similar tropical growing conditions.' },
  { plant1: 'Papaya', plant2: 'Lemongrass', compatibility: 'beneficial', reason: 'Lemongrass deters pests and acts as ground cover around papaya.' },
  { plant1: 'Papaya', plant2: 'Sweet Potato', compatibility: 'beneficial', reason: 'Sweet potato acts as living mulch, keeping soil moist for papaya.' },

  // Cilantro/Coriander (pak chee - Thai staple)
  { plant1: 'Cilantro', plant2: 'Tomato', compatibility: 'beneficial', reason: 'Cilantro attracts beneficial insects and repels aphids from tomatoes.' },
  { plant1: 'Cilantro', plant2: 'Pepper', compatibility: 'beneficial', reason: 'Attracts hoverflies that eat aphids on peppers.' },
  { plant1: 'Cilantro', plant2: 'Spinach', compatibility: 'beneficial', reason: 'Both enjoy cooler conditions. Good succession planting partners.' },
  { plant1: 'Cilantro', plant2: 'Fennel', compatibility: 'harmful', reason: 'Cross-pollination can affect cilantro seed quality.' },

  // Mint companions
  { plant1: 'Mint', plant2: 'Cabbage', compatibility: 'beneficial', reason: 'Mint repels cabbage moths, flea beetles, and ants.' },
  { plant1: 'Mint', plant2: 'Tomato', compatibility: 'beneficial', reason: 'Mint deters aphids and improves tomato health. Keep mint contained.' },
  { plant1: 'Mint', plant2: 'Parsley', compatibility: 'harmful', reason: 'Both spread aggressively and compete for the same space and nutrients.' },

  // Eggplant
  { plant1: 'Eggplant', plant2: 'Pepper', compatibility: 'beneficial', reason: 'Similar growing needs. Peppers help deter some eggplant pests.' },
  { plant1: 'Eggplant', plant2: 'Marigold', compatibility: 'beneficial', reason: 'Marigolds repel nematodes and beetles that attack eggplant.' },
  { plant1: 'Eggplant', plant2: 'Bean', compatibility: 'beneficial', reason: 'Beans fix nitrogen that eggplant needs for fruiting.' },
  { plant1: 'Eggplant', plant2: 'Fennel', compatibility: 'harmful', reason: 'Fennel root secretions inhibit eggplant growth.' },

  // Dragon Fruit
  { plant1: 'Dragon Fruit', plant2: 'Marigold', compatibility: 'beneficial', reason: 'Marigolds attract pollinators essential for dragon fruit flowering.' },
  { plant1: 'Dragon Fruit', plant2: 'Lemongrass', compatibility: 'beneficial', reason: 'Lemongrass deters pests and acts as ground cover for dragon fruit posts.' },

  // Galangal (Thai ginger)
  { plant1: 'Galangal', plant2: 'Turmeric', compatibility: 'beneficial', reason: 'Similar growing conditions. Both enjoy shade and moisture.' },
  { plant1: 'Galangal', plant2: 'Lemongrass', compatibility: 'beneficial', reason: 'Both are Thai kitchen garden staples. Lemongrass provides pest protection.' },

  // Bean companions
  { plant1: 'Bean', plant2: 'Corn', compatibility: 'beneficial', reason: 'Classic Three Sisters companion. Beans fix nitrogen for corn, corn provides support.' },
  { plant1: 'Bean', plant2: 'Squash', compatibility: 'beneficial', reason: 'Three Sisters. Squash provides ground cover reducing weeds.' },
  { plant1: 'Bean', plant2: 'Onion', compatibility: 'harmful', reason: 'Onions inhibit bean growth through chemical compounds.' },
  { plant1: 'Bean', plant2: 'Garlic', compatibility: 'harmful', reason: 'Garlic inhibits bean growth. Keep well separated.' },

  // Marigold (universal companion)
  { plant1: 'Marigold', plant2: 'Most vegetables', compatibility: 'beneficial', reason: 'Marigolds repel nematodes, whiteflies, and many pests. Attract pollinators.' },

  // Sunflower
  { plant1: 'Sunflower', plant2: 'Corn', compatibility: 'beneficial', reason: 'Both attract pollinators. Sunflowers can serve as trap crops for pests.' },
  { plant1: 'Sunflower', plant2: 'Squash', compatibility: 'beneficial', reason: 'Sunflowers attract pollinators crucial for squash production.' },
  { plant1: 'Sunflower', plant2: 'Potato', compatibility: 'harmful', reason: 'Sunflower root compounds can inhibit potato growth.' },
];

/**
 * Get all unique plant names from the companion database.
 */
export function getAllCompanionPlants(): string[] {
  const plants = new Set<string>();
  companionData.forEach((r) => {
    plants.add(r.plant1);
    plants.add(r.plant2);
  });
  return Array.from(plants).sort();
}

/**
 * Look up companion compatibility between two plants.
 */
export function getCompanionship(plant1: string, plant2: string): CompanionRelationship | undefined {
  return companionData.find(
    (r) =>
      (r.plant1.toLowerCase() === plant1.toLowerCase() && r.plant2.toLowerCase() === plant2.toLowerCase()) ||
      (r.plant1.toLowerCase() === plant2.toLowerCase() && r.plant2.toLowerCase() === plant1.toLowerCase())
  );
}

/**
 * Get all companions for a specific plant.
 */
export function getCompanionsFor(plant: string): { name: string; compatibility: Compatibility; reason: string }[] {
  const companions: { name: string; compatibility: Compatibility; reason: string }[] = [];

  companionData.forEach((r) => {
    if (r.plant1.toLowerCase() === plant.toLowerCase()) {
      companions.push({ name: r.plant2, compatibility: r.compatibility, reason: r.reason });
    } else if (r.plant2.toLowerCase() === plant.toLowerCase()) {
      companions.push({ name: r.plant1, compatibility: r.compatibility, reason: r.reason });
    }
  });

  return companions;
}
