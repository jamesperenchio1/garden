'use client';

interface AirStoneProps {
  selected?: boolean;
  onClick?: () => void;
}

export function AirStone({ selected, onClick }: AirStoneProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main stone body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 12]} />
        <meshStandardMaterial
          color={selected ? '#f3f4f6' : '#e5e7eb'}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      {/* Air hose connector */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.14, 8]} />
        <meshStandardMaterial color={selected ? '#d1d5db' : '#6b7280'} />
      </mesh>
      {/* Bubble indicators (small spheres) */}
      {[[-0.08, 0.08, 0.04], [0, 0.1, -0.06], [0.07, 0.09, 0.02], [-0.04, 0.12, -0.03]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial
            color={selected ? '#bfdbfe' : '#93c5fd'}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.28, 12]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
