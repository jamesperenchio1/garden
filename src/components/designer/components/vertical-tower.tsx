'use client';

interface VerticalTowerProps {
  selected?: boolean;
  onClick?: () => void;
}

export function VerticalTower({ selected, onClick }: VerticalTowerProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main tower body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 1.6, 10]} />
        <meshStandardMaterial
          color={selected ? '#86efac' : '#16a34a'}
          roughness={0.6}
        />
      </mesh>
      {/* Planting pockets - arranged vertically */}
      {[-0.55, -0.2, 0.15, 0.5].map((y, i) => (
        <group key={i} position={[0.18 * Math.cos((i * Math.PI) / 2), y, 0.18 * Math.sin((i * Math.PI) / 2)]}>
          <mesh rotation={[0, (i * Math.PI) / 2, Math.PI / 4]}>
            <cylinderGeometry args={[0.07, 0.05, 0.1, 8]} />
            <meshStandardMaterial color={selected ? '#bbf7d0' : '#15803d'} />
          </mesh>
        </group>
      ))}
      {/* Top reservoir cap */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.12, 10]} />
        <meshStandardMaterial color={selected ? '#4ade80' : '#166534'} />
      </mesh>
      {/* Base plate */}
      <mesh position={[0, -0.86, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 10]} />
        <meshStandardMaterial color={selected ? '#86efac' : '#14532d'} />
      </mesh>
      {selected && (
        <mesh>
          <cylinderGeometry args={[0.28, 0.32, 1.76, 10]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
