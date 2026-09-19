import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 3D Document Card (PDF or Word)
function Doc3D({ position, type = 'PDF', isTarget = false, isConverting = false }) {
  const meshRef = useRef();
  const isPdf = type === 'PDF';
  const primaryColor = isPdf ? '#ef4444' : '#2563eb';
  const accentColor = isPdf ? '#dc2626' : '#1d4ed8';

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (isConverting) {
      meshRef.current.rotation.y = t * 2.5;
      meshRef.current.rotation.x = Math.sin(t * 3) * 0.2;
    } else {
      meshRef.current.rotation.y = Math.sin(t * 0.8 + (isTarget ? 2 : 0)) * 0.2;
      meshRef.current.rotation.x = Math.cos(t * 0.6) * 0.08;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Paper Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.6, 0.04]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Top Header Banner */}
      <mesh position={[0, 0.65, 0.025]}>
        <boxGeometry args={[1.2, 0.3, 0.01]} />
        <meshStandardMaterial color={primaryColor} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Badge Tag */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.7, 0.35, 0.01]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} />
      </mesh>

      {/* Text Label on Paper */}
      <Text
        position={[0, 0, 0.035]}
        fontSize={0.16}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>

      {/* Text lines mockup */}
      <mesh position={[0, -0.35, 0.025]}>
        <boxGeometry args={[0.8, 0.04, 0.005]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, -0.48, 0.025]}>
        <boxGeometry args={[0.6, 0.04, 0.005]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, -0.61, 0.025]}>
        <boxGeometry args={[0.75, 0.04, 0.005]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

// Glowing Energy Portal in the center
function ConversionPortal({ isConverting = false }) {
  const portalRef = useRef();

  useFrame(({ clock }) => {
    if (!portalRef.current) return;
    const t = clock.getElapsedTime();
    portalRef.current.rotation.z = t * (isConverting ? 4 : 1);
    portalRef.current.scale.setScalar(1 + (isConverting ? Math.sin(t * 8) * 0.15 : Math.sin(t * 2) * 0.05));
  });

  return (
    <group ref={portalRef} position={[0, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.6, 0.08, 16, 64]} />
        <meshStandardMaterial
          color={isConverting ? '#a855f7' : '#3b82f6'}
          emissive={isConverting ? '#9333ea' : '#2563eb'}
          emissiveIntensity={isConverting ? 2.5 : 1.2}
          roughness={0.2}
        />
      </mesh>
      {/* Particle core */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <MeshDistortMaterial
          color={isConverting ? '#c084fc' : '#60a5fa'}
          emissive={isConverting ? '#a855f7' : '#3b82f6'}
          emissiveIntensity={1.5}
          distort={0.4}
          speed={isConverting ? 6 : 2}
        />
      </mesh>
    </group>
  );
}

export default function Converter3DScene({ mode = 'PDF_TO_WORD', isConverting = false }) {
  const fromType = mode === 'PDF_TO_WORD' ? 'PDF' : 'DOCX';
  const toType = mode === 'PDF_TO_WORD' ? 'DOCX' : 'PDF';

  return (
    <div className="w-full h-44 sm:h-52 rounded-3xl bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white border border-slate-200 overflow-hidden relative shadow-sm">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-3 left-4 z-10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isConverting ? 'bg-purple-500 animate-ping' : 'bg-emerald-500'}`} />
        <span>3D Conversion Engine &bull; {mode === 'PDF_TO_WORD' ? 'PDF → Word' : 'Word → PDF'}</span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <pointLight position={[-4, 2, -2]} intensity={0.8} color="#60a5fa" />
        <pointLight position={[4, -2, -2]} intensity={0.8} color="#a855f7" />

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          {/* Source Document */}
          <Doc3D position={[-1.7, 0, 0]} type={fromType} isConverting={isConverting} />

          {/* Central Portal */}
          <ConversionPortal isConverting={isConverting} />

          {/* Target Document */}
          <Doc3D position={[1.7, 0, 0]} type={toType} isTarget isConverting={isConverting} />
        </Float>
      </Canvas>
    </div>
  );
}
