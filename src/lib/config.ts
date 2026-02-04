// Centralized configuration from environment variables
export const config = {
  backendHost: import.meta.env.VITE_BACKEND_HOST || 'https://backend.numor.app',
} as const;
