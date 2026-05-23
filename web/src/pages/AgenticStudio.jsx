import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '../utils/api.js';

const CATEGORIES = [
  'Characters', 'Locations', 'Items', 'Stories', 'Dialogue',
  'Encounters', 'Sci-Fi', 'Writing', 'Names', 'Events', 'Magic', 'Master'
];

const STEPS = ['Select agents', 'Generate variants', 'Debate', 'Winner', 'Done'];

function AgentCard({ agent, selected }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 8,
        border: selected
          ? '1px solid rgba(1,105,111,0.6)'
          : '1px solid var(--color-border, rgba(255,255,255,0.08))',
        background: selected ? 'rgba(1,105,111,0.12)' : 'rgba(255,255,255,0.03)',
        marginBottom: 8
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13 }}>{agent.name}</div>
      {agent.bio && (
        <p style={{ margin: '4px 0 6px', fontSize: 11, color: '#888', lineHeight: 1.4 }}>
          {agent.bio}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {agent.skills?.slice(0, 3).map((s) => (
          <span
            key={s.name}
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              background: '#222',
              color: '#7ee787'
            }}
          >
            {s.name} {s.score}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AgenticStudio() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Writing');
  const [complexity, setComplexity] = useState('medium');
  const [iterations, setIterations] = useState(2);
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [groqReady, setGroqReady] = useState(null);
  const [allAgents, setAllAgents] = useState([]);
  const [previewAgents, setPreviewAgents] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [code, setCode] = useState('');
  const [meta, setMeta] = useState(null);
  const [variants, setVariants] = useState([]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    api.get(endpoints.perchanceAgenticStatus)
      .then((res) => {
        setGroqReady(res.data?.groqConfigured ?? false);
        setAllAgents(res.data?.agents ?? []);
      })
      .catch(() => setGroqReady(false));
  }, []);

  useEffect(() => {
    const trimmed = description.trim();
    if (trimmed.length < 4) {
      setPreviewAgents([]);
      return undefined;
    }

    setPreviewLoading(true);
    const timer = setTimeout(() => {
      api
        .get(endpoints.perchanceAgenticPreview, {
          params: { description: trimmed, category: category.toLowerCase() }
        })
        .then((res) => setPreviewAgents(res.data?.agents ?? []))
        .catch(() => setPreviewAgents([]))
        .finally(() => setPreviewLoading(false));
    }, 450);

    return () => clearTimeout(timer);
  }, [description, category]);

  const validateLive = useCallback(async (text) => {
    if (!text.trim()) return;
    try {
      const res = await api.post(endpoints.perchanceValidate, { code: text });
      setValidation(res.data);
    } catch {
      setValidation(null);
    }
  }, []);

  const runAgentic = async () => {
    if (!description.trim()) {
      setError('Enter a description for your generator.');
      return;
    }
    setError(null);
    setLoading(true);
    setStepIndex(0);
    setCode('');
    setMeta(null);
    setVariants([]);
    setActiveVariant(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 2 ? i + 1 : i));
    }, 2500);

    try {
      const res = await api.post(endpoints.perchanceAgentic, {
        description: description.trim(),
        category: category.toLowerCase(),
        complexity,
        iterations,
        theme: theme.trim() || undefined
      });

      clearInterval(stepTimer);
      setStepIndex(STEPS.length - 1);
      const data = res.data;
      const all = data.allVariants ?? [];
      setVariants(all);
      setCode(data.code || '');
      setMeta({
        agentsUsed: data.agentsUsed,
        selectedAgents: data.selectedAgents,
        memoryUsed: data.memoryUsed,
        finalScore: data.finalScore,
        generationTime: data.generationTime,
        debateRounds: data.debateRounds
      });
      setValidation(data.validation);
    } catch (err) {
      clearInterval(stepTimer);
      setStepIndex(-1);
      const msg = err.response?.data?.error || err.message || 'Generation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectVariant = (index) => {
    setActiveVariant(index);
    const v = variants[index];
    if (v?.content) {
      setCode(v.content);
      setValidation(null);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const agentsForPanel = previewAgents.length > 0 ? previewAgents : allAgents.slice(0, 7);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
          Ultra Agentic Mode
        </h1>
        <p style={{ color: 'var(--color-text-muted, #aaa)', marginTop: 8 }}>
          Seven specialized agents collaborate, debate, and vote to produce the best Perchance generator.
        </p>
      </header>

      {groqReady === false && (
        <div style={{
          padding: 16, marginBottom: 20, borderRadius: 8,
          background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.4)'
        }}>
          Groq API is not configured on the server. Set <code>GROQ_API_KEY</code> in the API <code>.env</code> and restart <code>npm start</code>.
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 24,
        alignItems: 'start'
      }}>
        <section style={{
          padding: 20, borderRadius: 12,
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          background: 'var(--color-surface, #111)'
        }}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="e.g. fantasy tavern name generator with mood and reputation"
              style={{
                width: '100%', marginTop: 6, padding: 10, borderRadius: 8,
                background: '#0d1117', color: '#fff', border: '1px solid #333', resize: 'vertical'
              }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%', marginTop: 6, padding: 10, borderRadius: 8,
                background: '#0d1117', color: '#fff', border: '1px solid #333'
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Complexity</span>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              style={{
                width: '100%', marginTop: 6, padding: 10, borderRadius: 8,
                background: '#0d1117', color: '#fff', border: '1px solid #333'
              }}
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="master">Master</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Debate rounds ({iterations})</span>
            <input
              type="range" min={1} max={3} value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8 }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Theme (optional)</span>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="dark fantasy, cozy, etc."
              style={{
                width: '100%', marginTop: 6, padding: 10, borderRadius: 8,
                background: '#0d1117', color: '#fff', border: '1px solid #333'
              }}
            />
          </label>

          <button
            type="button"
            onClick={runAgentic}
            disabled={loading}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none',
              background: loading ? '#333' : '#01696f', color: '#fff',
              fontWeight: 700, cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Agents working…' : 'Generate with Agents'}
          </button>

          {error && (
            <p style={{ color: '#f85149', marginTop: 12, fontSize: 13 }}>{error}</p>
          )}

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
              {previewAgents.length > 0
                ? `Selected for this request (${previewAgents.length})`
                : `All agents (${allAgents.length})`}
              {previewLoading && ' — updating…'}
            </p>
            {agentsForPanel.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                selected={previewAgents.some((p) => p.id === a.id)}
              />
            ))}
          </div>
        </section>

        <section>
          {loading && stepIndex >= 0 && (
            <div style={{
              padding: 16, marginBottom: 16, borderRadius: 8,
              background: 'rgba(1,105,111,0.15)', border: '1px solid rgba(1,105,111,0.4)'
            }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{STEPS[stepIndex]}…</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11, padding: '4px 8px', borderRadius: 4,
                      background: i <= stepIndex ? '#01696f' : '#222',
                      color: i <= stepIndex ? '#fff' : '#666'
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meta && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 13 }}>
              <span>Agents: <strong>{meta.agentsUsed?.join(', ')}</strong></span>
              <span>Score: <strong>{meta.finalScore?.toFixed(2)}</strong></span>
              <span>Time: <strong>{meta.generationTime}ms</strong></span>
              <span>Rounds: <strong>{meta.debateRounds}</strong></span>
              {meta.memoryUsed && (
                <span style={{ color: '#7ee787' }}>Memory context used</span>
              )}
            </div>
          )}

          {variants.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVariant(i)}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #333',
                    background: activeVariant === i ? '#01696f' : '#222',
                    color: '#fff', cursor: 'pointer', fontSize: 12
                  }}
                >
                  {v.agent} ({v.score?.toFixed(1)})
                </button>
              ))}
            </div>
          )}

          {validation && (
            <p style={{
              fontSize: 13, marginBottom: 12,
              color: validation.valid ? '#7ee787' : '#f85149'
            }}>
              {validation.valid ? 'Syntax valid' : `Errors: ${validation.errors?.join(', ')}`}
              {validation.warnings?.length > 0 && (
                <span style={{ color: '#ffa657' }}> — {validation.warnings.join('; ')}</span>
              )}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={copyCode}
              disabled={!code}
              style={{
                padding: '8px 14px', borderRadius: 6, border: '1px solid #333',
                background: '#222', color: '#fff', cursor: code ? 'pointer' : 'not-allowed'
              }}
            >
              Copy code
            </button>
            <button
              type="button"
              onClick={() => validateLive(code)}
              disabled={!code}
              style={{
                padding: '8px 14px', borderRadius: 6, border: '1px solid #333',
                background: '#222', color: '#fff', cursor: code ? 'pointer' : 'not-allowed'
              }}
            >
              Re-validate
            </button>
            <a
              href="https://perchance.org"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '8px 14px', borderRadius: 6, border: '1px solid #01696f',
                color: '#00bcd4', textDecoration: 'none', alignSelf: 'center'
              }}
            >
              Open Perchance.org
            </a>
          </div>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setValidation(null);
            }}
            placeholder="Generated Perchance code will appear here…"
            spellCheck={false}
            style={{
              width: '100%', minHeight: 480, padding: 16, borderRadius: 10,
              fontFamily: "'Fira Code', Consolas, monospace", fontSize: 13, lineHeight: 1.6,
              background: '#0d1117', color: '#e6edf3', border: '1px solid #333', resize: 'vertical'
            }}
          />
        </section>
      </div>
    </div>
  );
}
