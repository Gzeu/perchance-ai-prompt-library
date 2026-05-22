import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Chip, Button,
  TextField, InputAdornment, IconButton, Tooltip, Alert, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Search, Delete, ContentCopy, Star, Download, DeleteSweep } from '@mui/icons-material';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';

const HistoryPage = () => {
  const { history, clearHistory, removeFromHistory } = useHistory();
  const { addFavorite, isFavorite } = useFavorites();
  const [search, setSearch] = useState('');
  const [styleFilter, setStyleFilter] = useState('all');

  const styles = [...new Set(history.map(h => h.style).filter(Boolean))];

  const filtered = history.filter(h => {
    const matchSearch = !search || h.text?.toLowerCase().includes(search.toLowerCase()) || h.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStyle = styleFilter === 'all' || h.style === styleFilter;
    return matchSearch && matchStyle;
  });

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const downloadHistory = () => {
    const content = filtered.map(h => h.text).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>📜 History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadHistory} disabled={filtered.length === 0}>
            Export
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearHistory} disabled={history.length === 0}>
            Clear All
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search in history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Style</InputLabel>
                <Select value={styleFilter} label="Filter by Style" onChange={(e) => setStyleFilter(e.target.value)}>
                  <MenuItem value="all">All Styles</MenuItem>
                  {styles.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography color="text.secondary">{filtered.length} / {history.length} entries</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {history.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No history yet</Typography>
          <Typography variant="body2" color="text.faint">Generate prompts to see them here</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {item.style && <Chip label={item.style} size="small" color="primary" />}
                    {item.subject && <Chip label={item.subject} size="small" color="secondary" />}
                    {item.type && <Chip label={item.type} size="small" variant="outlined" />}
                    <Chip label={new Date(item.timestamp).toLocaleString()} size="small" sx={{ opacity: 0.6 }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => copyToClipboard(item.text)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isFavorite(item.text) ? 'Already in favorites' : 'Save to favorites'}>
                      <IconButton size="small" onClick={() => addFavorite(item)} color={isFavorite(item.text) ? 'warning' : 'default'}>
                        <Star fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" color="error" onClick={() => removeFromHistory(item.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxHeight: 80, overflow: 'auto', color: 'text.secondary' }}>
                  {item.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HistoryPage;
