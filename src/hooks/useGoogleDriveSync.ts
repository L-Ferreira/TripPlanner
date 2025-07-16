import { useCallback, useEffect, useState } from 'react';
import { getGoogleDriveService } from './useGoogleAuth';
import { TripData } from './useTripData';

export interface SyncState {
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  hasLocalChanges: boolean;
  hasRemoteChanges: boolean;
}

export interface SyncActions {
  syncNow: () => Promise<void>;
  clearError: () => void;
  forceUpload: () => Promise<void>;
  forceDownload: () => Promise<void>;
}

const LAST_SYNC_KEY = 'lastSyncTime';
const LAST_SYNCED_DATA_KEY = 'lastSyncedData';
const FILE_NAME = 'trip-planner-data.json';

export const useGoogleDriveSync = (
  isAuthenticated: boolean,
  localTripData: TripData | null,
  setLocalTripData: (data: TripData) => void
): SyncState & SyncActions => {
  const [state, setState] = useState<SyncState>({
    isLoading: false,
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    hasLocalChanges: false,
    hasRemoteChanges: false,
  });

  const updateSyncState = useCallback(() => {
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
    const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
    
    // Compare current local data with last synced data
    let hasLocalChanges = false;
    if (localTripData && lastSyncedData) {
      try {
        const parsedLastSynced = JSON.parse(lastSyncedData);
        hasLocalChanges = JSON.stringify(localTripData) !== JSON.stringify(parsedLastSynced);
      } catch (error) {
        // If we can't parse last synced data, consider it as having local changes
        hasLocalChanges = true;
      }
    } else if (localTripData && !lastSyncedData) {
      // If we have local data but no record of last sync, we have changes
      hasLocalChanges = true;
    }
    
    setState(prev => ({
      ...prev,
      lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : null,
      hasLocalChanges,
    }));
  }, [localTripData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const syncNow = useCallback(async () => {
    if (!isAuthenticated) {
      setState(prev => ({
        ...prev,
        error: 'Not authenticated with Google Drive',
      }));
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      
      // Check if remote file exists
      const remoteFile = await service.findTripPlannerFile();
      
      // Debug: List all files in root directory
      try {
        await service.listRootFiles();
      } catch (error) {
        // Ignore error
      }
      
      if (!remoteFile) {
        // No remote file, upload local data if available
        if (localTripData) {
          await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2));
          
          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));
          
          setState(prev => ({
            ...prev,
            lastSyncTime: now,
            hasLocalChanges: false,
            hasRemoteChanges: false,
          }));
        }
      } else {
        // Remote file exists, check for conflicts
        const remoteContent = await service.downloadFile(remoteFile.id);
        
        if (!remoteContent || remoteContent.trim() === '') {
          throw new Error('Remote file is empty or corrupted');
        }
        
        let remoteData: TripData;
        try {
          remoteData = JSON.parse(remoteContent);
          
          // Validate the structure of the parsed data
          if (!remoteData || typeof remoteData !== 'object' || !remoteData.tripInfo || !Array.isArray(remoteData.days)) {
            throw new Error('Invalid trip data structure');
          }
        } catch (parseError) {
          throw new Error(`Failed to parse remote data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
        }
        
        const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
        const remoteModified = new Date(remoteFile.modifiedTime);
        
        if (!lastSyncTime || remoteModified > new Date(lastSyncTime)) {
          // Remote is newer, need to handle conflict
          if (localTripData && JSON.stringify(localTripData) !== JSON.stringify(remoteData)) {
            // Conflict detected - for now, prioritize remote (can be enhanced)
            setLocalTripData(remoteData);
            // Don't update localStorage here - let useTripData handle it
          } else {
            // No local changes, safe to download
            setLocalTripData(remoteData);
            // Don't update localStorage here - let useTripData handle it
          }
          
          // Update sync state
          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(remoteData));
          
          setState(prev => ({
            ...prev,
            lastSyncTime: now,
            hasRemoteChanges: false,
            hasLocalChanges: false,
          }));
        } else if (localTripData && JSON.stringify(localTripData) !== JSON.stringify(remoteData)) {
          // Local is newer, upload changes
          await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2), remoteFile.id);
          
          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));
          
          setState(prev => ({
            ...prev,
            lastSyncTime: now,
            hasLocalChanges: false,
            hasRemoteChanges: false,
          }));
        } else {
          // Data is the same, just update sync time
          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData || remoteData));
          
          setState(prev => ({
            ...prev,
            lastSyncTime: now,
            hasLocalChanges: false,
            hasRemoteChanges: false,
          }));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, localTripData, setLocalTripData]);

  const forceUpload = useCallback(async () => {
    if (!isAuthenticated || !localTripData) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      const remoteFile = await service.findTripPlannerFile();
      
      if (remoteFile) {
        await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2), remoteFile.id);
      } else {
        await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2));
      }
      
      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));
      
      setState(prev => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
        hasRemoteChanges: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, localTripData]);

  const forceDownload = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      const remoteFile = await service.findTripPlannerFile();
      
      if (!remoteFile) {
        throw new Error('No file found in Google Drive');
      }
      
      const remoteContent = await service.downloadFile(remoteFile.id);
      
      if (!remoteContent || remoteContent.trim() === '') {
        throw new Error('Remote file is empty or corrupted');
      }
      
      let remoteData: TripData;
      try {
        remoteData = JSON.parse(remoteContent);
        
        if (!remoteData || typeof remoteData !== 'object' || !remoteData.tripInfo || !Array.isArray(remoteData.days)) {
          throw new Error('Invalid trip data structure');
        }
      } catch (parseError) {
        throw new Error(`Failed to parse remote data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
      }
      
      setLocalTripData(remoteData);
      
      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(remoteData));
      
      setState(prev => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
        hasRemoteChanges: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Download failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, setLocalTripData]);

  // Update sync state when local data changes
  useEffect(() => {
    updateSyncState();
  }, [updateSyncState]);

  return {
    ...state,
    syncNow,
    clearError,
    forceUpload,
    forceDownload,
  };
}; 