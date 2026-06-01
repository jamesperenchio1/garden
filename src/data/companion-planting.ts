import type { CompanionRelation } from '@/types';

export const companionRelations: CompanionRelation[] = [
  // Beneficial pairs
  { plantA: 'Thai Bird Chili (Prik Kee Noo)', plantB: 'Marigold (Dao Ruang)', relationship: 'beneficial', reason: 'Marigold roots deter nematodes that attack chili roots.' },
  { plantA: 'Thai Bird Chili (Prik Kee Noo)', plantB: 'Thai Basil (Bai Horapha)', relationship: 'beneficial', reason: 'Basil may repel aphids, whitefly, and improve chili flavor.' },
  { plantA: 'Thai Eggplant (Makhuea Pro)', plantB: 'Marigold (Dao Ruang)', relationship: 'beneficial', reason: 'Marigolds suppress root-knot nematodes common in eggplant.' },
  { plantA: 'Thai Eggplant (Makhuea Pro)', plantB: 'Thai Basil (Bai Horapha)', relationship: 'beneficial', reason: 'Basil masks eggplant from flea beetles and spider mites.' },
  { plantA: 'Long Bean (Thua Pluak)', plantB: 'Corn', relationship: 'beneficial', reason: 'Beans fix nitrogen for heavy-feeding corn; corn provides support.' },
  { plantA: 'Long Bean (Thua Pluak)', plantB: 'Okra (Krachiap Khao)', relationship: 'beneficial', reason: 'Similar cultural needs; okra provides light shade for bean roots.' },
  { plantA: 'Morning Glory (Pak Boong)', plantB: 'Long Bean (Thua Pluak)', relationship: 'beneficial', reason: 'Different root zones reduce competition; bean trellis shades water bed.' },
  { plantA: 'Thai Bitter Melon (Mara Khee Nok)', plantB: 'Nasturtium', relationship: 'beneficial', reason: 'Nasturtium traps aphids away from melon vines.' },
  { plantA: 'Thai Bitter Melon (Mara Khee Nok)', plantB: 'Thai Basil (Bai Horapha)', relationship: 'beneficial', reason: 'Basil repels flies and mosquitoes around melon foliage.' },
  { plantA: 'Chinese Kale (Pak Kana)', plantB: 'Dill', relationship: 'beneficial', reason: 'Dill attracts beneficial wasps that prey on brassica caterpillars.' },
  { plantA: 'Chinese Kale (Pak Kana)', plantB: 'Coriander (Phak Chi)', relationship: 'beneficial', reason: 'Coriander attracts hoverflies that eat aphids on kale.' },
  { plantA: 'Winged Bean (Thua Phuu)', plantB: 'Corn', relationship: 'beneficial', reason: 'Winged beans climb corn stalks and fix nitrogen.' },
  { plantA: 'Winged Bean (Thua Phuu)', plantB: 'Okra (Krachiap Khao)', relationship: 'beneficial', reason: 'Okra provides partial shade during hottest months.' },
  { plantA: 'Okra (Krachiap Khao)', plantB: 'Peppermint', relationship: 'beneficial', reason: 'Mint may deter ants and aphids; keep mint contained.' },
  { plantA: 'Yardlong Bean (Thua Fak Yao)', plantB: 'Corn', relationship: 'beneficial', reason: 'Classic three-sisters complement; beans climb corn and fix nitrogen.' },
  { plantA: 'Thai Cucumber (Taeng Raet)', plantB: 'Nasturtium', relationship: 'beneficial', reason: 'Nasturtiums lure cucumber beetles and aphids away.' },
  { plantA: 'Thai Cucumber (Taeng Raet)', plantB: 'Coriander (Phak Chi)', relationship: 'beneficial', reason: 'Coriander flowers attract pollinators and predatory insects.' },
  { plantA: 'Thai Basil (Bai Horapha)', plantB: 'Tomato', relationship: 'beneficial', reason: 'Basil repels thrips, flies, and mosquitoes; may improve tomato flavor.' },
  { plantA: 'Thai Basil (Bai Horapha)', plantB: 'Thai Cucumber (Taeng Raet)', relationship: 'beneficial', reason: 'Basil deters pests common to cucurbits.' },
  { plantA: 'Holy Basil (Bai Kraphao)', plantB: 'Pepper', relationship: 'beneficial', reason: 'Holy basil may repel spider mites and aphids from pepper plants.' },
  { plantA: 'Lemongrass (Ta Khai)', plantB: 'Thai Eggplant (Makhuea Pro)', relationship: 'beneficial', reason: 'Lemongrass deters aphids and whitefly; tall growth shades eggplant slightly.' },
  { plantA: 'Lemongrass (Ta Khai)', plantB: 'Galangal (Kha)', relationship: 'beneficial', reason: 'Both aromatic grasses share cultural needs; interplanting confuses pests.' },
  { plantA: 'Galangal (Kha)', plantB: 'Turmeric (Khamin)', relationship: 'beneficial', reason: 'Both rhizome crops thrive in similar partial shade and rich soil.' },
  { plantA: 'Coriander (Phak Chi)', plantB: 'Spinach', relationship: 'beneficial', reason: 'Coriander bolts later when shaded by spinach in cool season.' },
  { plantA: 'Vietnamese Coriander (Phak Phai)', plantB: 'Gotu Kola (Bua Bok)', relationship: 'beneficial', reason: 'Both moisture-loving herbs create a living mulch together.' },
  { plantA: 'Turmeric (Khamin)', plantB: 'Banana (Kluai)', relationship: 'beneficial', reason: 'Turmeric grows well in banana shade; bananas benefit from turmeric pest deterrence.' },
  { plantA: 'Papaya (Malako)', plantB: 'Lemongrass (Ta Khai)', relationship: 'beneficial', reason: 'Lemongrass border around papaya deters aphids and grasshoppers.' },
  { plantA: 'Pineapple (Sapparot)', plantB: 'Marigold (Dao Ruang)', relationship: 'beneficial', reason: 'Marigold intercropped with pineapple suppresses nematodes in sandy soil.' },
  { plantA: 'Banana (Kluai)', plantB: 'Papaya (Malako)', relationship: 'beneficial', reason: 'Different root depths reduce competition; banana mulch benefits papaya.' },
  { plantA: 'Dragon Fruit (Kaeo Mangkon)', plantB: 'Peanut', relationship: 'beneficial', reason: 'Peanut ground cover fixes nitrogen and suppresses weeds under dragon fruit posts.' },
  { plantA: 'Guava (Farang)', plantB: 'Lemongrass (Ta Khai)', relationship: 'beneficial', reason: 'Lemongrass border helps repel fruit flies from guava.' },
  { plantA: 'Marigold (Dao Ruang)', plantB: 'Thai Bird Chili (Prik Kee Noo)', relationship: 'beneficial', reason: 'Marigold roots exude compounds toxic to nematodes affecting chili.' },
  { plantA: 'Jasmine (Mali)', plantB: 'Bougainvillea (Fueng Fah)', relationship: 'beneficial', reason: 'Different flowering cycles support year-round pollinator presence.' },
  { plantA: 'Butterfly Pea (Anchan)', plantB: 'Yardlong Bean (Thua Fak Yao)', relationship: 'beneficial', reason: 'Butterfly pea is a nitrogen-fixing vine that can share trellis space.' },
  { plantA: 'Andrographis (Fah Talai Jone)', plantB: 'Galangal (Kha)', relationship: 'beneficial', reason: 'Similar partial-shade medicinal herb guild; pest confusion effect.' },
  { plantA: 'Aloe Vera (Wan Hang Kharok)', plantB: 'Pineapple (Sapparot)', relationship: 'beneficial', reason: 'Both drought-tolerant; aloe can indicate overwatering for pineapple beds.' },
  { plantA: 'Gotu Kola (Bua Bok)', plantB: 'Torch Ginger (Dala)', relationship: 'beneficial', reason: 'Gotu kola acts as living mulch holding moisture for torch ginger roots.' },
  { plantA: 'Noni (Yao)', plantB: 'Pandan (Bai Toey)', relationship: 'beneficial', reason: 'Pandan thrives in noni shade; both used in traditional Thai wellness.' },
  { plantA: 'Pandan (Bai Toey)', plantB: 'Turmeric (Khamin)', relationship: 'beneficial', reason: 'Both shade-loving aromatics with similar moisture and soil needs.' },
  { plantA: 'Chives (Kui Chai)', plantB: 'Chinese Kale (Pak Kana)', relationship: 'beneficial', reason: 'Chives may deter aphids and cabbage worms from brassicas.' },

  // Harmful / antagonistic pairs
  { plantA: 'Thai Bird Chili (Prik Kee Noo)', plantB: 'Fennel', relationship: 'harmful', reason: 'Fennel secretes allelopathic compounds that inhibit chili growth.' },
  { plantA: 'Thai Eggplant (Makhuea Pro)', plantB: 'Potato', relationship: 'harmful', reason: 'Both are in the Solanaceae family and share pests and diseases (blight, wilt).' },
  { plantA: 'Long Bean (Thua Pluak)', plantB: 'Onion', relationship: 'harmful', reason: 'Onions may stunt legume growth and reduce nitrogen fixation.' },
  { plantA: 'Morning Glory (Pak Boong)', plantB: 'Sweet Potato', relationship: 'harmful', reason: 'Both are in the Convolvulaceae family; shared pests and similar nutrient demands.' },
  { plantA: 'Thai Bitter Melon (Mara Khee Nok)', plantB: 'Potato', relationship: 'harmful', reason: 'Both susceptible to similar fungal wilts and beetle pests.' },
  { plantA: 'Chinese Kale (Pak Kana)', plantB: 'Strawberry', relationship: 'harmful', reason: 'Both compete for similar nutrients; strawberry may harbor clubroot.' },
  { plantA: 'Winged Bean (Thua Phuu)', plantB: 'Garlic', relationship: 'harmful', reason: 'Alliums can inhibit rhizobium bacteria needed by legumes.' },
  { plantA: 'Okra (Krachiap Khao)', plantB: 'Sweet Potato', relationship: 'harmful', reason: 'Sweet potato vines overtake and shade out okra seedlings.' },
  { plantA: 'Yardlong Bean (Thua Fak Yao)', plantB: 'Fennel', relationship: 'harmful', reason: 'Fennel allelopathy suppresses legume germination and growth.' },
  { plantA: 'Thai Cucumber (Taeng Raet)', plantB: 'Potato', relationship: 'harmful', reason: 'Potato and cucumber share susceptibility to Phytophthora blight.' },
  { plantA: 'Thai Basil (Bai Horapha)', plantB: 'Rue', relationship: 'harmful', reason: 'Rue can inhibit basil growth; both compete for similar nutrients.' },
  { plantA: 'Holy Basil (Bai Kraphao)', plantB: 'Sage', relationship: 'harmful', reason: 'Different moisture needs; sage prefers much drier conditions.' },
  { plantA: 'Coriander (Phak Chi)', plantB: 'Fennel', relationship: 'harmful', reason: 'Fennel allelopathy stunts coriander growth and germination.' },
  { plantA: 'Galangal (Kha)', plantB: 'Peanut', relationship: 'harmful', reason: 'Peanut ground cover can trap too much moisture around galangal rhizomes, causing rot.' },
  { plantA: 'Papaya (Malako)', plantB: 'Papaya (Malako)', relationship: 'harmful', reason: 'Overcrowding papaya causes poor air circulation and spreads ringspot virus.' },
  { plantA: 'Banana (Kluai)', plantB: 'Banana (Kluai)', relationship: 'harmful', reason: 'Planting too close spreads Panama disease and reduces yield.' },
  { plantA: 'Marigold (Dao Ruang)', plantB: 'Bean', relationship: 'harmful', reason: 'Some marigold varieties can inhibit bean germination; keep at border only.' },
  { plantA: 'Dragon Fruit (Kaeo Mangkon)', plantB: 'Dragon Fruit (Kaeo Mangkon)', relationship: 'harmful', reason: 'Overcrowding limits light and airflow, increasing fungal rot.' },
];

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function getCompanionship(
  a: string,
  b: string
): CompanionRelation & { direction: 'direct' | 'inferred' } | null {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  const found = companionRelations.find(
    (r) =>
      (normalizeName(r.plantA) === na && normalizeName(r.plantB) === nb) ||
      (normalizeName(r.plantA) === nb && normalizeName(r.plantB) === na)
  );
  if (!found) return null;
  return { ...found, direction: 'direct' };
}

export function getCompanionsFor(plantName: string): CompanionRelation[] {
  const n = normalizeName(plantName);
  return companionRelations.filter(
    (r) =>
      (normalizeName(r.plantA) === n || normalizeName(r.plantB) === n) &&
      r.relationship === 'beneficial'
  );
}

export function getAntagonistsFor(plantName: string): CompanionRelation[] {
  const n = normalizeName(plantName);
  return companionRelations.filter(
    (r) =>
      (normalizeName(r.plantA) === n || normalizeName(r.plantB) === n) &&
      r.relationship === 'harmful'
  );
}
