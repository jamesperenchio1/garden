'use client';

import React, { useCallback } from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { SystemComponent } from '@/types/system';
import { Reservoir } from './components/reservoir';
import { Pump } from './components/pump';
import { Pipe } from './components/pipe';
import { Gutter } from './components/gutter';
import { NetPot } from './components/net-pot';
import { GrowBed } from './components/grow-bed';
import { AirStone } from './components/air-stone';
import { Valve } from './components/valve';
import { DripEmitter } from './components/drip-emitter';
import { WickingMaterial } from './components/wicking-material';
import { VerticalTower } from './components/vertical-tower';
import { FishTank } from './components/fish-tank';

const GRID_SIZE = 0.5; // snap grid unit in world units

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

interface ComponentRendererProps {
  component: SystemComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ComponentRenderer({ component, isSelected, onSelect }: ComponentRendererProps) {
  const { position, rotation, scale, type } = component;

  const sharedProps = {
    selected: isSelected,
    onClick: () => onSelect(component.id),
  };

  const componentMap: Record<string, React.ReactNode> = {
    reservoir: <Reservoir {...sharedProps} />,
    pump: <Pump {...sharedProps} />,
    pipe: <Pipe {...sharedProps} />,
    gutter: <Gutter {...sharedProps} />,
    net_pot: <NetPot {...sharedProps} />,
    grow_bed: <GrowBed {...sharedProps} />,
    air_stone: <AirStone {...sharedProps} />,
    valve: <Valve {...sharedProps} />,
    drip_emitter: <DripEmitter {...sharedProps} />,
    wicking_material: <WickingMaterial {...sharedProps} />,
    vertical_tower: <VerticalTower {...sharedProps} />,
    fish_tank: <FishTank {...sharedProps} />,
  };

  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
    >
      {componentMap[type] ?? null}
    </group>
  );
}

interface ConnectionLineProps {
  from: SystemComponent;
  to: SystemComponent;
}

function ConnectionLine({ from, to }: ConnectionLineProps) {
  const points = [
    new THREE.Vector3(from.position.x, from.position.y, from.position.z),
    new THREE.Vector3(to.position.x, to.position.y, to.position.z),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: '#60a5fa', transparent: true, opacity: 0.6 });
  const line = new THREE.Line(geometry, material);

  return <primitive object={line} />;
}

interface FloorPlaneProps {
  onPlaceComponent?: (position: { x: number; y: number; z: number }) => void;
}

function FloorPlane({ onPlaceComponent }: FloorPlaneProps) {
  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation?.();
      if (onPlaceComponent && e.point) {
        const pt = e.point as THREE.Vector3;
        onPlaceComponent({
          x: snapToGrid(pt.x),
          y: 0,
          z: snapToGrid(pt.z),
        });
      }
    },
    [onPlaceComponent]
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
      onClick={handleClick}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a2e1a" transparent opacity={0.0} />
    </mesh>
  );
}

interface SceneProps {
  components: SystemComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onPlaceComponent?: (position: { x: number; y: number; z: number }) => void;
  showGrid?: boolean;
}

export function Scene({
  components,
  selectedComponentId,
  onSelectComponent,
  onPlaceComponent,
  showGrid = true,
}: SceneProps) {
  const handleBackgroundClick = useCallback(() => {
    onSelectComponent(null);
  }, [onSelectComponent]);

  // Build a map of id → component for connection line rendering
  const componentMap = Object.fromEntries(components.map((c) => [c.id, c]));

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.4} />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={30}
      />

      {/* Grid floor */}
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={GRID_SIZE}
          cellThickness={0.5}
          cellColor="#2d4a2d"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#3d6b3d"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Invisible click-to-place floor */}
      <FloorPlane onPlaceComponent={onPlaceComponent} />

      {/* Background click to deselect */}
      <mesh
        visible={false}
        position={[0, 0, 0]}
        onClick={handleBackgroundClick}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial />
      </mesh>

      {/* Connection lines */}
      {components.map((comp) =>
        comp.connections.map((connId) => {
          const target = componentMap[connId];
          if (!target) return null;
          return (
            <ConnectionLine key={`${comp.id}-${connId}`} from={comp} to={target} />
          );
        })
      )}

      {/* Render all components */}
      {components.map((comp) => (
        <ComponentRenderer
          key={comp.id}
          component={comp}
          isSelected={selectedComponentId === comp.id}
          onSelect={onSelectComponent}
        />
      ))}
    </>
  );
}
