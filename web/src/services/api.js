import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const promptApi = {
  // Health check
  getHealth: () => api.get('/health'),
  
  // Styles
  getStyles: () => api.get('/styles'),
  
  // Generate single prompt
  generate: (data) => api.post('/prompts/generate', data),
  
  // Generate batch
  generateBatch: (data) => api.post('/prompts/batch', data),
  
  // Mix styles
  mixStyles: (data) => api.post('/prompts/mix', data),
};

export default promptApi;
