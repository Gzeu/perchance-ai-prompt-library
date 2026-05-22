import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/generator', label: 'Generator', icon: '✨' },
  { path: '/studio', label: 'Studio', icon: '⚡', highlight: true },
  { path: '/pack', label: 'Pack Builder', icon: '🎲', highlight: true },
  { path: '/batch', label: 'Batch', icon: '📦' },
  { path: '/mixer', label: 'Mixer', icon: '🎨' },
  { path: '/history', label: 'History', icon: '📜' },
  { path: '/favorites', label: 'Favorites', icon: '❤️' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/api', label: 'API', icon: '🔧' },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      background: 'var(--color-surface, #111)',
      borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.08))',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Perchance AI">
            <rect width="28" height="28" rx="7" fill="#01696f"/>
            <path d="M8 20V8h5.5a4 4 0 0 1 0 8H8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="18" r="2.5" fill="#7ee787"/>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text, #fff)', letterSpacing: '-0.01em' }}>Perchance<span style={{ color: '#01696f' }}>AI</span></span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="desktop-nav">
          {NAV_LINKS.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: active ? 700 : 500,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                background: active ? 'var(--color-primary, #01696f)' : link.highlight ? 'rgba(1,105,111,0.12)' : 'transparent',
                color: active ? '#fff' : link.highlight ? 'var(--color-primary, #01696f)' : 'var(--color-text-muted, #aaa)',
                border: link.highlight && !active ? '1px solid rgba(1,105,111,0.3)' : '1px solid transparent',
                transition: 'all 0.15s'
              }}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--color-text, #fff)', fontSize: 20, cursor: 'pointer', padding: 4 }}
          className="mobile-menu-btn" aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{ borderTop: '1px solid var(--color-border, rgba(255,255,255,0.08))', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setOpen(false)}
              style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
                background: location.pathname === link.path ? 'var(--color-primary, #01696f)' : 'transparent',
                color: location.pathname === link.path ? '#fff' : 'var(--color-text, #ccc)' }}>
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </nav>
  );
}
