import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * PrinterModel — a stylized desktop printer built entirely from Three.js primitives.
 * Tracks mouse position for subtle look-at rotation.
 *
 * Props:
 *   mouseRef  { current: { x: number, y: number } }  – normalised [-1,1] mouse coords
 */
export default function PrinterModel({ mouseRef }) {
  const groupRef = useRef(null);
  // Target rotation for smooth lerp
  const targetRot = useRef({ x: 0, y: 0 });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Mouse-driven target
    if (mouseRef?.current) {
      targetRot.current.y = mouseRef.current.x * 0.28;
      targetRot.current.x = -mouseRef.current.y * 0.12;
    }

    // Lerp to target
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRot.current.y,
      0.04
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRot.current.x,
      0.04
    );

    // Gentle idle bobbing
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.06;
  });

  // Shared materials
  const bodyMat = { color: '#e8edf5', roughness: 0.35, metalness: 0.15 };
  const accentMat = { color: '#2563eb', roughness: 0.3, metalness: 0.2 };
  const darkMat = { color: '#1e293b', roughness: 0.5, metalness: 0.3 };
  const screenMat = { color: '#0ea5e9', roughness: 0.1, metalness: 0.6, emissive: '#0369a1', emissiveIntensity: 0.6 };
  const paperMat = { color: '#f8fafc', roughness: 0.9, metalness: 0.0 };

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* ── Main body ───────────────────────────────────── */}
      <RoundedBox args={[2.4, 1.1, 1.6]} radius={0.12} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial {...bodyMat} />
      </RoundedBox>

      {/* ── Top lid (scanner-style top panel) ───────────── */}
      <RoundedBox args={[2.4, 0.18, 1.6]} radius={0.08} smoothness={4} position={[0, 0.64, 0]} castShadow>
        <meshStandardMaterial color="#d1d9e8" roughness={0.3} metalness={0.18} />
      </RoundedBox>

      {/* ── Control panel (front top) ─────────────────── */}
      <RoundedBox args={[1.1, 0.22, 0.08]} radius={0.04} smoothness={4} position={[-0.45, 0.5, 0.84]} castShadow>
        <meshStandardMaterial color="#c8d0e0" roughness={0.25} metalness={0.2} />
      </RoundedBox>

      {/* ── Small LCD screen ──────────────────────────── */}
      <mesh position={[-0.45, 0.5, 0.88]}>
        <planeGeometry args={[0.55, 0.14]} />
        <meshStandardMaterial {...screenMat} />
      </mesh>

      {/* ── Buttons row ───────────────────────────────── */}
      {[0.55, 0.7, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0.88]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color={i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : '#6b7280'} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* ── Paper output slot (front face) ─────────────── */}
      <mesh position={[0, 0.1, 0.81]}>
        <boxGeometry args={[1.6, 0.06, 0.04]} />
        <meshStandardMaterial {...darkMat} />
      </mesh>

      {/* ── Output tray (front-bottom, angled) ──────────── */}
      <RoundedBox args={[1.6, 0.08, 0.5]} radius={0.04} smoothness={4} position={[0, -0.26, 1.02]} rotation={[-0.28, 0, 0]} castShadow>
        <meshStandardMaterial color="#d1d9e8" roughness={0.45} metalness={0.1} />
      </RoundedBox>

      {/* ── Input tray (back-bottom, angled) ────────────── */}
      <RoundedBox args={[1.6, 0.06, 0.7]} radius={0.04} smoothness={4} position={[0, 0.35, -0.72]} rotation={[0.32, 0, 0]} castShadow>
        <meshStandardMaterial color="#d1d9e8" roughness={0.45} metalness={0.1} />
      </RoundedBox>

      {/* ── Blue accent stripe on front ───────────────── */}
      <mesh position={[0, -0.42, 0.81]}>
        <boxGeometry args={[2.4, 0.07, 0.04]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>

      {/* ── Paper coming out of output slot ─────────────── */}
      <AnimatedPaper />

      {/* ── Logo text on front face (simple plane) ───────── */}
      <mesh position={[0.7, 0.5, 0.81]}>
        <boxGeometry args={[0.5, 0.05, 0.01]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Animated paper exiting the printer */
function AnimatedPaper() {
  const paperRef = useRef(null);

  useFrame(({ clock }) => {
    if (!paperRef.current) return;
    const t = clock.getElapsedTime();
    // Paper oscillates in/out of the slot
    const cycle = (Math.sin(t * 0.5) + 1) / 2; // 0 → 1 loop
    paperRef.current.position.z = 0.82 + cycle * 0.55;
    paperRef.current.position.y = 0.12 + cycle * 0.05;
  });

  return (
    <mesh ref={paperRef} position={[0, 0.12, 0.82]} castShadow>
      <boxGeometry args={[1.4, 0.01, 0.55]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.85} metalness={0.0} />
    </mesh>
  );
}
