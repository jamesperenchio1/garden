import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type DesignerTheme = 'light' | 'dark';

export interface DesignerComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  connections: string[];
  [key: string]: unknown;
}

export interface FlowIssue {
  id: string;
  message: string;
  severity: 'error' | 'warning';
  componentId?: string;
}

export interface DesignerState {
  components: DesignerComponent[];
  selectedId: string | null;
  theme: DesignerTheme;
  history: DesignerComponent[][];
  historyIndex: number;
}

export interface DesignerActions {
  addComponent: (
    component: Omit<DesignerComponent, 'id' | 'connections'>
  ) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<DesignerComponent>) => void;
  selectComponent: (id: string | null) => void;
  addConnection: (fromId: string, toId: string) => void;
  removeConnection: (fromId: string, toId: string) => void;
  validateDesign: () => FlowIssue[];
  undo: () => void;
  redo: () => void;
  setTheme: (theme: DesignerTheme) => void;
}

type DesignerStore = DesignerState & DesignerActions;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveCollisions(components: DesignerComponent[]): DesignerComponent[] {
  const resolved = components.map((c) => ({ ...c }));
  const minGap = 0.1;

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i];
      const b = resolved[j];

      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      const overlapZ = Math.min(a.z + a.depth, b.z + b.depth) - Math.max(a.z, b.z);

      if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
        const minOverlap = Math.min(overlapX, overlapY, overlapZ);
        if (minOverlap === overlapX) {
          b.x = a.x + a.width + minGap;
        } else if (minOverlap === overlapY) {
          b.y = a.y + a.height + minGap;
        } else {
          b.z = a.z + a.depth + minGap;
        }
      }
    }
  }

  return resolved;
}

function pushHistory(
  history: DesignerComponent[][],
  index: number,
  components: DesignerComponent[]
): { history: DesignerComponent[][]; historyIndex: number } {
  const next = history.slice(0, index + 1);
  next.push(JSON.parse(JSON.stringify(components)));
  if (next.length > 50) {
    next.shift();
    return { history: next, historyIndex: next.length - 1 };
  }
  return { history: next, historyIndex: next.length - 1 };
}

export const useDesignerStore = create<DesignerStore>()(
  devtools(
    (set, get) => ({
      components: [],
      selectedId: null,
      theme: 'light',
      history: [],
      historyIndex: -1,

      addComponent: (component) =>
        set((state) => {
          const partial = component as Record<string, unknown>;
          const newComponent = {
            type: String(partial.type ?? ''),
            x: Number(partial.x ?? 0),
            y: Number(partial.y ?? 0),
            z: Number(partial.z ?? 0),
            width: Number(partial.width ?? 0),
            height: Number(partial.height ?? 0),
            depth: Number(partial.depth ?? 0),
            ...partial,
            id: generateId(),
            connections: [] as string[],
          } as DesignerComponent;
          const updated = resolveCollisions([...state.components, newComponent]);
          const { history, historyIndex } = pushHistory(
            state.history,
            state.historyIndex,
            updated
          );
          return {
            components: updated,
            selectedId: newComponent.id,
            history,
            historyIndex,
          };
        }),

      removeComponent: (id) =>
        set((state) => {
          const filtered = state.components
            .filter((c) => c.id !== id)
            .map((c) => ({
              ...c,
              connections: c.connections.filter((connId) => connId !== id),
            }));
          const { history, historyIndex } = pushHistory(
            state.history,
            state.historyIndex,
            filtered
          );
          return {
            components: filtered,
            selectedId: state.selectedId === id ? null : state.selectedId,
            history,
            historyIndex,
          };
        }),

      updateComponent: (id, updates) =>
        set((state) => {
          const updated = state.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          );
          const resolved = resolveCollisions(updated);
          const { history, historyIndex } = pushHistory(
            state.history,
            state.historyIndex,
            resolved
          );
          return { components: resolved, history, historyIndex };
        }),

      selectComponent: (id) => set({ selectedId: id }),

      addConnection: (fromId, toId) =>
        set((state) => {
          if (fromId === toId) return state;
          const updated = state.components.map((c) => {
            if (c.id === fromId && !c.connections.includes(toId)) {
              return { ...c, connections: [...c.connections, toId] };
            }
            return c;
          });
          const { history, historyIndex } = pushHistory(
            state.history,
            state.historyIndex,
            updated
          );
          return { components: updated, history, historyIndex };
        }),

      removeConnection: (fromId, toId) =>
        set((state) => {
          const updated = state.components.map((c) => {
            if (c.id === fromId) {
              return {
                ...c,
                connections: c.connections.filter((connId) => connId !== toId),
              };
            }
            return c;
          });
          const { history, historyIndex } = pushHistory(
            state.history,
            state.historyIndex,
            updated
          );
          return { components: updated, history, historyIndex };
        }),

      validateDesign: () => {
        const { components } = get();
        const issues: FlowIssue[] = [];
        const ids = new Set(components.map((c) => c.id));

        components.forEach((c) => {
          if (!c.type) {
            issues.push({
              id: generateId(),
              message: `Component ${c.id} has no type`,
              severity: 'error',
              componentId: c.id,
            });
          }
          c.connections.forEach((connId) => {
            if (!ids.has(connId)) {
              issues.push({
                id: generateId(),
                message: `Component ${c.id} connects to missing component ${connId}`,
                severity: 'error',
                componentId: c.id,
              });
            }
          });
        });

        components.forEach((c) => {
          const hasIncoming = components.some((other) =>
            other.connections.includes(c.id)
          );
          if (
            c.connections.length === 0 &&
            !hasIncoming &&
            components.length > 1
          ) {
            issues.push({
              id: generateId(),
              message: `Component ${c.id} is isolated`,
              severity: 'warning',
              componentId: c.id,
            });
          }
        });

        return issues;
      },

      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const prevIndex = state.historyIndex - 1;
          return {
            components: JSON.parse(JSON.stringify(state.history[prevIndex])),
            historyIndex: prevIndex,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const nextIndex = state.historyIndex + 1;
          return {
            components: JSON.parse(JSON.stringify(state.history[nextIndex])),
            historyIndex: nextIndex,
          };
        }),

      setTheme: (theme) => set({ theme }),
    }),
    { name: 'designer-store' }
  )
);
