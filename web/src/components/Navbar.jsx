import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip, useMediaQuery, useTheme, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Create, ViewModule, Palette, Api, History, Star, BarChart, Menu } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { promptApi } from '../services/api';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <Home /> },
  { label: 'Generator', path: '/generator', icon: <Create /> },
  { label: 'Batch', path: '/batch', icon: <ViewModule /> },
  { label: 'Mixer', path: '/mixer', icon: <Palette /> },
  { label: 'History', path: '/history', icon: <History /> },
  { label: 'Favorites', path: '/favorites', icon: <Star /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart /> },
  { label: 'API', path: '/api', icon: <Api /> },
];

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    promptApi.getHealth().then(res => setApiStatus(res.data?.status === 'healthy')).catch(() => setApiStatus(false));
  }, []);

  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)', borderBottom: '1px solid rgba(0,188,212,0.2)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: isMobile ? 1 : 0, fontWeight: 700, mr: 3, background: 'linear-gradient(90deg, #00bcd4, #ff4081)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎨 Perchance AI
          </Typography>

          {apiStatus !== null && (
            <Chip
              label={apiStatus ? '● API Online' : '● API Offline'}
              size="small"
              sx={{ mr: 2, bgcolor: apiStatus ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)', color: apiStatus ? '#4caf50' : '#f44336', border: `1px solid ${apiStatus ? '#4caf50' : '#f44336'}40`, display: { xs: 'none', md: 'flex' } }}
            />
          )}

          {isMobile ? (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}><Menu /></IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {navItems.map(item => (
                <Button key={item.path} color="inherit" component={Link} to={item.path}
                  startIcon={item.icon}
                  size="small"
                  variant={location.pathname === item.path ? 'outlined' : 'text'}
                  sx={{ color: location.pathname === item.path ? '#00bcd4' : 'rgba(255,255,255,0.7)', borderColor: '#00bcd4', fontSize: '0.75rem', minWidth: 0, px: 1 }}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 1, fontWeight: 700 }}>🎨 Perchance AI</Typography>
          <List>
            {navItems.map(item => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path} onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
