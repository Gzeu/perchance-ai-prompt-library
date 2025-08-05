import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  Palette,
  Api,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { promptApi } from '../services/api';

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Failed to connect to API. Make sure the server is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🎨 Perchance AI Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* API Status */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {health?.status === 'healthy' ? (
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                ) : (
                  <Error color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6">API Status</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {health?.status || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version: {health?.version || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Styles */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Art Styles</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {styles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available styles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Features</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {health?.features?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active features
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Performance</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                &lt;50ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. response time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Styles Grid */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Art Styles
              </Typography>
              <Grid container spacing={2}>
                {styles.map((style) => (
                  <Grid item xs={12} sm={6} md={4} key={style.key}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {style.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {style.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`${style.variableCount} variables`} 
                            size="small" 
                            color="primary" 
                          />
                          {style.hasExamples && (
                            <Chip 
                              label="Examples" 
                              size="small" 
                              color="success" 
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" color="primary" href="/generator">
                  Generate Prompt
                </Button>
                <Button variant="contained" color="secondary" href="/batch">
                  Batch Generation
                </Button>
                <Button variant="contained" color="info" href="/mixer">
                  Mix Styles
                </Button>
                <Button variant="outlined" href="/api">
                  Explore API
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
