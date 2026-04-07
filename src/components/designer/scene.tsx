'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { OrbitControls, Grid, PivotControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { SystemComponent, Vec3 } from '@/types/system';
import { useDesignerStore, type DesignerTheme } from '@/store/designer-store';
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

function snapPoint(p: THREE.Vector3): Vec3 {
  return { x: snapToGrid(p.x), y: 0, z: snapToGrid(p.z) };
}

interface ComponentRendererProps {
  component: SystemComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ComponentRenderer({ component, isSelected, onSelect }: ComponentRendererProps) {
  const { position, rotation, scale, type } = component;
  const pivotMatrix = useRef(new THREE.Matrix4());
  const updateComponent = useDesignerStore((s) => s.updateComponent);

  const sharedProps = {
    selected: isSelected,
    onClick: () => {
      onSelect(component.id);
    },
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

  const inner = (
    <group
      scale={[scale.x, scale.y, scale.z]}
    >
      {componentMap[type] ?? null}
      {isSelected && (
        <>
          {/* Wireframe bounding box — always visible, never hidden inside a mesh. */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.35, 1.35, 1.35]} />
            <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.9} />
          </mesh>
          {/* Floor ring to highlight the footprint on the grid. */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.75, 0.95, 32]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.55} />
          </mesh>
        </>
      )}
    </group>
  );

  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      {isSelected ? (
        <PivotControls
          anchor={[0, 0, 0]}
          scale={1.2}
          depthTest={false}
          lineWidth={2}
          disableRotations
          disableSliders
          activeAxes={[true, true, true]}
          onDrag={(l) => {
            pivotMatrix.current.copy(l);
          }}
          onDragEnd={() => {
            const t = new THREE.Vector3();
            const r = new THREE.Quaternion();
            const s = new THREE.Vector3();
            pivotMatrix.current.decompose(t, r, s);
            const factor = Math.max(s.x, s.y, s.z);
            if (factor > 0 && Math.abs(factor - 1) > 0.01) {
              updateComponent(component.id, {
                scale: {
                  x: Math.max(0.1, scale.x * factor),
                  y: Math.max(0.1, scale.y * factor),
                  z: Math.max(0.1, scale.z * factor),
                },
              });
            }
            pivotMatrix.current.identity();
          }}
        >
          {inner}
        </PivotControls>
      ) : (
        inner
      )}
    </group>
  );
}

interface ConnectionLineProps {
  path: Vec3[];
  colour: string;
  opacity?: number;
  dashed?: boolean;
}

function ConnectionPath({ path, colour, opacity = 0.8, dashed = false }: ConnectionLineProps) {
  const geometry = useMemo(() => {
    const pts = path.map((p) => new THREE.Vector3(p.x, p.y + 0.05, p.z));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [path]);

  const line = useMemo(() => {
    if (dashed) {
      const mat = new THREE.LineDashedMaterial({
        color: colour,
        dashSize: 0.2,
        gapSize: 0.12,
        transparent: true,
        opacity,
      });
      const l = new THREE.Line(geometry, mat);
      l.computeLineDistances();
      return l;
    }
    const mat = new THREE.LineBasicMaterial({
      color: colour,
      transparent: true,
      opacity,
      linewidth: 2,
    });
    return new THREE.Line(geometry, mat);
  }, [geometry, colour, opacity, dashed]);

  return <primitive object={line} />;
}

interface FloorPlaneProps {
  onFloorClick: (point: Vec3) => void;
}

function FloorPlane({ onFloorClick }: FloorPlaneProps) {
  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation?.();
      if (e.point) {
        onFloorClick(snapPoint(e.point as THREE.Vector3));
      }
    },
    [onFloorClick]
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
      onClick={handleClick}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a2e1a" transparent opacity={0.0} />
    </mesh>
  );
}

/** Dashed preview line that follows the pointer while in connect mode. */
function ConnectPreview({ theme }: { theme: DesignerTheme }) {
  const connectMode = useDesignerStore((s) => s.connectMode);
  const components = useDesignerStore((s) => s.components);
  const { camera, pointer, raycaster } = useThree();
  const [hover, setHover] = React.useState<Vec3 | null>(null);
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  useFrame(() => {
    if (!connectMode.active) return;
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    const intersected = raycaster.ray.intersectPlane(planeRef.current, hit);
    if (intersected) {
      setHover({ x: hit.x, y: 0, z: hit.z });
    }
  });

  if (!connectMode.active || !connectMode.fromId) return null;
  const from = components.find((c) => c.id === connectMode.fromId);
  if (!from) return null;

  const path: Vec3[] = [
    from.position,
    ...connectMode.waypoints,
    hover ?? from.position,
  ];
  const colour = theme === 'dark' ? '#a3e635' : '#16a34a';

  return (
    <>
      <ConnectionPath path={path} colour={colour} opacity={0.9} dashed />
      {connectMode.waypoints.map((w, i) => (
        <mesh key={i} position={[w.x, w.y + 0.05, w.z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={colour} />
        </mesh>
      ))}
    </>
  );
}

interface SceneProps {
  components: SystemComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onPlaceComponent?: (position: Vec3) => void;
  showGrid?: boolean;
}

export function Scene({
  components,
  selectedComponentId,
  onSelectComponent,
  onPlaceComponent,
  showGrid = true,
}: SceneProps) {
  const theme = useDesignerStore((s) => s.theme);
  const connectMode = useDesignerStore((s) => s.connectMode);
  const addConnectWaypoint = useDesignerStore((s) => s.addConnectWaypoint);
  const finishConnectMode = useDesignerStore((s) => s.finishConnectMode);

  const handleBackgroundClick = useCallback(() => {
    onSelectComponent(null);
  }, [onSelectComponent]);

  // Build a map of id → component for connection line rendering
  const componentMap = useMemo(
    () => Object.fromEntries(components.map((c) => [c.id, c])),
    [components]
  );

  const handleFloorClick = useCallback(
    (point: Vec3) => {
      // In connect mode, floor clicks become waypoints.
      if (connectMode.active) {
        addConnectWaypoint(point);
        return;
      }
      // Otherwise, if a component type is pending, place it.
      onPlaceComponent?.(point);
    },
    [connectMode.active, addConnectWaypoint, onPlaceComponent]
  );

  const handleComponentSelect = useCallback(
    (id: string) => {
      if (connectMode.active && connectMode.fromId && connectMode.fromId !== id) {
        finishConnectMode(id);
        return;
      }
      onSelectComponent(id);
    },
    [connectMode.active, connectMode.fromId, finishConnectMode, onSelectComponent]
  );

  const connectionColour = theme === 'dark' ? '#60a5fa' : '#2563eb';
  const cellColour = theme === 'dark' ? '#2d4a2d' : '#cfd8cb';
  const sectionColour = theme === 'dark' ? '#3d6b3d' : '#7f9a7c';
  const backgroundColour = theme === 'dark' ? '#0d1a0d' : '#f4f7f2';

  return (
    <>
      {/* Theme-bound scene clear colour — without this the framebuffer stays black. */}
      <color attach="background" args={[backgroundColour]} />
      {/* Lighting */}
      <ambientLight intensity={theme === 'dark' ? 0.6 : 0.85} />
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
          cellColor={cellColour}
          sectionSize={2}
          sectionThickness={1}
          sectionColor={sectionColour}
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Invisible click-to-place floor */}
      <FloorPlane onFloorClick={handleFloorClick} />

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

      {/* Connection lines with waypoints */}
      {components.map((comp) =>
        comp.connections.map((conn, i) => {
          const target = componentMap[conn.toId];
          if (!target) return null;
          const path: Vec3[] = [comp.position, ...conn.waypoints, target.position];
          return (
            <ConnectionPath
              key={`${comp.id}-${conn.toId}-${i}`}
              path={path}
              colour={connectionColour}
              opacity={0.65}
            />
          );
        })
      )}

      {/* Waypoint markers for existing connections */}
      {components.flatMap((comp) =>
        comp.connections.flatMap((conn) =>
          conn.waypoints.map((w, i) => (
            <mesh
              key={`${comp.id}-${conn.toId}-wp-${i}`}
              position={[w.x, w.y + 0.05, w.z]}
            >
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color={connectionColour} />
            </mesh>
          ))
        )
      )}

      <ConnectPreview theme={theme} />

      {/* Render all components */}
      {components.map((comp) => (
        <ComponentRenderer
          key={comp.id}
          component={comp}
          isSelected={selectedComponentId === comp.id}
          onSelect={handleComponentSelect}
        />
      ))}
    </>
  );
}
