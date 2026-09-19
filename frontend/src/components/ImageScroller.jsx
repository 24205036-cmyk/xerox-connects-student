import React, { useEffect, useState, useRef, useMemo, startTransition } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Printer,
  Maximize2,
  Sliders,
  Move
} from 'lucide-react';

/**
 * ImageScroller
 * Faithfully adapted and enhanced from Framer component:
 * https://framer.com/m/ImageScroller-kjnj.js@aP86nmOJy6tPfN0rRzeL
 *
 * Features:
 * - Sticky full-screen viewport with multi-phase scroll progression
 * - Dynamic animated transitions (fade, scale, rotate, spiral, blur, zoom, saturate)
 * - Draggable interactive thumbnail dock with spring active indicator (layoutId="thumb-outline")
 * - High-definition background imagery with glassmorphism overlays
 * - Headline typography, badge pill, subtitle & CTA buttons
 * - Keyboard & click smooth scroll navigation
 * - Fallback / jump navigation to the next section
 */
export default function ImageScroller({
  items: userItems,
  transition: userTransition,
  layout: userLayout,
  dock: userDock,
  text: userText,
  thumbnails: userThumbnails,
  outline: userOutline,
  dragHandle: userDragHandle,
  onExploreClick,
}) {
  // Default Items tailored to XeroXpress campus printing
  const defaultItems = [
    {
      image: { src: '/campus_hub.jpg', alt: 'XeroXpress Campus Print Hub' },
      badge: 'Smart Campus Printing',
      text: 'Skip Lines. Print Smart.',
      subtitle: 'Upload documents straight from your hostel or phone. Collect instantly at campus express kiosks.',
      tag: 'Kiosk Pickup',
      ctaText: 'Start Print Order',
      ctaLink: '/login',
      priceBadge: 'From ₹1.50 / page',
    },
    {
      image: { src: '/campus_service_center.jpg', alt: 'Bright Campus Print & Xerox Center' },
      badge: 'Express Campus Service',
      text: 'Print & Xerox Center',
      subtitle: 'Fast counter pickups, high-speed multi-function copiers, thesis binding, and instant document solutions.',
      tag: 'Campus Counter',
      ctaText: 'Explore Print Services',
      ctaLink: '/login',
      priceBadge: '< 2 Hours Turnaround',
    },
    {
      image: { src: '/svc_color.jpg', alt: 'Creative Portfolios and Brochures' },
      badge: '120–300 GSM Premium Media',
      text: 'Portfolios & College Posters',
      subtitle: 'Brochures, event flyers, seminar handouts, and glossy portfolio spreads with rich tone fidelity.',
      tag: 'Creative Media',
      ctaText: 'Order Event Posters',
      ctaLink: '/login',
      priceBadge: 'Bulk Discounts',
    },
    {
      image: { src: '/svc_lab.jpg', alt: 'Hardbound Lab Records & Spiral Binding' },
      badge: 'University Approved Standards',
      text: 'Certified Lab Records & Binding',
      subtitle: 'Department-standard record notebooks, thesis hard-binding with gold foil embossing, and durable spiral combs.',
      tag: 'Record Binding',
      ctaText: 'Order Lab Record',
      ctaLink: '/login',
      priceBadge: 'Binding from ₹40',
    },
    {
      image: { src: '/svc_bw.jpg', alt: 'High Volume Laser Duplication' },
      badge: '1200 DPI Laser Clarity',
      text: 'Fast Academic Duplication',
      subtitle: 'High-speed lecture notes, question banks, and research papers with clean duplex printing.',
      tag: 'B&W Laser',
      ctaText: 'Upload PDF Notes',
      ctaLink: '/login',
      priceBadge: '₹1.50 / page',
    },
  ];

  const items = userItems || defaultItems;

  // Options & styling configs matching Framer component schema
  const transition = {
    transitionType: userTransition?.transitionType ?? 'fade', // 'fade' | 'scale' | 'zoom' | 'blur' | 'spiral' | 'saturate'
    imageAnimationDelay: userTransition?.imageAnimationDelay ?? 0,
    textAnimationDelay: userTransition?.textAnimationDelay ?? 0.15,
  };

  const layout = {
    backgroundColor: userLayout?.backgroundColor ?? '#090d16',
    componentPadding: userLayout?.componentPadding ?? 0,
  };

  const dock = {
    dockPosition: userDock?.dockPosition ?? 'bottom', // 'bottom' | 'center' | 'left' | 'right'
    thumbColor: userDock?.thumbColor ?? 'rgba(15, 23, 42, 0.68)',
    dockInset: userDock?.dockInset ?? 32,
    dockPadding: userDock?.dockPadding ?? 12,
    thumbBlur: userDock?.thumbBlur ?? 16,
    thumbRadius: userDock?.thumbRadius ?? 20,
  };

  const thumbnails = {
    thumbSize: userThumbnails?.thumbSize ?? 72,
    thumbnailRadius: userThumbnails?.thumbnailRadius ?? 14,
    thumbPadding: userThumbnails?.thumbPadding ?? 10,
    thumbImageRadius: userThumbnails?.thumbImageRadius ?? 12,
    dimInactive: userThumbnails?.dimInactive ?? true,
    inactiveOpacity: userThumbnails?.inactiveOpacity ?? 0.45,
  };

  const outline = {
    outlineSize: userOutline?.outlineSize ?? 78,
    outlineThickness: userOutline?.outlineThickness ?? 2.5,
    outlineRadius: userOutline?.outlineRadius ?? 16,
  };

  const dragHandle = {
    dragHandleShow: userDragHandle?.dragHandleShow ?? true,
    dragHandleColor: userDragHandle?.dragHandleColor ?? 'rgba(255, 255, 255, 0.25)',
    dragHandleRadius: userDragHandle?.dragHandleRadius ?? 6,
    dragHandleBGBlur: userDragHandle?.dragHandleBGBlur ?? 8,
    dragHandleWidth: userDragHandle?.dragHandleWidth ?? 44,
    dragHandleHeight: userDragHandle?.dragHandleHeight ?? 14,
    dragHandleInset: userDragHandle?.dragHandleInset ?? -18,
    dragHandleInnerColor: userDragHandle?.dragHandleInnerColor ?? '#ffffff',
    dragHandleInnerWidth: userDragHandle?.dragHandleInnerWidth ?? 22,
    dragHandleInnerHeight: userDragHandle?.dragHandleInnerHeight ?? 4,
    dragHandleInnerRadius: userDragHandle?.dragHandleInnerRadius ?? 2,
    dragHandleInnerOpacity: userDragHandle?.dragHandleInnerOpacity ?? 0.85,
  };

  // State & Refs
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const dockRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  // Optional active transition state so user can toggle preview styles
  const [activeTransitionType, setActiveTransitionType] = useState(transition.transitionType);

  // Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const getImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    if (typeof image === 'object') {
      const src = image.src;
      if (typeof src === 'string') return src;
      if (src && typeof src === 'object') {
        const nested = src.src;
        if (typeof nested === 'string') return nested;
      }
    }
    return '';
  };

  const validItems = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return arr.filter((item) => {
      if (!item) return false;
      const src = getImageSrc(item.image);
      return typeof src === 'string' && src.length > 0;
    });
  }, [items]);

  // Clamp index
  useEffect(() => {
    const total = validItems.length;
    if (total <= 0) return;
    const next = Math.max(0, Math.min(activeIndex, total - 1));
    if (next !== activeIndex) {
      startTransition(() => setActiveIndex(next));
    }
  }, [validItems.length]);

  // Scroll progress listener
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const totalItems = validItems.length;
      if (totalItems === 0) return;
      const newIndex = Math.min(Math.floor(latest * totalItems), totalItems - 1);
      startTransition(() => {
        setActiveIndex(newIndex);
      });
    });
    return () => unsubscribe();
  }, [scrollYProgress, validItems.length]);

  const scrollHeight = useMemo(() => {
    return Math.max(validItems.length * 100, 100);
  }, [validItems.length]);

  // Transition Variants (faithfully matching Framer component types)
  const getTransitionVariants = (type, index, active) => {
    const isActive = active === index;
    const isInitial = index === 0;

    switch (type) {
      case 'scale':
        return {
          initial: { opacity: isInitial ? 1 : 0, scale: isInitial ? 1 : 0.85 },
          animate: { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.15 },
        };
      case 'rotate':
        return {
          initial: { opacity: isInitial ? 1 : 0, rotate: isInitial ? 0 : -90 },
          animate: { opacity: isActive ? 1 : 0, rotate: isActive ? 0 : 90 },
        };
      case 'spiral':
        return {
          initial: { opacity: isInitial ? 1 : 0, rotate: isInitial ? 0 : -180, scale: isInitial ? 1 : 0.4 },
          animate: { opacity: isActive ? 1 : 0, rotate: isActive ? 0 : 180, scale: isActive ? 1 : 0.4 },
        };
      case 'blur':
        return {
          initial: { opacity: isInitial ? 1 : 0, filter: isInitial ? 'blur(0px)' : 'blur(20px)' },
          animate: { opacity: isActive ? 1 : 0, filter: isActive ? 'blur(0px)' : 'blur(20px)' },
        };
      case 'zoom':
        return {
          initial: { opacity: isInitial ? 1 : 0, scale: isInitial ? 1 : 0.7 },
          animate: { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.7 },
        };
      case 'saturate':
        return {
          initial: { opacity: isInitial ? 1 : 0, filter: isInitial ? 'saturate(1)' : 'saturate(3) contrast(1.5)' },
          animate: { opacity: isActive ? 1 : 0, filter: isActive ? 'saturate(1)' : 'saturate(3) contrast(1.5)' },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: isInitial ? 1 : 0 },
          animate: { opacity: isActive ? 1 : 0 },
        };
    }
  };

  // Smooth scroll to slide
  const handleThumbnailClick = (index) => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const containerTop = containerRef.current.offsetTop;
      const sectionHeight = window.innerHeight;
      const scrollTarget = containerTop + (index + 0.05) * sectionHeight;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  };

  // Skip down to home page content
  const handleScrollDownToContent = () => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const containerBottom = containerRef.current.offsetTop + containerRef.current.offsetHeight;
      window.scrollTo({ top: containerBottom, behavior: 'smooth' });
    }
  };

  // Dock positioning
  const getDockStyles = () => {
    const base = {
      position: 'absolute',
      zIndex: 30,
      pointerEvents: 'auto',
    };

    switch (dock.dockPosition) {
      case 'left':
        return { ...base, top: '50%', left: dock.dockInset, transform: 'translateY(-50%)' };
      case 'right':
        return { ...base, top: '50%', right: dock.dockInset, transform: 'translateY(-50%)' };
      case 'top':
        return { ...base, top: dock.dockInset, left: '50%', transform: 'translateX(-50%)' };
      case 'center':
      case 'bottom':
      default:
        return { ...base, bottom: dock.dockInset, left: '50%', transform: 'translateX(-50%)' };
    }
  };

  // Drag interaction
  function handleDragStart(e) {
    if (!dragHandle.dragHandleShow) return;
    if (!dockRef.current || !stickyRef.current) return;

    // Only initiate drag if clicking the handle area or header
    const handleEl = dockRef.current.querySelector('[aria-label="Drag handle"]');
    if (handleEl) {
      const rect = handleEl.getBoundingClientRect();
      if (
        e.clientX < rect.left - 20 ||
        e.clientX > rect.right + 20 ||
        e.clientY < rect.top - 15 ||
        e.clientY > rect.bottom + 15
      ) {
        return;
      }
    }

    e.preventDefault();
    startTransition(() => setIsDragging(true));

    const containerRect = stickyRef.current.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    const dockVisualX = dockRect.left - containerRect.left;
    const dockVisualY = dockRect.top - containerRect.top;

    dragOffset.current = {
      x: e.clientX - containerRect.left - dockVisualX,
      y: e.clientY - containerRect.top - dockVisualY,
    };

    if (typeof document !== 'undefined') {
      document.body.style.userSelect = 'none';
    }
  }

  function handleDragMove(e) {
    if (!isDragging || !dragHandle.dragHandleShow) return;
    if (!stickyRef.current || !dockRef.current) return;

    const containerRect = stickyRef.current.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();

    let relX = e.clientX - containerRect.left - dragOffset.current.x;
    let relY = e.clientY - containerRect.top - dragOffset.current.y;

    const minX = 16;
    const minY = 16;
    const maxX = containerRect.width - dockRect.width - 16;
    const maxY = containerRect.height - dockRect.height - 16;

    relX = Math.max(minX, Math.min(relX, maxX));
    relY = Math.max(minY, Math.min(relY, maxY));

    startTransition(() => setDrag({ x: relX, y: relY }));
  }

  function handleDragEnd() {
    startTransition(() => setIsDragging(false));
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = '';
    }
  }

  useEffect(() => {
    if (!isDragging || !dragHandle.dragHandleShow) return;
    const move = (e) => handleDragMove(e);
    const up = () => handleDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isDragging, dragHandle.dragHandleShow]);

  const dockDynamicStyle = {
    ...getDockStyles(),
    ...(drag.x !== 0 || drag.y !== 0
      ? {
          left: drag.x,
          top: drag.y,
          bottom: undefined,
          right: undefined,
          transform: undefined,
          position: 'absolute',
          pointerEvents: 'auto',
          zIndex: 30,
          cursor: isDragging ? 'grabbing' : 'grab',
          willChange: 'transform',
        }
      : {
          cursor: isDragging ? 'grabbing' : 'grab',
        }),
  };

  const isHorizontal =
    dock.dockPosition === 'bottom' ||
    dock.dockPosition === 'top' ||
    dock.dockPosition === 'center';

  const currentItem = validItems[activeIndex] || validItems[0];

  return (
    <div
      ref={containerRef}
      id="campus-showcase-scroller"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        height: `${scrollHeight}vh`,
        backgroundColor: layout.backgroundColor,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Sticky Viewport (100vh) ───────────────────────────────── */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: layout.componentPadding,
          left: layout.componentPadding,
          right: layout.componentPadding,
          width: `calc(100% - ${layout.componentPadding * 2}px)`,
          height: `calc(100vh - ${layout.componentPadding * 2}px)`,
          overflow: 'hidden',
          boxSizing: 'border-box',
          background: '#0a0f1d',
        }}
      >
        {/* Background Images with Animated Transitions */}
        {validItems.map((item, index) => {
          const variants = getTransitionVariants(activeTransitionType, index, activeIndex);
          const src = getImageSrc(item.image);
          const isActive = activeIndex === index;

          return (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: isActive ? 2 : 1,
                overflow: 'hidden',
              }}
              initial={variants.initial}
              animate={variants.animate}
              transition={{ duration: 0.75, ease: [0.25, 1, 0.35, 1], delay: transition.imageAnimationDelay }}
            >
              {/* Full bleed picture with balanced brightness */}
              <img
                src={src}
                alt={item.image?.alt || item.text}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  userSelect: 'none',
                  filter: 'brightness(0.9) contrast(1.04)',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 6s ease-out',
                }}
                draggable={false}
              />

              {/* Balanced lighting gradient overlay - comfortably soft without glare */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(7, 11, 20, 0.86) 0%, rgba(7, 11, 20, 0.38) 45%, rgba(7, 11, 20, 0.52) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Accent colored glow aura matching theme */}
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '30%',
                  width: '40vw',
                  height: '40vw',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                  filter: 'blur(80px)',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          );
        })}

        {/* ── Top Bar within Showcase (Slide indicator & Quick controls) ── */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            padding: '0 32px',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'auto',
          }}
        >
          {/* Live indicator badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              fontSize: 12,
              fontWeight: 600,
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 10px #38bdf8',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 11 }}>
              Campus Print Showcase
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color: '#93c5fd', fontFamily: 'monospace', fontWeight: 700 }}>
              0{activeIndex + 1} / 0{validItems.length}
            </span>
          </div>

          {/* Right controls: Transition changer + Direct skip button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Transition mode pill */}
            <div
              style={{
                display: 'none', // shown on md screens via media query
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                fontSize: 11,
              }}
              className="showcase-controls-desktop"
            >
              <Sliders style={{ width: 12, height: 12, color: '#38bdf8' }} />
              <span>FX:</span>
              {['fade', 'scale', 'blur', 'zoom'].map((fx) => (
                <button
                  key={fx}
                  onClick={() => setActiveTransitionType(fx)}
                  style={{
                    border: 'none',
                    background: activeTransitionType === fx ? '#2563eb' : 'transparent',
                    color: activeTransitionType === fx ? '#fff' : '#cbd5e1',
                    padding: '3px 8px',
                    borderRadius: 99,
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {fx}
                </button>
              ))}
            </div>

            {/* Skip to Main Home / Order section */}
            <button
              onClick={handleScrollDownToContent}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <span>Explore Home</span>
              <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* ── Center Content Hero Overlay ───────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            textAlign: 'center',
            color: '#FFFFFF',
            width: '90%',
            maxWidth: 920,
            pointerEvents: 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {validItems.map((item, index) => {
              if (index !== activeIndex) return null;
              const textVariants = getTransitionVariants(activeTransitionType, index, activeIndex);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 25, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: transition.textAnimationDelay }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {/* Category Pill Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 16px',
                      borderRadius: 999,
                      background: 'rgba(37, 99, 235, 0.25)',
                      border: '1px solid rgba(96, 165, 250, 0.4)',
                      backdropFilter: 'blur(12px)',
                      color: '#bfdbfe',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 16,
                      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <Sparkles style={{ width: 13, height: 13, color: '#60a5fa' }} />
                    {item.badge || 'XeroXpress Campus Network'}
                  </div>

                  {/* Main Cinematic Title */}
                  <h2
                    style={{
                      fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)',
                      fontWeight: 900,
                      lineHeight: 1.08,
                      letterSpacing: '-0.04em',
                      color: '#ffffff',
                      marginBottom: 16,
                      textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {item.text}
                  </h2>

                  {/* Subtitle description */}
                  <p
                    style={{
                      fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
                      color: '#cbd5e1',
                      lineHeight: 1.6,
                      maxWidth: 680,
                      marginBottom: 28,
                      fontWeight: 400,
                      textShadow: '0 2px 16px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {item.subtitle || 'Fast, reliable, and high-fidelity campus printing at your fingertips.'}
                  </p>

                  {/* Interactive CTAs on active slide */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 14,
                      pointerEvents: 'auto',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      to={item.ctaLink || '/login'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '14px 28px',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: 'none',
                        boxShadow: '0 8px 30px rgba(37, 99, 235, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      <Printer style={{ width: 16, height: 16 }} />
                      <span>{item.ctaText || 'Place Order'}</span>
                      <ArrowRight style={{ width: 16, height: 16 }} />
                    </Link>

                    {item.priceBadge && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '13px 20px',
                          borderRadius: 14,
                          background: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: '#38bdf8' }}>✦</span>
                        <span>{item.priceBadge}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Left / Right Arrow Navigators ────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 24,
            transform: 'translateY(-50%)',
            zIndex: 25,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => handleThumbnailClick(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous image"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: activeIndex === 0 ? 0.35 : 0.85,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeIndex > 0) e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              if (activeIndex > 0) e.currentTarget.style.opacity = '0.85';
            }}
          >
            <ChevronLeft style={{ width: 22, height: 22 }} />
          </button>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 24,
            transform: 'translateY(-50%)',
            zIndex: 25,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => handleThumbnailClick(Math.min(validItems.length - 1, activeIndex + 1))}
            disabled={activeIndex === validItems.length - 1}
            aria-label="Next image"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: activeIndex === validItems.length - 1 ? 'not-allowed' : 'pointer',
              opacity: activeIndex === validItems.length - 1 ? 0.35 : 0.85,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeIndex < validItems.length - 1) e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              if (activeIndex < validItems.length - 1) e.currentTarget.style.opacity = '0.85';
            }}
          >
            <ChevronRight style={{ width: 22, height: 22 }} />
          </button>
        </div>

        {/* ── DRAGGABLE INTERACTIVE DOCK (Framer Component Faithful) ──── */}
        <div
          ref={dockRef}
          style={dockDynamicStyle}
          onMouseDown={dragHandle.dragHandleShow ? handleDragStart : undefined}
        >
          {/* Drag Handle Top Bar */}
          {dragHandle.dragHandleShow && (
            <div
              style={{
                position: 'absolute',
                top: dragHandle.dragHandleInset,
                left: '50%',
                transform: 'translateX(-50%)',
                width: dragHandle.dragHandleWidth,
                height: dragHandle.dragHandleHeight,
                borderRadius: dragHandle.dragHandleRadius,
                background: dragHandle.dragHandleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 35,
                cursor: isDragging ? 'grabbing' : 'grab',
                backdropFilter: dragHandle.dragHandleBGBlur
                  ? `blur(${dragHandle.dragHandleBGBlur}px)`
                  : undefined,
                WebkitBackdropFilter: dragHandle.dragHandleBGBlur
                  ? `blur(${dragHandle.dragHandleBGBlur}px)`
                  : undefined,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              aria-label="Drag handle"
              title="Drag to reposition thumbnail dock"
            >
              <svg
                width={dragHandle.dragHandleInnerWidth}
                height={dragHandle.dragHandleInnerHeight}
                viewBox={`0 0 ${dragHandle.dragHandleInnerWidth} ${dragHandle.dragHandleInnerHeight}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <rect
                  x="0"
                  y="0"
                  width={dragHandle.dragHandleInnerWidth}
                  height={dragHandle.dragHandleInnerHeight}
                  rx={dragHandle.dragHandleInnerRadius}
                  fill={dragHandle.dragHandleInnerColor}
                  fillOpacity={dragHandle.dragHandleInnerOpacity}
                />
              </svg>
            </div>
          )}

          {/* Dock Glass Background Panel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: dock.thumbColor,
              borderRadius: dock.thumbRadius,
              backdropFilter: dock.thumbBlur ? `blur(${dock.thumbBlur}px)` : undefined,
              WebkitBackdropFilter: dock.thumbBlur ? `blur(${dock.thumbBlur}px)` : undefined,
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.3)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Thumbnails Row */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: isHorizontal ? 'row' : 'column',
              gap: thumbnails.thumbPadding,
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: dock.dockPadding,
              background: 'transparent',
            }}
          >
            {validItems.map((item, index) => {
              const src = getImageSrc(item.image);
              const isActive = activeIndex === index;

              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: thumbnails.thumbSize,
                    height: thumbnails.thumbSize,
                    minWidth: thumbnails.thumbSize,
                    minHeight: thumbnails.thumbSize,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleThumbnailClick(index)}
                  title={item.text}
                >
                  {/* Framer Animated Active Indicator Outline with Spring */}
                  {isActive && (
                    <motion.div
                      layoutId="thumb-outline"
                      style={{
                        position: 'absolute',
                        top: `calc(50% - ${outline.outlineSize / 2}px)`,
                        left: `calc(50% - ${outline.outlineSize / 2}px)`,
                        width: outline.outlineSize,
                        height: outline.outlineSize,
                        boxSizing: 'border-box',
                        border: `${outline.outlineThickness}px solid #38bdf8`,
                        borderRadius: outline.outlineRadius,
                        boxShadow: '0 0 16px rgba(56, 189, 248, 0.6), inset 0 0 8px rgba(56, 189, 248, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        background: 'transparent',
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}

                  {/* Thumbnail Card Content */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: thumbnails.thumbImageRadius,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      opacity: thumbnails.dimInactive && !isActive ? thumbnails.inactiveOpacity : 1,
                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                      transition: 'opacity 0.25s ease, transform 0.25s ease',
                      border: isActive
                        ? '1px solid rgba(255,255,255,0.4)'
                        : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <img
                      src={src}
                      alt={item.image?.alt || item.text}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                      }}
                      draggable={false}
                    />

                    {/* Gradient label overlay on hover/active */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isActive
                          ? 'linear-gradient(to top, rgba(14, 165, 233, 0.4) 0%, transparent 60%)'
                          : 'rgba(0, 0, 0, 0.2)',
                        transition: 'background 0.2s',
                      }}
                    />

                    {/* Miniature index badge */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        right: 4,
                        fontSize: 9,
                        fontWeight: 800,
                        color: '#ffffff',
                        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                        fontFamily: 'monospace',
                      }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Scroll Down Cue / Hint ────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 28,
            zIndex: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255, 255, 255, 0.55)',
            fontSize: 11,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
          onClick={handleScrollDownToContent}
        >
          <span>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ChevronDown style={{ width: 14, height: 14, color: '#38bdf8' }} />
          </motion.div>
        </div>
      </div>

      {/* Embedded CSS for pulse and responsiveness */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @media (min-width: 768px) {
          .showcase-controls-desktop {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          #campus-showcase-scroller [aria-label="Drag handle"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
