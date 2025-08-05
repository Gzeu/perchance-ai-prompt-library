import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy,
  Download,
  Refresh,
  PlayArrow,
} from '@mui/icons-material';
import Highlight from 'react-highlight';
import { promptApi } from '../services/api';

const PromptGenerator = () => {
  const [styles, setStyles] = useState([]);
  const [formData, setFormData] = useState({
    style: 'anime',
    subject: '',
    age: '',
    gender: '',
    clothing: '',
    setting: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await promptApi.getStyles();
        setStyles(response.data.data || []);
      } catch (err) {
        setError('Failed to load styles');
      }
    };
    fetchStyles();
  }, []);

  const handleGenerate = async () => {
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await promptApi.generate(formData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate prompt');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPrompt = () => {
    if (!result) return;
    
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🎯 Prompt Generator
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Configuration
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Art Style</InputLabel>
                    <Select
                      value={formData.style}
                      label="Art Style"
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    >
                      {styles.map((style) => (
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
                    placeholder="e.g., magical sorceress, space warrior, ancient wizard"
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Age (optional)"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g., 22, teenager"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Gender (optional)"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    placeholder="e.g., woman, man, person"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clothing (optional)"
                    value={formData.clothing}
                    onChange={(e) => setFormData({ ...formData, clothing: e.target.value })}
                    placeholder="e.g., flowing robes, armor, casual outfit"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Setting (optional)"
                    value={formData.setting}
                    onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                    placeholder="e.g., magical forest, cyberpunk city, ancient temple"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleGenerate}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                    size="large"
                  >
                    {loading ? 'Generating...' : 'Generate Prompt'}
                  </Button>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
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
                  Generated Prompt
                </Typography>
                {result && (
                  <Box>
                    <Tooltip title="Copy to clipboard">
                      <IconButton onClick={() => copyToClipboard(result.text)}>
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download JSON">
                      <IconButton onClick={downloadPrompt}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {result ? (
                <Box>
                  <Paper sx={{ p: 2, mb: 2, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {result.text}
                    </Typography>
                  </Paper>

                  {result.negativePrompt && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,0,0,0.1)' }}>
                      <Typography variant="subtitle2" gutterBottom color="error">
                        🚫 Negative Prompt:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {result.negativePrompt}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Style: ${result.style}`} 
                      color="primary" 
                      size="small" 
                    />
                    <Chip 
                      label={`Words: ${result.metadata?.wordCount || 0}`} 
                      color="secondary" 
                      size="small" 
                    />
                    <Chip 
                      label={`Characters: ${result.metadata?.characterCount || 0}`} 
                      color="info" 
                      size="small" 
                    />
                  </Box>
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="body1" color="text.secondary">
                    Enter a subject and click "Generate Prompt" to see results here
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

export default PromptGenerator;
