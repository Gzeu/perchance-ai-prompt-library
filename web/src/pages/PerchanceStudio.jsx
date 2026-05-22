import { useState, useCallback, useRef, useEffect } from 'react';
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

// ─── Syntax Highlighter ───────────────────────────────────────────────────────
function highlightPerchance(code) {
  return code
    .split('\n')
    .map(line => {
      // comments
      if (/^\s*\/\//.test(line)) {
        return `<span class="ph-comment">${escHtml(line)}</span>`;
      }
      // list header (no indent, no special chars, ends line)
      if (/^[a-zA-Z][a-zA-Z0-9_-]*\s*$/.test(line.trim()) && line.trim().length > 0) {
        return `<span class="ph-list-name">${escHtml(line)}</span>`;
      }
      // process inline tokens
      let out = escHtml(line);
      // [^import] references
      out = out.replace(/\[\^[^\]]+\]/g, m => `<span class="ph-import">${m}</span>`);
      // [listRef] references
      out = out.replace(/\[[^\]]+\]/g, m => `<span class="ph-ref">${m}</span>`);
      // {a|b|c} inline choices
      out = out.replace(/\{[^}]+\}/g, m => `<span class="ph-choice">${m}</span>`);
      // weight numbers (trailing integer after 2+ spaces)
      out = out.replace(/(  +)(\d+)$/, (_, sp, n) => `${escHtml(sp)}<span class="ph-weight">${n}</span>`);
      // HTML tags in output
      out = out.replace(/&lt;(\/?[a-z]+)&gt;/g, (_, tag) => `<span class="ph-html">&lt;${tag}&gt;</span>`);
      return out;
    })
    .join('\n');
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const HIGHLIGHT_CSS = `
.ph-editor-wrap { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid var(--color-border); }
.ph-highlight, .ph-textarea {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px; line-height: 1.7; padding: 16px; margin: 0;
  tab-size: 2; white-space: pre-wrap; word-wrap: break-word;
  min-height: 520px; box-sizing: border-box; width: 100%;
}
.ph-highlight {
  position: absolute; top: 0; left: 0; pointer-events: none;
  background: #0d1117; color: #e6edf3;
  border: none; overflow: hidden;
}
.ph-textarea {
  position: relative; background: transparent;
  color: transparent; caret-color: #e6edf3;
  border: none; outline: none; resize: vertical;
  z-index: 1; spellcheck: false;
}
.ph-comment  { color: #8b949e; font-style: italic; }
.ph-list-name { color: #79c0ff; font-weight: 700; }
.ph-ref      { color: #ffa657; }
.ph-import   { color: #d2a8ff; font-weight: 600; }
.ph-choice   { color: #7ee787; }
.ph-weight   { color: #f85149; font-weight: 700; }
.ph-html     { color: #ff7b72; }
.ph-line-nums {
  position: absolute; left: 0; top: 0; padding: 16px 6px 16px 4px;
  font-family: 'Fira Code', monospace; font-size: 13px; line-height: 1.7;
  color: #484f58; user-select: none; pointer-events: none;
  text-align: right; min-width: 36px; background: #0d1117;
  border-right: 1px solid #21262d;
}
.ph-highlight-inner, .ph-textarea { padding-left: 48px; }
`;

function SyntaxEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumsRef = useRef(null);

  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (lineNumsRef.current && textareaRef.current) {
      lineNumsRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = value.split('\n').length;
  const lineNums = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const next = value.substring(0, start) + '  ' + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <>
      <style>{HIGHLIGHT_CSS}</style>
      <div className="ph-editor-wrap">
        {/* line numbers */}
        <pre ref={lineNumsRef} className="ph-line-nums" aria-hidden="true">{lineNums}</pre>
        {/* highlighted layer */}
        <pre ref={highlightRef} className="ph-highlight" aria-hidden="true">
          <code className="ph-highlight-inner"
            dangerouslySetInnerHTML={{ __html: highlightPerchance(value) + '\n' }} />
        </pre>
        {/* editable textarea */}
        <textarea
          ref={textareaRef}
          className="ph-textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </>
  );
}

// ─── Version History ──────────────────────────────────────────────────────────
const MAX_HISTORY = 20;

function useVersionHistory(initial) {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(initial);

  const push = useCallback((code, label) => {
    setCurrent(code);
    setHistory(prev => [
      { code, label, ts: Date.now() },
      ...prev.slice(0, MAX_HISTORY - 1)
    ]);
  }, []);

  const restore = useCallback((entry) => {
    setCurrent(entry.code);
  }, []);

  return { current, setCurrent, history, push, restore };
}

function VersionHistoryPanel({ history, onRestore, onClose }) {
  const fmt = ts => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (history.length === 0) {
    return (
      <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
        No history yet. Generate or refine to start tracking versions.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
      {history.map((entry, i) => (
        <div key={entry.ts} style={
          { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
            background: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: 10 }
        }>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {i === 0 && <span style={{ color: 'var(--color-primary)', marginRight: 6 }}>● latest</span>}
              {entry.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {fmt(entry.ts)} &nbsp;·&nbsp; {entry.code.split('\n').length} lines
            </div>
          </div>
          <button onClick={() => { onRestore(entry); onClose(); }}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-offset)', color: 'var(--color-text)',
              fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ↩ Restore
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PerchanceStudio() {
  const [category, setCategory] = useState('Characters');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [validation, setValidation] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [showHistory, setShowHistory] = useState(false);

  const { current: code, setCurrent: setCode, history, push: pushHistory, restore: restoreVersion } =
    useVersionHistory(DEFAULT_CODE);

  const generate = useCallback(async () => {
    if (!description.trim()) return;
    setLoading(true);
    setValidation(null);
    try {
      const res = await api.post('/perchance/generate', { category, description, complexity, theme: theme || undefined });
      pushHistory(res.data.code, `Generated: ${description.slice(0, 40)}`);
      setValidation(res.data.validation);
    } catch (e) {
      alert('Generation failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }, [category, description, complexity, theme, pushHistory]);

  const refine = useCallback(async () => {
    if (!refineText.trim() || !code) return;
    setRefining(true);
    try {
      const res = await api.post('/perchance/refine', { code, request: refineText });
      pushHistory(res.data.code, `Refined: ${refineText.slice(0, 40)}`);
      setValidation(res.data.validation);
      setRefineText('');
    } catch (e) {
      alert('Refinement failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setRefining(false);
    }
  }, [code, refineText, pushHistory]);

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

  const downloadTxt = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `perchance-${category.toLowerCase()}-${Date.now()}.txt`;
    a.click();
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
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you want to generate...\ne.g. 'A character generator for a dark gothic RPG with Victorian names'"
                  rows={4}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14,
                    resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

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

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Theme / Style <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input value={theme} onChange={e => setTheme(e.target.value)}
                  placeholder="e.g. dark gothic, cyberpunk, cozy fantasy..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }} />
              </div>

              <button onClick={generate} disabled={loading || !description.trim()}
                style={{ width: '100%', padding: '12px 20px', borderRadius: 8, border: 'none',
                  cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
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

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Perchance Code Editor
              <span style={{ marginLeft: 10, fontWeight: 400, fontSize: 11, color: 'var(--color-text-faint)' }}>
                {code.split('\n').length} lines
              </span>
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={validate}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                ✓ Validate
              </button>
              <button onClick={() => setShowHistory(h => !h)}
                style={{ padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${showHistory ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: showHistory ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: showHistory ? '#fff' : 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                🕓 History {history.length > 0 && `(${history.length})`}
              </button>
              <button onClick={copyCode}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button onClick={downloadTxt}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                ⬇ .txt
              </button>
              <button onClick={openOnPerchance}
                style={{ padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🚀 Open on Perchance
              </button>
            </div>
          </div>

          {/* Version History Panel */}
          {showHistory && (
            <div style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-offset)', maxHeight: 260, overflowY: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Version History — last {MAX_HISTORY} saves
              </div>
              <VersionHistoryPanel
                history={history}
                onRestore={restoreVersion}
                onClose={() => setShowHistory(false)}
              />
            </div>
          )}

          {/* Syntax-highlighted editor */}
          <SyntaxEditor value={code} onChange={setCode} />

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
                ['[listName]', 'Reference another list', '#ffa657'],
                ['{a|b|c}', 'Inline random choice', '#7ee787'],
                ['{1-10}', 'Random number range', '#7ee787'],
                ['[^gen.list]', 'Import from another generator', '#d2a8ff'],
                ['item  5', 'Weight (5x more likely)', '#f85149'],
                ['// comment', 'Add a comment', '#8b949e'],
                ['listName', 'List header (no indent)', '#79c0ff'],
                ['<b>text</b>', 'HTML in output', '#ff7b72']
              ].map(([syntax, desc, color]) => (
                <div key={syntax} style={{ padding: '6px 8px', borderRadius: 6, background: '#0d1117', fontSize: 11 }}>
                  <code style={{ color, fontWeight: 700, fontFamily: 'monospace' }}>{syntax}</code>
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
