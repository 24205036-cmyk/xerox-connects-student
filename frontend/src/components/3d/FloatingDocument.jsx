import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * FloatingDocument — a lightweight 3D PDF card with an HTML overlay label.
 * Props:
 *   position [x, y, z]   – world-space anchor
 *   phase    number       – float phase offset (radians) so cards don't sync
 *   filename string       – displayed filename
 *   copies   number       – copy count label
 *   mode     string       – "B&W" | "Color"
 *   sides    string       – "Front & Back" | "Single Side"
 */
export default function FloatingDocument({
  position = [0, 0, 0],
  phase = 0,
  filename = 'document.pdf',
  copies = 1,
  mode = 'B&W',
  sides = 'Front & Back',
}) {
  const groupRef = useRef(null);
  const startY = position[1];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle vertical float
    groupRef.current.position.y = startY + Math.sin(t * 0.7 + phase) * 0.12;
    // Slow idle rotation
    groupRef.current.rotation.y = Math.sin(t * 0.4 + phase) * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.3 + phase + 1) * 0.06;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Paper body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.75, 0.04]} />
        <meshStandardMaterial
          color="#f0f4ff"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Top accent bar (blue) */}
      <mesh position={[0, 0.74, 0.025]}>
        <boxGeometry args={[1.35, 0.28, 0.01]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Thin red corner fold triangle approximation */}
      <mesh position={[0.52, 0.76, 0.03]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.2, 0.01]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>

      {/* Lines on the page */}
      {[-0.1, -0.3, -0.5, -0.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.026]}>
          <boxGeometry args={[0.9, 0.025, 0.005]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
      ))}

      {/* HTML overlay label */}
      <Html
        center
        distanceFactor={5}
        position={[0, 0, 0.1]}
        style={{ pointerEvents: 'none' }}
        occlude={false}
      >
        <div className="doc-card-3d">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <span style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}>{filename}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', borderRadius: '6px', padding: '2px 6px', fontSize: '10px' }}>
              {copies} {copies === 1 ? 'copy' : 'copies'}
            </span>
            <span style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8', borderRadius: '6px', padding: '2px 6px', fontSize: '10px' }}>
              {mode}
            </span>
            <span style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8', borderRadius: '6px', padding: '2px 6px', fontSize: '10px' }}>
              {sides}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
