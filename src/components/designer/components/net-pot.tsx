'use client';

interface NetPotProps {
  selected?: boolean;
  onClick?: () => void;
}

export function NetPot({ selected, onClick }: NetPotProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Cup body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.08, 0.18, 8, 1, true]} />
        <meshStandardMaterial
          color={selected ? '#6b7280' : '#1f2937'}
          side={2}
          roughness={0.6}
          wireframe={false}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.09, 0]}>
        <circleGeometry args={[0.08, 8]} />
        <meshStandardMaterial color={selected ? '#4b5563' : '#111827'} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.09, 0]}>
        <torusGeometry args={[0.12, 0.015, 8, 16]} />
        <meshStandardMaterial color={selected ? '#9ca3af' : '#374151'} />
      </mesh>
      {/* Net mesh visual */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
          <boxGeometry args={[0.01, 0.16, 0.22]} />
          <meshStandardMaterial color={selected ? '#6b7280' : '#374151'} transparent opacity={0.4} />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <cylinderGeometry args={[0.18, 0.14, 0.26, 8]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
