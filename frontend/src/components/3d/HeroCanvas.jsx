import React, { useRef, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import PrinterModel from './PrinterModel';
import FloatingDocument from './FloatingDocument';

/** Loading fallback shown while 3D assets initialise */
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 rounded-2xl">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-400 text-xs font-medium tracking-wide">Loading 3D scene…</span>
    </div>
  );
}

/**
 * HeroCanvas — the complete hero 3D scene.
 * Renders the interactive printer + three floating PDF documents.
 * On screens narrower than 768px a static fallback is shown instead.
 */
export default function HeroCanvas({ isMobile = false }) {
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
  }, []);

  if (isMobile) {
    return <MobileFallback />;
  }

  return (
    <div
      className="hero-canvas-wrap canvas-bg"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          camera={{ position: [0, 0.6, 5.5], fov: 42 }}
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* ── Lighting ──────────────────────────────────────── */}
          <ambientLight intensity={0.55} color="#e0e8ff" />
          <directionalLight
            position={[4, 6, 5]}
            intensity={1.2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[512, 512]}
          />
          {/* Rim light from left/back */}
          <directionalLight position={[-3, 2, -3]} intensity={0.4} color="#6366f1" />
          {/* Soft fill from below */}
          <pointLight position={[0, -2, 2]} intensity={0.3} color="#1d4ed8" />

          {/* ── Ground shadow ─────────────────────────────────── */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.35}
            scale={8}
            blur={2.5}
            far={4}
            color="#0f172a"
          />

          {/* ── 3D Printer ───────────────────────────────────── */}
          <PrinterModel mouseRef={mouseRef} />

          {/* ── Floating PDF documents ────────────────────────── */}
          <FloatingDocument
            position={[-2.6, 0.6, 0.2]}
            phase={0}
            filename="DSA_Lab.pdf"
            copies={2}
            mode="B&W"
            sides="Front & Back"
          />
          <FloatingDocument
            position={[2.5, 0.3, -0.3]}
            phase={2.1}
            filename="CN_Record.pdf"
            copies={1}
            mode="Color"
            sides="Single Side"
          />
          <FloatingDocument
            position={[-2.2, -0.7, -0.5]}
            phase={4.2}
            filename="Project_Report.pdf"
            copies={3}
            mode="B&W"
            sides="Front & Back"
          />

          {/* Subtle environment for material reflections */}
          <Environment preset="city" />
        </Canvas>
      </Suspense>

      {/* Subtle corner gradient overlays to blend edges */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 105%, rgba(37,99,235,0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

/** Lightweight static fallback for mobile / low-power devices */
function MobileFallback() {
  return (
    <div className="hero-canvas-wrap canvas-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Stylised printer icon */}
        <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/25">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
            <line x1="9" y1="7" x2="15" y2="7" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-slate-400 text-xs font-medium">Upload. Print. Collect.</p>
        {/* Three mini document chips */}
        <div className="flex flex-col items-center gap-2 pt-1">
          {['DSA_Lab.pdf', 'CN_Record.pdf', 'Project_Report.pdf'].map((f) => (
            <div key={f} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/50 text-xs text-slate-300">
              <svg className="w-3.5 h-3.5 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
