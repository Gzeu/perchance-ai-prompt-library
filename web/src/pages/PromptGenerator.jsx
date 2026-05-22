import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Card, CardContent, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Box, Paper, Chip, Alert, CircularProgress,
  IconButton, Tooltip, Tabs, Tab, AppBar, Divider, Autocomplete,
} from '@mui/material';
import {
  ContentCopy, Download, PlayArrow, Image as ImageIcon, TextFields, Star, StarBorder,
} from '@mui/icons-material';
import { promptApi } from '../services/api';
import ImageGenerator from '../components/ImageGenerator';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';

const PromptGenerator = () => {
  const [styles, setStyles] = useState([]);
  const [artists, setArtists] = useState([]);
  const [themes, setThemes] = useState([]);
  const [formData, setFormData] = useState({ style: '', subject: '', age: '', gender: '', clothing: '', setting: '', artist: '', theme: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addToHistory } = useHistory();
  const { addFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const load = async () => {
      try {
        const [stylesRes, artistsData, themesData] = await Promise.all([
          promptApi.getStyles(),
          promptApi.getArtists(),
          promptApi.getThemes(),
        ]);
        const loadedStyles = stylesRes.data.data || [];
        setStyles(loadedStyles);
        if (loadedStyles.length > 0) setFormData(prev => ({ ...prev, style: loadedStyles[0].key }));
        const allArtists = Array.isArray(artistsData) ? artistsData : Object.values(artistsData).flat();
        setArtists(allArtists.map(a => typeof a === 'string' ? a : a.name).filter(Boolean));
        const allThemes = Array.isArray(themesData) ? themesData : Object.values(themesData).flat();
        setThemes(allThemes.map(t => typeof t === 'string' ? t : t.name || t).filter(Boolean));
      } catch (err) {
        setError('Failed to load configuration');
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const generatePrompt = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (!data.subject) throw new Error('Subject is required');
      if (!data.style) throw new Error('Please select a style');
      const apiData = {
        style: data.style,
        subject: data.subject,
        ...(data.age && { age: data.age }),
        ...(data.gender && { gender: data.gender }),
        ...(data.clothing && { clothing: data.clothing }),
        ...(data.setting && { setting: data.setting }),
        ...(data.artist && { artist: data.artist }),
        ...(data.theme && { theme: data.theme }),
      };
      const response = await promptApi.generate(apiData);
      if (!response.data?.data) throw new Error('Invalid response from server');
      const r = response.data.data;
      setResult(r);
      addToHistory({ text: r.text, style: data.style, subject: data.subject, type: 'single', negativePrompt: r.negativePrompt });
      return r.text;
    } catch (err) {
      setError(err.message || 'Failed to generate prompt');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await generatePrompt(formData); } catch {}
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = () => {
    if (result) addFavorite({ text: result.text, style: formData.style, subject: formData.subject });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>🎯 AI Prompt & Image Generator</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Configuration</Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Art Style</InputLabel>
                      <Select name="style" value={formData.style} onChange={handleChange} label="Art Style" disabled={loading}>
                        {styles.map(s => <MenuItem key={s.key} value={s.key}>{s.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Subject *" value={formData.subject} onChange={handleChange} name="subject" placeholder="e.g., magical sorceress, space warrior" required />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Age" value={formData.age} onChange={handleChange} name="age" placeholder="e.g., 22" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Gender" value={formData.gender} onChange={handleChange} name="gender" placeholder="e.g., woman" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Clothing" value={formData.clothing} onChange={handleChange} name="clothing" placeholder="e.g., flowing robes" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Setting" value={formData.setting} onChange={handleChange} name="setting" placeholder="e.g., magical forest" />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      options={artists}
                      value={formData.artist}
                      onInputChange={(_, val) => setFormData(prev => ({ ...prev, artist: val }))}
                      renderInput={(params) => <TextField {...params} label="Artist (optional)" placeholder="e.g., Greg Rutkowski" />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      options={themes}
                      value={formData.theme}
                      onInputChange={(_, val) => setFormData(prev => ({ ...prev, theme: val }))}
                      renderInput={(params) => <TextField {...params} label="Theme (optional)" placeholder="e.g., dark fantasy" />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />} size="large">
                      {loading ? 'Generating...' : 'Generate Prompt'}
                    </Button>
                  </Grid>
                </Grid>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <AppBar position="static" color="default" elevation={1}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} indicatorColor="primary" textColor="primary" variant="fullWidth">
                  <Tab label="Text Prompt" icon={<TextFields />} iconPosition="start" />
                  <Tab label="Generate Image" icon={<ImageIcon />} iconPosition="start" />
                </Tabs>
              </AppBar>

              <Box sx={{ p: 2 }}>
                {activeTab === 0 ? (
                  result ? (
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Generated Prompt</Typography>
                          <Box>
                            <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                              <IconButton size="small" onClick={() => copyToClipboard(result.text)} color={copied ? 'success' : 'default'}>
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={isFavorite(result.text) ? 'In favorites' : 'Add to favorites'}>
                              <IconButton size="small" onClick={handleFavorite} color={isFavorite(result.text) ? 'warning' : 'default'}>
                                {isFavorite(result.text) ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {result.text}
                          </Typography>
                        </Paper>
                        {result.negativePrompt && (
                          <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(255,0,0,0.08)' }}>
                            <Typography variant="subtitle2" gutterBottom color="error">🚫 Negative Prompt:</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{result.negativePrompt}</Typography>
                          </Paper>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={`Style: ${result.style || formData.style}`} color="primary" size="small" />
                          <Chip label={`Words: ${result.metadata?.wordCount || 0}`} color="secondary" size="small" />
                          <Chip label={`Chars: ${result.metadata?.characterCount || 0}`} color="info" size="small" />
                          {formData.artist && <Chip label={`Artist: ${formData.artist}`} size="small" variant="outlined" />}
                          {formData.theme && <Chip label={`Theme: ${formData.theme}`} size="small" variant="outlined" />}
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <Typography color="text.secondary">Fill in the form and click Generate Prompt</Typography>
                    </Paper>
                  )
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {result?.text ? (
                      <ImageGenerator prompt={result.text} width={768} height={512} model="stable-diffusion-xl" />
                    ) : (
                      <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <Typography color="text.secondary">Generate a text prompt first, then come here to create an image</Typography>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PromptGenerator;
