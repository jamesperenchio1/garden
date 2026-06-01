export interface GrowingSystem {
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pros: string[];
  cons: string[];
}

export const growingSystems: GrowingSystem[] = [
  {
    name: 'Nutrient Film Technique (NFT)',
    description:
      'A thin film of nutrient solution continuously flows over plant roots in sloped channels. Very popular for leafy greens and herbs in Thai urban farms due to water efficiency and fast turnaround.',
    difficulty: 'intermediate',
    pros: [
      'Extremely water-efficient—ideal for drought-prone Thai regions',
      'Fast growth rates for lettuce, basil, and pak choi',
      'Modular and scalable for balconies and rooftops',
      'Minimal growing medium required',
      'Easy to inspect and harvest roots',
    ],
    cons: [
      'Pump failure or power outage can kill plants within hours',
      'Susceptible to clogging from algae or debris in humid Thai climate',
      'Not suitable for heavy fruiting crops (tomato, eggplant)',
      'Requires precise pH and EC monitoring',
      'Root temperature can spike in direct sun without insulation',
    ],
  },
  {
    name: 'Deep Water Culture (DWC)',
    description:
      'Plants are suspended in net pots with roots submerged in an oxygenated nutrient solution. One of the simplest and most reliable hydroponic methods for beginners in Thailand.',
    difficulty: 'beginner',
    pros: [
      'Very forgiving for beginners—stable root zone environment',
      'Excellent for leafy greens, herbs, and even chili',
      'Low maintenance once balanced',
      'Reservoir thermal mass buffers against rapid Thai temperature swings',
      'No complex irrigation plumbing needed',
    ],
    cons: [
      'Large water volume means bigger nutrient cost at refill',
      'Root diseases (Pythium) spread quickly if oxygenation fails',
      'Mosquitoes can breed in open reservoirs—cover essential',
      'Difficult to move once filled',
      'Algae growth in uncovered tanks is common in sunny Thai conditions',
    ],
  },
  {
    name: 'Ebb and Flow (Flood and Drain)',
    description:
      'The grow bed is periodically flooded with nutrient solution and then drained. Mimics natural tidal patterns and works well with a variety of media.',
    difficulty: 'intermediate',
    pros: [
      'Versatile—suitable for seedlings, herbs, and medium fruiting crops',
      'Excellent oxygenation of roots during drain cycles',
      'Can use inexpensive local media (volcanic rock, coconut coir)',
      'Timer-based automation is straightforward',
      'Tolerates brief power outages better than NFT',
    ],
    cons: [
      'More moving parts (timers, bell siphons, pumps) to maintain',
      'Bell siphons can fail if not tuned correctly',
      'Grow beds are heavy when flooded—structural support needed',
      'Risk of salt buildup in media over time',
      'Drainage plumbing can clog with roots and debris',
    ],
  },
  {
    name: 'Drip System',
    description:
      'Nutrient solution is dripped directly onto the base of each plant via emitters. Highly adaptable to Thai container gardening and larger setups alike.',
    difficulty: 'intermediate',
    pros: [
      'Scales from a few pots to commercial farms easily',
      'Works with soil, coco coir, perlite, or rockwool',
      'Precise control over each plant\'s water and nutrient delivery',
      'Suitable for heavy fruiting crops like tomato and eggplant',
      'Can be run on gravity with elevated reservoir',
    ],
    cons: [
      'Emitters clog frequently from mineral precipitates and algae',
      'Uneven flow if system is not level',
      'More tubing and hardware to install and maintain',
      'Runoff or excess solution requires management',
      'Sensitive to water pressure fluctuations',
    ],
  },
  {
    name: 'Aeroponics',
    description:
      'Roots hang in air and are misted with nutrient solution. Delivers maximum oxygen to roots and achieves the fastest growth rates, but requires precision engineering.',
    difficulty: 'advanced',
    pros: [
      'Fastest growth rates of any soilless method',
      'Uses 95% less water than soil agriculture',
      'No growing medium needed—lower ongoing cost',
      'Excellent root inspection and disease isolation',
      'Very high yield per square meter',
    ],
    cons: [
      'High initial cost for misting nozzles and pressure pumps',
      'Nozzle clogging is relentless in hard-water areas of Thailand',
      'Power failure is catastrophic—roots dry in minutes',
      'Requires meticulous pH and EC calibration',
      'Humidity management critical in already-humid Thai climate',
    ],
  },
  {
    name: 'Wicking System',
    description:
      'A passive system where nutrient solution travels from a reservoir to the root zone via a wick. Perfect for small Thai apartments and low-tech beginners.',
    difficulty: 'beginner',
    pros: [
      'No pumps, electricity, or timers required',
      'Extremely low cost and simple to build',
      'Great for herbs, lettuce, and microgreens',
      'Silent operation—ideal for indoor balconies',
      'Very low maintenance',
    ],
    cons: [
      'Limited to small, water-loving plants',
      'Wick material can degrade or become clogged with algae',
      'Slow nutrient delivery—not suitable for fast-growing fruiting crops',
      'Reservoir can breed mosquitoes if uncovered',
      'Root zone may stay too wet, encouraging rot',
    ],
  },
  {
    name: 'Dutch Bucket',
    description:
      'Individual buckets filled with media (perlite, coco coir) feed each plant via a drip line, with runoff collected and recirculated or drained. Standard for vine crops in Thai hydroponic farms.',
    difficulty: 'intermediate',
    pros: [
      'Perfect for large fruiting vines: tomato, cucumber, bitter melon',
      'Isolates each plant—disease does not spread easily',
      'Excellent drainage prevents root rot in humid climate',
      'Easy to train plants vertically, saving space',
      'Buckets can be moved or replaced individually',
    ],
    cons: [
      'Requires significant media volume per plant',
      'Drip emitters need frequent cleaning',
      'Runoff collection adds plumbing complexity',
      'More labor-intensive for large numbers of plants',
      'Media replacement needed every 1–2 years',
    ],
  },
  {
    name: 'Kratky Method',
    description:
      'A completely passive form of DWC where a static reservoir is filled once and allowed to deplete as plants grow. The air gap above the falling water line provides oxygen.',
    difficulty: 'beginner',
    pros: [
      'Zero electricity, pumps, or timers—ultimate simplicity',
      'Extremely low cost for home gardeners',
      'Excellent for short-cycle leafy greens and herbs',
      'No noise or mechanical failure risk',
      'Easy to set up with recycled containers',
    ],
    cons: [
      'Only works for short-cycle crops; not for long fruiting plants',
      'Water level must be carefully calculated at setup',
      'No way to adjust nutrients mid-cycle',
      'Roots can become slimy if reservoir is too warm',
      'Algae and mosquito breeding in uncovered containers',
    ],
  },
  {
    name: 'Vertical Tower',
    description:
      'Plants grow in stacked columns or A-frame towers, often with NFT or drip irrigation running top-to-bottom. Maximizes production in tight Bangkok and Chiang Mai urban spaces.',
    difficulty: 'intermediate',
    pros: [
      'Maximum plants per square meter—ideal for balconies',
      'Striking visual appeal for home and commercial displays',
      'Good airflow between plants reduces fungal disease',
      'Harvesting at waist height reduces back strain',
      'Can combine herbs, greens, and strawberries in one tower',
    ],
    cons: [
      'Top plants may shade lower ones if not rotated',
      'Pump must overcome gravity—higher pressure needed',
      'Uneven water distribution can dry bottom plants',
      'Tower stability critical in Thai storm season winds',
      'More expensive per plant than horizontal systems',
    ],
  },
  {
    name: 'Rail / Gutter System',
    description:
      'PVC rain gutters or custom rails are mounted horizontally (often on walls or fences) with plants in net cups. Nutrient solution recirculates or drips through the rail.',
    difficulty: 'intermediate',
    pros: [
      'Excellent use of vertical wall and fence space',
      'Good for Thai townhouses with limited ground area',
      'Easy to level and inspect',
      'Modular—add or remove rail sections as needed',
      'Gutter systems are inexpensive using local PVC supplies',
    ],
    cons: [
      'Limited root space restricts plant size and yield',
      'Rails heat up in direct sun, stressing roots',
      'Clogging at low points if not perfectly level',
      'Not suitable for heavy fruiting crops',
      'Wall mounting requires sturdy brackets',
    ],
  },
  {
    name: 'Media-Based Aquaponics',
    description:
      'Fish tank water is pumped into a gravel or volcanic rock grow bed, where plants filter the water before it returns to the fish. A sustainable closed-loop system well-suited to Thai warm-water fish like tilapia.',
    difficulty: 'intermediate',
    pros: [
      'No synthetic fertilizers—fish waste feeds plants',
      'Produces both protein (tilapia, catfish) and vegetables',
      'Very low water use once cycled',
      'Hardy against brief Thai power outages if sized correctly',
      'Excellent for leafy greens, herbs, and fruiting crops',
    ],
    cons: [
      'Requires cycling period (4–6 weeks) before adding fish',
      'Fish health directly impacts plant health',
      'pH compromise needed between fish (7.0) and plants (6.0)',
      'Heat can reduce dissolved oxygen—extra aeration needed',
      'Predatory birds and cats may target outdoor fish tanks',
    ],
  },
  {
    name: 'NFT Aquaponics',
    description:
      'Combines fish tanks with NFT channels where plant roots filter water in a thin film. Common in commercial Thai aquaponics for high-density leafy production.',
    difficulty: 'advanced',
    pros: [
      'Highest plant density of any aquaponics method',
      'Continuous water filtration benefits fish health',
      'Very fast lettuce and herb turnover',
      'Water stays well-oxygenated in thin film',
      'Modular expansion for commercial scale',
    ],
    cons: [
      'Biofilter must be robust—fish waste solids clog channels',
      'Any system failure affects both fish and plants rapidly',
      'Requires backup power and aeration for fish safety',
      'Root temperature control harder than media beds',
      'High technical knowledge needed for balancing system',
    ],
  },
];
