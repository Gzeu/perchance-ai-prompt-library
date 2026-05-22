import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  perchanceCategories: '/perchance/categories'
};
