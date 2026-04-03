import { create } from 'zustand';

interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

interface AppState {
  location: Location;
  setLocation: (location: Location) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  thaiHazardsEnabled: boolean;
  setThaiHazardsEnabled: (enabled: boolean) => void;
}

// Default to Bangkok, Thailand
const DEFAULT_LOCATION: Location = {
  latitude: 13.7563,
  longitude: 100.5018,
  name: 'Bangkok, Thailand',
};

export const useAppStore = create<AppState>((set) => ({
  location: DEFAULT_LOCATION,
  setLocation: (location) => set({ location }),
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  thaiHazardsEnabled: true,
  setThaiHazardsEnabled: (thaiHazardsEnabled) => set({ thaiHazardsEnabled }),
}));
