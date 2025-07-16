import { useCallback, useEffect, useState } from 'react';
import { GoogleDriveConfig, GoogleDriveService } from '../lib/googleDrive';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: { email?: string } | null;
}

export interface AuthActions {
  login: () => void;
  logout: () => void;
  clearError: () => void;
}

const GOOGLE_DRIVE_CONFIG: GoogleDriveConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
  scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
};

let googleDriveService: GoogleDriveService | null = null;

const getGoogleDriveService = (): GoogleDriveService => {
  if (!googleDriveService) {
    googleDriveService = new GoogleDriveService(GOOGLE_DRIVE_CONFIG);
  }
  return googleDriveService;
};

export const useGoogleAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
  });

  const updateAuthState = useCallback(() => {
    const service = getGoogleDriveService();
    const isAuthenticated = service.isAuthenticated();

    setState((prev) => ({
      ...prev,
      isAuthenticated,
      isLoading: false,
    }));

    // Log authentication status and token info
    if (isAuthenticated) {
      const tokenInfo = service.getTokenExpirationInfo();
      console.log('Authentication status:', {
        isAuthenticated: true,
        hasRefreshToken: service.hasRefreshToken(),
        tokenExpiry: tokenInfo ? new Date(tokenInfo.expires_at).toISOString() : 'unknown',
        tokenExpired: tokenInfo?.is_expired || false,
      });
    }
  }, []);

  const login = useCallback(async () => {
    try {
      if (!GOOGLE_DRIVE_CONFIG.clientId) {
        setState((prev) => ({
          ...prev,
          error: 'Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.',
        }));
        return;
      }

      const service = getGoogleDriveService();
      const authUrl = await service.getAuthUrl();

      // Open popup window for authentication
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

      if (!popup) {
        setState((prev) => ({
          ...prev,
          error: 'Popup blocked. Please allow popups for this site.',
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      // Monitor popup for URL changes
      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            setState((prev) => ({ ...prev, isLoading: false }));
            return;
          }

          // Check if popup has navigated to redirect URI
          const popupUrl = popup.location.href;
          if (popupUrl && popupUrl.includes(GOOGLE_DRIVE_CONFIG.redirectUri)) {
            // Look for tokens in hash parameters (implicit flow)
            const hashParams = new URLSearchParams(popup.location.hash.substring(1));
            const error = hashParams.get('error');

            if (hashParams.has('access_token')) {
              // Handle successful authorization
              console.log('Access token received, processing...');

              try {
                service.handleAuthCallback(hashParams);
                setState((prev) => ({
                  ...prev,
                  isAuthenticated: true,
                  isLoading: false,
                  user: { email: 'user@example.com' }, // TODO: Get actual user info
                }));
                console.log('Authentication successful');
              } catch (error) {
                setState((prev) => ({
                  ...prev,
                  error: error instanceof Error ? error.message : 'Authentication failed',
                  isLoading: false,
                }));
              }
            } else if (error) {
              const errorDescription = hashParams.get('error_description') || 'Authentication failed';
              setState((prev) => ({
                ...prev,
                error: errorDescription,
                isLoading: false,
              }));
            }

            clearInterval(checkPopup);
            popup.close();
          }
        } catch (error) {
          // Cross-origin errors are expected until redirect
          if (popup.closed) {
            clearInterval(checkPopup);
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      }, 1000);

      // Clean up if popup is closed manually
      popup.addEventListener('beforeunload', () => {
        clearInterval(checkPopup);
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      }));
    }
  }, []);

  const logout = useCallback(() => {
    try {
      const service = getGoogleDriveService();
      service.logout();

      setState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  return {
    ...state,
    login,
    logout,
    clearError,
  };
};

export { getGoogleDriveService };
