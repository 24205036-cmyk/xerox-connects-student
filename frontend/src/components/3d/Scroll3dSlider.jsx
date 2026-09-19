import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const wrap = (val, range) => ((val % range) + range) % range;

const coverVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coverFragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uPlaneAspect;
  uniform vec2 uImageAspect;
  uniform float uOpacity;
  uniform float uBorderRadius;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float planeRatio = uPlaneAspect.x / uPlaneAspect.y;
    float imageRatio = uImageAspect.x / uImageAspect.y;
    if (planeRatio > imageRatio) {
      float scale = imageRatio / planeRatio;
      uv.y = uv.y * scale + (1.0 - scale) * 0.5;
    } else {
      float scale = planeRatio / imageRatio;
      uv.x = uv.x * scale + (1.0 - scale) * 0.5;
    }
    vec4 texColor = texture2D(uTexture, uv);
    vec4 placeholder = vec4(0.08, 0.12, 0.20, 1.0);
    gl_FragColor = mix(placeholder, texColor, uOpacity);

    if (uBorderRadius > 0.0) {
      float ar = uPlaneAspect.x / uPlaneAspect.y;
      vec2 uvCorr = (vUv - 0.5) * vec2(ar, 1.0);
      vec2 halfSize = vec2(ar * 0.5, 0.5);
      float r = uBorderRadius;
      vec2 q = abs(uvCorr) - halfSize + r;
      float d = length(max(q, 0.0)) - r;
      gl_FragColor.a *= 1.0 - smoothstep(-0.003, 0.003, d);
    }
  }
`;

export default function Scroll3dSlider({
  slides = [],
  direction = 'vertical',
  effectPreset = 'cards', // 'cards' | 'coverflow' | 'distortion' | 'carousel' | 'cube'
  backgroundColor = '#0b0f19',
  aspectRatio = 1.35,
  slideHeight = 2.4,
  slideGap = 0.28,
  borderRadius = 0.06,
  autoplay = true,
  autoplaySpeed = 0.5,
  wheelSpeed = 0.02,
  dragSpeed = 0.015,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !slides || slides.length === 0) return;

    const totalSlides = slides.length;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    const isHoriz = direction === 'horizontal';
    const slideSizes = Array(totalSlides).fill(isHoriz ? slideHeight * aspectRatio : slideHeight);
    const slideOffsets = [];
    let stackPosition = 0;

    for (let i = 0; i < totalSlides; i++) {
      if (i === 0) {
        slideOffsets.push(0);
        stackPosition = slideSizes[0] / 2;
      } else {
        stackPosition += slideGap + slideSizes[i] / 2;
        slideOffsets.push(stackPosition);
        stackPosition += slideSizes[i] / 2;
      }
    }
    const loopLength = stackPosition + slideGap + slideSizes[0] / 2;
    const halfLoop = loopLength / 2;

    const meshes = [];
    const textureLoader = new THREE.TextureLoader();

    for (let i = 0; i < totalSlides; i++) {
      const h = slideHeight;
      const w = h * aspectRatio;
      const geometry = new THREE.PlaneGeometry(w, h, 32, 16);
      const material = new THREE.ShaderMaterial({
        vertexShader: coverVertexShader,
        fragmentShader: coverFragmentShader,
        uniforms: {
          uTexture: { value: null },
          uPlaneAspect: { value: new THREE.Vector2(w, h) },
          uImageAspect: { value: new THREE.Vector2(1, 1) },
          uOpacity: { value: 0 },
          uBorderRadius: { value: borderRadius },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        offset: slideOffsets[i],
        index: i,
        originalVertices: [...geometry.attributes.position.array],
      };

      const imgUrl = slides[i]?.image || slides[i];
      if (imgUrl) {
        textureLoader.load(imgUrl, (tex) => {
          material.uniforms.uTexture.value = tex;
          material.uniforms.uImageAspect.value.set(tex.image.width, tex.image.height);
          material.uniforms.uOpacity.value = 1;
        });
      }
      scene.add(mesh);
      meshes.push(mesh);
    }

    let scrollTarget = 0;
    let scrollPosition = 0;
    let scrollMomentum = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let isHovered = false;
    let lastFrameTime = performance.now();
    let disposed = false;

    // Wheel
    const onWheel = (e) => {
      e.preventDefault();
      const delta = isHoriz ? (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) : e.deltaY;
      scrollTarget += delta * wheelSpeed * 0.08;
      scrollMomentum = delta * 0.005;
    };

    // Pointer events for drag
    const onPointerDown = (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      scrollMomentum = 0;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const delta = isHoriz ? e.clientX - dragStartX : e.clientY - dragStartY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      scrollTarget -= delta * dragSpeed;
      scrollMomentum = -delta * 0.01;
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onMouseEnter = () => { isHovered = true; };
    const onMouseLeave = () => { isHovered = false; isDragging = false; };

    renderer.domElement.style.cursor = 'grab';
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => {
      const r = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    let rafId;
    const animate = (time) => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastFrameTime) / 1000, 0.1);
      lastFrameTime = time;

      // Autoplay
      if (autoplay && !isDragging && !isHovered) {
        scrollTarget += autoplaySpeed * delta;
      }

      // Momentum damping
      if (!isDragging) {
        scrollTarget += scrollMomentum;
        scrollMomentum *= 0.92;
        if (Math.abs(scrollMomentum) < 0.0001) scrollMomentum = 0;
      }

      // Smooth scroll interpolation
      scrollPosition += (scrollTarget - scrollPosition) * 0.1;

      let closestDist = Infinity;
      let closestIdx = 0;

      for (const mesh of meshes) {
        const { offset, index } = mesh.userData;
        let pos = -(offset - wrap(scrollPosition, loopLength));
        pos = wrap(pos + halfLoop, loopLength) - halfLoop;

        mesh.rotation.set(0, 0, 0);
        mesh.position.set(0, 0, 0);

        if (isHoriz) {
          mesh.position.x = pos;
        } else {
          mesh.position.y = pos;
        }

        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = index;
        }

        // Apply 3D Effect Preset
        if (effectPreset === 'cards') {
          const t = Math.max(-1, Math.min(1, pos / 2.2));
          const absT = Math.abs(t);
          mesh.position.z = -absT * 1.8;
          mesh.rotation.x = t * 0.45;
          mesh.rotation.z = -t * 0.12;
          mesh.scale.setScalar(1 - absT * 0.18);
        } else if (effectPreset === 'coverflow') {
          const maxRot = (45 * Math.PI) / 180;
          const t = Math.max(-1, Math.min(1, pos / 1.6));
          const absT = Math.abs(t);
          if (isHoriz) {
            mesh.rotation.y = -t * maxRot;
            mesh.position.z = -absT * 1.5;
          } else {
            mesh.rotation.x = t * maxRot;
            mesh.position.z = -absT * 1.5;
          }
        } else if (effectPreset === 'carousel') {
          const maxRot = (50 * Math.PI) / 180;
          const t = Math.max(-1, Math.min(1, pos / 2));
          if (isHoriz) {
            mesh.rotation.y = -t * maxRot;
            mesh.position.z = -Math.abs(t) * 2;
          } else {
            mesh.rotation.x = t * maxRot;
            mesh.position.z = -Math.abs(t) * 2;
          }
        }
      }

      if (closestIdx !== activeIdx) {
        setActiveIdx(closestIdx);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);

      for (const mesh of meshes) {
        mesh.geometry.dispose();
        if (mesh.material.uniforms.uTexture?.value) {
          mesh.material.uniforms.uTexture.value.dispose();
        }
        mesh.material.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [slides, direction, effectPreset, aspectRatio, slideHeight, slideGap, borderRadius, autoplay, autoplaySpeed, wheelSpeed, dragSpeed]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        background: backgroundColor,
        touchAction: 'none',
        ...style,
      }}
    />
  );
}
