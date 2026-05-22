import { useState, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Status badge colours ────────────────────────────────────────────────────
const STATUS_STYLE = {
  unchanged: 'bg-gray-100 text-gray-600',
  modified:  'bg-yellow-100 text-yellow-700',
  added:     'bg-green-100 text-green-700',
  removed:   'bg-red-100 text-red-600'
};

const STATUS_ICON = { unchanged: '○', modified: '●', added: '+', removed: '−' };

// ─── Small helpers ───────────────────────────────────────────────────────────
function Badge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[status]}`}>
      {STATUS_ICON[status]} {status}
    </span>
  );
}

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
}

function CodeBox({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute top-2 right-2 text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? '✓ copied' : 'copy'}
      </button>
      <pre className="bg-gray-900 text-green-300 text-xs p-4 rounded-lg overflow-x-auto max-h-72 font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── Topology visualiser ─────────────────────────────────────────────────────
function TopologyMap({ generators, masterSlug }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {generators.map(gen => (
        <div
          key={gen.slug}
          className={`rounded-lg border p-3 text-sm ${
            gen.slug === masterSlug
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="font-semibold text-gray-800 truncate">{gen.title}</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">{gen.slug}</div>
          {gen.imports?.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {gen.imports.map((imp, i) => (
                <div key={i} className="text-xs text-indigo-600 font-mono truncate">
                  ↩ {imp.fromSlug}.{imp.listName}
                </div>
              ))}
            </div>
          )}
          {gen.slug === masterSlug && (
            <div className="mt-1.5 text-xs font-bold text-indigo-700">★ master</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Generator card ──────────────────────────────────────────────────────────
function GeneratorCard({ gen, diffStatus }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">{gen.title}</span>
          <span className="text-xs text-gray-400 font-mono">{gen.slug}</span>
          {diffStatus && <Badge status={diffStatus} />}
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && gen.code && (
        <div className="p-3">
          <CodeBox code={gen.code} />
          {gen.meta && (
            <div className="text-xs text-gray-400 mt-2">
              {gen.meta.model} · {gen.meta.tokens} tokens · {gen.meta.ms}ms
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Diff view ───────────────────────────────────────────────────────────────
function DiffView({ diff }) {
  if (!diff) return null;
  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm">
        {[['modified', diff.modifiedCount], ['added', diff.addedCount],
          ['removed', diff.removedCount], ['unchanged', diff.unchangedCount]].map(([s, c]) => (
          <span key={s} className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[s]}`}>
            {STATUS_ICON[s]} {c} {s}
          </span>
        ))}
      </div>
      {diff.generators.filter(g => g.status !== 'unchanged').map(g => (
        <div key={g.slug} className="border rounded-lg overflow-hidden">
          <div className={`flex items-center gap-2 px-4 py-2 ${
            g.status === 'modified' ? 'bg-yellow-50' :
            g.status === 'added'    ? 'bg-green-50'  : 'bg-red-50'
          }`}>
            <Badge status={g.status} />
            <span className="font-medium text-sm">{g.title}</span>
            <span className="text-xs text-gray-400 font-mono">{g.slug}</span>
          </div>
          <div className="max-h-48 overflow-y-auto bg-gray-900 px-4 py-3 font-mono text-xs leading-relaxed">
            {g.lines.slice(0, 80).map((l, i) => (
              <div key={i} className={`${
                l.type === 'added'   ? 'text-green-400' :
                l.type === 'removed' ? 'text-red-400'   : 'text-gray-500'
              }`}>
                {l.type === 'added' ? '+' : l.type === 'removed' ? '−' : ' '} {l.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PackBuilder() {
  // Build flow
  const [theme, setTheme]       = useState('');
  const [plan, setPlan]         = useState(null);
  const [pack, setPack]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [phase, setPhase]       = useState('idle'); // idle | planning | building | done

  // Remix flow
  const [remixInstr, setRemixInstr]   = useState('');
  const [remixResult, setRemixResult] = useState(null);
  const [remixLoading, setRemixLoading] = useState(false);

  // Diff
  const [diff, setDiff]         = useState(null);
  const [activeTab, setActiveTab] = useState('pack'); // pack | remix | diff

  // ── API helpers ────────────────────────────────────────────────────────────
  const post = useCallback(async (path, body) => {
    const r = await fetch(`${API}/api/pack${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await r.json();
    if (!json.success) throw new Error(json.error?.message || json.error || 'Unknown error');
    return json.data;
  }, []);

  // ── Build flow ─────────────────────────────────────────────────────────────
  const handleBuild = async () => {
    if (!theme.trim()) return;
    setLoading(true); setError(''); setPlan(null); setPack(null);
    setRemixResult(null); setDiff(null);

    try {
      setPhase('planning');
      const newPlan = await post('/plan', { theme: theme.trim() });
      setPlan(newPlan);

      setPhase('building');
      const newPack = await post('/build', { plan: newPlan });
      setPack(newPack);
      setPhase('done');
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  };

  // ── Remix flow ─────────────────────────────────────────────────────────────
  const handleRemix = async () => {
    if (!pack || !remixInstr.trim()) return;
    setRemixLoading(true); setError('');

    try {
      const result = await post('/remix', { packId: pack.id, instruction: remixInstr.trim() });
      setRemixResult(result);

      // Auto-compute diff
      const diffData = await fetch(`${API}/api/pack/diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packAId: pack.id, packBId: result.pack.id })
      }).then(r => r.json());
      if (diffData.success) setDiff(diffData.data);

      setActiveTab('remix');
    } catch (e) {
      setError(e.message);
    } finally {
      setRemixLoading(false);
    }
  };

  // ── Export all ─────────────────────────────────────────────────────────────
  const exportAll = (targetPack) => {
    if (!targetPack) return;
    const content = targetPack.generators
      .map(g => `// === ${g.title} (${g.slug}) ===\n${g.code}`)
      .join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${targetPack.theme.replace(/\s+/g, '-').toLowerCase()}-pack.txt`;
    a.click();
  };

  // ─────────────────────────────────────────────────────────────────────────
  const displayPack = activeTab === 'remix' && remixResult ? remixResult.pack : pack;
  const diffStatusMap = diff
    ? Object.fromEntries(diff.generators.map(g => [g.slug, g.status]))
    : {};

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎲 Pack Builder</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Generate a pack of interconnected Perchance generators from a theme — then remix it in one click.
        </p>
      </div>

      {/* Build input */}
      <div className="flex gap-3">
        <input
          value={theme}
          onChange={e => setTheme(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleBuild()}
          placeholder="fantasy RPG session, cyberpunk city, cozy coffee shop..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          disabled={loading}
        />
        <button
          onClick={handleBuild}
          disabled={loading || !theme.trim()}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
        >
          {loading ? <><Spinner /> {phase === 'planning' ? 'Planning…' : 'Building…'}</> : '✨ Build Pack'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Plan preview (while building) */}
      {plan && !pack && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">📐 Plan — {plan.generators.length} generators</h2>
          <TopologyMap generators={plan.generators} masterSlug={plan.masterSlug} />
          {loading && (
            <div className="text-sm text-indigo-600 flex items-center gap-2">
              <Spinner /> Generating all generators in parallel…
            </div>
          )}
        </div>
      )}

      {/* Built pack */}
      {pack && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
            <span>🎲 <strong>{pack.generators.length}</strong> generators</span>
            <span>⚡ {pack.totalTokens.toLocaleString()} tokens</span>
            <span>⏱ {(pack.totalMs / 1000).toFixed(1)}s</span>
            <span className="ml-auto text-xs text-gray-400 font-mono">{pack.id}</span>
          </div>

          {/* Topology */}
          <div className="space-y-2">
            <h2 className="font-semibold text-gray-700">🗺 Topology</h2>
            <TopologyMap generators={pack.generators} masterSlug={pack.masterSlug} />
          </div>

          {/* Remix input */}
          <div className="border border-dashed border-indigo-300 rounded-xl p-4 space-y-3 bg-indigo-50/50">
            <h2 className="font-semibold text-indigo-700">🔀 Remix this pack</h2>
            <div className="flex gap-3">
              <input
                value={remixInstr}
                onChange={e => setRemixInstr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !remixLoading && handleRemix()}
                placeholder='"convert to sci-fi", "make it darker", "add humor", "pirate theme"…'
                className="flex-1 border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                disabled={remixLoading}
              />
              <button
                onClick={handleRemix}
                disabled={remixLoading || !remixInstr.trim()}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {remixLoading ? <><Spinner /> Remixing…</> : '🔀 Remix'}
              </button>
            </div>
            {remixResult && (
              <div className="text-xs text-indigo-600">
                ✓ {remixResult.diffSummary}
              </div>
            )}
          </div>

          {/* Tabs */}
          {remixResult && (
            <div className="flex gap-2 border-b border-gray-200">
              {[
                ['pack',  '📦 Original'],
                ['remix', '🔀 Remixed'],
                ['diff',  '± Diff']
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Diff view */}
          {activeTab === 'diff' && diff && <DiffView diff={diff} />}

          {/* Generator list */}
          {activeTab !== 'diff' && displayPack && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">
                  {activeTab === 'remix' ? '🔀 Remixed' : '📦 Original'} generators
                </h2>
                <button
                  onClick={() => exportAll(displayPack)}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  ⬇ Export all
                </button>
              </div>
              {displayPack.generators.map(gen => (
                <GeneratorCard
                  key={gen.slug}
                  gen={gen}
                  diffStatus={activeTab === 'remix' ? diffStatusMap[gen.slug] : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
