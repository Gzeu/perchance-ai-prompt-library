import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  Api,
  CheckCircle,
  Speed,
} from '@mui/icons-material';
import Highlight from 'react-highlight';
import { promptApi } from '../services/api';

const ApiExplorer = () => {
  const [health, setHealth] = useState(null);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      description: 'Check API server status',
      example: {
        response: health || { status: 'healthy', version: '2.0.0' }
      }
    },
    {
      method: 'GET',
      path: '/api/styles',
      description: 'List all available art styles',
      example: {
        response: { success: true, data: styles.slice(0, 2) }
      }
    },
    {
      method: 'POST',
      path: '/api/prompts/generate',
      description: 'Generate a single prompt',
      example: {
        request: {
          style: 'anime',
          subject: 'space warrior',
          age: '22',
          clothing: 'futuristic armor'
        },
        response: {
          success: true,
          data: {
            text: 'Beautiful soft anime style, space warrior, a stunning 22 year old anime woman...',
            style: 'anime',
            metadata: { wordCount: 65, characterCount: 475 }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/prompts/batch',
      description: 'Generate multiple variations',
      example: {
        request: {
          style: 'cinematic',
          subject: 'detective',
          count: 3
        },
        response: {
          success: true,
          data: {
            results: [
              { text: 'Variation 1...', variationNumber: 1 },
              { text: 'Variation 2...', variationNumber: 2 },
              { text: 'Variation 3...', variationNumber: 3 }
            ]
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/prompts/mix',
      description: 'Mix multiple art styles',
      example: {
        request: {
          styles: ['anime', 'cinematic'],
          subject: 'dragon rider'
        },
        response: {
          success: true,
          data: {
            text: 'Mixed style prompt...',
            mixedStyles: ['anime', 'cinematic'],
            subject: 'dragon rider'
          }
        }
      }
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🌐 API Explorer
      </Typography>

      {/* API Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">API Status</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {health?.status || 'Loading...'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version: {health?.version || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Api color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Endpoints</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {endpoints.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available endpoints
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Endpoints Documentation */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Endpoints
          </Typography>
          
          {endpoints.map((endpoint, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={endpoint.method} 
                    color={endpoint.method === 'GET' ? 'primary' : 'secondary'}
                    size="small"
                  />
                  <Typography variant="body1" fontFamily="monospace">
                    {endpoint.path}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {endpoint.description}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {endpoint.example.request && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Request Example:
                      </Typography>
                      <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.3)' }}>
                        <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                          {JSON.stringify(endpoint.example.request, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}
                  <Grid item xs={12} md={endpoint.example.request ? 6 : 12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Response Example:
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.3)' }}>
                      <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                        {JSON.stringify(endpoint.example.response, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Usage Instructions
          </Typography>
          
          <Typography variant="body2" paragraph>
            The API server runs on <code>http://localhost:3000</code> and provides RESTful endpoints for prompt generation.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Make sure the API server is running with <code>npm run api</code> before using these endpoints.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>
            Example cURL commands:
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)' }}>
            <pre style={{ margin: 0, fontSize: '0.8rem' }}>
{`# Health check
curl http://localhost:3000/api/health

# Generate prompt
curl -X POST http://localhost:3000/api/prompts/generate \\
  -H "Content-Type: application/json" \\
  -d '{"style":"anime","subject":"warrior"}'

# Batch generation
curl -X POST http://localhost:3000/api/prompts/batch \\
  -H "Content-Type: application/json" \\
  -d '{"style":"cinematic","subject":"detective","count":3}'`}
            </pre>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiExplorer;
