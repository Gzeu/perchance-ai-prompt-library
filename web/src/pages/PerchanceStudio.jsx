import { useState, useCallback } from 'react';
import { api } from '../utils/api.js';

const CATEGORIES = [
  'Characters', 'Locations', 'Items', 'Stories', 'Dialogue',
  'Encounters', 'Sci-Fi', 'Writing', 'Names', 'Events', 'Magic', 'Master'
];

const COMPLEXITY_INFO = {
  simple: { label: 'Simple', desc: '3-5 lists, quick to use', color: '#6daa45' },
  medium: { label: 'Medium', desc: '5-8 lists, detailed output', color: '#01696f' },
  master: { label: 'Master Generator', desc: 'Imports multiple generators, full session-ready', color: '#7a39bb' }
};

const DEFAULT_CODE = `// Your Perchance code will appear here
// Click "Generate with AI" to create a generator
// or start typing your own below

output
  [adjective] [noun]

adjective
  mysterious
  ancient
  glowing

noun
  artifact
  portal
  relic`;

export default function PerchanceStudio() {
  const [category, setCategory] = useState('Characters');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [theme, setTheme] = useState('');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [validation, setValidation] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const generate = useCallback(async () => {
    if (!description.trim()) return;
    setLoading(true);
    setValidation(null);
    try {
      const res = await api.post('/perchance/generate', { category, description, complexity, theme: theme || undefined });
      setCode(res.data.code);
      setValidation(res.data.validation);
    } catch (e) {
      alert('Generation failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }, [category, description, complexity, theme]);

  const refine = useCallback(async () => {
    if (!refineText.trim() || !code) return;
    setRefining(true);
    try {
      const res = await api.post('/perchance/refine', { code, request: refineText });
      setCode(res.data.code);
      setValidation(res.data.validation);
      setRefineText('');
    } catch (e) {
      alert('Refinement failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setRefining(false);
    }
  }, [code, refineText]);

  const validate = useCallback(async () => {
    try {
      const res = await api.post('/perchance/validate', { code });
      setValidation(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [code]);

  const getIdeas = useCallback(async () => {
    setLoadingIdeas(true);
    try {
      const res = await api.post('/perchance/ideas', { category, count: 6 });
      setIdeas(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIdeas(false);
    }
  }, [category]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openOnPerchance = () => {
    const encoded = encodeURIComponent(code);
    window.open(`https://perchance.org/edit#${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, margin: 0 }}>⚡ Perchance Studio</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>Generate, edit and publish Perchance.org generators with AI</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface)', borderRadius: 8, padding: 4 }}>
            {['generate', 'ideas'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
                {tab === 'generate' ? '🤖 Generate' : '💡 Ideas'}
              </button>
            ))}
          </div>

          {activeTab === 'generate' && (
            <>
              {/* Category */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you want to generate...\ne.g. 'A character generator for a dark gothic RPG with Victorian names'"
                  rows={4}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14,
                    resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* Complexity */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Complexity</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(COMPLEXITY_INFO).map(([key, info]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 8, border: `1px solid ${complexity === key ? info.color : 'var(--color-border)'}`,
                      background: complexity === key ? `${info.color}15` : 'var(--color-surface)', cursor: 'pointer' }}>
                      <input type="radio" name="complexity" value={key} checked={complexity === key} onChange={() => setComplexity(key)} style={{ accentColor: info.color }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: complexity === key ? info.color : 'var(--color-text)' }}>{info.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{info.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Theme / Style <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input value={theme} onChange={e => setTheme(e.target.value)}
                  placeholder="e.g. dark gothic, cyberpunk, cozy fantasy..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }} />
              </div>

              <button onClick={generate} disabled={loading || !description.trim()}
                style={{ width: '100%', padding: '12px 20px', borderRadius: 8, border: 'none', cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !description.trim() ? 'var(--color-border)' : 'var(--color-primary)',
                  color: '#fff', fontSize: 14, fontWeight: 700, transition: 'all 0.18s' }}>
                {loading ? '⏳ Generating...' : '⚡ Generate with AI'}
              </button>
            </>
          )}

          {activeTab === 'ideas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Category for Ideas</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={getIdeas} disabled={loadingIdeas}
                style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                {loadingIdeas ? 'Generating ideas...' : '💡 Get Ideas'}
              </button>
              {ideas.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ideas.map((idea, i) => (
                    <button key={i} onClick={() => { setDescription(idea); setActiveTab('generate'); }}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 13,
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s' }}>
                      → {idea}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Refine */}
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Refine with AI</label>
            <textarea value={refineText} onChange={e => setRefineText(e.target.value)}
              placeholder="e.g. 'Add more items to each list' or 'Make it more dark and gritty'"
              rows={2}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 13,
                resize: 'vertical', fontFamily: 'inherit' }} />
            <button onClick={refine} disabled={refining || !refineText.trim()}
              style={{ width: '100%', marginTop: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid var(--color-primary)',
                background: 'transparent', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {refining ? 'Refining...' : '✏️ Refine Generator'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL — CODE EDITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>Perchance Code Editor</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={validate}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                ✓ Validate
              </button>
              <button onClick={copyCode}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button onClick={openOnPerchance}
                style={{ padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🚀 Open on Perchance
              </button>
            </div>
          </div>

          <textarea value={code} onChange={e => setCode(e.target.value)}
            spellCheck={false}
            style={{ width: '100%', minHeight: 520, padding: '16px', borderRadius: 10,
              border: '1px solid var(--color-border)', background: '#0d1117',
              color: '#e6edf3', fontSize: 13, fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              lineHeight: 1.7, resize: 'vertical', tabSize: 2 }} />

          {/* Validation */}
          {validation && (
            <div style={{ padding: '12px 16px', borderRadius: 8,
              background: validation.valid ? '#6daa4520' : '#a12c7b20',
              border: `1px solid ${validation.valid ? '#6daa45' : '#a12c7b'}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: validation.valid ? '#6daa45' : '#a12c7b', marginBottom: 4 }}>
                {validation.valid ? '✓ Valid Perchance syntax' : '✗ Syntax issues found'}
              </div>
              {validation.errors?.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: '#a12c7b' }}>❌ {e}</div>
              ))}
              {validation.warnings?.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--color-warning)' }}>⚠️ {w}</div>
              ))}
            </div>
          )}

          {/* Syntax cheatsheet */}
          <details style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <summary style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-muted)' }}>📖 Perchance Syntax Cheatsheet</summary>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['[listName]', 'Reference another list'],
                ['{a|b|c}', 'Inline random choice'],
                ['{1-10}', 'Random number range'],
                ['[^gen.list]', 'Import from another generator'],
                ['item  5', 'Weight (5x more likely)'],
                ['\\n', 'New line in output'],
                ['// comment', 'Add a comment'],
                ['<b>text</b>', 'HTML formatting in output']
              ].map(([syntax, desc]) => (
                <div key={syntax} style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--color-surface-offset)', fontSize: 11 }}>
                  <code style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{syntax}</code>
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: 6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
