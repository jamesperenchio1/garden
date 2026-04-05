'use client';

import { Canvas } from '@react-three/fiber';
import { Scene } from './scene';
import { FlowSimulation } from './flow-simulation';
import { useDesignerStore } from '@/store/designer-store';
import type { SystemComponent } from '@/types/system';

interface R3FCanvasProps {
  components: SystemComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onPlaceComponent?: (position: { x: number; y: number; z: number }) => void;
  showGrid?: boolean;
  showFlow?: boolean;
}

export function R3FCanvas({
  components,
  selectedComponentId,
  onSelectComponent,
  onPlaceComponent,
  showGrid = true,
  showFlow = true,
}: R3FCanvasProps) {
  const theme = useDesignerStore((s) => s.theme);
  const background = theme === 'dark' ? '#0d1a0d' : '#f4f7f2';
  return (
    <Canvas
      shadows
      camera={{ position: [6, 6, 8], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background }}
    >
      <Scene
        components={components}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
        onPlaceComponent={onPlaceComponent}
        showGrid={showGrid}
      />
      {showFlow && <FlowSimulation components={components} />}
    </Canvas>
  );
}
