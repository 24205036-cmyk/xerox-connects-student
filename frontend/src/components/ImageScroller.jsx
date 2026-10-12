import React, { useEffect, useState, useRef, useMemo, startTransition } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Printer
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
      image: { src: '/campus_service_center.jpg', alt: 'Bright Sunlit Campus Print & Xerox Center' },
      badge: 'Smart Campus Printing',
      text: 'Skip Lines. Print Smart.',
      subtitle: 'Upload documents straight from your hostel or phone. Collect instantly at campus express kiosks.',
      tag: 'Kiosk Pickup',
      ctaText: 'Start Print Order',
      ctaLink: '/login',
      priceBadge: 'From ₹1.50 / page',
    },
    {
      image: { src: '/images/reg_campus_hub.jpg', alt: 'Bright Campus Student Print Collection Hub' },
      badge: 'Express Campus Service',
      text: 'Print & Xerox Center',
      subtitle: 'Fast counter pickups, high-speed multi-function copiers, thesis binding, and instant document solutions.',
      tag: 'Campus Counter',
      ctaText: 'Explore Print Services',
      ctaLink: '/login',
      priceBadge: '< 2 Hours Turnaround',
    },
    {
      image: { src: '/carousel/organized_study_desk.jpg', alt: 'Bright Sunlit Academic Study & Thesis Station' },
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
    show: userDock?.show ?? false, // Hidden per user request
    dockPosition: userDock?.dockPosition ?? 'bottom', // 'bottom' | 'center' | 'left' | 'right'
    thumbColor: userDock?.thumbColor ?? 'rgba(15, 23, 42, 0.68)',
    dockInset: userDock?.dockInset ?? 32,
    dockPadding: userDock?.dockPadding ?? 14,
    thumbBlur: userDock?.thumbBlur ?? 16,
    thumbRadius: userDock?.thumbRadius ?? 24,
  };

  const thumbnails = {
    thumbSize: userThumbnails?.thumbSize ?? 96,
    thumbnailRadius: userThumbnails?.thumbnailRadius ?? 18,
    thumbPadding: userThumbnails?.thumbPadding ?? 12,
    thumbImageRadius: userThumbnails?.thumbImageRadius ?? 16,
    dimInactive: userThumbnails?.dimInactive ?? true,
    inactiveOpacity: userThumbnails?.inactiveOpacity ?? 0.45,
  };

  const outline = {
    outlineSize: userOutline?.outlineSize ?? 102,
    outlineThickness: userOutline?.outlineThickness ?? 2.5,
    outlineRadius: userOutline?.outlineRadius ?? 20,
  };

  const dragHandle = {
    dragHandleShow: userDragHandle?.dragHandleShow ?? true,
    dragHandleColor: userDragHandle?.dragHandleColor ?? 'rgba(255, 255, 255, 0.25)',
    dragHandleRadius: userDragHandle?.dragHandleRadius ?? 6,
    dragHandleBGBlur: userDragHandle?.dragHandleBGBlur ?? 8,
    dragHandleWidth: userDragHandle?.dragHandleWidth ?? 54,
    dragHandleHeight: userDragHandle?.dragHandleHeight ?? 14,
    dragHandleInset: userDragHandle?.dragHandleInset ?? -18,
    dragHandleInnerColor: userDragHandle?.dragHandleInnerColor ?? '#ffffff',
    dragHandleInnerWidth: userDragHandle?.dragHandleInnerWidth ?? 26,
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

  const activeTransitionType = transition.transitionType;

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
                  filter: 'brightness(1.05) contrast(1.02) saturate(1.04)',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 6s ease-out',
                }}
                draggable={false}
              />

              {/* Balanced natural lighting gradient overlay - bright and open */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(10, 15, 29, 0.68) 0%, rgba(10, 15, 29, 0.14) 48%, rgba(10, 15, 29, 0.35) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Soft radial backdrop to enhance center text legibility without dimming the bright daylight */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse at 50% 44%, rgba(10, 15, 29, 0.32) 0%, transparent 68%)',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          );
        })}


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
                    {item.badge || 'XeroXpress Campus Network'}
                  </div>

                  {/* Main Cinematic Title */}
                  <h2
                    style={{
                      fontSize: 'clamp(2.8rem, 6.2vw, 5.2rem)',
                      fontWeight: 900,
                      lineHeight: 1.06,
                      letterSpacing: '-0.04em',
                      color: '#ffffff',
                      marginBottom: 18,
                      textShadow: '0 4px 30px rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {item.text}
                  </h2>

                  {/* Subtitle description */}
                  <p
                    style={{
                      fontSize: 'clamp(1.15rem, 1.8vw, 1.4rem)',
                      color: '#cbd5e1',
                      lineHeight: 1.6,
                      maxWidth: 780,
                      marginBottom: 32,
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
                      gap: 16,
                      pointerEvents: 'auto',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      to={item.ctaLink || '/login'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '16px 36px',
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 15,
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
                      <Printer style={{ width: 18, height: 18 }} />
                      <span>{item.ctaText || 'Place Order'}</span>
                      <ArrowRight style={{ width: 18, height: 18 }} />
                    </Link>

                    {item.priceBadge && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '15px 24px',
                          borderRadius: 16,
                          background: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
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
              width: 52,
              height: 52,
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
            <ChevronLeft style={{ width: 26, height: 26 }} />
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
              width: 52,
              height: 52,
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
            <ChevronRight style={{ width: 26, height: 26 }} />
          </button>
        </div>

        {/* ── DRAGGABLE INTERACTIVE DOCK (Framer Component Faithful) ──── */}
        {dock.show && (
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
        )}

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
