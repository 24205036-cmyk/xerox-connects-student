import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CloudUpload, SlidersHorizontal, Package, Zap,
  Clock, Shield, Printer, FileText, CheckCircle2, ChevronDown,
  ChevronUp, Star, FileCode2, Image, Copy, Search,
  Bell, Layers, RefreshCw, IndianRupee, Smartphone,
} from 'lucide-react';
import { checkHealth } from '../services/api';
import ImageScroller from '../components/ImageScroller';


/* ── FAQ item ─────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '16px 0',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 12,
          fontSize: 14, fontWeight: 600, color: '#1e293b',
        }}
      >
        <span>{q}</span>
        {open
          ? <ChevronUp style={{ width: 16, height: 16, color: '#2563eb', flexShrink: 0 }} />
          : <ChevronDown style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <p style={{ paddingBottom: 16, fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  /* ── Data ──────────────────────────────────────────────────── */
  const miniFeatures = [
    { icon: CloudUpload, label: 'Easy Upload', sub: 'Any device' },
    { icon: SlidersHorizontal, label: 'Custom Settings', sub: 'B&W / Color' },
    { icon: Search, label: 'Order Tracking', sub: 'Live status' },
    { icon: Package, label: 'Collect & Go', sub: 'No queue' },
  ];

  const ourServices = [
    { icon: FileText, label: 'B&W Printing' },
    { icon: Image, label: 'Color Printing' },
    { icon: FileCode2, label: 'PDF Convert' },
    { icon: Copy, label: 'Lab Records' },
  ];

  const whyUs = [
    'Upload from hostel or home',
    'No waiting in Xerox queue',
    'Order tracking & alerts',
    'Transparent per-page pricing',
  ];


  const stats = [
    { value: '2,400+', label: 'Print Orders', icon: '📦' },
    { value: '1,200+', label: 'Students Registered', icon: '🎓' },
    { value: '99%', label: 'Client Satisfaction', icon: '👍' },
    { value: '<2 hrs', label: 'Processing Time', icon: '⚡' },
    { value: 'A+', label: 'Quality You Can Trust', icon: '🏅' },
  ];

  return (
    <div style={{ background: '#f8faff', color: '#1e293b', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════
          §0 FRAMER IMAGE SCROLLER SHOWCASE
      ══════════════════════════════════════════════════════════ */}
      <ImageScroller />

      {/* ══════════════════════════════════════════════════════════
          §1 HERO  (Image 2 layout: text-left | image-center | cards-right)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '40px 0 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>

          {/* 2-column grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: '24px',
            alignItems: 'center',
            minHeight: 520,
          }} className="hero-cols">

            {/* ── LEFT: text content ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ paddingBottom: 32 }}
            >
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: '#eff6ff', border: '1px solid #bfdbfe',
                fontSize: 11, fontWeight: 700, color: '#1d4ed8',
                marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Smart Campus Printing. Perfect Results.
              </div>

              {/* Heading */}
              <h1 style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                fontWeight: 900, lineHeight: 1.08,
                letterSpacing: '-1px', color: '#0f172a',
                marginBottom: 12,
              }}>
                Skip Lines.<br />
                <span style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Get Prints.
                </span>
              </h1>

              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75, marginBottom: 22, maxWidth: 340 }}>
              </p>

              {/* Mini feature icons row */}


              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '12px 22px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                  transition: 'all 0.2s',
                }}>
                  <Zap style={{ width: 14, height: 14 }} />
                  Create Order
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>

              </div>

              {/* API status + trust */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: apiOnline === false ? '#d97706' : '#059669' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: apiOnline === false ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
                  {apiOnline === null ? 'Connecting…' : apiOnline ? 'Backend Connected' : 'Backend Offline'}
                  <span style={{ color: '#cbd5e1', fontWeight: 400 }}>·</span>
                  <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontWeight: 500 }}>Express.js API</span>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>
                  Skip the queue — upload from your hostel, collect when it's ready.
                </p>
              </div>
            </motion.div>

            {/* ── RIGHT: Printer image ───────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              }}
            >
              <img
                src="/printer_hero.jpg"
                alt="XeroXpress — campus digital printing machine"
                style={{
                  width: '100%',
                  maxHeight: 520,
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
                  filter: 'drop-shadow(0 20px 40px rgba(37,99,235,0.15))',
                }}
                loading="eager"
              />
            </motion.div>
          </div>
        </div>

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 767px) {
            .hero-cols { grid-template-columns: 1fr !important; }
            .hero-cols > *:nth-child(2) { order: -1; }
          }
        `}</style>
      </section>


    </div>
  );
}
