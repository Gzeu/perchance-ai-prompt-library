import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import {
  Palette,
  PlayArrow,
  ContentCopy,
} from '@mui/icons-material';
import { promptApi } from '../services/api';

const StyleMixer = () => {
  const [allStyles, setAllStyles] = useState([]);
  const [formData, setFormData] = useState({
    styles: [],
    subject: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await promptApi.getStyles();
        setAllStyles(response.data.data || []);
      } catch (err) {
        setError('Failed to load styles');
      }
    };
    fetchStyles();
  }, []);

  const handleMix = async () => {
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (formData.styles.length < 2) {
      setError('Please select at least 2 styles to mix');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await promptApi.mixStyles(formData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mix styles');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🎨 Style Mixer
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mix Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Combine multiple art styles to create unique prompts
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Styles to Mix</InputLabel>
                    <Select
                      multiple
                      value={formData.styles}
                      onChange={(e) => setFormData({ ...formData, styles: e.target.value })}
                      input={<OutlinedInput label="Select Styles to Mix" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const style = allStyles.find(s => s.key === value);
                            return (
                              <Chip 
                                key={value} 
                                label={style?.name || value} 
                                size="small" 
                                color="primary"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {allStyles.map((style) => (
                        <MenuItem key={style.key} value={style.key}>
                          {style.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., dragon rider, cyberpunk detective"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleMix}
                    disabled={loading || formData.styles.length < 2}
                    startIcon={loading ? <CircularProgress size={20} /> : <Palette />}
                    size="large"
                  >
                    {loading ? 'Mixing Styles...' : 'Mix Styles'}
                  </Button>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Selected Styles Preview */}
              {formData.styles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Styles:
                  </Typography>
                  <Grid container spacing={1}>
                    {formData.styles.map(styleKey => {
                      const style = allStyles.find(s => s.key === styleKey);
                      return style ? (
                        <Grid item xs={12} key={styleKey}>
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {style.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {style.description}
                            </Typography>
                          </Paper>
                        </Grid>
                      ) : null;
                    })}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Mixed Style Result
                </Typography>
                {result && (
                  <Button
                    size="small"
                    onClick={() => copyToClipboard(result.text)}
                    startIcon={<ContentCopy />}
                  >
                    Copy
                  </Button>
                )}
              </Box>

              {result ? (
                <Box>
                  <Paper sx={{ p: 2, mb: 2, maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {result.text}
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={`Mixed Styles: ${result.mixedStyles?.join(' + ') || 'Unknown'}`} 
                      color="primary" 
                      size="small" 
                    />
                    <Chip 
                      label={`Subject: ${result.subject || 'Unknown'}`} 
                      color="secondary" 
                      size="small" 
                    />
                  </Box>

                  {result.negativePrompt && (
                    <Paper sx={{ p: 2, bgcolor: 'rgba(255,0,0,0.1)' }}>
                      <Typography variant="subtitle2" gutterBottom color="error">
                        🚫 Negative Prompt:
                      </Typography>
                      <Typography variant="body2">
                        {result.negativePrompt}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="body1" color="text.secondary">
                    Select at least 2 styles and a subject, then click "Mix Styles" to see the result
                  </Typography>
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
