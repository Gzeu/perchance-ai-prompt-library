import axios from 'axios';

// In dev, Vite proxies /api → localhost:3000. In prod, set VITE_API_URL to your API host.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err)
);

export const endpoints = {
  // Existing
  generate: '/generate',
  styles: '/styles',
  artists: '/artists',
  themes: '/themes',
  stats: '/stats',
  // Perchance
  perchanceGenerate: '/perchance/generate',
  perchanceRefine: '/perchance/refine',
  perchanceIdeas: '/perchance/ideas',
  perchanceValidate: '/perchance/validate',
  perchanceTemplates: '/perchance/templates',
  perchanceCategories: '/perchance/categories',
  perchanceAgentic: '/perchance/agentic',
  perchanceAgenticStatus: '/perchance/agentic/status'
};
