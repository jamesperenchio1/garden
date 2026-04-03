import { create } from 'zustand';
import type { SystemComponent, ComponentType } from '@/types/system';

interface DesignerState {
  components: SystemComponent[];
  selectedComponentId: string | null;
  addComponent: (type: ComponentType, position: { x: number; y: number; z: number }) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<SystemComponent>) => void;
  connectComponents: (fromId: string, toId: string) => void;
  clearAll: () => void;
  loadComponents: (components: SystemComponent[]) => void;
}

let nextId = 1;

export const useDesignerStore = create<DesignerState>((set) => ({
  components: [],
  selectedComponentId: null,
  addComponent: (type, position) =>
    set((state) => ({
      components: [
        ...state.components,
        {
          id: `comp-${nextId++}`,
          type,
          position,
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          connections: [],
          properties: {},
        },
      ],
    })),
  removeComponent: (id) =>
    set((state) => ({
      components: state.components
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          connections: c.connections.filter((connId) => connId !== id),
        })),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    })),
  selectComponent: (id) => set({ selectedComponentId: id }),
  updateComponent: (id, updates) =>
    set((state) => ({
      components: state.components.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  connectComponents: (fromId, toId) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === fromId && !c.connections.includes(toId)
          ? { ...c, connections: [...c.connections, toId] }
          : c
      ),
    })),
  clearAll: () => set({ components: [], selectedComponentId: null }),
  loadComponents: (components) => set({ components, selectedComponentId: null }),
}));
