'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

interface GutterProps {
  selected?: boolean;
  onClick?: () => void;
}

export function Gutter({ selected, onClick }: GutterProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Bottom of trough */}
      <mesh ref={meshRef} position={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.06, 0.3]} />
        <meshStandardMaterial color={selected ? '#d4a574' : '#92400e'} roughness={0.8} />
      </mesh>
      {/* Left wall */}
      <mesh position={[0, 0.02, -0.16]}>
        <boxGeometry args={[1.6, 0.28, 0.04]} />
        <meshStandardMaterial color={selected ? '#d4a574' : '#78350f'} roughness={0.8} />
      </mesh>
      {/* Right wall */}
      <mesh position={[0, 0.02, 0.16]}>
        <boxGeometry args={[1.6, 0.28, 0.04]} />
        <meshStandardMaterial color={selected ? '#d4a574' : '#78350f'} roughness={0.8} />
      </mesh>
      {/* End caps */}
      <mesh position={[-0.82, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.28, 0.3]} />
        <meshStandardMaterial color={selected ? '#d4a574' : '#78350f'} roughness={0.8} />
      </mesh>
      <mesh position={[0.82, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.28, 0.3]} />
        <meshStandardMaterial color={selected ? '#d4a574' : '#78350f'} roughness={0.8} />
      </mesh>
      {selected && (
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.68, 0.38, 0.38]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
