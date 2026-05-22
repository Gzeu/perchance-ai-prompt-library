import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Chip, Button,
  TextField, InputAdornment, IconButton, Tooltip,
} from '@mui/material';
import { Search, Delete, ContentCopy, DeleteSweep, Download } from '@mui/icons-material';
import { useFavorites } from '../hooks/useFavorites';

const FavoritesPage = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const [search, setSearch] = useState('');

  const filtered = favorites.filter(f =>
    !search || f.text?.toLowerCase().includes(search.toLowerCase()) || f.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const downloadFavorites = () => {
    const content = filtered.map(f => f.text).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>⭐ Favorites</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadFavorites} disabled={filtered.length === 0}>
            Export
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearFavorites} disabled={favorites.length === 0}>
            Clear All
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search in favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />
        </CardContent>
      </Card>

      {favorites.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No favorites yet</Typography>
          <Typography variant="body2" color="text.secondary">Star prompts from the Generator or History to save them here</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {item.style && <Chip label={item.style} size="small" color="primary" />}
                    {item.subject && <Chip label={item.subject} size="small" color="secondary" />}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => copyToClipboard(item.text)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove from favorites">
                      <IconButton size="small" color="error" onClick={() => removeFavorite(item.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}>
                  {item.text?.length > 300 ? item.text.slice(0, 300) + '...' : item.text}
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.5 }}>
                  Saved {new Date(item.savedAt).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FavoritesPage;
