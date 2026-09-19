import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Clock, MapPin, Shield, FileCheck2, Phone, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top info bar */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#cbd5e1' }}>
            <Clock style={{ width: 14, height: 14, color: '#f59e0b', flexShrink: 0 }} />
            <span><strong>Order Window:</strong> 06:00 AM – 08:30 PM daily</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#cbd5e1' }}>
            <MapPin style={{ width: 14, height: 14, color: '#2563eb', flexShrink: 0 }} />
            <span>Collection: Campus Central Xerox Counter</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '2rem', marginBottom: 36 }} className="footer-grid">

          {/* Col 1 — Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                <Printer style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
                  Xero<span style={{ color: '#60a5fa' }}>Xpress</span>
                </div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>Upload. Print. Collect.</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.75, maxWidth: 280, marginBottom: 16 }}>
              The smart campus printing platform. Order B&W prints, color prints, lab records, and project reports — anytime from anywhere.
            </p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>Built for College Students & Campus Xerox Staff</p>
          </div>

          {/* Col 2 — Platform */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Platform</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Create Order', to: '/login' },
                { label: 'Track Order',  to: '/login' },
                { label: 'How It Works', to: '/#how-it-works' },
                { label: 'Pricing',      to: '/#pricing' },
              ].map(({ label, to }) => (
                <Link key={label} to={to}
                  style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 — Portals */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Portals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Student Dashboard', to: '/student' },
                { label: 'Xerox Staff Queue', to: '/staff' },
                { label: 'Admin Console',      to: '/admin' },
                { label: 'Register Account',   to: '/register' },
              ].map(({ label, to }) => (
                <Link key={label} to={to}
                  style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4 — Campus Xerox */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Campus Xerox</h3>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
              <p style={{ color: '#94a3b8', marginBottom: 6, lineHeight: 1.6 }}>Orders packed by staff and ready for collection at the Xerox counter.</p>
              <p style={{ color: '#f59e0b', fontWeight: 600, fontSize: 11 }}>Night batch → Ready next morning 8:00 AM</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#334155' }}>© {new Date().getFullYear()} XeroXpress — Campus Digital Printing Platform</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#334155' }}>
              <Shield style={{ width: 13, height: 13, color: '#2563eb' }} /> Secure Printing
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#334155' }}>
              <FileCheck2 style={{ width: 13, height: 13, color: '#10b981' }} /> High Quality Output
            </span>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 1023px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 639px) { .footer-grid { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}
