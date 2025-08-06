import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Slider, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Palette as StyleIcon,
  Tune as TuneIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '512px',
  objectFit: 'contain',
  borderRadius: '8px',
  border: '1px solid #ddd',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
  backgroundColor: 'rgba(0,0,0,0.02)',
  borderRadius: '8px',
  border: '2px dashed #ddd',
});

// Style presets
const STYLE_PRESETS = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'anime', label: 'Anime' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'pixel-art', label: 'Pixel Art' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'steampunk', label: 'Steampunk' },
  { value: 'surreal', label: 'Surreal' },
];

const ImageGenerator = ({ initialPrompt = '' }) => {
  // State
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(50);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Construct the full prompt with style
      const fullPrompt = `${prompt}, ${style} style, high quality, detailed`;
      
      // Call the API
      const response = await axios.post('/api/images/generate', {
        prompt: fullPrompt,
        negative_prompt: negativePrompt,
        width,
        height,
        steps,
        guidance_scale: guidanceScale,
        seed: seed === -1 ? Math.floor(Math.random() * 1000000) : seed
      }, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/*'
        }
      });
      
      // Convert the response to a data URL
      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      
      setGeneratedImage({
        url: imageUrl,
        prompt: fullPrompt,
        timestamp: new Date().toISOString(),
        settings: { width, height, steps, guidanceScale, seed }
      });
      
      showSnackbar('Image generated successfully!', 'success');
      
    } catch (err) {
      console.error('Error generating image:', err);
      const errorMessage = err.response?.data?.message || 'Failed to generate image';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle downloading the generated image
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `generated-image-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSnackbar('Image downloaded!', 'success');
  };

  // Handle copying the prompt to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Copied to clipboard!', 'success');
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle random seed
  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  // Handle style preset change
  const handleStyleChange = (event) => {
    setStyle(event.target.value);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <StyledPaper elevation={3}>
          <Grid container spacing={3}>
            {/* Left column - Inputs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                <AutoAwesomeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Generate Image
              </Typography>
              
              <TextField
                fullWidth
                label="Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                variant="outlined"
                required
                placeholder="Describe the image you want to generate..."
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Style</InputLabel>
                <Select
                  value={style}
                  onChange={handleStyleChange}
                  label="Style"
                  startAdornment={<StyleIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  {STYLE_PRESETS.map((preset) => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ImageIcon />}
                  disabled={isGenerating}
                  fullWidth
                >
                  {isGenerating ? 'Generating...' : 'Generate Image'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  startIcon={<TuneIcon />}
                >
                  {showAdvanced ? 'Hide' : 'Advanced'}
                </Button>
              </Box>
              
              {showAdvanced && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Advanced Settings
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Negative Prompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Things you don't want in the image..."
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Width: {width}px</Typography>
                    <Slider
                      value={width}
                      onChange={(e, value) => setWidth(value)}
                      min={256}
                      max={1024}
                      step={64}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Height: {height}px</Typography>
                    <Slider
                      value={height}
                      onChange={(e, value) => setHeight(value)}
                      min={256}
                      max={1024}
                      step={64}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Steps: {steps}</Typography>
                    <Slider
                      value={steps}
                      onChange={(e, value) => setSteps(value)}
                      min={10}
                      max={150}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom>Guidance Scale: {guidanceScale}</Typography>
                      <Slider
                        value={guidanceScale}
                        onChange={(e, value) => setGuidanceScale(value)}
                        min={1}
                        max={20}
                        step={0.5}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    
                    <Box sx={{ minWidth: 120 }}>
                      <TextField
                        label="Seed"
                        type="number"
                        value={seed === -1 ? '' : seed}
                        onChange={(e) => setSeed(e.target.value === '' ? -1 : parseInt(e.target.value))}
                        margin="normal"
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <Tooltip title="Randomize">
                              <IconButton onClick={handleRandomizeSeed} size="small">
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
              
              {error && (
                <Box mt={2} color="error.main">
                  <Typography variant="body2">{error}</Typography>
                </Box>
              )}
            </Grid>
            
            {/* Right column - Preview */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              
              {isGenerating ? (
                <LoadingContainer>
                  <Box textAlign="center">
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Generating your image...
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      This may take a moment
                    </Typography>
                  </Box>
                </LoadingContainer>
              ) : generatedImage ? (
                <Box>
                  <PreviewImage 
                    src={generatedImage.url} 
                    alt="Generated content" 
                    ref={canvasRef}
                  />
                  
                  <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      size="small"
                    >
                      Download
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ContentCopy />}
                      onClick={() => copyToClipboard(generatedImage.prompt)}
                      size="small"
                    >
                      Copy Prompt
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                      size="small"
                    >
                      New Variation
                    </Button>
                  </Box>
                  
                  <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Generation Details
                    </Typography>
                    <Typography variant="caption" component="div" color="textSecondary">
                      <div>Style: {style}</div>
                      <div>Size: {width} × {height}px</div>
                      <div>Steps: {steps}</div>
                      <div>Guidance: {guidanceScale}</div>
                      <div>Seed: {seed === -1 ? 'random' : seed}</div>
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <LoadingContainer>
                  <Box textAlign="center" color="text.secondary">
                    <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body1">
                      Your generated image will appear here
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Enter a prompt and click "Generate Image"
                    </Typography>
                  </Box>
                </LoadingContainer>
              )}
            </Grid>
          </Grid>
        </StyledPaper>
      </form>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageGenerator;
