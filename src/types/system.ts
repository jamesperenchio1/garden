export type SystemType =
  | 'nft'
  | 'dwc'
  | 'ebb_flow'
  | 'drip'
  | 'aeroponics'
  | 'wicking'
  | 'dutch_bucket'
  | 'kratky'
  | 'vertical_tower'
  | 'rail_gutter'
  | 'aquaponics';

export type ComponentType =
  | 'reservoir'
  | 'pump'
  | 'pipe'
  | 'gutter'
  | 'net_pot'
  | 'grow_bed'
  | 'air_stone'
  | 'valve'
  | 'drip_emitter'
  | 'wicking_material'
  | 'vertical_tower'
  | 'fish_tank'
  | 'timer';

export interface SystemComponent {
  id: string;
  type: ComponentType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  connections: string[]; // IDs of connected components
  properties: Record<string, number | string | boolean>;
}

export interface HydroSystem {
  id?: number;
  name: string;
  type: SystemType;
  components: SystemComponent[];
  flowRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowSimulation {
  systemId: number;
  particles: FlowParticle[];
  issues: FlowIssue[];
}

export interface FlowParticle {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  pressure: number;
}

export interface FlowIssue {
  type: 'dead_spot' | 'pressure_drop' | 'undersized_pipe' | 'overflow';
  componentId: string;
  severity: 'warning' | 'critical';
  description: string;
}
