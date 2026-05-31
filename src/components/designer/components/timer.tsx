'use client';

import * as THREE from 'three';
import { useMemo } from 'react';

export function Timer() {
  const group = useMemo(() => {
    const g = new THREE.Group();

    // Main box body
    const bodyGeo = new THREE.BoxGeometry(0.3, 0.2, 0.15);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#334155' });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.1;
    g.add(body);

    // Display screen
    const screenGeo = new THREE.PlaneGeometry(0.22, 0.12);
    const screenMat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      emissive: '#0ea5e9',
      emissiveIntensity: 0.3,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.12, 0.076);
    g.add(screen);

    // Dial / knob
    const knobGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
    const knobMat = new THREE.MeshStandardMaterial({ color: '#f59e0b' });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(0.1, 0.22, 0);
    g.add(knob);

    // Power LED
    const ledGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const ledMat = new THREE.MeshStandardMaterial({ color: '#22c55e', emissive: '#22c55e', emissiveIntensity: 0.8 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.1, 0.22, 0.05);
    g.add(led);

    // Cable
    const cableGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set(0, 0.05, -0.15);
    cable.rotation.x = Math.PI / 2;
    g.add(cable);

    return g;
  }, []);

  return <primitive object={group} />;
}
