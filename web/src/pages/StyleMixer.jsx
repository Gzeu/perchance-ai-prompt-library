import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, TextField, Button, Box, Paper, Chip,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  OutlinedInput, IconButton, Tooltip,
} from '@mui/material';
import { Palette, PlayArrow, ContentCopy, Star, StarBorder } from '@mui/icons-material';
import { promptApi } from '../services/api';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';

const StyleMixer = () => {
  const [allStyles, setAllStyles] = useState([]);
  const [formData, setFormData] = useState({ styles: [], subject: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { addToHistory } = useHistory();
  const { addFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    promptApi.getStyles().then(res => setAllStyles(res.data.data || [])).catch(() => setError('Failed to load styles'));
  }, []);

  const handleMix = async () => {
    if (!formData.subject.trim()) { setError('Subject is required'); return; }
    if (formData.styles.length < 2) { setError('Select at least 2 styles'); return; }
    setLoading(true); setError(null);
    try {
      const response = await promptApi.mixStyles(formData);
      const r = response.data.data;
      setResult(r);
      addToHistory({ text: r.text, style: formData.styles.join('+'), subject: formData.subject, type: 'mixed' });
    } catch (err) {
      setError(err.message || 'Failed to mix styles');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>🎨 Style Mixer</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mix Configuration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Combine multiple art styles to create unique prompts</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Styles to Mix</InputLabel>
                    <Select multiple value={formData.styles}
                      onChange={(e) => setFormData({ ...formData, styles: e.target.value })}
                      input={<OutlinedInput label="Select Styles to Mix" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(v => {
                            const s = allStyles.find(x => x.key === v);
                            return <Chip key={v} label={s?.name || v} size="small" color="primary" />;
                          })}
                        </Box>
                      )}>
                      {allStyles.map(s => <MenuItem key={s.key} value={s.key}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Subject" value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., dragon rider, cyberpunk detective" required />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" color="primary" onClick={handleMix}
                    disabled={loading || formData.styles.length < 2}
                    startIcon={loading ? <CircularProgress size={20} /> : <Palette />} size="large">
                    {loading ? 'Mixing...' : 'Mix Styles'}
                  </Button>
                </Grid>
              </Grid>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {formData.styles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Selected ({formData.styles.length}):</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.styles.map(k => {
                      const s = allStyles.find(x => x.key === k);
                      return s ? <Chip key={k} label={s.name} size="small" onDelete={() => setFormData({ ...formData, styles: formData.styles.filter(x => x !== k) })} /> : null;
                    })}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mixed Result</Typography>
                {result && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                      <IconButton size="small" onClick={() => copyToClipboard(result.text)} color={copied ? 'success' : 'default'}><ContentCopy fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title={isFavorite(result.text) ? 'In favorites' : 'Add to favorites'}>
                      <IconButton size="small" onClick={() => addFavorite({ text: result.text, style: formData.styles.join('+'), subject: formData.subject })} color={isFavorite(result.text) ? 'warning' : 'default'}>
                        {isFavorite(result.text) ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
              {result ? (
                <Box>
                  <Paper sx={{ p: 2, mb: 2, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>{result.text}</Typography>
                  </Paper>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={`Mixed: ${result.mixedStyles?.join(' + ') || formData.styles.join(' + ')}`} color="primary" size="small" />
                    <Chip label={`Subject: ${result.subject || formData.subject}`} color="secondary" size="small" />
                  </Box>
                  {result.negativePrompt && (
                    <Paper sx={{ p: 2, bgcolor: 'rgba(255,0,0,0.08)' }}>
                      <Typography variant="subtitle2" gutterBottom color="error">🚫 Negative Prompt:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{result.negativePrompt}</Typography>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Typography color="text.secondary">Select ≥2 styles and a subject, then click Mix Styles</Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StyleMixer;
