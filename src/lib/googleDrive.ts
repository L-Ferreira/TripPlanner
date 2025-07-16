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

export class GoogleDriveService {
  private config: GoogleDriveConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('google_drive_token');
    const expiry = localStorage.getItem('google_drive_token_expiry');

    if (token && expiry) {
      this.accessToken = token;
      this.tokenExpiry = parseInt(expiry, 10);
    }
  }

  private saveTokenToStorage(token: string, expiresIn: number): void {
    const expiry = Date.now() + expiresIn * 1000;
    localStorage.setItem('google_drive_token', token);
    localStorage.setItem('google_drive_token_expiry', expiry.toString());
    this.accessToken = token;
    this.tokenExpiry = expiry;
  }

  private clearTokenFromStorage(): void {
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_token_expiry');
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  public isAuthenticated(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  public getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'token', // Use implicit flow for frontend
      scope: this.config.scope,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public handleAuthCallback(hashParams: URLSearchParams): void {
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');

    if (!accessToken || !expiresIn) {
      throw new Error('Invalid authentication response');
    }

    this.saveTokenToStorage(accessToken, parseInt(expiresIn, 10));
  }

  public logout(): void {
    this.clearTokenFromStorage();
  }

  private async makeApiRequest(endpoint: string, options: any = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      this.clearTokenFromStorage();
      throw new Error('Authentication expired');
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
    return data.files || [];
  }

  public async listRootFiles(): Promise<GoogleDriveFile[]> {
    const response = await this.makeApiRequest(
      `/files?q=parents in 'root'&fields=files(id,name,modifiedTime,size,parents,webViewLink)`
    );

    if (!response.ok) {
      throw new Error(`List files failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  public async findTripPlannerFile(): Promise<GoogleDriveFile | null> {
    const files = await this.searchFiles("name='trip-planner-data.json'");

    if (files.length > 0) {
      return files[0];
    } else {
      return null;
    }
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
      throw new Error(`Failed to create file: ${createResponse.statusText} - ${errorText}`);
    }

    const fileData = await createResponse.json();

    // Step 2: Upload content to the created file
    const result = await this.updateFileContent(fileData.id, content);

    // Step 3: Verify the file was created correctly
    try {
      await this.getFileInfo(result);
    } catch (error) {
      // Verification failed, but file was created
    }

    return result;
  }

  private async updateFileContent(fileId: string, content: string): Promise<string> {
    // Use the upload endpoint instead of regular API for media content
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update file content: ${response.statusText} - ${errorText}`);
    }

    // Verify the content was uploaded correctly
    try {
      const verifyResponse = await this.makeApiRequest(`/files/${fileId}?fields=size`);
      if (verifyResponse.ok) {
        const fileInfo = await verifyResponse.json();

        if (fileInfo.size === '0') {
          throw new Error('File was uploaded but shows 0 bytes');
        }
      }
    } catch (verifyError) {
      // Verification failed, but upload may have succeeded
    }

    return fileId;
  }

  public async getFileInfo(fileId: string): Promise<GoogleDriveFile> {
    const response = await this.makeApiRequest(`/files/${fileId}?fields=id,name,modifiedTime,size,parents,webViewLink`);

    if (!response.ok) {
      const errorText = await response.text();
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
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  }
}
