export type Compatibility = 'beneficial' | 'harmful' | 'neutral';

export interface CompanionRelationship {
  plant1: string;
  plant2: string;
  compatibility: Compatibility;
  reason: string;
}

export interface CompanionPlant {
  name: string;
  category: string;
  companions: { name: string; compatibility: Compatibility; reason: string }[];
}

export interface SoilBed {
  id?: number;
  name: string;
  width: number; // cm
  length: number; // cm
  soilType?: string;
  ph?: number;
  amendments: SoilAmendment[];
  plants: BedPlant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SoilAmendment {
  name: string;
  amount: string;
  appliedAt: Date;
  notes?: string;
}

export interface BedPlant {
  plantName: string;
  position: { x: number; y: number };
  spacingRadius: number; // cm
}
