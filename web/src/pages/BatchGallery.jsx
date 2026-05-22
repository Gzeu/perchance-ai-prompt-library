import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Box, Paper, Chip, Alert, CircularProgress,
  IconButton, Tooltip, Slider,
} from '@mui/material';
import { ContentCopy, Download, ViewModule, Star, StarBorder } from '@mui/icons-material';
import { promptApi } from '../services/api';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';

const BatchGallery = () => {
  const [styles, setStyles] = useState([]);
  const [formData, setFormData] = useState({ style: '', subject: '', count: 3 });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToHistory } = useHistory();
  const { addFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    promptApi.getStyles().then(res => {
      const s = res.data.data || [];
      setStyles(s);
      if (s.length > 0) setFormData(prev => ({ ...prev, style: s[0].key }));
    }).catch(() => setError('Failed to load styles'));
  }, []);

  const handleGenerate = async () => {
    if (!formData.subject.trim()) { setError('Subject is required'); return; }
    setLoading(true); setError(null);
    try {
      const response = await promptApi.generateBatch(formData);
      if (response.data?.success) {
        const batchData = response.data.data;
        const items = batchData?.results || (Array.isArray(batchData) ? batchData : []);
        setResults(items);
        items.forEach(r => addToHistory({ text: r.text, style: formData.style, subject: formData.subject, type: 'batch' }));
      } else {
        setError('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate batch');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const downloadBatch = (format = 'json') => {
    if (!results.length) return;
    let content, mime, ext;
    if (format === 'txt') {
      content = results.map((r, i) => `--- Variation ${i + 1} ---\n${r.text}`).join('\n\n');
      mime = 'text/plain'; ext = 'txt';
    } else {
      content = JSON.stringify(results, null, 2);
      mime = 'application/json'; ext = 'json';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `batch_${Date.now()}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>🔄 Batch Gallery</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Batch Configuration</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Art Style</InputLabel>
                    <Select value={formData.style} label="Art Style" onChange={(e) => setFormData({ ...formData, style: e.target.value })}>
                      {styles.map(s => <MenuItem key={s.key} value={s.key}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Subject" value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., magical sorceress, space warrior" required />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Variations: {formData.count}</Typography>
                  <Slider value={formData.count} onChange={(_, v) => setFormData({ ...formData, count: v })} min={1} max={10} marks valueLabelDisplay="auto" />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" color="secondary" onClick={handleGenerate} disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <ViewModule />} size="large">
                    {loading ? 'Generating...' : `Generate ${formData.count} Variations`}
                  </Button>
                </Grid>
                {results.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button fullWidth variant="outlined" onClick={() => downloadBatch('txt')} startIcon={<Download />} size="small">TXT</Button>
                      <Button fullWidth variant="outlined" onClick={() => downloadBatch('json')} startIcon={<Download />} size="small">JSON</Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Generated Variations ({results.length})</Typography>
              {results.length > 0 ? (
                <Grid container spacing={2}>
                  {results.map((result, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">Variation {result.variationNumber || index + 1}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Copy">
                              <IconButton size="small" onClick={() => copyToClipboard(result.text)}><ContentCopy fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title={isFavorite(result.text) ? 'In favorites' : 'Add to favorites'}>
                              <IconButton size="small" onClick={() => addFavorite({ text: result.text, style: formData.style, subject: formData.subject })} color={isFavorite(result.text) ? 'warning' : 'default'}>
                                {isFavorite(result.text) ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxHeight: 100, overflow: 'auto', color: 'text.secondary' }}>
                          {result.text || 'No text available'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={`Words: ${result.metadata?.wordCount || 0}`} size="small" color="primary" />
                          <Chip label={`Chars: ${result.metadata?.characterCount || 0}`} size="small" color="secondary" />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Typography color="text.secondary">Configure settings and generate variations</Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BatchGallery;
