
/**
 * Application Configuration
 * 
 * Best Practice:
 * Never hardcode secrets in frontend code. 
 * API Keys should be loaded from .env files or injected at runtime.
 */

interface Config {
  env: 'development' | 'production';
  useMockData: boolean;
  
  // API Endpoints
  apiBaseUrl: string;
  websocketUrl: string;

  // External Services (Public Keys Only)
  geminiApiKey: string;
  stripePublishableKey: string;
}

// Cast import.meta to any to avoid TypeScript errors with missing Vite types
const env = (import.meta as any).env || {};

const config: Config = {
  env: env.MODE as 'development' | 'production',
  
  // TOGGLE THIS TO SWITCH FROM SEED DATA TO REAL BACKEND
  useMockData: env.VITE_USE_MOCK === 'true',

  apiBaseUrl: env.VITE_API_URL || 'http://localhost:3000/api',
  websocketUrl: env.VITE_WS_URL || 'ws://localhost:3000',

  geminiApiKey: env.VITE_GEMINI_API_KEY || '',
  stripePublishableKey: env.VITE_STRIPE_PUB_KEY || '',
};

export default config;
