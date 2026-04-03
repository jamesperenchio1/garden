'use client';

interface GrowBedProps {
  selected?: boolean;
  onClick?: () => void;
}

export function GrowBed({ selected, onClick }: GrowBedProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main bed body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.2, 0.9]} />
        <meshStandardMaterial
          color={selected ? '#86efac' : '#166534'}
          roughness={0.7}
        />
      </mesh>
      {/* Growing medium surface */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[1.36, 0.04, 0.86]} />
        <meshStandardMaterial color={selected ? '#bbf7d0' : '#4d7c0f'} roughness={0.9} />
      </mesh>
      {/* Legs */}
      {[[-0.6, -0.25, -0.35], [-0.6, -0.25, 0.35], [0.6, -0.25, -0.35], [0.6, -0.25, 0.35]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.06, 0.3, 0.06]} />
          <meshStandardMaterial color={selected ? '#86efac' : '#14532d'} />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <boxGeometry args={[1.48, 0.28, 0.98]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
