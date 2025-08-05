import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Home,
  Create,
  ViewModule,
  Palette,
  Api,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Home /> },
    { label: 'Generator', path: '/generator', icon: <Create /> },
    { label: 'Batch Gallery', path: '/batch', icon: <ViewModule /> },
    { label: 'Style Mixer', path: '/mixer', icon: <Palette /> },
    { label: 'API Explorer', path: '/api', icon: <Api /> },
  ];

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #00bcd4, #ff4081)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          🎨 Perchance AI Prompt Library v2.0
        </Typography>
        <Chip 
          label="WEB INTERFACE" 
          size="small" 
          sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              startIcon={item.icon}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{ 
                color: 'white',
                borderColor: location.pathname === item.path ? 'rgba(255,255,255,0.5)' : 'transparent'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
