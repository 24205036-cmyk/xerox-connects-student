import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ───────────────────────────────────────────────────────── 3D Math Engine
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEG = Math.PI / 180;

function identity() {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
  ];
}

function rotationX(a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function rotationY(a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}


function transform(m, x, y, z, out) {
  out.x = m[0] * x + m[1] * y + m[2] * z;
  out.y = m[3] * x + m[4] * y + m[5] * z;
  out.z = m[6] * x + m[7] * y + m[8] * z;
}

function orthonormalize(m) {
  let [ax, ay, az, bx, by, bz] = m;
  let la = Math.hypot(ax, ay, az) || 1;
  ax /= la; ay /= la; az /= la;

  const dot = bx * ax + by * ay + bz * az;
  bx -= ax * dot;
  by -= ay * dot;
  bz -= az * dot;
  const lb = Math.hypot(bx, by, bz) || 1;
  bx /= lb; by /= lb; bz /= lb;

  const cx = ay * bz - az * by;
  const cy = az * bx - ax * bz;
  const cz = ax * by - ay * bx;
  return [ax, ay, az, bx, by, bz, cx, cy, cz];
}

export default function GlobeCarousel3D({
  images = [],
  radius = 195,
  tileWidth = 120,
  tileHeight = 114,
  distance = 700,
  speed = 11,
  axis = 'y',
  friction = 0.94,
  count = 20,
  onSelectImage
}) {
  const containerRef = useRef(null);
  const canvasStageRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const stateRef = useRef({
    R: multiply(rotationX(8 * DEG), identity()),
    velYaw: 0,
    velPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    travelled: 0,
    rafId: null,
    tiles: [],
    W: 0,
    H: 0,
    spun: 0,
    lastFrame: 0,
    isAutoRotating: true,
    currentAxis: axis
  });

  useEffect(() => {
    const stage = canvasStageRef.current;
    const container = containerRef.current;
    if (!stage || !container || images.length === 0) return;

    stage.innerHTML = '';
    const tiles = [];
    const totalTiles = Math.max(images.length, count);

    for (let i = 0; i < totalTiles; i++) {
      const uy = totalTiles === 1 ? 0 : 1 - (i / (totalTiles - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - uy * uy));
      const theta = i * GOLDEN_ANGLE;

      const el = document.createElement('div');
      el.className = 'absolute top-0 left-0 overflow-hidden cursor-pointer select-none group will-change-transform';
      el.style.borderRadius = '18px';
      el.style.border = '1px solid rgba(255, 255, 255, 0.22)';
      el.style.boxShadow = '0 16px 36px -4px rgba(0, 0, 0, 0.75), 0 0 1px 1px rgba(255, 255, 255, 0.15)';
      el.style.background = '#141519';
      el.style.backdropFilter = 'blur(6px)';

      const img = document.createElement('img');
      img.className = 'w-full h-full object-cover pointer-events-none block';
      img.loading = 'eager';
      const imgData = images[i % images.length];
      img.src = imgData.src;
      img.alt = imgData.title || `Carousel Image ${i + 1}`;

      const glare = document.createElement('div');
      glare.className = 'absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/50 pointer-events-none opacity-50';

      el.appendChild(img);
      el.appendChild(glare);
      stage.appendChild(el);

      tiles.push({
        el,
        img,
        imgData,
        index: i % images.length,
        ux: Math.cos(theta) * r,
        uy,
        uz: Math.sin(theta) * r
      });
    }

    stateRef.current.tiles = tiles;

    const updateSize = () => {
      stateRef.current.W = container.clientWidth;
      stateRef.current.H = container.clientHeight;
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const pt = { x: 0, y: 0, z: 0 };

    const animate = (now) => {
      const state = stateRef.current;
      const dt = state.lastFrame ? Math.min(0.1, (now - state.lastFrame) / 1000) : 0;
      state.lastFrame = now;

      const { W, H, tiles } = state;

      if (!state.dragging) {
        if (state.isAutoRotating) {
          const a = speed * DEG * dt;
          if (state.currentAxis === 'x') {
            state.R = multiply(state.R, rotationX(a));
          } else if (state.currentAxis === 'tumble') {
            state.R = multiply(multiply(state.R, rotationY(a)), rotationX(a * 0.618));
          } else {
            state.R = multiply(state.R, rotationY(a));
          }
        }

        if (state.velYaw || state.velPitch) {
          state.R = multiply(
            multiply(rotationY(state.velYaw * dt), rotationX(state.velPitch * dt)),
            state.R
          );
          const decay = Math.pow(friction, dt * 60);
          state.velYaw *= decay;
          state.velPitch *= decay;
          if (Math.abs(state.velYaw) < 0.0005) state.velYaw = 0;
          if (Math.abs(state.velPitch) < 0.0005) state.velPitch = 0;
        }

        if (++state.spun % 240 === 0) {
          state.R = orthonormalize(state.R);
        }
      }

      if (W > 0 && H > 0 && tiles.length > 0) {
        const cx = W / 2;
        const cy = H / 2;
        // Scale with tighter spacing between cards
        const fit = Math.min(W, H) / 560;
        const curRadius = radius * fit;
        const curTileW = tileWidth * fit;
        const curTileH = tileHeight * fit;
        const curDist = Math.max(distance * fit, curRadius * 1.1);

        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i];
          transform(state.R, t.ux, t.uy, t.uz, pt);
          const z2 = pt.z;
          const wx = pt.x * curRadius;
          const wy = pt.y * curRadius;
          const wz = pt.z * curRadius;

          const scale = curDist / (curDist - wz);
          const tw = curTileW * scale;
          const th = curTileH * scale;
          const x = cx + wx * scale - tw / 2;
          const y = cy + wy * scale - th / 2;

          const front = (z2 + 1) / 2;
          const opacity = 0.25 + 0.75 * Math.pow(front, 1.3);

          const s = t.el.style;
          s.width = `${tw}px`;
          s.height = `${th}px`;
          s.zIndex = String(Math.round(front * 1000));
          s.opacity = String(opacity);
          s.transform = `translate3d(${x}px, ${y}px, 0)`;

          if (front > 0.65) {
            s.borderColor = 'rgba(255, 255, 255, 0.28)';
            s.boxShadow = '0 20px 45px -8px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.15)';
          } else {
            s.borderColor = 'rgba(255, 255, 255, 0.08)';
            s.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.7)';
          }
        }
      }

      state.rafId = requestAnimationFrame(animate);
    };

    stateRef.current.lastFrame = 0;
    stateRef.current.rafId = requestAnimationFrame(animate);

    return () => {
      ro.disconnect();
      if (stateRef.current.rafId) {
        cancelAnimationFrame(stateRef.current.rafId);
      }
    };
  }, [images, count, radius, tileWidth, tileHeight, distance, speed, friction]);

  const handlePointerDown = (e) => {
    const state = stateRef.current;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.lastT = performance.now();
    state.velYaw = 0;
    state.velPitch = 0;
    state.travelled = 0;
    state.dragging = true;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e) => {
    const state = stateRef.current;
    if (!state.dragging) return;

    const now = performance.now();
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    const dt = Math.max(1, now - state.lastT) / 1000;
    state.travelled += Math.hypot(dx, dy);

    const W = Math.max(1, state.W);
    const H = Math.max(1, state.H);
    const ay = dx * (Math.PI / W);
    const ax = -dy * (Math.PI / H);

    state.R = multiply(multiply(rotationY(ay), rotationX(ax)), state.R);
    state.velYaw = ay / dt;
    state.velPitch = ax / dt;

    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.lastT = now;
  };

  const handlePointerUp = (e) => {
    const state = stateRef.current;
    state.dragging = false;

    if (state.travelled < 8) {
      const hit = e.target.closest('div');
      if (hit) {
        const found = state.tiles.find((t) => t.el === hit);
        if (found && found.imgData) {
          setActiveItem(found.imgData);
          if (onSelectImage) onSelectImage(found.imgData);
        }
      }
    }
  };


  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[580px] overflow-hidden select-none flex items-center justify-center"
    >
      {/* Natural Studio Light Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.035) 0%, transparent 70%)'
        }}
      />

      {/* Orbit Canvas Stage */}
      <div
        ref={canvasStageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none z-10"
      />



      {/* ────────────────── Detail Lightbox Modal on Tile Click ────────────────── */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-4 z-50 rounded-3xl bg-slate-950/95 border border-white/20 backdrop-blur-2xl flex flex-col justify-between p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  {activeItem.tag}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">{activeItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Preview Image */}
            <div className="relative my-auto max-h-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center">
              <img
                src={activeItem.src}
                alt={activeItem.title}
                className="w-full h-full max-h-[300px] object-contain"
              />
            </div>

            {/* Modal Description Footer */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{activeItem.subtitle}</p>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Back to Orbit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
