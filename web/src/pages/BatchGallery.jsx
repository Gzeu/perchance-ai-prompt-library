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
  Slider,
} from '@mui/material';
import {
  ContentCopy,
  Download,
  ViewModule,
  PlayArrow,
} from '@mui/icons-material';
import { promptApi } from '../services/api';

const BatchGallery = () => {
  const [styles, setStyles] = useState([]);
  const [formData, setFormData] = useState({
    style: 'anime',
    subject: '',
    count: 3,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // Pentru debugging

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await promptApi.getStyles();
        setStyles(response.data.data || []);
      } catch (err) {
        setError('Failed to load styles: ' + err.message);
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
    setDebugInfo(null);

    try {
      console.log('🔄 Sending batch request:', formData);
      
      const response = await promptApi.generateBatch(formData);
      console.log('✅ Batch response received:', response);
      
      setDebugInfo({
        request: formData,
        response: response.data
      });

      // Improved response parsing
      if (response.data && response.data.success) {
        const batchData = response.data.data;
        
        if (batchData && batchData.results && Array.isArray(batchData.results)) {
          setResults(batchData.results);
          console.log('✅ Results set:', batchData.results.length);
        } else {
          // Fallback pentru diferite structuri de răspuns
          if (Array.isArray(response.data.data)) {
            setResults(response.data.data);
          } else {
            setError('Invalid response structure: missing results array');
            console.error('Response structure:', response.data);
          }
        }
      } else {
        setError('API returned unsuccessful response');
        console.error('API Error:', response.data);
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate batch';
      setError(errorMessage);
      console.error('❌ Batch generation error:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBatch = () => {
    if (results.length === 0) return;
    
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_prompts_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🔄 Batch Gallery
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Batch Configuration
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
                    placeholder="e.g., magical sorceress, space warrior"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Number of Variations: {formData.count}
                  </Typography>
                  <Slider
                    value={formData.count}
                    onChange={(e, value) => setFormData({ ...formData, count: value })}
                    min={1}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={handleGenerate}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <ViewModule />}
                    size="large"
                  >
                    {loading ? 'Generating...' : `Generate ${formData.count} Variations`}
                  </Button>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold">Error:</Typography>
                  {error}
                </Alert>
              )}
              {results.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={downloadBatch}
                    startIcon={<Download />}
                  >
                    Download All as JSON
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Gallery */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generated Variations ({results.length})
              </Typography>

              {results.length > 0 ? (
                <Grid container spacing={2}>
                  {results.map((result, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Variation {result.variationNumber || index + 1}
                          </Typography>
                          <Tooltip title="Copy to clipboard">
                            <IconButton size="small" onClick={() => copyToClipboard(result.text)}>
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, maxHeight: 100, overflow: 'auto' }}>
                          {result.text || 'No text available'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={`Words: ${result.metadata?.wordCount || 0}`} 
                            size="small" 
                            color="primary" 
                          />
                          <Chip 
                            label={`Chars: ${result.metadata?.characterCount || 0}`} 
                            size="small" 
                            color="secondary" 
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="body1" color="text.secondary">
                    Configure settings and click "Generate Variations" to see batch results here
                  </Typography>
                  {debugInfo && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Request sent but no results received. Check debug info above.
                    </Typography>
                  )}
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
