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

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Connection {
  /** ID of the target component. */
  toId: string;
  /** Optional path bends in world space (excluding endpoints). */
  waypoints: Vec3[];
  /** Explicit tube length in metres. Overrides the straight-line distance. */
  lengthOverride?: number;
}

export interface SystemComponent {
  id: string;
  type: ComponentType;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  /** Outgoing connections. May be legacy `string[]` on disk — normalised on load. */
  connections: Connection[];
  properties: Record<string, number | string | boolean>;
}

/** Normalise a possibly-legacy connections field to the Connection[] shape. */
export function normaliseConnections(
  raw: unknown
): Connection[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => {
    if (typeof c === 'string') {
      return { toId: c, waypoints: [] };
    }
    if (c && typeof c === 'object' && 'toId' in c) {
      const conn = c as Partial<Connection>;
      return {
        toId: String(conn.toId),
        waypoints: Array.isArray(conn.waypoints) ? conn.waypoints : [],
        lengthOverride:
          typeof conn.lengthOverride === 'number' ? conn.lengthOverride : undefined,
      };
    }
    return null;
  }).filter((c): c is Connection => c !== null);
}

export function normaliseComponent(c: SystemComponent): SystemComponent {
  return {
    ...c,
    scale: c.scale ?? { x: 1, y: 1, z: 1 },
    rotation: c.rotation ?? { x: 0, y: 0, z: 0 },
    connections: normaliseConnections(c.connections as unknown),
    properties: c.properties ?? {},
  };
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
