/**
 * SharePackModal.jsx — Share a built pack with a copyable link
 *
 * Props:
 *   pack       {object}   The BuiltPack object
 *   isOpen     {boolean}
 *   onClose    {function}
 */
import { useState, useEffect } from 'react';
import api from '../api';

export default function SharePackModal({ pack, isOpen, onClose }) {
  const [shareUrl, setShareUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [shareId, setShareId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate share link when modal opens
  useEffect(() => {
    if (!isOpen || !pack?.id) return;
    if (shareUrl) return; // already generated
    generateLink();
  }, [isOpen, pack]);

  async function generateLink() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/pack/share', {
        packId: pack.id,
        isPublic: true,
        baseUrl: window.location.origin
      });
      setShareUrl(res.data.data.url);
      setShareId(res.data.data.id);
      setExpiresAt(res.data.data.expiresAt);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard API failure
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function openPackPage() {
    if (shareId) window.open(`/pack/${shareId}`, '_blank', 'noopener,noreferrer');
  }

  if (!isOpen) return null;

  const expiryLabel = expiresAt
    ? `Expires ${new Date(expiresAt).toLocaleString()}`
    : '';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>Share Pack</span>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Pack info */}
        <div style={styles.packInfo}>
          <span style={styles.packTheme}>🧞 {pack?.theme}</span>
          <span style={styles.packMeta}>
            {pack?.generators?.length} generators
          </span>
        </div>

        {/* Link area */}
        {loading && <p style={styles.hint}>Generating link…</p>}
        {error && <p style={styles.error}>{error}</p>}

        {shareUrl && (
          <>
            <div style={styles.linkRow}>
              <input
                style={styles.linkInput}
                value={shareUrl}
                readOnly
                onFocus={e => e.target.select()}
              />
              <button
                style={{ ...styles.btn, ...(copied ? styles.btnSuccess : {}) }}
                onClick={copyLink}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>

            {expiryLabel && <p style={styles.hint}>{expiryLabel} — 24h TTL</p>}

            <div style={styles.actions}>
              <button style={styles.btnSecondary} onClick={openPackPage}>
                👁️ Preview page
              </button>
              <button style={styles.btnSecondary} onClick={() => {
                setShareUrl('');
                setShareId('');
                generateLink();
              }}>
                🔄 Regenerate
              </button>
            </div>

            {/* Fork URL hint */}
            <div style={styles.forkHint}>
              <span style={styles.hintLabel}>Fork URL:</span>
              <code style={styles.code}>{shareUrl}?fork=true</code>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'var(--color-surface, #1c1b19)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '12px',
    padding: '24px',
    width: '480px',
    maxWidth: '95vw',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '1.1rem', fontWeight: 600,
    color: 'var(--color-text, #cdccca)'
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '1.4rem',
    cursor: 'pointer', color: 'var(--color-text-muted, #797876)',
    lineHeight: 1
  },
  packInfo: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px',
    background: 'var(--color-surface-offset, #1d1c1a)',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  packTheme: {
    fontWeight: 500, color: 'var(--color-text, #cdccca)', fontSize: '0.95rem'
  },
  packMeta: {
    fontSize: '0.8rem', color: 'var(--color-text-muted, #797876)'
  },
  linkRow: {
    display: 'flex', gap: '8px', marginBottom: '8px'
  },
  linkInput: {
    flex: 1, padding: '8px 12px',
    background: 'var(--color-surface-offset-2, #22211f)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '6px',
    color: 'var(--color-text, #cdccca)',
    fontSize: '0.85rem',
    fontFamily: 'monospace'
  },
  btn: {
    padding: '8px 16px',
    background: 'var(--color-primary, #4f98a3)',
    color: '#fff', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    whiteSpace: 'nowrap'
  },
  btnSuccess: {
    background: 'var(--color-success, #6daa45)'
  },
  btnSecondary: {
    padding: '7px 14px',
    background: 'var(--color-surface-dynamic, #2d2c2a)',
    color: 'var(--color-text, #cdccca)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
  },
  actions: {
    display: 'flex', gap: '8px', marginTop: '12px'
  },
  hint: {
    fontSize: '0.78rem', color: 'var(--color-text-muted, #797876)', margin: '4px 0'
  },
  error: {
    fontSize: '0.85rem', color: 'var(--color-error, #dd6974)', margin: '8px 0'
  },
  forkHint: {
    marginTop: '16px', padding: '10px 14px',
    background: 'var(--color-surface-offset, #1d1c1a)',
    borderRadius: '8px'
  },
  hintLabel: {
    fontSize: '0.75rem', color: 'var(--color-text-muted, #797876)',
    display: 'block', marginBottom: '4px'
  },
  code: {
    fontSize: '0.78rem', color: 'var(--color-primary, #4f98a3)',
    wordBreak: 'break-all'
  }
};
