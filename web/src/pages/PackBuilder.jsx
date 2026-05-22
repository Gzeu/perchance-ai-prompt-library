import { useState, useCallback, useRef } from 'react';
import SharePackModal from '../components/SharePackModal';
import ExportModal from '../components/ExportModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Status badge colours ────────────────────────────────────────────────────
const STATUS_STYLE = {
  unchanged: 'bg-gray-100 text-gray-600',
  modified:  'bg-yellow-100 text-yellow-700',
  added:     'bg-green-100 text-green-700',
  removed:   'bg-red-100 text-red-600'
};

const STATUS_ICON = { unchanged: '○', modified: '●', added: '+', removed: '−' };

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Open on Perchance ───────────────────────────────────────────────────────
function openOnPerchance(code, slug) {
  const encoded = encodeURIComponent(code);
  const url = `https://perchance.org/create?title=${encodeURIComponent(slug)}&code=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
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
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm text-gray-800 truncate">{gen.title}</span>
          <span className="text-xs text-gray-400 font-mono shrink-0">{gen.slug}</span>
          {diffStatus && <Badge status={diffStatus} />}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {gen.code && (
            <button
              onClick={e => { e.stopPropagation(); openOnPerchance(gen.code, gen.slug); }}
              title="Open this generator on Perchance.org"
              className="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition font-medium"
            >
              ↗ Perchance
            </button>
          )}
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
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

// ─── Remix History Timeline ───────────────────────────────────────────────────
function RemixTimeline({ history, activePack, onActivate }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remix History</h3>
      <div className="relative pl-4">
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-200" />
        {history.map((entry, idx) => {
          const isActive = activePack?.id === entry.pack.id;
          const label = idx === 0 ? 'Original' : `v${idx}`;
          const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <button
              key={entry.pack.id}
              onClick={() => onActivate(entry)}
              className="w-full flex items-start gap-3 py-2 text-left group transition"
            >
              <div className={`relative z-10 mt-1 w-2.5 h-2.5 rounded-full shrink-0 -ml-1 ring-2 ring-white transition ${
                isActive ? 'bg-indigo-500' : 'bg-gray-300 group-hover:bg-indigo-300'
              }`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${
                    isActive ? 'text-indigo-600' : 'text-gray-600'
                  }`}>{label}</span>
                  <span className="text-xs text-gray-400">{time}</span>
                  {isActive && <span className="text-xs text-indigo-400">← viewing</span>}
                </div>
                {entry.instruction && (
                  <div className="text-xs text-gray-500 truncate mt-0.5 italic">"{entry.instruction}"</div>
                )}
                {entry.diffSummary && (
                  <div className="text-xs text-gray-400 mt-0.5">{entry.diffSummary}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
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
  const [phase, setPhase]       = useState('idle');

  // Remix flow
  const [remixInstr, setRemixInstr]     = useState('');
  const [remixResult, setRemixResult]   = useState(null);
  const [remixLoading, setRemixLoading] = useState(false);

  // Remix history
  const [remixHistory, setRemixHistory] = useState([]);
  const [activePack, setActivePack]     = useState(null);
  const [activeDiff, setActiveDiff]     = useState(null);

  // Diff
  const [diff, setDiff]         = useState(null);
  const [activeTab, setActiveTab] = useState('pack');

  // Modal state
  const [shareOpen, setShareOpen]   = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const originalPackIdRef = useRef(null);

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

  const fetchDiff = useCallback(async (packAId, packBId) => {
    const r = await fetch(`${API}/api/pack/diff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packAId, packBId })
    });
    const json = await r.json();
    return json.success ? json.data : null;
  }, []);

  // ── Build flow ─────────────────────────────────────────────────────────────
  const handleBuild = async () => {
    if (!theme.trim()) return;
    setLoading(true); setError('');
    setPlan(null); setPack(null); setActivePack(null);
    setRemixResult(null); setDiff(null); setActiveDiff(null);
    setRemixHistory([]); originalPackIdRef.current = null;

    try {
      setPhase('planning');
      const newPlan = await post('/plan', { theme: theme.trim() });
      setPlan(newPlan);

      setPhase('building');
      const newPack = await post('/build', { plan: newPlan });
      setPack(newPack);
      setActivePack(newPack);
      originalPackIdRef.current = newPack.id;

      setRemixHistory([{ pack: newPack, instruction: null, diffSummary: null, timestamp: Date.now() }]);
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
    if (!activePack || !remixInstr.trim()) return;
    setRemixLoading(true); setError('');

    try {
      const result = await post('/remix', { packId: activePack.id, instruction: remixInstr.trim() });
      const newPack = result.pack;

      const diffData = originalPackIdRef.current
        ? await fetchDiff(originalPackIdRef.current, newPack.id)
        : null;

      const historyEntry = {
        pack: newPack,
        instruction: remixInstr.trim(),
        diffSummary: result.diffSummary,
        timestamp: Date.now()
      };

      setRemixHistory(prev => [...prev, historyEntry]);
      setActivePack(newPack);
      setActiveDiff(diffData);
      setDiff(diffData);
      setRemixResult(result);
      setRemixInstr('');
      setActiveTab('diff');
    } catch (e) {
      setError(e.message);
    } finally {
      setRemixLoading(false);
    }
  };

  // ── Activate a history entry ───────────────────────────────────────────────
  const handleActivateHistory = useCallback(async (entry) => {
    setActivePack(entry.pack);
    setActiveTab('pack');

    if (entry.pack.id !== originalPackIdRef.current && originalPackIdRef.current) {
      const d = await fetchDiff(originalPackIdRef.current, entry.pack.id);
      setActiveDiff(d);
      setDiff(d);
    } else {
      setActiveDiff(null);
      setDiff(null);
    }
  }, [fetchDiff]);

  // ── Open all on Perchance ──────────────────────────────────────────────────
  const openAllOnPerchance = (targetPack) => {
    if (!targetPack) return;
    targetPack.generators.forEach(gen => {
      if (gen.code) openOnPerchance(gen.code, gen.slug);
    });
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const diffStatusMap = activeDiff
    ? Object.fromEntries(activeDiff.generators.map(g => [g.slug, g.status]))
    : {};

  const isOriginal = activePack?.id === originalPackIdRef.current;
  const versionLabel = isOriginal
    ? 'Original'
    : `v${remixHistory.findIndex(e => e.pack.id === activePack?.id)}`;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex gap-6">

        {/* ── Left: main panel ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

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
          {pack && activePack && (
            <>
              {/* Stats bar */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
                <span>🎲 <strong>{activePack.generators.length}</strong> generators</span>
                <span>⚡ {activePack.totalTokens?.toLocaleString()} tokens</span>
                <span>⏱ {((activePack.totalMs || 0) / 1000).toFixed(1)}s</span>
                <span className="font-semibold text-indigo-600">{versionLabel}</span>
                <span className="ml-auto text-xs text-gray-400 font-mono">{activePack.id}</span>
              </div>

              {/* Topology */}
              <div className="space-y-2">
                <h2 className="font-semibold text-gray-700">🗺 Topology</h2>
                <TopologyMap generators={activePack.generators} masterSlug={activePack.masterSlug} />
              </div>

              {/* Remix input */}
              <div className="border border-dashed border-indigo-300 rounded-xl p-4 space-y-3 bg-indigo-50/50">
                <h2 className="font-semibold text-indigo-700">🔀 Remix — viewing <span className="italic">{versionLabel}</span></h2>
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
              <div className="flex gap-2 border-b border-gray-200">
                {[
                  ['pack',  '📦 Generators'],
                  ...(activeDiff ? [['diff', '± Diff vs Original']] : [])
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

              {/* Diff view */}
              {activeTab === 'diff' && activeDiff && <DiffView diff={activeDiff} />}

              {/* Generator list */}
              {activeTab === 'pack' && (
                <div className="space-y-2">
                  {/* Toolbar — Share / Export / Open all / Perchance */}
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-700">
                      {versionLabel} generators
                    </h2>
                    <div className="flex gap-2">
                      {/* 🔗 Share */}
                      <button
                        onClick={() => setShareOpen(true)}
                        title="Share this pack via link"
                        className="text-xs px-3 py-1.5 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition font-medium flex items-center gap-1"
                      >
                        🔗 Share
                      </button>

                      {/* 📦 Export */}
                      <button
                        onClick={() => setExportOpen(true)}
                        title="Export generators as .zip / .json / clipboard"
                        className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-1"
                      >
                        📦 Export
                      </button>

                      {/* ↗ Open all on Perchance */}
                      <button
                        onClick={() => openAllOnPerchance(activePack)}
                        title="Open all generators on Perchance.org"
                        className="text-xs px-3 py-1.5 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition"
                      >
                        ↗ Open all on Perchance
                      </button>
                    </div>
                  </div>

                  {activePack.generators.map(gen => (
                    <GeneratorCard
                      key={gen.slug}
                      gen={gen}
                      diffStatus={!isOriginal ? diffStatusMap[gen.slug] : undefined}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: Remix History sidebar ──────────────────────────────── */}
        {remixHistory.length > 1 && (
          <div className="w-52 shrink-0 pt-16">
            <RemixTimeline
              history={remixHistory}
              activePack={activePack}
              onActivate={handleActivateHistory}
            />
          </div>
        )}

      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {shareOpen && activePack && (
        <SharePackModal
          pack={activePack}
          onClose={() => setShareOpen(false)}
        />
      )}

      {exportOpen && activePack && (
        <ExportModal
          generators={activePack.generators}
          packTheme={activePack.theme}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
}
