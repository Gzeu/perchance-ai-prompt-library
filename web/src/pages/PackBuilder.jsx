import React, { useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Chip, Alert, LinearProgress, Divider, IconButton,
  Tooltip, Grid, Collapse, Skeleton, Stack
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ROLE_COLORS = {
  root: '#ff9800',
  dependency: '#00bcd4',
  standalone: '#9c27b0'
};

const ROLE_LABELS = {
  root: '🎯 Root',
  dependency: '🔗 Dependency',
  standalone: '⚡ Standalone'
};

const ROLE_DESCRIPTIONS = {
  root: 'Main generator — uses cross-imports from dependencies',
  dependency: 'Provides named lists imported by root/other generators',
  standalone: 'Self-contained — no cross-imports needed'
};

const EXAMPLE_THEMES = [
  { label: 'Fantasy RPG session', emoji: '⚔️' },
  { label: 'Sci-fi space opera crew', emoji: '🚀' },
  { label: 'Cozy mystery village', emoji: '🕵️' },
  { label: 'Cyberpunk street encounter', emoji: '🌆' },
  { label: 'Dungeon delve adventure', emoji: '🏰' },
  { label: 'Pirate voyage generator', emoji: '🏴‍☠️' },
  { label: 'Horror survival scenario', emoji: '👻' },
  { label: 'Anime character creator', emoji: '🎌' },
];

// ── Skeleton for plan cards ──────────────────────────────────────────
function PlanCardSkeleton() {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
        <Skeleton variant="rounded" width={80} height={22} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={24} />
        <Skeleton variant="text" width="100%" height={18} />
        <Skeleton variant="text" width="60%" height={18} />
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
          <Skeleton variant="rounded" width={60} height={18} />
          <Skeleton variant="rounded" width={50} height={18} />
        </Box>
      </Box>
    </Grid>
  );
}

// ── Dependency graph (text-based) ───────────────────────────────────
function DependencyGraph({ generators }) {
  const roots = generators.filter(g => g.role === 'root');
  const deps = generators.filter(g => g.role === 'dependency');
  const standalones = generators.filter(g => g.role === 'standalone');

  if (!deps.length && !standalones.length) return null;

  return (
    <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.12)', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AccountTreeIcon sx={{ color: '#00bcd4', fontSize: 18 }} />
        <Typography variant="caption" sx={{ color: '#00bcd4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          Import Graph
        </Typography>
      </Box>
      <Box sx={{ fontFamily: '"Fira Code", monospace', fontSize: '0.78rem', color: '#aaa', lineHeight: 2 }}>
        {deps.map(dep => (
          <Box key={dep.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component="span" sx={{ color: '#00bcd4', fontFamily: 'inherit', fontSize: 'inherit' }}>[{dep.id}]</Typography>
            <Typography component="span" sx={{ color: '#555', fontFamily: 'inherit', fontSize: 'inherit' }}>──▶</Typography>
            {roots.filter(r => r.imports?.includes(dep.id)).map(r => (
              <Typography key={r.id} component="span" sx={{ color: '#ff9800', fontFamily: 'inherit', fontSize: 'inherit', mr: 0.5 }}>[{r.id}]</Typography>
            ))}
          </Box>
        ))}
        {standalones.map(s => (
          <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component="span" sx={{ color: '#9c27b0', fontFamily: 'inherit', fontSize: 'inherit' }}>[{s.id}]</Typography>
            <Typography component="span" sx={{ color: '#555', fontFamily: 'inherit', fontSize: 'inherit' }}>── standalone</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Single generator card ─────────────────────────────────────────────
function GeneratorCard({ gen, expanded, onToggle, copied, onCopy, onOpen }) {
  const roleColor = ROLE_COLORS[gen.role] || '#888';
  const hasFailed = gen.code?.startsWith('// ERROR');

  return (
    <Card sx={{
      border: `1px solid ${roleColor}${hasFailed ? '60' : '30'}`,
      background: hasFailed ? 'rgba(244,67,54,0.04)' : `${roleColor}05`,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: `0 0 0 1px ${roleColor}40` }
    }}>
      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Chip
            label={ROLE_LABELS[gen.role] || gen.role}
            size="small"
            sx={{ bgcolor: `${roleColor}20`, color: roleColor, fontWeight: 700, fontSize: '0.7rem' }}
          />
          <Typography fontWeight={700} sx={{ flexGrow: 1 }}>{gen.name}</Typography>

          {hasFailed && <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: 18 }} />}
          {!hasFailed && gen.validation?.valid && <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />}

          {gen.validation?.crossImports > 0 && (
            <Chip
              label={`${gen.validation.crossImports} imports`}
              size="small"
              icon={<LinkIcon sx={{ fontSize: '0.75rem !important' }} />}
              sx={{ bgcolor: 'rgba(0,188,212,0.1)', color: '#00bcd4', fontSize: '0.7rem' }}
            />
          )}

          <Tooltip title={copied[gen.id] ? 'Copied!' : 'Copy code'}>
            <IconButton size="small" onClick={() => onCopy(gen.id, gen.code)} disabled={hasFailed}>
              {copied[gen.id]
                ? <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                : <ContentCopyIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Open on Perchance.org">
            <IconButton size="small" onClick={() => onOpen(gen.code)} disabled={hasFailed}>
              <OpenInNewIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onToggle}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.82rem' }}>
          {gen.description}
        </Typography>

        {/* Cross-import badges */}
        {gen.imports?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, lineHeight: '20px' }}>imports:</Typography>
            {gen.imports.map(imp => (
              <Chip
                key={imp}
                label={imp}
                size="small"
                icon={<LinkIcon sx={{ fontSize: '0.7rem !important' }} />}
                sx={{ fontSize: '0.68rem', height: 20, bgcolor: 'rgba(0,188,212,0.08)', color: '#00bcd4' }}
              />
            ))}
          </Box>
        )}

        {/* Collapsed summary line */}
        {!expanded && !hasFailed && (
          <Typography variant="caption" color="text.secondary">
            {gen.validation?.listsFound || 0} lists · {gen.code?.split('\n').length || 0} lines
            {gen.validation?.crossImports > 0 ? ` · ${gen.validation.crossImports} cross-imports` : ''}
          </Typography>
        )}
        {!expanded && hasFailed && (
          <Typography variant="caption" sx={{ color: '#f44336' }}>Generation failed — try Rebuild</Typography>
        )}

        {/* Expanded code block */}
        <Collapse in={!!expanded}>
          <Divider sx={{ my: 1.5 }} />
          <Box
            component="pre"
            sx={{
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 1,
              p: 2,
              overflowX: 'auto',
              fontSize: '0.77rem',
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
              lineHeight: 1.65,
              color: hasFailed ? '#f44336' : '#e0e0e0',
              border: '1px solid rgba(255,255,255,0.06)',
              maxHeight: 400,
              overflowY: 'auto',
              margin: 0
            }}
          >
            {gen.code}
          </Box>
          {!hasFailed && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button
                size="small"
                startIcon={copied[gen.id] ? <CheckCircleIcon /> : <ContentCopyIcon />}
                onClick={() => onCopy(gen.id, gen.code)}
                variant="outlined"
                sx={{ color: copied[gen.id] ? '#4caf50' : undefined }}
              >
                {copied[gen.id] ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button size="small" startIcon={<OpenInNewIcon />} onClick={() => onOpen(gen.code)} variant="outlined" color="warning">
                Open on Perchance
              </Button>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function PackBuilder() {
  const [theme, setTheme] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | planning | planned | building | done | error
  const [plan, setPlan] = useState(null);
  const [pack, setPack] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState({});
  const [copiedAll, setCopiedAll] = useState(false);

  const reset = () => {
    setPhase('idle');
    setPlan(null);
    setPack(null);
    setError(null);
    setExpanded({});
    setCopied({});
    setCopiedAll(false);
  };

  const planPack = useCallback(async () => {
    if (!theme.trim()) return;
    setError(null);
    setPlan(null);
    setPack(null);
    setExpanded({});
    setPhase('planning');
    try {
      const res = await fetch(`${API_BASE}/api/perchance/pack/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim() })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Plan failed');
      setPlan(json.data);
      setPhase('planned');
    } catch (e) {
      setError(e.message);
      setPhase('error');
    }
  }, [theme]);

  const buildPack = useCallback(async () => {
    if (!plan) return;
    setError(null);
    setPack(null);
    setPhase('building');
    try {
      const res = await fetch(`${API_BASE}/api/perchance/pack/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: plan.theme, generators: plan.generators })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Build failed');
      setPack(json.data);
      setPhase('done');
      // Auto-expand root generator
      const root = json.data.pack.find(g => g.role === 'root');
      if (root) setExpanded({ [root.id]: true });
    } catch (e) {
      setError(e.message);
      setPhase('error');
    }
  }, [plan]);

  const copyCode = useCallback((id, code) => {
    navigator.clipboard.writeText(code);
    setCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
  }, []);

  const copyAll = useCallback(() => {
    if (!pack) return;
    const content = pack.pack
      .map(g => `// ===== ${g.name.toUpperCase()} (${g.id}) =====\n// Role: ${g.role} | ${g.description}\n\n${g.code}`)
      .join('\n\n\n');
    navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }, [pack]);

  const openOnPerchance = useCallback((code) => {
    const encoded = encodeURIComponent(code);
    window.open(`https://perchance.org/ai-text-to-text-generator#${encoded}`, '_blank', 'noopener noreferrer');
  }, []);

  const downloadPack = useCallback(() => {
    if (!pack) return;
    const content = [
      `// PERCHANCE GENERATOR PACK`,
      `// Theme: ${pack.theme}`,
      `// Generated: ${new Date().toISOString()}`,
      `// Generators: ${pack.meta.totalGenerators} (${pack.meta.validGenerators} valid)`,
      `// Cross-imports: ${pack.meta.totalCrossImports}`,
      '',
      ...pack.pack.map(g =>
        `// ${'='.repeat(60)}\n// ${g.name.toUpperCase()} [${g.id}]\n// Role: ${g.role} — ${g.description}\n// ${'='.repeat(60)}\n\n${g.code}`
      )
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.theme.toLowerCase().replace(/\s+/g, '-')}-pack.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pack]);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const stats = useMemo(() => {
    if (!pack) return null;
    const byRole = pack.pack.reduce((acc, g) => {
      acc[g.role] = (acc[g.role] || 0) + 1;
      return acc;
    }, {});
    return { byRole, failed: pack.pack.filter(g => g.code?.startsWith('// ERROR')).length };
  }, [pack]);

  const isLoading = phase === 'planning' || phase === 'building';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 3 }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
          <LayersIcon sx={{ color: '#ff9800', fontSize: 34 }} />
          <Typography variant="h4" fontWeight={800}>Pack Builder</Typography>
          <Chip label="BETA" size="small" sx={{ bgcolor: 'rgba(255,152,0,0.15)', color: '#ff9800', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
        </Box>
        <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
          Enter a theme → AI plans a set of interconnected Perchance generators,
          then builds them in parallel with cross-imports via{' '}
          <code style={{ color: '#00bcd4', background: 'rgba(0,188,212,0.08)', padding: '1px 5px', borderRadius: 4 }}>
            [^generator.listName]
          </code>
        </Typography>
      </Box>

      {/* ── Input card ── */}
      <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <CardContent>
          <TextField
            fullWidth
            label="Theme"
            placeholder='e.g. "Fantasy RPG session" or "Cyberpunk street encounter"'
            value={theme}
            onChange={e => setTheme(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && planPack()}
            disabled={isLoading}
            sx={{ mb: 2 }}
            variant="outlined"
            InputProps={{ sx: { fontFamily: '"Fira Code", monospace' } }}
          />

          {/* Example chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
            {EXAMPLE_THEMES.map(t => (
              <Chip
                key={t.label}
                label={`${t.emoji} ${t.label}`}
                size="small"
                onClick={() => { setTheme(t.label); if (phase !== 'idle') reset(); }}
                disabled={isLoading}
                variant="outlined"
                sx={{ cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s',
                  '&:hover': { borderColor: '#00bcd4', color: '#00bcd4', background: 'rgba(0,188,212,0.06)' } }}
              />
            ))}
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={planPack}
              disabled={!theme.trim() || isLoading}
              sx={{
                background: theme.trim() && !isLoading
                  ? 'linear-gradient(135deg, #0097a7, #006064)'
                  : undefined,
                fontWeight: 700
              }}
            >
              {phase === 'planning' ? 'Planning…' : 'Plan Pack'}
            </Button>

            {(phase === 'planned') && (
              <Button
                variant="contained"
                startIcon={<BuildIcon />}
                onClick={buildPack}
                disabled={isLoading}
                sx={{ background: 'linear-gradient(135deg, #e65100, #bf360c)', fontWeight: 700 }}
              >
                Build {plan?.generators?.length} Generators
              </Button>
            )}

            {phase === 'done' && (
              <>
                <Button variant="outlined" startIcon={<BuildIcon />} onClick={buildPack} disabled={isLoading}>
                  Rebuild
                </Button>
                <Button
                  variant="outlined"
                  startIcon={copiedAll ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  onClick={copyAll}
                  sx={{ color: copiedAll ? '#4caf50' : undefined, borderColor: copiedAll ? '#4caf50' : undefined }}
                >
                  {copiedAll ? 'Copied All!' : 'Copy All'}
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadPack}>
                  Download .txt
                </Button>
              </>
            )}

            {(plan || pack || error) && (
              <Button variant="text" onClick={reset} disabled={isLoading} color="inherit" sx={{ opacity: 0.6 }}>
                Reset
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ── Progress bar ── */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {phase === 'planning'
              ? '🤖 AI is analyzing the theme and planning the generator pack…'
              : `🔨 Building ${plan?.generators?.length || ''} generators in parallel (Promise.allSettled)…`}
          </Typography>
          <LinearProgress
            color={phase === 'planning' ? 'secondary' : 'warning'}
            sx={{ borderRadius: 1, height: 5 }}
          />
        </Box>
      )}

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)} icon={<ErrorOutlineIcon />}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* ── Planning skeleton ── */}
      {phase === 'planning' && (
        <Card sx={{ mb: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent>
            <Skeleton variant="text" width={220} height={28} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[0, 1, 2, 3, 4].map(i => <PlanCardSkeleton key={i} />)}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── Plan preview ── */}
      {plan && (phase === 'planned' || phase === 'building' || phase === 'done') && (
        <Card sx={{ mb: 3, border: '1px solid rgba(0,188,212,0.2)', background: 'rgba(0,188,212,0.02)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AccountTreeIcon sx={{ color: '#00bcd4' }} />
              <Typography variant="h6" sx={{ color: '#00bcd4', fontWeight: 700 }}>
                Pack Plan — {plan.generators.length} generators
              </Typography>
              <Typography variant="body2" color="text.secondary">for "{plan.theme}"</Typography>
              {/* Role legend */}
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <Tooltip key={role} title={ROLE_DESCRIPTIONS[role]}>
                    <Chip
                      label={label}
                      size="small"
                      sx={{ bgcolor: `${ROLE_COLORS[role]}15`, color: ROLE_COLORS[role], fontSize: '0.68rem', cursor: 'help' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <DependencyGraph generators={plan.generators} />

            <Grid container spacing={1.5}>
              {plan.generators.map((gen, i) => (
                <Grid item xs={12} sm={6} md={4} key={gen.id}>
                  <Box sx={{
                    p: 2, borderRadius: 2, height: '100%',
                    border: `1px solid ${ROLE_COLORS[gen.role] || '#555'}35`,
                    background: `${ROLE_COLORS[gen.role] || '#555'}06`,
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: `${ROLE_COLORS[gen.role] || '#555'}70` }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace' }}>#{i + 1}</Typography>
                      <Chip
                        label={ROLE_LABELS[gen.role] || gen.role}
                        size="small"
                        sx={{ bgcolor: `${ROLE_COLORS[gen.role] || '#555'}20`, color: ROLE_COLORS[gen.role] || '#aaa', fontSize: '0.68rem' }}
                      />
                    </Box>
                    <Typography fontWeight={700} sx={{ mb: 0.25, fontSize: '0.92rem' }}>{gen.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {gen.description}
                    </Typography>
                    {gen.imports?.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                        {gen.imports.map(imp => (
                          <Chip
                            key={imp}
                            label={`← ${imp}`}
                            size="small"
                            sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(0,188,212,0.08)', color: '#00bcd4' }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>

            {phase === 'planned' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<BuildIcon />}
                  onClick={buildPack}
                  sx={{ background: 'linear-gradient(135deg, #e65100, #bf360c)', fontWeight: 700 }}
                >
                  Build All {plan.generators.length} Generators
                </Button>
              </Box>
            )}

            {phase === 'building' && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress color="warning" sx={{ borderRadius: 1, height: 4 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Building generators in parallel…
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Built pack ── */}
      {pack && phase === 'done' && (
        <Box>
          {/* Summary bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 22 }} />
            <Typography variant="h6" fontWeight={700}>
              Pack ready — {pack.meta.validGenerators}/{pack.meta.totalGenerators} generators
            </Typography>
            <Chip
              label={`${pack.meta.totalCrossImports} cross-imports`}
              size="small"
              icon={<LinkIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{ bgcolor: 'rgba(0,188,212,0.12)', color: '#00bcd4' }}
            />
            <Chip
              label={`${(pack.meta.buildTime / 1000).toFixed(1)}s build`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
            />
            {stats?.byRole && Object.entries(stats.byRole).map(([role, count]) => (
              <Chip
                key={role}
                label={`${count} ${role}`}
                size="small"
                sx={{ bgcolor: `${ROLE_COLORS[role] || '#555'}15`, color: ROLE_COLORS[role] || '#aaa', fontSize: '0.7rem' }}
              />
            ))}
            {stats?.failed > 0 && (
              <Chip label={`${stats.failed} failed`} size="small" sx={{ bgcolor: 'rgba(244,67,54,0.15)', color: '#f44336' }} />
            )}
          </Box>

          {/* Generator cards */}
          <Stack spacing={1.5}>
            {pack.pack.map(gen => (
              <GeneratorCard
                key={gen.id}
                gen={gen}
                expanded={!!expanded[gen.id]}
                onToggle={() => toggleExpand(gen.id)}
                copied={copied}
                onCopy={copyCode}
                onOpen={openOnPerchance}
              />
            ))}
          </Stack>

          {/* Bottom action bar */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={copiedAll ? <CheckCircleIcon /> : <ContentCopyIcon />}
              onClick={copyAll}
              sx={{ color: copiedAll ? '#4caf50' : undefined, borderColor: copiedAll ? '#4caf50' : undefined }}
            >
              {copiedAll ? 'Copied All!' : 'Copy All Generators'}
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadPack}>
              Download Pack (.txt)
            </Button>
            <Button variant="outlined" startIcon={<BuildIcon />} onClick={buildPack}>
              Rebuild
            </Button>
          </Box>
        </Box>
      )}

      {/* ── Empty state ── */}
      {phase === 'idle' && (
        <Box sx={{
          textAlign: 'center', py: 8,
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.01)'
        }}>
          <LayersIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No pack generated yet</Typography>
          <Typography variant="body2" color="text.disabled">
            Enter a theme above and click <strong>Plan Pack</strong> to start
          </Typography>
        </Box>
      )}
    </Box>
  );
}
