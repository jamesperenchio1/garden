'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useDesignerStore } from '@/store/designer-store';
import type { SystemComponent } from '@/types/system';

// Dynamically import Canvas with SSR disabled — Three.js requires browser APIs
const R3FCanvas = dynamic(() => import('./r3f-canvas').then((m) => m.R3FCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-muted/30 rounded-lg">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading 3D engine…</p>
      </div>
    </div>
  ),
});

interface SystemCanvasProps {
  components: SystemComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onPlaceComponent?: (position: { x: number; y: number; z: number }) => void;
  showGrid?: boolean;
  showFlow?: boolean;
}

export function SystemCanvas(props: SystemCanvasProps) {
  const theme = useDesignerStore((s) => s.theme);
  return (
    <div
      className={`w-full h-full rounded-lg overflow-hidden ${
        theme === 'dark' ? 'bg-[#0d1a0d]' : 'bg-[#f4f7f2]'
      }`}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Initialising WebGL…</p>
            </div>
          </div>
        }
      >
        <R3FCanvas {...props} />
      </Suspense>
    </div>
  );
}
