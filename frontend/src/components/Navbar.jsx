import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, Menu, X, ArrowRight, Zap } from 'lucide-react';
export default function Navbar() {
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location.pathname]);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: scrolled ? '0 8px 30px rgba(0,0,0,0.5)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            }}>
              <Printer style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
                Xero<span style={{ color: '#38bdf8' }}>Xpress</span>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                Upload. Print. Collect.
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {[
              { label: 'Home',         href: '/' },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                style={{
                  padding: '8px 14px', borderRadius: 9,
                  fontSize: 13, fontWeight: 600,
                  color: '#cbd5e1', textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden-mobile">

            <Link to="/login" style={{
              padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              color: '#e2e8f0', textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#e2e8f0'}>
              Sign In
            </Link>

            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 11,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(37,99,235,0.4)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 22px rgba(37,99,235,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(37,99,235,0.4)'; e.currentTarget.style.transform = 'none'; }}>
              <Zap style={{ width: 14, height: 14 }} />
              Create Order
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '8px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#cbd5e1', cursor: 'pointer', display: 'none',
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {isOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div style={{ background: '#0a0f1d', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
            {[
              { label: 'Home',         href: '/' },
            ].map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setIsOpen(false)}
                style={{ padding: '11px 8px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link to="/login" onClick={() => setIsOpen(false)}
              style={{ padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/login" onClick={() => setIsOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              <Zap style={{ width: 14, height: 14 }} /> Create Order <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </header>
  );
}
