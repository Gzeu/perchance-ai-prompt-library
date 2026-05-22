import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

const COMPLEXITY_COLORS = {
  simple: '#6daa45',
  medium: '#01696f',
  master: '#7a39bb'
};

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/perchance/templates'),
      api.get('/perchance/categories')
    ]).then(([tr, cr]) => {
      setTemplates(tr.data);
      setCategories(['All', ...cr.data.map(c => c.name)]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter(t => {
    const matchCat = selectedCat === 'All' || t.category === selectedCat;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const copyCode = (t) => {
    navigator.clipboard.writeText(t.code);
    setCopied(t.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openOnPerchance = (code) => {
    window.open(`https://perchance.org/edit#${encodeURIComponent(code)}`, '_blank', 'noopener,noreferrer');
  };

  const useInStudio = (t) => {
    navigate('/perchance-studio', { state: { code: t.code, name: t.name } });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ color: 'var(--color-text-muted)' }}>Loading templates...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, margin: 0 }}>📚 Template Library</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>{templates.length} ready-to-use Perchance generators — copy, customize and publish</p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
            background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${selectedCat === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: selectedCat === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selectedCat === cat ? '#fff' : 'var(--color-text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(t => (
          <div key={t.id}
            style={{ borderRadius: 10, border: `1px solid ${previewId === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: 'var(--color-surface)', overflow: 'hidden', transition: 'all 0.18s' }}>
            <div style={{ padding: '16px 16px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{t.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
                  background: `${COMPLEXITY_COLORS[t.complexity]}25`,
                  color: COMPLEXITY_COLORS[t.complexity] }}>
                  {t.complexity}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>{t.description}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)' }}>#{tag}</span>
                ))}
              </div>
            </div>

            {/* Preview toggle */}
            {previewId === t.id && (
              <div style={{ borderTop: '1px solid var(--color-divider)', padding: '12px 16px' }}>
                <pre style={{ fontSize: 11, lineHeight: 1.6, color: '#e6edf3', background: '#0d1117',
                  padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: 200, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {t.code}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, padding: '12px 16px', borderTop: '1px solid var(--color-divider)', flexWrap: 'wrap' }}>
              <button onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer' }}>
                {previewId === t.id ? 'Hide' : '👁 Preview'}
              </button>
              <button onClick={() => copyCode(t)}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                {copied === t.id ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button onClick={() => useInStudio(t)}
                style={{ padding: '5px 10px', borderRadius: 6, border: 'none',
                  background: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                ✏️ Edit in Studio
              </button>
              <button onClick={() => openOnPerchance(t.code)}
                style={{ padding: '5px 10px', borderRadius: 6, border: 'none',
                  background: '#7a39bb', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🚀 Perchance
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h3>No templates found</h3>
          <p>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
