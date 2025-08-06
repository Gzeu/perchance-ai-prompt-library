import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors and validate data structure
api.interceptors.response.use(
  (response) => {
    // Validate the response data structure
    if (response.data && typeof response.data === 'object') {
      return response;
    }
    
    // If the response doesn't have the expected structure, throw an error
    throw new Error('Invalid response structure from the server');
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }
    
    // Handle HTTP errors
    const status = error.response.status;
    let message = 'An error occurred';
    
    if (status === 400) {
      message = error.response.data?.error || 'Invalid request';
    } else if (status === 404) {
      message = 'The requested resource was not found';
    } else if (status >= 500) {
      message = 'Server error. Please try again later.';
    }
    
    console.error(`API Error (${status}):`, message);
    throw new Error(message);
  }
);

export const promptApi = {
  // Health check
  getHealth: () => api.get('/health'),
  
  // Styles
  getStyles: async () => {
    try {
      const response = await api.get('/styles');
      // Ensure the response has the expected structure
      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('Unexpected response format from /styles endpoint');
        return { data: { data: [] } }; // Return empty array as fallback
      }
      return response;
    } catch (error) {
      console.error('Error fetching styles:', error);
      return { data: { data: [] } }; // Return empty array on error
    }
  },
  
  // Generate single prompt
  generate: async (data) => {
    try {
      const response = await api.post('/prompts/generate', data);
      // Validate the response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from the server');
      }
      return response;
    } catch (error) {
      console.error('Error generating prompt:', error);
      throw error; // Re-throw to be handled by the component
    }
  },
  
  // Generate batch
  generateBatch: (data) => api.post('/prompts/batch', data),
  
  // Mix styles
  mixStyles: (data) => api.post('/prompts/mix', data),
};

export default promptApi;
