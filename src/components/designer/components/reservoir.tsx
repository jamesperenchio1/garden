'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

interface ReservoirProps {
  selected?: boolean;
  onClick?: () => void;
}

export function Reservoir({ selected, onClick }: ReservoirProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.7, 0.8]} />
        <meshStandardMaterial
          color={selected ? '#60a5fa' : '#1d4ed8'}
          metalness={0.1}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[1.22, 0.06, 0.82]} />
        <meshStandardMaterial color={selected ? '#93c5fd' : '#2563eb'} />
      </mesh>
      {/* Outlet pipe stub */}
      <mesh position={[0.65, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[1.3, 0.78, 0.88]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
