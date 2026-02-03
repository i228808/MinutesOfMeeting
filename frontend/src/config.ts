export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// For Google OAuth, we might need the base URL without /api
export const BASE_URL = API_URL.replace('/api', '');
