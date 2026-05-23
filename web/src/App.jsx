import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PromptGenerator from './pages/PromptGenerator';
import BatchGallery from './pages/BatchGallery';
import StyleMixer from './pages/StyleMixer';
import ApiExplorer from './pages/ApiExplorer';
import HistoryPage from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PerchanceStudio from './pages/PerchanceStudio';
import AgenticStudio from './pages/AgenticStudio';
import PackBuilder from './pages/PackBuilder';
import PackViewPage from './pages/PackViewPage';
import TemplateLibrary from './pages/TemplateLibrary';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00bcd4' },
    secondary: { main: '#ff4081' },
    background: { default: '#0a0a0a', paper: '#111' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.06)' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/generator" element={<PromptGenerator />} />
              <Route path="/batch" element={<BatchGallery />} />
              <Route path="/mixer" element={<StyleMixer />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/api" element={<ApiExplorer />} />
              <Route path="/studio" element={<PerchanceStudio />} />
              <Route path="/agentic" element={<AgenticStudio />} />
              <Route path="/pack" element={<PackBuilder />} />
              <Route path="/pack/:id" element={<PackViewPage />} />
              <Route path="/templates" element={<TemplateLibrary />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
