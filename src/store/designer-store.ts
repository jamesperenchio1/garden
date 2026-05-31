import { create } from 'zustand';
import type {
  Connection,
  ComponentType,
  SystemComponent,
  Vec3,
} from '@/types/system';
import { normaliseComponent } from '@/types/system';
import type { FlowIssue } from '@/types/system';

export type DesignerTheme = 'light' | 'dark';

const THEME_KEY = 'designer.theme';

function loadTheme(): DesignerTheme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // First visit — persist the default so external observers can read it.
  window.localStorage.setItem(THEME_KEY, 'light');
  return 'light';
}

const GRID_UNIT = 0.5;

/** Nudge a placement position on the X axis until it doesn't overlap an existing component. */
function resolveCollision(
  position: Vec3,
  existing: SystemComponent[]
): Vec3 {
  const taken = (p: Vec3) =>
    existing.some(
      (c) =>
        Math.abs(c.position.x - p.x) < 1e-3 &&
        Math.abs(c.position.y - p.y) < 1e-3 &&
        Math.abs(c.position.z - p.z) < 1e-3
    );
  let pos = { ...position };
  let guard = 0;
  while (taken(pos) && guard < 200) {
    pos = { ...pos, x: pos.x + GRID_UNIT };
    guard += 1;
  }
  return pos;
}

interface ConnectMode {
  active: boolean;
  fromId: string | null;
  waypoints: Vec3[];
}

interface DesignerState {
  components: SystemComponent[];
  selectedComponentId: string | null;
  theme: DesignerTheme;
  connectMode: ConnectMode;

  addComponent: (type: ComponentType, position: Vec3) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<SystemComponent>) => void;

  /** Finalise a connection, optionally with intermediate waypoints. */
  addConnection: (fromId: string, toId: string, waypoints?: Vec3[]) => void;
  /** Remove an outgoing connection from fromId → toId. */
  removeConnection: (fromId: string, toId: string) => void;
  /** Update the lengthOverride / waypoints of an existing connection. */
  updateConnection: (
    fromId: string,
    toId: string,
    updates: Partial<Connection>
  ) => void;

  clearAll: () => void;
  loadComponents: (components: SystemComponent[]) => void;
  validateDesign: () => FlowIssue[];

  setTheme: (theme: DesignerTheme) => void;

  startConnectMode: (fromId: string) => void;
  addConnectWaypoint: (point: Vec3) => void;
  cancelConnectMode: () => void;
  finishConnectMode: (toId: string) => void;
}

let nextId = 1;

export const useDesignerStore = create<DesignerState>((set, get) => ({
  components: [],
  selectedComponentId: null,
  theme: loadTheme(),
  connectMode: { active: false, fromId: null, waypoints: [] },

  addComponent: (type, position) =>
    set((state) => {
      const resolved = resolveCollision(position, state.components);
      return {
        components: [
          ...state.components,
          {
            id: `comp-${nextId++}`,
            type,
            position: resolved,
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            connections: [],
            properties: {},
          },
        ],
      };
    }),

  removeComponent: (id) =>
    set((state) => ({
      components: state.components
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          connections: c.connections.filter((conn) => conn.toId !== id),
        })),
      selectedComponentId:
        state.selectedComponentId === id ? null : state.selectedComponentId,
    })),

  selectComponent: (id) => set({ selectedComponentId: id }),

  updateComponent: (id, updates) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  addConnection: (fromId, toId, waypoints = []) =>
    set((state) => {
      if (fromId === toId) return state;
      return {
        components: state.components.map((c) => {
          if (c.id !== fromId) return c;
          if (c.connections.some((conn) => conn.toId === toId)) return c;
          return {
            ...c,
            connections: [...c.connections, { toId, waypoints }],
          };
        }),
      };
    }),

  removeConnection: (fromId, toId) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === fromId
          ? { ...c, connections: c.connections.filter((conn) => conn.toId !== toId) }
          : c
      ),
    })),

  updateConnection: (fromId, toId, updates) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === fromId
          ? {
              ...c,
              connections: c.connections.map((conn) =>
                conn.toId === toId ? { ...conn, ...updates } : conn
              ),
            }
          : c
      ),
    })),

  clearAll: () =>
    set({
      components: [],
      selectedComponentId: null,
      connectMode: { active: false, fromId: null, waypoints: [] },
    }),

  validateDesign: () => {
    const { components } = get();
    const issues: FlowIssue[] = [];
    const byId = Object.fromEntries(components.map((c) => [c.id, c]));

    for (const comp of components) {
      // Pump must be below or at the same level as the reservoir it feeds from
      if (comp.type === 'pump') {
        const sourceConn = components.find((c) =>
          c.connections.some((conn) => conn.toId === comp.id)
        );
        if (sourceConn && sourceConn.type === 'reservoir' && comp.position.y > sourceConn.position.y) {
          issues.push({
            type: 'pressure_drop',
            componentId: comp.id,
            severity: 'critical',
            description: `Pump is above its source reservoir. Water cannot flow uphill without a submersible pump.`,
          });
        }
      }

      // Reservoir must be above grow beds it feeds (for gravity systems)
      if (comp.type === 'reservoir') {
        for (const conn of comp.connections) {
          const target = byId[conn.toId];
          if (target && (target.type === 'grow_bed' || target.type === 'vertical_tower') && comp.position.y < target.position.y) {
            issues.push({
              type: 'dead_spot',
              componentId: comp.id,
              severity: 'warning',
              description: `Reservoir is below ${target.type}. Gravity feed requires reservoir to be higher.`,
            });
          }
        }
      }

      // Fish tank must have an air stone
      if (comp.type === 'fish_tank') {
        const hasAirStone = components.some(
          (c) => c.type === 'air_stone' && comp.connections.some((conn) => conn.toId === c.id)
        );
        if (!hasAirStone) {
          issues.push({
            type: 'dead_spot',
            componentId: comp.id,
            severity: 'warning',
            description: 'Fish tank has no air stone. Aquatic life requires oxygenation.',
          });
        }
      }

      // Valve should not be the only connection between pump and grow beds
      if (comp.type === 'valve') {
        const hasUpstreamPump = components.some(
          (c) => c.type === 'pump' && c.connections.some((conn) => {
            // Simple check: pump connects to something that connects to valve
            const direct = conn.toId === comp.id;
            const indirect = components.some((mid) => mid.id === conn.toId && mid.connections.some((m) => m.toId === comp.id));
            return direct || indirect;
          })
        );
        if (!hasUpstreamPump && comp.connections.length > 0) {
          issues.push({
            type: 'pressure_drop',
            componentId: comp.id,
            severity: 'warning',
            description: 'Valve has no upstream pump. Gravity feed only — verify flow is sufficient.',
          });
        }
      }
    }

    return issues;
  },

  loadComponents: (components) =>
    set({
      components: components.map(normaliseComponent),
      selectedComponentId: null,
      connectMode: { active: false, fromId: null, waypoints: [] },
    }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, theme);
    }
    set({ theme });
  },

  startConnectMode: (fromId) =>
    set({ connectMode: { active: true, fromId, waypoints: [] } }),

  addConnectWaypoint: (point) =>
    set((state) => ({
      connectMode: {
        ...state.connectMode,
        waypoints: [...state.connectMode.waypoints, point],
      },
    })),

  cancelConnectMode: () =>
    set({ connectMode: { active: false, fromId: null, waypoints: [] } }),

  finishConnectMode: (toId) => {
    const { connectMode, addConnection } = get();
    if (!connectMode.active || !connectMode.fromId) return;
    addConnection(connectMode.fromId, toId, connectMode.waypoints);
    set({ connectMode: { active: false, fromId: null, waypoints: [] } });
  },
}));
