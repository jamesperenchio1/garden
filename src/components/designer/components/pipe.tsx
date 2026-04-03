'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

interface PipeProps {
  selected?: boolean;
  onClick?: () => void;
}

export function Pipe({ selected, onClick }: PipeProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main pipe body */}
      <mesh ref={meshRef} castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.4, 10]} />
        <meshStandardMaterial
          color={selected ? '#d1d5db' : '#9ca3af'}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      {/* End caps */}
      <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 10]} />
        <meshStandardMaterial color={selected ? '#e5e7eb' : '#6b7280'} />
      </mesh>
      <mesh position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 10]} />
        <meshStandardMaterial color={selected ? '#e5e7eb' : '#6b7280'} />
      </mesh>
      {selected && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.48, 10]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
