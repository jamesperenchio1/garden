'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SystemComponent, FlowIssue } from '@/types/system';

// ---------------------------------------------------------------------------
// Physics helpers
// ---------------------------------------------------------------------------

interface FlowEdge {
  from: SystemComponent;
  to: SystemComponent;
  /** 0–1 flow rate normalised */
  flowRate: number;
  /** true when water flows downward (gravity assists) */
  gravityAssisted: boolean;
  /** Effective tube length in metres used for the calculation. */
  lengthMetres: number;
  issue?: FlowIssue;
}

/** One world-space unit ≈ one metre for simulation purposes. */
function segmentLength(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function getConnectionPath(
  from: SystemComponent,
  to: SystemComponent,
  waypoints: { x: number; y: number; z: number }[]
) {
  return [from.position, ...waypoints, to.position];
}

export function computePathLength(path: { x: number; y: number; z: number }[]): number {
  let len = 0;
  for (let i = 0; i < path.length - 1; i++) {
    len += segmentLength(path[i], path[i + 1]);
  }
  return len;
}

function computeFlowEdges(components: SystemComponent[]): FlowEdge[] {
  const byId = Object.fromEntries(components.map((c) => [c.id, c]));
  const edges: FlowEdge[] = [];

  for (const comp of components) {
    for (const conn of comp.connections) {
      const target = byId[conn.toId];
      if (!target) continue;

      const heightDiff = comp.position.y - target.position.y; // positive = downhill
      const gravityAssisted = heightDiff > 0.01;

      const path = getConnectionPath(comp, target, conn.waypoints);
      const computedLength = computePathLength(path);
      const lengthMetres = conn.lengthOverride ?? computedLength;

      // Simple physics: base flow rate boosted by pump or gravity
      let flowRate = 0.4;

      if (comp.type === 'pump') flowRate = 0.95;
      if (gravityAssisted) flowRate = Math.min(1, flowRate + heightDiff * 0.3);
      if (comp.type === 'valve') {
        const open = comp.properties.open !== false;
        flowRate = open ? flowRate : 0;
      }
      if (comp.type === 'pipe') {
        const diameter = (comp.properties.diameter as number) ?? 0.05;
        flowRate *= Math.min(1, diameter / 0.05);
      }

      // Length-based pressure drop: 1m = negligible, 10m = mild, >50m = severe,
      // 1,000,000m = crushingly low. Uses an exponential decay; no cap, the user
      // is allowed to build absurd systems — they just get flagged.
      const lengthPenalty = Math.exp(-lengthMetres / 25);
      flowRate *= lengthPenalty;

      // Detect issues
      let issue: FlowIssue | undefined;
      if (flowRate < 0.2) {
        const reason =
          lengthMetres > 50
            ? `tube length ${lengthMetres.toFixed(0)}m is too long`
            : `low pressure`;
        issue = {
          type: 'pressure_drop',
          componentId: comp.id,
          severity: flowRate < 0.1 ? 'critical' : 'warning',
          description: `${(flowRate * 100).toFixed(0)}% flow ${comp.type} → ${target.type} (${reason})`,
        };
      }
      if (!gravityAssisted && comp.type !== 'pump' && flowRate < 0.5 && !issue) {
        issue = {
          type: 'dead_spot',
          componentId: comp.id,
          severity: 'warning',
          description: `Potential dead spot: ${comp.type} → ${target.type} (no pump, no gravity)`,
        };
      }

      edges.push({ from: comp, to: target, flowRate, gravityAssisted, lengthMetres, issue });
    }
  }

  return edges;
}

// ---------------------------------------------------------------------------
// Particle system per edge
// ---------------------------------------------------------------------------

const PARTICLES_PER_EDGE = 8;

interface ParticleTrailProps {
  edge: FlowEdge;
}

function ParticleTrail({ edge }: ParticleTrailProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Offsets spread particles evenly along the edge
  const offsets = useMemo(
    () => Array.from({ length: PARTICLES_PER_EDGE }, (_, i) => i / PARTICLES_PER_EDGE),
    []
  );

  // Colour: blue (good) → yellow (ok) → red (bad)
  const colour = useMemo(() => {
    const r = edge.flowRate;
    if (r > 0.6) return new THREE.Color('#3b82f6'); // blue
    if (r > 0.3) return new THREE.Color('#f59e0b'); // amber
    return new THREE.Color('#ef4444'); // red
  }, [edge.flowRate]);

  const fromVec = useMemo(
    () => new THREE.Vector3(edge.from.position.x, edge.from.position.y + 0.05, edge.from.position.z),
    [edge.from]
  );
  const toVec = useMemo(
    () => new THREE.Vector3(edge.to.position.x, edge.to.position.y + 0.05, edge.to.position.z),
    [edge.to]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    offsets.forEach((offset, i) => {
      const alpha = ((offset + t * edge.flowRate * 0.4) % 1 + 1) % 1;
      dummy.position.lerpVectors(fromVec, toVec, alpha);
      // slight arc: lift midpoint a bit
      dummy.position.y += Math.sin(alpha * Math.PI) * 0.12;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, colour);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (edge.flowRate < 0.01) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLES_PER_EDGE]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={0.5}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Issue indicator — floating sphere above problematic component
// ---------------------------------------------------------------------------

interface IssueIndicatorProps {
  component: SystemComponent;
  issue: FlowIssue;
}

function IssueIndicator({ component, issue }: IssueIndicatorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        component.position.y + 0.8 + Math.sin(clock.getElapsedTime() * 2) * 0.08;
    }
  });

  const colour = issue.severity === 'critical' ? '#ef4444' : '#f59e0b';

  return (
    <mesh
      ref={meshRef}
      position={[component.position.x, component.position.y + 0.8, component.position.z]}
    >
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={1} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface FlowSimulationProps {
  components: SystemComponent[];
}

export function FlowSimulation({ components }: FlowSimulationProps) {
  const edges = useMemo(() => computeFlowEdges(components), [components]);

  if (edges.length === 0) return null;

  const issueComponents = edges
    .filter((e) => e.issue)
    .map((e) => ({ component: e.from, issue: e.issue! }));

  return (
    <group>
      {edges.map((edge, i) => (
        <ParticleTrail key={`${edge.from.id}-${edge.to.id}-${i}`} edge={edge} />
      ))}
      {issueComponents.map(({ component, issue }, i) => (
        <IssueIndicator key={`issue-${component.id}-${i}`} component={component} issue={issue} />
      ))}
    </group>
  );
}

// Export computed issues so the UI can show them
export { computeFlowEdges };
export type { FlowEdge };
