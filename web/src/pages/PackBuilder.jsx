import { useState } from 'react';
import { api } from '../utils/api.js';

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = [
    { id: 1, label: 'Theme' },
    { id: 2, label: 'Plan' },
    { id: 3, label: 'Build' },
    { id: 4, label: 'Pack' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <>
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
              background: current >= s.id ? 'var(--color-primary)' : 'var(--color-surface-offset)',
              color: current >= s.id ? '#fff' : 'var(--color-text-muted)',
              border: current === s.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              boxShadow: current === s.id ? '0 0 0 3px var(--color-primary-highlight)' : 'none',
              transition: 'all 0.2s'
            }}>{current > s.id ? '✓' : s.id}</div>
            <span style={{ fontSize: 11, color: current >= s.id ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: current === s.id ? 700 : 400 }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div key={`line-${s.id}`} style={{ flex: 1, height: 2, background: current > s.id ? 'var(--color-primary)' : 'var(--color-border)', marginBottom: 18, transition: 'background 0.3s' }} />
          )}
        </>
      ))}
    </div>
  );
}

// ─── Dependency graph visual ──────────────────────────────────────────────────
function DependencyGraph({ generators }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 0' }}>
      {generators.map(gen => (
        <div key={gen.slug} style={{
          padding: '8px 14px', borderRadius: 20,
          background: gen.importsFrom && gen.importsFrom.length > 0 ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
          border: `1px solid ${gen.importsFrom && gen.importsFrom.length > 0 ? 'var(--color-primary)' : 'var(--color-border)'}`,
          fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3
        }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{gen.name}</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{gen.slug}</span>
          {gen.importsFrom && gen.importsFrom.length > 0 && (
            <span style={{ fontSize: 10, color: 'var(--color-primary)' }}>
              ← imports: {gen.importsFrom.join(', ')}
            </span>
          )}
          {gen.exportsLists && gen.exportsLists.length > 0 && (
            <span style={{ fontSize: 10, color: 'var(--color-text-faint)' }}>
              exports: {gen.exportsLists.join(', ')}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Generator card in result ─────────────────────────────────────────────────
function GeneratorCard({ gen, index }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(gen.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openOnPerchance = () => {
    window.open(`https://perchance.org/edit#${encodeURIComponent(gen.code)}`, '_blank', 'noopener,noreferrer');
  };

  const download = () => {
    const blob = new Blob([gen.code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${gen.slug}.txt`;
    a.click();
  };

  const lines = gen.code ? gen.code.split('\n').length : 0;

  return (
    <div style={{
      borderRadius: 10, border: `1px solid ${gen.status === 'error' ? 'var(--color-error)' : 'var(--color-border)'}`,
      background: 'var(--color-surface)', overflow: 'hidden'
    }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%', background: gen.status === 'error' ? 'var(--color-error)' : 'var(--color-primary)',
            color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>{index + 1}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{gen.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              {gen.slug} {gen.status === 'ok' && `· ${lines} lines`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {gen.status === 'ok' ? (
            <>
              <button onClick={e => { e.stopPropagation(); copy(); }}
                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-offset)', color: 'var(--color-text)', fontSize: 11, cursor: 'pointer' }}>
                {copied ? '✓' : '📋'}
              </button>
              <button onClick={e => { e.stopPropagation(); download(); }}
                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-offset)', color: 'var(--color-text)', fontSize: 11, cursor: 'pointer' }}>⬇</button>
              <button onClick={e => { e.stopPropagation(); openOnPerchance(); }}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🚀 Open</button>
            </>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--color-error)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-error)', background: 'var(--color-error-highlight)' }}>❌ Failed</span>
          )}
          <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && gen.code && (
        <pre style={{
          margin: 0, padding: '12px 16px',
          background: '#0d1117', color: '#e6edf3',
          fontSize: 12, fontFamily: "'Fira Code', monospace",
          lineHeight: 1.7, overflowX: 'auto',
          borderTop: '1px solid var(--color-border)',
          maxHeight: 320
        }}>{gen.code}</pre>
      )}
      {expanded && gen.status === 'error' && (
        <div style={{ padding: '10px 16px', background: 'var(--color-error-highlight)', fontSize: 12, color: 'var(--color-error)', borderTop: '1px solid var(--color-border)' }}>
          {gen.error}
        </div>
      )}
    </div>
  );
}

// ─── PRESET THEMES ────────────────────────────────────────────────────────────
const PRESETS = [
  { emoji: '⚔️', label: 'Fantasy RPG Session', value: 'fantasy RPG tabletop session with characters, quests, locations, and encounters' },
  { emoji: '🚀', label: 'Sci-Fi Space Opera', value: 'sci-fi space opera with alien species, starships, planets, and missions' },
  { emoji: '🌆', label: 'Cyberpunk City', value: 'cyberpunk dystopian city with hackers, corporations, street gangs, and jobs' },
  { emoji: '🧙', label: 'Magic Academy', value: 'magic academy school with students, professors, spells, classes, and events' },
  { emoji: '🏴‍☠️', label: 'Pirate Adventure', value: 'pirate adventure with crews, ships, islands, treasures, and sea monsters' },
  { emoji: '🌲', label: 'Survival Horror', value: 'survival horror in a dark forest with creatures, events, items, and characters' },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function PackBuilder({ onOpenInStudio }) {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('');
  const [plan, setPlan] = useState(null);
  const [pack, setPack] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [buildProgress, setBuildProgress] = useState(null);
  const [error, setError] = useState(null);

  // ── Step 1 → 2: Plan ──
  const doPlan = async () => {
    if (!theme.trim()) return;
    setLoadingPlan(true);
    setError(null);
    try {
      const res = await api.post('/pack/plan', { theme: theme.trim() });
      setPlan(res.data);
      setStep(2);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoadingPlan(false);
    }
  };

  // ── Step 2 → 3 → 4: Build ──
  const doBuild = async () => {
    setLoadingBuild(true);
    setError(null);
    setBuildProgress('Starting parallel generation...');
    setStep(3);
    try {
      const res = await api.post('/pack/build', { plan });
      setPack(res.data);
      setStep(4);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setStep(2);
    } finally {
      setLoadingBuild(false);
      setBuildProgress(null);
    }
  };

  const reset = () => { setStep(1); setTheme(''); setPlan(null); setPack(null); setError(null); };

  const downloadAll = () => {
    if (!pack) return;
    pack.generators.filter(g => g.status === 'ok').forEach(gen => {
      const blob = new Blob([gen.code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${gen.slug}.txt`;
      a.click();
    });
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, margin: 0 }}>
          🎲 Generator Pack Builder
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6, fontSize: 14 }}>
          Give a theme — AI plans and builds a full set of interlinked Perchance generators in one shot.
        </p>
      </div>

      <Steps current={step} />

      {/* ── STEP 1: Theme ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Your Theme</label>
            <input
              value={theme}
              onChange={e => setTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doPlan()}
              placeholder="e.g. fantasy RPG session, cyberpunk city, space opera..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-offset)', color: 'var(--color-text)', fontSize: 15 }}
            />
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>Be descriptive — "dark gothic city with crime lords" beats just "dark city".</div>
          </div>

          {/* Preset grid */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Or pick a preset</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {PRESETS.map(p => (
                <button key={p.value} onClick={() => setTheme(p.value)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                    border: `1px solid ${theme === p.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: theme === p.value ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
                    color: 'var(--color-text)', fontSize: 13, fontWeight: theme === p.value ? 700 : 400,
                    transition: 'all 0.15s'
                  }}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={doPlan} disabled={loadingPlan || !theme.trim()}
            style={{ padding: '14px 24px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700,
              cursor: loadingPlan || !theme.trim() ? 'not-allowed' : 'pointer',
              background: loadingPlan || !theme.trim() ? 'var(--color-border)' : 'var(--color-primary)',
              color: '#fff', transition: 'all 0.18s' }}>
            {loadingPlan ? '🧠 Planning pack...' : '→ Plan My Pack'}
          </button>

          {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-error-highlight)', border: '1px solid var(--color-error)', fontSize: 13, color: 'var(--color-error)' }}>❌ {error}</div>}
        </div>
      )}

      {/* ── STEP 2: Review Plan ── */}
      {step === 2 && plan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '16px 20px', borderRadius: 10, border: '1px solid var(--color-primary)', background: 'var(--color-primary-highlight)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)', marginBottom: 4 }}>{plan.packName}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{plan.description}</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-faint)', marginTop: 6 }}>slug: {plan.packSlug} · {plan.generators.length} generators · planned in {plan.planTime}ms</div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Generator Map</div>
            <DependencyGraph generators={plan.generators} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.generators.map((gen, i) => (
              <div key={gen.slug} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>{gen.name} <span style={{ fontFamily: 'monospace', fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 11 }}>({gen.slug})</span></div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{gen.purpose}</div>
                  {gen.importsFrom && gen.importsFrom.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>imports: {gen.importsFrom.map(s => `[^${s}]`).join(' ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reset} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 13, cursor: 'pointer' }}>← Change Theme</button>
            <button onClick={doBuild} disabled={loadingBuild}
              style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', background: 'var(--color-primary)', color: '#fff' }}>
              ⚡ Build All {plan.generators.length} Generators
            </button>
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-error-highlight)', border: '1px solid var(--color-error)', fontSize: 13, color: 'var(--color-error)' }}>❌ {error}</div>}
        </div>
      )}

      {/* ── STEP 3: Building ── */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Building your pack...</div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>Generating {plan?.generators?.length} generators in parallel with Groq AI</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {plan?.generators?.map((gen, i) => (
              <div key={gen.slug} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)', opacity: 0.3 + (i * 0.1),
                animation: `pulse 1.2s ${i * 0.15}s ease-in-out infinite` }} />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.4);opacity:1}}`}</style>
        </div>
      )}

      {/* ── STEP 4: Results ── */}
      {step === 4 && pack && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary */}
          <div style={{ padding: '16px 20px', borderRadius: 10, border: '1px solid #6daa45', background: '#6daa4518', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>✓ {pack.packName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {pack.stats.successful}/{pack.stats.total} generators built · {pack.stats.buildTime}ms
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={downloadAll}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                ⬇ Download All
              </button>
              <button onClick={reset}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' }}>
                🔄 New Pack
              </button>
            </div>
          </div>

          {/* Generator cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pack.generators.map((gen, i) => (
              <GeneratorCard key={gen.slug} gen={gen} index={i} onOpenInStudio={onOpenInStudio} />
            ))}
          </div>

          {/* Perchance interconnect tip */}
          <div style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--color-text)' }}>💡 How to use on Perchance.org:</strong>
            <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
              <li>Open each generator on Perchance via the 🚀 button above</li>
              <li>Save each one — the slug in the URL must match <code style={{ background: 'var(--color-surface-offset)', padding: '1px 5px', borderRadius: 4 }}>[^slug.list]</code> references</li>
              <li>Open the main generator last — it will pull from all the others automatically</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
