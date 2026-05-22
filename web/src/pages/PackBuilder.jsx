import React, { useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Chip, Alert, LinearProgress, Divider, IconButton,
  Tooltip, Grid, Badge, Collapse
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

const EXAMPLE_THEMES = [
  'Fantasy RPG session',
  'Sci-fi space opera crew',
  'Cozy mystery village',
  'Cyberpunk street encounter',
  'Dungeon delve adventure',
  'Pirate voyage generator'
];

export default function PackBuilder() {
  const [theme, setTheme] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | planning | building | done | error
  const [plan, setPlan] = useState(null);      // { theme, generators[] }
  const [pack, setPack] = useState(null);      // { theme, pack[], meta }
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState({});

  const reset = () => {
    setPhase('idle');
    setPlan(null);
    setPack(null);
    setError(null);
    setExpanded({});
    setCopied({});
  };

  const planPack = useCallback(async () => {
    if (!theme.trim()) return;
    setError(null);
    setPlan(null);
    setPack(null);
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
      if (root) setExpanded(prev => ({ ...prev, [root.id]: true }));
    } catch (e) {
      setError(e.message);
      setPhase('error');
    }
  }, [plan]);

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
  };

  const openOnPerchance = (code) => {
    const encoded = encodeURIComponent(code);
    window.open(`https://perchance.org/ai-text-to-text-generator#${encoded}`, '_blank', 'noopener');
  };

  const downloadPack = () => {
    if (!pack) return;
    const content = pack.pack.map(g =>
      `// ===== ${g.name.toUpperCase()} (${g.id}) =====\n// Role: ${g.role}\n// ${g.description}\n\n${g.code}`
    ).join('\n\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.theme.toLowerCase().replace(/\s+/g, '-')}-pack.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const isLoading = phase === 'planning' || phase === 'building';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#ff9800', fontSize: 36 }} />
          Pack Builder
        </Typography>
        <Typography color="text.secondary">
          Give a theme → AI plans & builds a set of interconnected Perchance generators that import from each other via{' '}
          <code style={{ color: '#00bcd4' }}>[^generator.list]</code>
        </Typography>
      </Box>

      {/* Input */}
      <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.03)' }}>
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
          />
          {/* Example chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {EXAMPLE_THEMES.map(t => (
              <Chip
                key={t}
                label={t}
                size="small"
                onClick={() => { setTheme(t); reset(); }}
                disabled={isLoading}
                sx={{ cursor: 'pointer', '&:hover': { borderColor: '#00bcd4' } }}
                variant="outlined"
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={planPack}
              disabled={!theme.trim() || isLoading}
              sx={{ background: 'linear-gradient(135deg, #00bcd4, #0097a7)' }}
            >
              {phase === 'planning' ? 'Planning…' : 'Plan Pack'}
            </Button>
            {plan && phase !== 'building' && phase !== 'done' && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<BuildIcon />}
                onClick={buildPack}
                disabled={isLoading}
              >
                Build All Generators
              </Button>
            )}
            {phase === 'done' && (
              <>
                <Button variant="outlined" startIcon={<BuildIcon />} onClick={buildPack}>
                  Rebuild
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadPack}>
                  Download Pack
                </Button>
              </>
            )}
            {(plan || pack || error) && (
              <Button variant="text" onClick={reset} disabled={isLoading} color="inherit">
                Reset
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Progress */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {phase === 'planning' ? '🤖 AI is planning the generator pack…' : `🔨 Building ${plan?.generators?.length || ''} generators in parallel…`}
          </Typography>
          <LinearProgress color={phase === 'planning' ? 'secondary' : 'warning'} />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Plan preview */}
      {plan && phase === 'planned' && (
        <Card sx={{ mb: 3, border: '1px solid rgba(0,188,212,0.3)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#00bcd4' }}>
              📋 Pack Plan — {plan.generators.length} generators for "{plan.theme}"
            </Typography>
            <Grid container spacing={2}>
              {plan.generators.map((gen, i) => (
                <Grid item xs={12} sm={6} md={4} key={gen.id}>
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    border: `1px solid ${ROLE_COLORS[gen.role]}40`,
                    background: `${ROLE_COLORS[gen.role]}08`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#888' }}>#{i + 1}</Typography>
                      <Chip label={ROLE_LABELS[gen.role] || gen.role} size="small"
                        sx={{ bgcolor: `${ROLE_COLORS[gen.role]}22`, color: ROLE_COLORS[gen.role], fontSize: '0.7rem' }} />
                    </Box>
                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>{gen.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                      {gen.description}
                    </Typography>
                    {gen.imports?.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {gen.imports.map(imp => (
                          <Chip key={imp} label={`←${imp}`} size="small"
                            icon={<LinkIcon sx={{ fontSize: '0.7rem !important' }} />}
                            sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'rgba(255,255,255,0.05)' }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="warning" startIcon={<BuildIcon />} onClick={buildPack}>
                Build All {plan.generators.length} Generators
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Built pack */}
      {pack && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">
              ✅ Pack ready — {pack.meta.validGenerators}/{pack.meta.totalGenerators} generators
            </Typography>
            <Chip label={`${pack.meta.totalCrossImports} cross-imports`} size="small"
              icon={<LinkIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{ bgcolor: 'rgba(0,188,212,0.15)', color: '#00bcd4' }} />
            <Chip label={`${(pack.meta.buildTime / 1000).toFixed(1)}s`} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pack.pack.map((gen) => (
              <Card key={gen.id} sx={{
                border: `1px solid ${ROLE_COLORS[gen.role] || '#333'}40`,
                background: `${ROLE_COLORS[gen.role] || '#333'}06`
              }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  {/* Generator header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Chip label={ROLE_LABELS[gen.role] || gen.role} size="small"
                      sx={{ bgcolor: `${ROLE_COLORS[gen.role]}22`, color: ROLE_COLORS[gen.role], fontWeight: 600 }} />
                    <Typography fontWeight={700} sx={{ flexGrow: 1 }}>{gen.name}</Typography>
                    {gen.validation?.valid && <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />}
                    {gen.validation?.crossImports > 0 && (
                      <Chip label={`${gen.validation.crossImports} imports`} size="small"
                        icon={<LinkIcon sx={{ fontSize: '0.75rem !important' }} />}
                        sx={{ bgcolor: 'rgba(0,188,212,0.1)', color: '#00bcd4', fontSize: '0.7rem' }} />
                    )}
                    <Tooltip title="Copy code">
                      <IconButton size="small" onClick={() => copyCode(gen.id, gen.code)}>
                        {copied[gen.id] ? <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} /> : <ContentCopyIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open on Perchance.org">
                      <IconButton size="small" onClick={() => openOnPerchance(gen.code)}>
                        <OpenInNewIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => toggleExpand(gen.id)}>
                      {expanded[gen.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {gen.description}
                  </Typography>

                  {/* Cross-import badges */}
                  {gen.imports?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>imports:</Typography>
                      {gen.imports.map(imp => (
                        <Chip key={imp} label={imp} size="small"
                          icon={<LinkIcon sx={{ fontSize: '0.7rem !important' }} />}
                          sx={{ fontSize: '0.68rem', height: 20, bgcolor: 'rgba(0,188,212,0.08)', color: '#00bcd4' }} />
                      ))}
                    </Box>
                  )}

                  {/* Code block (collapsible) */}
                  <Collapse in={!!expanded[gen.id]}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box component="pre" sx={{
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: 1,
                      p: 2,
                      overflowX: 'auto',
                      fontSize: '0.78rem',
                      fontFamily: '"Fira Code", "Cascadia Code", monospace',
                      lineHeight: 1.6,
                      color: '#e0e0e0',
                      border: '1px solid rgba(255,255,255,0.06)',
                      maxHeight: 420,
                      overflowY: 'auto',
                      margin: 0
                    }}>
                      {gen.code}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button size="small" startIcon={<ContentCopyIcon />}
                        onClick={() => copyCode(gen.id, gen.code)} variant="outlined">
                        {copied[gen.id] ? 'Copied!' : 'Copy Code'}
                      </Button>
                      <Button size="small" startIcon={<OpenInNewIcon />}
                        onClick={() => openOnPerchance(gen.code)} variant="outlined" color="warning">
                        Open on Perchance
                      </Button>
                    </Box>
                  </Collapse>

                  {/* Collapsed summary */}
                  {!expanded[gen.id] && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {gen.validation?.listsFound || 0} lists · {gen.code?.split('\n').length || 0} lines
                      {gen.validation?.crossImports > 0 ? ` · ${gen.validation.crossImports} cross-imports` : ''}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
