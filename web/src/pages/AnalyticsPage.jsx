import React, { useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Chip,
} from '@mui/material';
import { TrendingUp, Palette, History, Star } from '@mui/icons-material';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color, mr: 1 }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, color }}>{value}</Typography>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const { history } = useHistory();
  const { favorites } = useFavorites();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const styleBreakdown = history.reduce((acc, h) => {
    if (h.style) acc[h.style] = (acc[h.style] || 0) + 1;
    return acc;
  }, {});

  const typeBreakdown = history.reduce((acc, h) => {
    const t = h.type || 'single';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const dailyCounts = last7Days.map(label => {
    const date = new Date(label + ', ' + new Date().getFullYear());
    return history.filter(h => {
      const hDate = new Date(h.timestamp);
      return hDate.toDateString() === date.toDateString();
    }).length;
  });

  useEffect(() => {
    if (!chartRef.current || history.length === 0) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: last7Days,
          datasets: [{
            label: 'Prompts Generated',
            data: dailyCounts,
            backgroundColor: 'rgba(0,188,212,0.6)',
            borderColor: '#00bcd4',
            borderWidth: 2,
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#ccc' } } },
          scales: {
            x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#aaa', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
          },
        },
      });
    };
    document.head.appendChild(script);
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [history.length]);

  const topStyles = Object.entries(styleBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>📊 Analytics</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Generated" value={history.length} icon={<TrendingUp />} color="#00bcd4" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Favorites Saved" value={favorites.length} icon={<Star />} color="#ff9800" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Styles Used" value={Object.keys(styleBreakdown).length} icon={<Palette />} color="#ff4081" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Today" value={history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length} icon={<History />} color="#4caf50" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Activity — Last 7 Days</Typography>
              {history.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No data yet. Generate some prompts first.</Typography>
                </Paper>
              ) : (
                <canvas ref={chartRef} style={{ maxHeight: 280 }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Styles</Typography>
              {topStyles.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No data yet</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topStyles.map(([style, count]) => (
                    <Box key={style} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={style} size="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">{count}×</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Type Breakdown</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(typeBreakdown).map(([type, count]) => (
                  <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{type}</Typography>
                    <Chip label={count} size="small" variant="outlined" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
