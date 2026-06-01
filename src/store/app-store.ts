import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export interface AppState {
  location: Location;
  sidebarOpen: boolean;
  thaiHazardsEnabled: boolean;
  setLocation: (location: Location) => void;
  toggleSidebar: () => void;
  setThaiHazardsEnabled: (enabled: boolean) => void;
}

const BANGKOK: Location = {
  name: 'Bangkok',
  latitude: 13.7563,
  longitude: 100.5018,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      location: BANGKOK,
      sidebarOpen: true,
      thaiHazardsEnabled: false,
      setLocation: (location) => set({ location }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setThaiHazardsEnabled: (enabled) =>
        set({ thaiHazardsEnabled: enabled }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ location: state.location }),
    }
  )
);
