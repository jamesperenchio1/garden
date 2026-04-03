'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

interface PumpProps {
  selected?: boolean;
  onClick?: () => void;
}

export function Pump({ selected, onClick }: PumpProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main body cylinder */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.28, 0.5, 12]} />
        <meshStandardMaterial
          color={selected ? '#9ca3af' : '#1f2937'}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.06, 12]} />
        <meshStandardMaterial color={selected ? '#6b7280' : '#111827'} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Intake port */}
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Outlet port */}
      <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {selected && (
        <mesh>
          <cylinderGeometry args={[0.32, 0.35, 0.58, 12]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
