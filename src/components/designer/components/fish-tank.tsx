'use client';

interface FishTankProps {
  selected?: boolean;
  onClick?: () => void;
}

export function FishTank({ selected, onClick }: FishTankProps) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main tank body - transparent glass look */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.8, 0.9]} />
        <meshStandardMaterial
          color={selected ? '#93c5fd' : '#1d4ed8'}
          transparent
          opacity={0.3}
          metalness={0.1}
          roughness={0.05}
        />
      </mesh>
      {/* Water fill */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.36, 0.68, 0.86]} />
        <meshStandardMaterial
          color={selected ? '#7dd3fc' : '#0ea5e9'}
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* Frame edges - top */}
      <mesh position={[0, 0.41, 0]}>
        <boxGeometry args={[1.42, 0.04, 0.92]} />
        <meshStandardMaterial color={selected ? '#bfdbfe' : '#1e3a5f'} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Frame edges - bottom */}
      <mesh position={[0, -0.41, 0]}>
        <boxGeometry args={[1.42, 0.04, 0.92]} />
        <meshStandardMaterial color={selected ? '#bfdbfe' : '#1e3a5f'} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Corner pillars */}
      {[[-0.7, 0, -0.44], [-0.7, 0, 0.44], [0.7, 0, -0.44], [0.7, 0, 0.44]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.04, 0.86, 0.04]} />
          <meshStandardMaterial color={selected ? '#bfdbfe' : '#1e3a5f'} metalness={0.5} />
        </mesh>
      ))}
      {/* Aerator bubbles */}
      {[[-0.3, 0.3, 0.1], [0.1, 0.25, -0.1], [0.35, 0.28, 0.15]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.6} />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <boxGeometry args={[1.5, 0.88, 0.98]} />
          <meshStandardMaterial color="#60a5fa" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
