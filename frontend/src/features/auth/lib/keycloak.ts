import Keycloak from 'keycloak-js';
import type { User } from '@/types/auth';

// Keycloak configuration from environment
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.domain.com/auth',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'daily-sorte',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend-spa',
};

// Singleton Keycloak instance
let keycloak: Keycloak | null = null;

/**
 * Initialize Keycloak instance
 */
export function getKeycloak(): Keycloak {
  if (!keycloak) {
    keycloak = new Keycloak(keycloakConfig);
  }
  return keycloak;
}

/**
 * Initialize Keycloak and authenticate user
 * Called on app initialization
 */
export async function initKeycloak(): Promise<{
  authenticated: boolean;
  user?: User;
}> {
  const kc = getKeycloak();
  
  try {
    const authenticated = await kc?.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
    
    if (authenticated && kc?.tokenParsed) {
      const token = kc.tokenParsed as Record<string, unknown>;
      
      // Store tokens in localStorage
      const accessToken = kc.token;
      const refreshToken = kc.refreshToken;
      
      localStorage.setItem('access_token', accessToken || '');
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      // Extract user info from token
      const user: User = {
        id: token.sub as string,
        email: token.email as string || '',
        name: token.name as string || '',
        preferredUsername: token.preferred_username as string || '',
        preferredLanguage: token.preferred_language as string || 'pt',
        expiresAt: (token.exp as number) * 1000,
      };
      
      return { authenticated, user };
    }
    
    return { authenticated: false };
  } catch (error) {
    console.error('Keycloak init error:', error);
    return { authenticated: false };
  }
}

/**
 * Login via Keycloak (redirect to Keycloak login page)
 */
export async function login(): Promise<void> {
  const kc = getKeycloak();
  await kc?.login({
    redirectUri: window.location.href,
  });
}

/**
 * Logout from Keycloak
 */
export async function logout(): Promise<void> {
  const kc = getKeycloak();
  await kc?.logout({
    redirectUri: window.location.origin,
  });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

/**
 * Check if current session is valid
 */
export async function checkSession(): Promise<boolean> {
  const kc = getKeycloak();
  try {
    const valid = await kc?.updateToken(70);
    return valid ?? false;
  } catch {
    return false;
  }
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Get stored tokens
 */
export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  };
}

export default getKeycloak;