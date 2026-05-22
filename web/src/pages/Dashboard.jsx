import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, LinearProgress,
  Button, Alert, Paper, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { TrendingUp, Speed, Palette, CheckCircle, Error, History, Star } from '@mui/icons-material';
import { promptApi } from '../services/api';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, sub, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color, mr: 1 }}>{icon}</Box>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, color }}>{value}</Typography>
      {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { history } = useHistory();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, stylesRes] = await Promise.all([
          promptApi.getHealth(),
          promptApi.getStyles(),
        ]);
        setHealth(healthRes.data);
        setStyles(stylesRes.data.data || []);
      } catch (err) {
        setError('Failed to connect to API. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LinearProgress />;

  const recentHistory = history.slice(0, 5);
  const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🎨 Perchance AI Dashboard
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="API Status"
            value={health?.status === 'healthy' ? '✅' : '❌'}
            sub={`v${health?.version || 'N/A'}`}
            icon={health?.status === 'healthy' ? <CheckCircle /> : <Error />}
            color={health?.status === 'healthy' ? '#4caf50' : '#f44336'}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Art Styles" value={styles.length} sub="Available styles" icon={<Palette />} color="#00bcd4" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Generated" value={history.length} sub={`${todayCount} today`} icon={<TrendingUp />} color="#ff4081" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Favorites" value={favorites.length} sub="Saved prompts" icon={<Star />} color="#ff9800" />
        </Grid>

        {recentHistory.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent History</Typography>
                  <Button size="small" onClick={() => navigate('/history')} startIcon={<History />}>View All</Button>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Prompt</TableCell>
                      <TableCell>Style</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentHistory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ maxWidth: 400 }}>
                          <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {item.text}
                          </Typography>
                        </TableCell>
                        <TableCell><Chip label={item.style || '—'} size="small" color="primary" /></TableCell>
                        <TableCell><Chip label={item.type || 'single'} size="small" variant="outlined" /></TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Available Art Styles</Typography>
              <Grid container spacing={1}>
                {styles.map((style) => (
                  <Grid item xs={12} sm={6} md={4} key={style.key}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2">{style.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{style.description}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button fullWidth variant="contained" color="primary" onClick={() => navigate('/generator')}>🎯 Generate Prompt</Button>
                <Button fullWidth variant="contained" color="secondary" onClick={() => navigate('/batch')}>🔄 Batch Generation</Button>
                <Button fullWidth variant="contained" sx={{ bgcolor: '#7c4dff' }} onClick={() => navigate('/mixer')}>🎨 Mix Styles</Button>
                <Button fullWidth variant="outlined" onClick={() => navigate('/history')}>📜 View History</Button>
                <Button fullWidth variant="outlined" onClick={() => navigate('/analytics')}>📊 Analytics</Button>
                <Button fullWidth variant="outlined" color="inherit" onClick={() => navigate('/api')}>🔌 API Explorer</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
