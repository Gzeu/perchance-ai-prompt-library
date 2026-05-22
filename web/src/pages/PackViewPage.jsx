/**
 * PackViewPage.jsx — Public read-only view for a shared pack
 *
 * Routes:
 *   /pack/:id           → view-only
 *   /pack/:id?fork=true → auto-clone into Studio (fork flow)
 *
 * Data: fetched from GET /api/pack/shared/:id
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function PackViewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [forking, setForking] = useState(false);
  const [forkSuccess, setForkSuccess] = useState(false);

  const autoFork = searchParams.get('fork') === 'true';

  useEffect(() => {
    fetchPack();
  }, [id]);

  // Auto-trigger fork if ?fork=true
  useEffect(() => {
    if (autoFork && entry && !forkSuccess) {
      handleFork();
    }
  }, [autoFork, entry]);

  async function fetchPack() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/pack/shared/${id}`);
      setEntry(res.data.data);
    } catch (e) {
      setError(
        e?.response?.status === 404
          ? 'This pack has expired or does not exist.'
          : 'Failed to load pack.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFork() {
    if (forking || forkSuccess) return;
    setForking(true);
    try {
      const res = await api.post(`/pack/share/${id}/fork`);
      const forkedPack = res.data.data.pack;
      // Navigate to Studio with pack data via state
      navigate('/studio', { state: { forkedPack, fromShareId: id } });
    } catch (e) {
      setError('Fork failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setForking(false);
    }
  }

  function toggleGenerator(slug) {
    setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }));
  }

  function handleRemixFromHere() {
    if (!entry) return;
    navigate('/studio', {
      state: {
        forkedPack: entry.pack,
        fromShareId: id,
        remixMode: true,
        remixChain: entry.remixChain
      }
    });
  }

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.loading}>Loading pack…</div>
    </div>
  );

  if (error) return (
    <div style={styles.page}>
      <div style={styles.errorBox}>
        <span style={{ fontSize: '2rem' }}>🚫</span>
        <p>{error}</p>
        <button style={styles.btn} onClick={() => navigate('/')}>← Go Home</button>
      </div>
    </div>
  );

  if (!entry) return null;

  const { pack, forkCount, remixChain, createdAt, expiresAt } = entry;
  const isMaster = (slug) => slug === pack.masterSlug;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🧞 {pack.theme}</h1>
          <p style={styles.description}>{pack.description}</p>
        </div>
        <div style={styles.headerActions}>
          <button
            style={styles.btn}
            onClick={handleFork}
            disabled={forking}
          >
            {forking ? 'Forking…' : '🏔️ Fork this Pack'}
          </button>
          <button style={styles.btnSecondary} onClick={handleRemixFromHere}>
            🧰 Remix from here
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <StatChip icon="🧩" label={`${pack.generators.length} generators`} />
        <StatChip icon="🏔️" label={`${forkCount} forks`} />
        {remixChain.length > 1 && (
          <StatChip icon="🔀" label={`Remix depth: ${remixChain.length - 1}`} />
        )}
        <StatChip icon="⏰" label={`Created ${new Date(createdAt).toLocaleDateString()}`} />
        {expiresAt && (
          <StatChip icon="⏳" label={`Expires ${new Date(expiresAt).toLocaleString()}`} warn />
        )}
      </div>

      {/* Remix chain */}
      {remixChain.length > 1 && (
        <div style={styles.remixChain}>
          <span style={styles.remixLabel}>🔀 Remix chain:</span>
          {remixChain.map((cid, i) => (
            <span key={cid} style={styles.remixItem}>
              {i > 0 && <span style={styles.remixArrow}>&#x2192;</span>}
              <a
                href={`/pack/${cid}`}
                style={{ ...styles.remixLink, fontWeight: cid === id ? 700 : 400 }}
                target={cid !== id ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                {cid === id ? 'this' : cid.slice(0, 6) + '…'}
              </a>
            </span>
          ))}
        </div>
      )}

      {/* Generator cards */}
      <div style={styles.genGrid}>
        {pack.generators.map(gen => (
          <div
            key={gen.slug}
            style={{
              ...styles.genCard,
              ...(isMaster(gen.slug) ? styles.genCardMaster : {})
            }}
          >
            <div style={styles.genHeader} onClick={() => toggleGenerator(gen.slug)}>
              <div>
                <span style={styles.genTitle}>{gen.title}</span>
                {isMaster(gen.slug) && <span style={styles.masterBadge}>master</span>}
                <span style={styles.genSlug}>{gen.slug}</span>
              </div>
              <div style={styles.genHeaderRight}>
                {gen.imports?.length > 0 && (
                  <span style={styles.importBadge}>
                    {gen.imports.length} import{gen.imports.length > 1 ? 's' : ''}
                  </span>
                )}
                <span style={styles.chevron}>
                  {expanded[gen.slug] ? '▲' : '▼'}
                </span>
              </div>
            </div>
            <p style={styles.genRole}>{gen.role}</p>

            {/* Imports */}
            {gen.imports?.length > 0 && (
              <div style={styles.imports}>
                {gen.imports.map(imp => (
                  <span key={`${imp.fromSlug}.${imp.listName}`} style={styles.importTag}>
                    [^{imp.fromSlug}.{imp.listName}]
                  </span>
                ))}
              </div>
            )}

            {/* Code (collapsible) */}
            {expanded[gen.slug] && (
              <pre style={styles.code}>{gen.code}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatChip({ icon, label, warn }) {
  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '999px',
      background: warn
        ? 'var(--color-warning-highlight, #564942)'
        : 'var(--color-surface-offset, #1d1c1a)',
      border: '1px solid var(--color-border, #393836)',
      fontSize: '0.8rem',
      color: warn
        ? 'var(--color-warning, #bb653b)'
        : 'var(--color-text-muted, #797876)',
      display: 'inline-flex', alignItems: 'center', gap: '6px'
    }}>
      {icon} {label}
    </span>
  );
}

const styles = {
  page: {
    maxWidth: '960px', margin: '0 auto',
    padding: '32px 16px',
    color: 'var(--color-text, #cdccca)'
  },
  loading: {
    textAlign: 'center', padding: '80px 0',
    color: 'var(--color-text-muted, #797876)', fontSize: '1.1rem'
  },
  errorBox: {
    textAlign: 'center', padding: '80px 0',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '16px'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    fontWeight: 700, margin: '0 0 8px',
    color: 'var(--color-text, #cdccca)'
  },
  description: {
    color: 'var(--color-text-muted, #797876)',
    margin: 0, maxWidth: '560px', lineHeight: 1.6
  },
  headerActions: {
    display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap'
  },
  statsBar: {
    display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px'
  },
  remixChain: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 14px',
    background: 'var(--color-surface, #1c1b19)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '8px', marginBottom: '24px',
    flexWrap: 'wrap'
  },
  remixLabel: {
    fontSize: '0.8rem', color: 'var(--color-text-muted, #797876)', marginRight: '4px'
  },
  remixItem: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
  remixArrow: { color: 'var(--color-text-faint, #5a5957)', fontSize: '0.85rem' },
  remixLink: {
    fontSize: '0.82rem', color: 'var(--color-primary, #4f98a3)',
    textDecoration: 'none'
  },
  genGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  genCard: {
    background: 'var(--color-surface, #1c1b19)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '10px', overflow: 'hidden'
  },
  genCardMaster: {
    border: '1px solid var(--color-primary, #4f98a3)',
    boxShadow: '0 0 0 1px var(--color-primary, #4f98a3)'
  },
  genHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', cursor: 'pointer',
    userSelect: 'none'
  },
  genTitle: {
    fontWeight: 600, fontSize: '0.95rem',
    color: 'var(--color-text, #cdccca)'
  },
  masterBadge: {
    marginLeft: '8px',
    padding: '2px 8px',
    background: 'var(--color-primary-highlight, #313b3b)',
    color: 'var(--color-primary, #4f98a3)',
    borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700
  },
  genSlug: {
    display: 'block', fontSize: '0.78rem',
    color: 'var(--color-text-faint, #5a5957)',
    fontFamily: 'monospace', marginTop: '2px'
  },
  genHeaderRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  importBadge: {
    padding: '2px 8px',
    background: 'var(--color-surface-dynamic, #2d2c2a)',
    borderRadius: '4px', fontSize: '0.75rem',
    color: 'var(--color-text-muted, #797876)'
  },
  chevron: { fontSize: '0.75rem', color: 'var(--color-text-faint, #5a5957)' },
  genRole: {
    margin: '0 16px 12px',
    fontSize: '0.85rem', color: 'var(--color-text-muted, #797876)'
  },
  imports: {
    padding: '0 16px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap'
  },
  importTag: {
    padding: '3px 8px',
    background: 'var(--color-surface-offset, #1d1c1a)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '4px', fontSize: '0.75rem',
    fontFamily: 'monospace', color: 'var(--color-primary, #4f98a3)'
  },
  code: {
    margin: 0, padding: '16px',
    background: 'var(--color-bg, #171614)',
    fontSize: '0.8rem', lineHeight: 1.7,
    overflowX: 'auto',
    color: 'var(--color-text, #cdccca)',
    borderTop: '1px solid var(--color-divider, #262523)'
  },
  btn: {
    padding: '10px 20px',
    background: 'var(--color-primary, #4f98a3)',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
  },
  btnSecondary: {
    padding: '9px 18px',
    background: 'var(--color-surface-dynamic, #2d2c2a)',
    color: 'var(--color-text, #cdccca)',
    border: '1px solid var(--color-border, #393836)',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem'
  }
};
