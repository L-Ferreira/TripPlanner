export interface GoogleDriveConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size: string;
  parents?: string[];
  webViewLink?: string;
}

export interface AuthToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface StoredTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
  token_type: string;
}

export class GoogleDriveService {
  private config: GoogleDriveConfig;
  private tokens: StoredTokens | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const tokensJson = localStorage.getItem('google_drive_tokens');
      if (tokensJson) {
        this.tokens = JSON.parse(tokensJson);
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokensFromStorage();
    }
  }

  private saveTokensToStorage(tokens: StoredTokens): void {
    try {
      localStorage.setItem('google_drive_tokens', JSON.stringify(tokens));
      this.tokens = tokens;
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private clearTokensFromStorage(): void {
    localStorage.removeItem('google_drive_tokens');
    // Also clean up old token storage format
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_token_expiry');
    // Clean up session storage
    sessionStorage.removeItem('google_drive_code_verifier');

    this.tokens = null;
    this.refreshPromise = null;
  }

  public isAuthenticated(): boolean {
    if (!this.tokens) return false;

    // Check if we have a valid access token or a refresh token to get a new one
    const hasValidAccessToken = this.tokens.access_token && Date.now() < this.tokens.expires_at;
    const hasRefreshToken = !!this.tokens.refresh_token;

    return hasValidAccessToken || hasRefreshToken;
  }

  private isAccessTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expires_at;
  }

  public async getAuthUrl(): Promise<string> {
    // For Web application OAuth2 clients using implicit flow
    // We cannot use access_type=offline with response_type=token
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'token', // Use implicit flow
      scope: this.config.scope,
      prompt: 'consent', // Force consent for better user experience
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async handleAuthCallback(hashParams: URLSearchParams): Promise<void> {
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');
    // Note: refresh_token is not available with implicit flow

    if (!accessToken || !expiresIn) {
      throw new Error('Invalid authentication response');
    }

    const tokens: StoredTokens = {
      access_token: accessToken,
      refresh_token: undefined, // Not available with implicit flow
      expires_at: Date.now() + parseInt(expiresIn, 10) * 1000,
      scope: hashParams.get('scope') || this.config.scope,
      token_type: hashParams.get('token_type') || 'Bearer',
    };

    this.saveTokensToStorage(tokens);
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available, please reconnect');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      refresh_token: this.tokens.refresh_token,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);

      // If refresh fails, clear tokens and force re-authentication
      this.clearTokensFromStorage();
      throw new Error('Authentication expired, please reconnect');
    }

    const tokenData = await response.json();

    // Update tokens (refresh token might not be included in response)
    const newTokens: StoredTokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || this.tokens.refresh_token, // Keep old refresh token if new one not provided
      expires_at: Date.now() + tokenData.expires_in * 1000,
      scope: tokenData.scope || this.tokens.scope,
      token_type: tokenData.token_type || this.tokens.token_type,
    };

    this.saveTokensToStorage(newTokens);
  }

  private async ensureValidAccessToken(): Promise<void> {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    // If access token is still valid, nothing to do
    if (!this.isAccessTokenExpired()) {
      return;
    }

    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    // Start refresh process
    this.refreshPromise = this.refreshAccessToken();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  public logout(): void {
    this.clearTokensFromStorage();
  }

  public async getUserInfo(): Promise<{ email: string; name: string }> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    await this.ensureValidAccessToken();

    if (!this.tokens) {
      throw new Error('Authentication lost during token refresh');
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const userInfo = await response.json();
    return {
      email: userInfo.email,
      name: userInfo.name,
    };
  }

  private async makeApiRequest(endpoint: string, options: any = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    // Ensure we have a valid access token
    await this.ensureValidAccessToken();

    if (!this.tokens) {
      throw new Error('Authentication lost during token refresh');
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.tokens.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Access token might be invalid, try to refresh once more
      try {
        await this.refreshAccessToken();

        // Retry the request with the new token
        return await fetch(`https://www.googleapis.com/drive/v3${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.tokens!.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (refreshError) {
        console.error('Token refresh failed after 401:', refreshError);
        this.clearTokensFromStorage();
        throw new Error('Authentication expired, please reconnect');
      }
    }

    return response;
  }

  public async searchFiles(query: string): Promise<GoogleDriveFile[]> {
    const response = await this.makeApiRequest(
      `/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,size,parents,webViewLink)`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.files || [];

    return files;
  }

  public async listRootFiles(): Promise<GoogleDriveFile[]> {
    const response = await this.makeApiRequest(
      `/files?q=parents in 'root'&fields=files(id,name,modifiedTime,size,parents,webViewLink)`
    );

    if (!response.ok) {
      throw new Error(`List files failed: ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.files || [];

    return files;
  }

  public async findTripPlannerFile(): Promise<GoogleDriveFile | null> {
    const files = await this.searchFiles("name='trip-planner-data.json'");

    if (files.length > 0) {
      return files[0];
    }

    return null;
  }

  public async downloadFile(fileId: string): Promise<string> {
    // First, get file info to check size
    const fileInfo = await this.getFileInfo(fileId);

    if (fileInfo.size === '0') {
      throw new Error('Cannot download file - file is empty (0 bytes)');
    }

    const response = await this.makeApiRequest(`/files/${fileId}?alt=media`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Download failed: ${response.statusText} - ${errorText}`);
      throw new Error(`Download failed: ${response.statusText} - ${errorText}`);
    }

    const content = await response.text();

    // Validate that we got actual content
    if (!content || content.trim() === '') {
      throw new Error('Downloaded file is empty');
    }

    return content;
  }

  public async uploadFile(name: string, content: string, fileId?: string): Promise<string> {
    if (fileId) {
      // Update existing file - use simple media upload
      return this.updateFileContent(fileId, content);
    } else {
      // Create new file - use resumable upload with separate metadata and content
      return this.createNewFile(name, content);
    }
  }

  private async createNewFile(name: string, content: string): Promise<string> {
    // Step 1: Create file metadata (ensure it goes to root folder, not app data)
    const metadata = {
      name,
      parents: ['root'], // Explicitly put in root folder so it's visible
    };

    const createResponse = await this.makeApiRequest('/files', {
      method: 'POST',
      body: JSON.stringify(metadata),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`Failed to create file: ${createResponse.statusText} - ${errorText}`);
      throw new Error(`Failed to create file: ${createResponse.statusText} - ${errorText}`);
    }

    const fileData = await createResponse.json();

    // Step 2: Upload content to the created file
    const result = await this.updateFileContent(fileData.id, content);

    // Step 3: Verify the file was created correctly
    try {
      await this.getFileInfo(result);
    } catch (error) {
      console.warn('File verification failed:', error);
    }

    return result;
  }

  private async updateFileContent(fileId: string, content: string): Promise<string> {
    // Ensure we have a valid access token
    await this.ensureValidAccessToken();

    if (!this.tokens) {
      throw new Error('Authentication lost during token refresh');
    }

    // Use the upload endpoint instead of regular API for media content
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to update file content: ${response.statusText} - ${errorText}`);
      throw new Error(`Failed to update file content: ${response.statusText} - ${errorText}`);
    }

    // Verify the content was uploaded correctly
    try {
      const verifyResponse = await this.makeApiRequest(`/files/${fileId}?fields=size,modifiedTime`);
      if (verifyResponse.ok) {
        const fileInfo = await verifyResponse.json();

        if (fileInfo.size === '0') {
          throw new Error('File was uploaded but shows 0 bytes');
        }
      }
    } catch (verifyError) {
      console.warn('Upload verification failed:', verifyError);
    }

    return fileId;
  }

  public async getFileInfo(fileId: string): Promise<GoogleDriveFile> {
    const response = await this.makeApiRequest(`/files/${fileId}?fields=id,name,modifiedTime,size,parents,webViewLink`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get file info: ${response.statusText} - ${errorText}`);
      throw new Error(`Failed to get file info: ${response.statusText} - ${errorText}`);
    }

    const fileInfo = await response.json();

    return fileInfo;
  }

  public async deleteFile(fileId: string): Promise<void> {
    const response = await this.makeApiRequest(`/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error(`Delete failed: ${response.statusText}`);
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  }

  // Helper method to check if refresh token is available
  public hasRefreshToken(): boolean {
    return !!this.tokens?.refresh_token;
  }

  // Helper method to get token expiration info
  public getTokenExpirationInfo(): { expires_at: number; is_expired: boolean } | null {
    if (!this.tokens) return null;
    return {
      expires_at: this.tokens.expires_at,
      is_expired: this.isAccessTokenExpired(),
    };
  }
}
