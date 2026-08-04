// Centralized configuration from environment variables
export const config = {
  backendHost: import.meta.env.VITE_BACKEND_HOST || 'http://localhost:4000',
} as const;
