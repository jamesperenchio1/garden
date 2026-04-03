'use client';

interface DripEmitterProps {
  selected?: boolean;
  onClick?: () => void;
}

export function DripEmitter({ selected, onClick }: DripEmitterProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.18, 10]} />
        <meshStandardMaterial
          color={selected ? '#86efac' : '#16a34a'}
          roughness={0.5}
        />
      </mesh>
      {/* Inlet port */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Emitter tip */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.025, 0.08, 8]} />
        <meshStandardMaterial color={selected ? '#4ade80' : '#15803d'} />
      </mesh>
      {/* Drip drop */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.8} />
      </mesh>
      {selected && (
        <mesh>
          <cylinderGeometry args={[0.12, 0.14, 0.32, 10]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
