import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    const status = error.response.status;
    let message = error.response.data?.error || error.response.data?.message || 'An error occurred';
    if (status === 400) message = error.response.data?.error || 'Invalid request';
    else if (status === 404) message = 'Resource not found';
    else if (status >= 500) message = 'Server error. Please try again later.';
    throw new Error(message);
  }
);

export const promptApi = {
  getHealth: () => api.get('/health'),

  getStyles: async () => {
    try {
      const res = await api.get('/styles');
      if (!res.data || !Array.isArray(res.data.data)) return { data: { data: [] } };
      return res;
    } catch {
      return { data: { data: [] } };
    }
  },

  getArtists: async () => {
    try {
      const res = await api.get('/artists');
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  getThemes: async () => {
    try {
      const res = await api.get('/themes');
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  generate: async (data) => {
    const res = await api.post('/prompts/generate', data);
    if (!res.data || typeof res.data !== 'object') throw new Error('Invalid response format');
    return res;
  },

  generateBatch: (data) => api.post('/prompts/batch', data),

  mixStyles: (data) => api.post('/prompts/mix', data),

  getStats: async () => {
    try {
      const res = await api.get('/prompts/stats');
      return res.data?.data || res.data || null;
    } catch {
      return null;
    }
  },

  exportPrompts: (format = 'json') => api.get(`/prompts/export?format=${format}`),
};

export default promptApi;
