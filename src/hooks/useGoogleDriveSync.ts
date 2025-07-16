import { useCallback, useEffect, useRef, useState } from 'react';
import { getGoogleDriveService } from './useGoogleAuth';
import { TripData } from './useTripData';

export interface SyncState {
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  hasLocalChanges: boolean;
  autoSyncEnabled: boolean;
  nextAutoSyncTime: Date | null;
  countdownSeconds: number;
}

export interface SyncActions {
  syncNow: () => Promise<void>;
  forceUpload: () => Promise<void>;
  forceDownload: () => Promise<void>;
  forceReupload: () => Promise<void>;
  clearError: () => void;
  toggleAutoSync: () => void;
  refreshKey: number;
}

const LAST_SYNC_KEY = 'lastSyncTime';
const LAST_SYNCED_DATA_KEY = 'lastSyncedData';
const AUTO_SYNC_ENABLED_KEY = 'autoSyncEnabled';
const FILE_NAME = 'trip-planner-data.json';
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Helper function to validate trip data structure
const isValidTripData = (data: any): data is TripData => {
  if (!data || typeof data !== 'object') return false;
  if (!data.tripInfo || typeof data.tripInfo !== 'object') return false;
  if (!Array.isArray(data.days)) return false;
  if (!data.tripInfo.name || typeof data.tripInfo.name !== 'string') return false;
  return true;
};

// Improved data merging logic - prioritize local changes during sync
const mergeData = (localData: TripData, remoteData: TripData): TripData => {
  console.log('Merging data - local vs remote');
  console.log('Local data preview:', {
    tripName: localData.tripInfo.name,
    dayCount: localData.days.length,
    firstDayPlaces: localData.days[0]?.places?.length || 0,
  });
  console.log('Remote data preview:', {
    tripName: remoteData.tripInfo.name,
    dayCount: remoteData.days.length,
    firstDayPlaces: remoteData.days[0]?.places?.length || 0,
  });

  // During sync operations, we generally want to preserve local changes
  // since the user is actively working on the trip

  // Compare data deeply to decide merge strategy
  const localDayCount = localData.days.length;
  const remoteDayCount = remoteData.days.length;

  // If local has more days, definitely use local (user added days)
  if (localDayCount > remoteDayCount) {
    console.log('Local has more days, using local data');
    return localData;
  }

  // If remote has more days, but local has recent changes, prefer local
  // This handles the case where user is actively editing
  if (remoteDayCount > localDayCount) {
    console.log('Remote has more days, but checking for local changes...');

    // Check if local data has substantive changes compared to what we last synced
    try {
      const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
      if (lastSyncedData) {
        const lastSynced = JSON.parse(lastSyncedData);
        const localHasChanges = JSON.stringify(localData) !== JSON.stringify(lastSynced);

        if (localHasChanges) {
          console.log('Local has active changes, preserving local data');
          return localData;
        }
      }
    } catch (e) {
      console.log('Could not check last synced data, using local');
      return localData;
    }

    console.log('No local changes detected, using remote data');
    return remoteData;
  }

  // Same number of days - prefer local (user's current work)
  console.log('Same number of days, preferring local data');
  return localData;
};

export const useGoogleDriveSync = (
  isAuthenticated: boolean,
  localTripData: TripData | null,
  setLocalTripData: (data: TripData) => void
): SyncState & SyncActions => {
  // Load auto-sync preference from localStorage
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(() => {
    const saved = localStorage.getItem(AUTO_SYNC_ENABLED_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Add a refresh key to force re-renders
  const [refreshKey, setRefreshKey] = useState(0);

  const [state, setState] = useState<SyncState>(() => {
    console.log('🔧 Initializing sync state');
    return {
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
      error: null,
      hasLocalChanges: false,
      autoSyncEnabled,
      nextAutoSyncTime: null,
      countdownSeconds: 0,
    };
  });

  const autoSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncNowRef = useRef<(() => Promise<void>) | null>(null);

  // Check if local data has changed since last sync
  const checkLocalChanges = useCallback(() => {
    if (!localTripData) return false;

    const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
    if (!lastSyncedData) return true;

    try {
      const parsedLastSynced = JSON.parse(lastSyncedData);
      return JSON.stringify(localTripData) !== JSON.stringify(parsedLastSynced);
    } catch {
      return true;
    }
  }, [localTripData]);

  // Update sync state - memoized to prevent infinite loops
  const updateSyncState = useCallback(() => {
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
    const hasChanges = checkLocalChanges();

    setState((prev) => ({
      ...prev,
      lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : null,
      hasLocalChanges: hasChanges,
      autoSyncEnabled,
    }));
  }, [checkLocalChanges, autoSyncEnabled]);

  // Direct change detection effect - runs immediately when localTripData changes
  useEffect(() => {
    console.log('🔍 Checking for local changes...', { localTripData: !!localTripData });

    if (!localTripData) {
      console.log('❌ No local trip data, setting hasLocalChanges to false');
      setState((prev) => {
        console.log('🔄 State update: hasLocalChanges false');
        return { ...prev, hasLocalChanges: false };
      });
      return;
    }

    const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
    if (!lastSyncedData) {
      console.log('✅ No last synced data found, setting hasLocalChanges to true');
      setState((prev) => {
        console.log('🔄 State update: hasLocalChanges true (no last synced data)');
        return { ...prev, hasLocalChanges: true };
      });
      return;
    }

    try {
      const parsedLastSynced = JSON.parse(lastSyncedData);
      const hasChanges = JSON.stringify(localTripData) !== JSON.stringify(parsedLastSynced);
      console.log('🔍 Comparison result:', { hasChanges });
      setState((prev) => {
        console.log('🔄 State update: hasLocalChanges', hasChanges);
        return { ...prev, hasLocalChanges: hasChanges };
      });
    } catch {
      console.log('❌ Error parsing last synced data, setting hasLocalChanges to true');
      setState((prev) => {
        console.log('🔄 State update: hasLocalChanges true (parse error)');
        return { ...prev, hasLocalChanges: true };
      });
    }
  }, [localTripData]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Toggle auto-sync
  const toggleAutoSync = useCallback(() => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabledState(newValue);
    localStorage.setItem(AUTO_SYNC_ENABLED_KEY, JSON.stringify(newValue));
    console.log(`Auto-sync ${newValue ? 'enabled' : 'disabled'}`);
  }, [autoSyncEnabled]);

  // Main sync function - downloads remote, merges, uploads result
  const syncNow = useCallback(async () => {
    if (!isAuthenticated) {
      setState((prev) => ({ ...prev, error: 'Not authenticated with Google Drive' }));
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('Starting sync operation');

      // Find the trip planner file
      const remoteFile = await service.findTripPlannerFile();

      if (!remoteFile) {
        // No remote file, upload local data if available
        if (localTripData) {
          console.log('No remote file found, uploading local data');
          await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2));

          // Update sync state
          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));

          setState((prev) => ({
            ...prev,
            lastSyncTime: now,
            hasLocalChanges: false,
          }));
        }
        return;
      }

      // Download remote data
      console.log('Downloading remote data for sync');
      const remoteContent = await service.downloadFile(remoteFile.id);

      if (!remoteContent || remoteContent.trim() === '') {
        // Remote file is empty, upload local data
        if (localTripData) {
          console.log('Remote file is empty, uploading local data');
          await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2), remoteFile.id);

          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));

          setState((prev) => ({
            ...prev,
            lastSyncTime: now,
            hasLocalChanges: false,
          }));
        }
        return;
      }

      // Parse remote data
      let remoteData: TripData;
      try {
        remoteData = JSON.parse(remoteContent);

        if (!isValidTripData(remoteData)) {
          throw new Error('Invalid trip data structure');
        }
      } catch (parseError) {
        console.error('Failed to parse remote data:', parseError);
        setState((prev) => ({ ...prev, error: 'Remote file contains invalid data' }));
        return;
      }

      // Compare and merge data
      const localDataString = JSON.stringify(localTripData);
      const remoteDataString = JSON.stringify(remoteData);

      if (localDataString === remoteDataString) {
        console.log('Data is identical, updating sync time');
        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(remoteData));

        setState((prev) => ({
          ...prev,
          lastSyncTime: now,
          hasLocalChanges: false,
        }));
        return;
      }

      // Data is different, merge it
      const mergedData = localTripData ? mergeData(localTripData, remoteData) : remoteData;

      console.log('📊 Sync merge results:', {
        localTripDataExists: !!localTripData,
        localDayCount: localTripData?.days?.length || 0,
        remoteDayCount: remoteData.days.length,
        mergedDayCount: mergedData.days.length,
        localTrip: localTripData?.tripInfo?.name || 'Unknown',
        remoteTrip: remoteData.tripInfo.name,
        mergedTrip: mergedData.tripInfo.name,
      });

      // Update local data if it changed
      if (JSON.stringify(localTripData) !== JSON.stringify(mergedData)) {
        console.log('🔄 Updating local data with merged result');
        setLocalTripData(mergedData);

        // Force a brief delay to ensure state updates are processed
        setTimeout(() => {
          console.log('🔄 Forcing state refresh after local data update');
          setState((prev) => ({ ...prev }));
        }, 100);
      } else {
        console.log('✅ Local data unchanged after merge');
      }

      // Upload merged data
      console.log('📤 Uploading merged data to Google Drive');
      console.log('📋 Data being uploaded:', {
        tripName: mergedData.tripInfo.name,
        dayCount: mergedData.days.length,
        firstDayPlaces: mergedData.days[0]?.places?.length || 0,
      });

      await service.uploadFile(FILE_NAME, JSON.stringify(mergedData, null, 2), remoteFile.id);

      // Update sync state
      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(mergedData));

      setState((prev) => {
        console.log('✅ Sync completed - updating state: hasLocalChanges false');
        return {
          ...prev,
          lastSyncTime: now,
          hasLocalChanges: false,
        };
      });

      // Force a refresh to ensure UI updates
      setRefreshKey((prev) => prev + 1);

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, localTripData, setLocalTripData]);

  // Keep syncNow ref updated
  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);

  // Force upload - upload local data regardless
  const forceUpload = useCallback(async () => {
    if (!isAuthenticated || !localTripData) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('Force uploading local data');

      const remoteFile = await service.findTripPlannerFile();

      if (remoteFile) {
        await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2), remoteFile.id);
      } else {
        await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2));
      }

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));

      setState((prev) => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
      }));

      // Force a refresh to ensure UI updates
      setRefreshKey((prev) => prev + 1);

      console.log('Force upload completed successfully');
    } catch (error) {
      console.error('Force upload failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, localTripData]);

  // Force download - download remote and replace local
  const forceDownload = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('Force downloading remote data');

      const remoteFile = await service.findTripPlannerFile();

      if (!remoteFile) {
        throw new Error('No file found in Google Drive');
      }

      const remoteContent = await service.downloadFile(remoteFile.id);

      if (!remoteContent || remoteContent.trim() === '') {
        throw new Error('Remote file is empty');
      }

      let remoteData: TripData;
      try {
        remoteData = JSON.parse(remoteContent);

        if (!isValidTripData(remoteData)) {
          throw new Error('Remote file contains invalid trip data');
        }
      } catch (parseError) {
        throw new Error(
          'Failed to parse remote data: ' + (parseError instanceof Error ? parseError.message : 'Invalid JSON')
        );
      }

      // Update local data
      setLocalTripData(remoteData);

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(remoteData));

      setState((prev) => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
      }));

      // Force a refresh to ensure UI updates
      setRefreshKey((prev) => prev + 1);

      console.log('Force download completed successfully');
    } catch (error) {
      console.error('Force download failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Download failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, setLocalTripData]);

  // Force re-upload - delete remote file and create new one
  const forceReupload = useCallback(async () => {
    if (!isAuthenticated || !localTripData) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('Force re-upload: deleting existing file and creating new one');

      // Delete existing file if it exists
      const existingFile = await service.findTripPlannerFile();
      if (existingFile) {
        await service.deleteFile(existingFile.id);
      }

      // Create new file
      await service.uploadFile(FILE_NAME, JSON.stringify(localTripData, null, 2));

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(localTripData));

      setState((prev) => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
      }));

      // Force a refresh to ensure UI updates
      setRefreshKey((prev) => prev + 1);

      console.log('Force re-upload completed successfully');
    } catch (error) {
      console.error('Force re-upload failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Re-upload failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [isAuthenticated, localTripData]);

  // Set up auto-sync interval
  useEffect(() => {
    if (isAuthenticated && autoSyncEnabled && !state.isSyncing) {
      const runAutoSync = () => {
        console.log('Running auto-sync');
        if (syncNowRef.current) {
          syncNowRef.current();
        }
      };

      // Set up interval for auto-sync
      autoSyncIntervalRef.current = setInterval(runAutoSync, AUTO_SYNC_INTERVAL);

      // Set next auto-sync time
      const nextSyncTime = new Date(Date.now() + AUTO_SYNC_INTERVAL);
      setState((prev) => ({ ...prev, nextAutoSyncTime: nextSyncTime }));

      return () => {
        if (autoSyncIntervalRef.current) {
          clearInterval(autoSyncIntervalRef.current);
        }
      };
    } else {
      // Clear auto-sync
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
        autoSyncIntervalRef.current = null;
      }
      setState((prev) => ({ ...prev, nextAutoSyncTime: null, countdownSeconds: 0 }));
    }
  }, [isAuthenticated, autoSyncEnabled, state.isSyncing]);

  // Set up countdown timer - separate from auto-sync logic
  useEffect(() => {
    if (state.nextAutoSyncTime && autoSyncEnabled) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeDiff = state.nextAutoSyncTime!.getTime() - now;

        if (timeDiff <= 0) {
          setState((prev) => ({ ...prev, countdownSeconds: 0 }));
          return;
        }

        const seconds = Math.floor(timeDiff / 1000);
        setState((prev) => ({ ...prev, countdownSeconds: seconds }));
      };

      // Update immediately
      updateCountdown();

      // Update every second
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setState((prev) => ({ ...prev, countdownSeconds: 0 }));
    }
  }, [state.nextAutoSyncTime, autoSyncEnabled]);

  // Update sync state when dependencies change (excluding localTripData since it's handled separately)
  useEffect(() => {
    updateSyncState();
  }, [updateSyncState]);

  return {
    ...state,
    syncNow,
    forceUpload,
    forceDownload,
    forceReupload,
    clearError,
    toggleAutoSync,
    refreshKey,
  };
};
