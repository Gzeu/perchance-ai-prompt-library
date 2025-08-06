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
    style: '0', // Default to first style key from API
    subject: '',
    age: '',
    gender: '',
    clothing: '',
    setting: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset error when user makes changes
    if (error) {
      setError(null);
    }
  };

  // Get the current style name for display
  const getCurrentStyleName = () => {
    const style = styles.find(s => s.key === formData.style);
    return style ? style.name : 'Unknown Style';
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure we're sending the correct data format expected by the API
      const apiData = {
        style: formData.style, // Already using the correct key from the API
        subject: formData.subject,
        // Only include additional fields if they have values
        ...(formData.age && { age: formData.age }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.clothing && { clothing: formData.clothing }),
        ...(formData.setting && { setting: formData.setting }),
      };
      
      const response = await promptApi.generate(apiData);
      setResult(response.data);
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError(err.response?.data?.error || 'Failed to generate prompt. Please try again.');
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
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="style-label">Art Style</InputLabel>
                    <Select
                      labelId="style-label"
                      id="style"
                      name="style"
                      value={formData.style}
                      onChange={handleChange}
                      label="Art Style"
                      disabled={loading || styles.length === 0}
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
                    onChange={handleChange}
                    name="subject"
                    placeholder="e.g., magical sorceress, space warrior, ancient wizard"
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Age (optional)"
                    value={formData.age}
                    onChange={handleChange}
                    name="age"
                    placeholder="e.g., 22, teenager"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Gender (optional)"
                    value={formData.gender}
                    onChange={handleChange}
                    name="gender"
                    placeholder="e.g., woman, man, person"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clothing (optional)"
                    value={formData.clothing}
                    onChange={handleChange}
                    name="clothing"
                    placeholder="e.g., flowing robes, armor, casual outfit"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Setting (optional)"
                    value={formData.setting}
                    onChange={handleChange}
                    name="setting"
                    placeholder="e.g., magical forest, cyberpunk city, ancient temple"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                    size="large"
                  >
                    {loading ? 'Generating...' : 'Generate Prompt'}
                  </Button>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {error}
                </Alert>
              )}
              {styles.length === 0 && !loading && !error && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  No styles available. Please check if the API server is running.
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
