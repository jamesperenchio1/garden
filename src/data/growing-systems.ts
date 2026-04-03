import type { SystemType } from '@/types/system';

export interface GrowingSystemInfo {
  type: SystemType;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  waterUsage: 'low' | 'medium' | 'high';
  bestFor: string[];
  pros: string[];
  cons: string[];
}

export const growingSystems: GrowingSystemInfo[] = [
  {
    type: 'nft',
    name: 'Nutrient Film Technique (NFT)',
    description: 'A thin film of nutrient solution flows continuously over plant roots in sloped channels.',
    difficulty: 'intermediate',
    waterUsage: 'low',
    bestFor: ['Lettuce', 'Herbs', 'Strawberries', 'Leafy greens'],
    pros: ['Efficient water use', 'Easy to inspect roots', 'Good oxygenation', 'Scalable'],
    cons: ['Pump failure = rapid plant death', 'Not great for large plants', 'Channel blockages'],
  },
  {
    type: 'dwc',
    name: 'Deep Water Culture (DWC)',
    description: 'Plant roots are suspended in aerated nutrient solution. Air stones provide oxygen.',
    difficulty: 'beginner',
    waterUsage: 'medium',
    bestFor: ['Lettuce', 'Kale', 'Basil', 'Bok choy', 'Herbs'],
    pros: ['Simple setup', 'Fast growth', 'Inexpensive', 'Low maintenance'],
    cons: ['Water temperature control needed in Thai heat', 'Root diseases if water stagnates', 'Heavy water use for large setups'],
  },
  {
    type: 'ebb_flow',
    name: 'Ebb & Flow (Flood and Drain)',
    description: 'Growing bed periodically floods with nutrient solution then drains back to reservoir.',
    difficulty: 'intermediate',
    waterUsage: 'medium',
    bestFor: ['Tomatoes', 'Peppers', 'Herbs', 'Most vegetables'],
    pros: ['Versatile', 'Good root oxygenation', 'Can use various media', 'Timer-controlled'],
    cons: ['Timer/pump dependency', 'More components', 'Potential overflow issues'],
  },
  {
    type: 'drip',
    name: 'Drip System',
    description: 'Nutrient solution is dripped slowly to each plant via emitters from a supply line.',
    difficulty: 'intermediate',
    waterUsage: 'low',
    bestFor: ['Tomatoes', 'Peppers', 'Cucumbers', 'Large plants'],
    pros: ['Precise nutrient delivery', 'Scalable', 'Good for large plants', 'Water efficient'],
    cons: ['Emitter clogging', 'More complex plumbing', 'pH drift in long runs'],
  },
  {
    type: 'aeroponics',
    name: 'Aeroponics',
    description: 'Plant roots hang in air and are misted with nutrient solution at intervals.',
    difficulty: 'advanced',
    waterUsage: 'low',
    bestFor: ['Lettuce', 'Herbs', 'Strawberries', 'Microgreens'],
    pros: ['Fastest growth rates', 'Most water efficient', 'Maximum oxygenation', 'No growing media needed'],
    cons: ['Most complex', 'Mister clogging', 'Power failure critical', 'Expensive'],
  },
  {
    type: 'wicking',
    name: 'Passive Wicking',
    description: 'Nutrient solution is drawn up to roots via capillary action through wicking material. No pumps needed.',
    difficulty: 'beginner',
    waterUsage: 'low',
    bestFor: ['Herbs', 'Leafy greens', 'Small plants', 'Lettuce'],
    pros: ['No electricity needed', 'Extremely simple', 'Passive operation', 'Low cost', 'Silent'],
    cons: ['Slower growth than active systems', 'Limited to smaller plants', 'Wicking material maintenance'],
  },
  {
    type: 'dutch_bucket',
    name: 'Dutch Bucket (Bato Bucket)',
    description: 'Individual buckets with growing media, drip-fed nutrient solution with drain-to-waste or recirculating.',
    difficulty: 'intermediate',
    waterUsage: 'medium',
    bestFor: ['Tomatoes', 'Peppers', 'Cucumbers', 'Eggplant', 'Large fruiting plants'],
    pros: ['Great for large plants', 'Easy to maintain individual plants', 'Modular', 'Good drainage'],
    cons: ['More plumbing', 'Uses growing media', 'Individual bucket maintenance'],
  },
  {
    type: 'kratky',
    name: 'Kratky Method',
    description: 'Passive DWC where plants sit in nutrient solution that is not replenished. Air gap forms as roots grow.',
    difficulty: 'beginner',
    waterUsage: 'low',
    bestFor: ['Lettuce', 'Herbs', 'Leafy greens', 'Small plants'],
    pros: ['Zero electricity', 'Simplest possible setup', 'No pumps or timers', 'Very cheap'],
    cons: ['Single harvest per fill', 'Limited to fast-growing crops', 'No nutrient adjustment', 'Small scale'],
  },
  {
    type: 'vertical_tower',
    name: 'Vertical Tower',
    description: 'Stacked growing system where nutrient solution flows from top down through multiple planting sites.',
    difficulty: 'intermediate',
    waterUsage: 'low',
    bestFor: ['Strawberries', 'Lettuce', 'Herbs', 'Small vegetables'],
    pros: ['Space efficient', 'Eye-catching', 'Good for small spaces', 'Many planting sites'],
    cons: ['Uneven light distribution', 'Top-heavy when mature', 'Bottom plants get less light'],
  },
  {
    type: 'rail_gutter',
    name: 'Rail/Gutter System',
    description: 'Horizontal gutters or rails with nutrient solution flowing through. Can be passive (wicking) or active (pumped).',
    difficulty: 'beginner',
    waterUsage: 'low',
    bestFor: ['Lettuce', 'Herbs', 'Strawberries', 'Microgreens'],
    pros: ['Easy to build with standard gutters', 'Can be passive or active', 'Good for narrow spaces', 'Stackable'],
    cons: ['Limited root space', 'Slope must be precise', 'Algae growth in gutters'],
  },
  {
    type: 'aquaponics',
    name: 'Aquaponics',
    description: 'Combines fish farming with hydroponics. Fish waste provides nutrients for plants, plants filter water for fish.',
    difficulty: 'advanced',
    waterUsage: 'medium',
    bestFor: ['Leafy greens', 'Herbs', 'Tomatoes', 'Cucumbers', 'Tilapia', 'Catfish'],
    pros: ['Self-sustaining ecosystem', 'Produces fish + vegetables', 'Organic-compatible', 'Educational'],
    cons: ['Complex to balance', 'Fish health management', 'Startup time for cycling', 'More equipment'],
  },
];

export function getSystemInfo(type: SystemType): GrowingSystemInfo | undefined {
  return growingSystems.find((s) => s.type === type);
}
