'use client';

interface ValveProps {
  selected?: boolean;
  onClick?: () => void;
}

export function Valve({ selected, onClick }: ValveProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial
          color={selected ? '#fca5a5' : '#dc2626'}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.28, 0.06, 0.06]} />
        <meshStandardMaterial color={selected ? '#fca5a5' : '#b91c1c'} metalness={0.4} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.6} />
      </mesh>
      {/* Pipe stubs */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
