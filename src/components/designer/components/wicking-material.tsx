'use client';

interface WickingMaterialProps {
  selected?: boolean;
  onClick?: () => void;
}

export function WickingMaterial({ selected, onClick }: WickingMaterialProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main body — flat layered look */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.08, 0.4]} />
        <meshStandardMaterial
          color={selected ? '#c4b5a0' : '#78716c'}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      {/* Fiber texture layers */}
      {[-0.02, 0, 0.02].map((y, i) => (
        <mesh key={i} position={[0, y + 0.05, 0]}>
          <boxGeometry args={[0.48, 0.02, 0.38]} />
          <meshStandardMaterial
            color={selected ? '#d6cdc4' : '#a8a29e'}
            roughness={1}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {/* Wick strand going down */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 6]} />
        <meshStandardMaterial color={selected ? '#c4b5a0' : '#57534e'} roughness={0.95} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[0.58, 0.16, 0.48]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
