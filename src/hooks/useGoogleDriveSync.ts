import { useCallback, useEffect, useRef, useState } from 'react';
import { ConflictSummary, detectConflicts } from '../utils/conflictDetection';
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
  // Add conflict-related state
  conflictSummary: ConflictSummary | null;
  showConflictModal: boolean;
  pendingRemoteData: TripData | null;
}

export interface SyncActions {
  syncNow: () => Promise<void>;
  forceUpload: () => Promise<void>;
  forceDownload: () => Promise<void>;
  forceReupload: () => Promise<void>;
  clearError: () => void;
  toggleAutoSync: () => void;
  refreshKey: number;
  // Add conflict resolution actions
  resolveConflicts: (resolvedData: TripData) => Promise<void>;
  cancelConflictResolution: () => void;
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

// Import the improved merge function from SyncContext
// Note: This will be defined in SyncContext.tsx and exported
export const mergeData = (localData: TripData, remoteData: TripData): TripData => {
  // Helper function to merge two objects field by field
  const mergeFields = (local: any, remote: any, fieldName: string): any => {
    if (JSON.stringify(local) === JSON.stringify(remote)) {
      return local; // No difference, return either
    }

    // For simple fields, we need to decide which one to use
    // Since we don't have timestamps, we'll use a heuristic:
    // - If local is default/empty and remote has content, use remote
    // - If remote is default/empty and local has content, use local
    // - Otherwise, prefer local (user's current session)

    if (typeof local === 'string' && typeof remote === 'string') {
      // For strings, prefer non-empty values
      if (!local || local.trim() === '') return remote;
      if (!remote || remote.trim() === '') return local;
      // Both have content, prefer local
      return local;
    }

    if (typeof local === 'number' && typeof remote === 'number') {
      // For numbers, prefer non-zero values
      if (local === 0 && remote !== 0) return remote;
      if (remote === 0 && local !== 0) return local;
      // Both have values, prefer local
      return local;
    }

    // For objects and arrays, do a deeper merge
    if (typeof local === 'object' && typeof remote === 'object') {
      if (Array.isArray(local) && Array.isArray(remote)) {
        // Merge arrays by combining unique items
        const merged = [...local];
        remote.forEach((item: any) => {
          if (!merged.some((existing: any) => JSON.stringify(existing) === JSON.stringify(item))) {
            merged.push(item);
          }
        });
        return merged;
      } else if (local && remote) {
        // Merge objects field by field
        const merged = { ...local };
        Object.keys(remote).forEach((key) => {
          if (key in merged) {
            merged[key] = mergeFields(merged[key], remote[key], `${fieldName}.${key}`);
          } else {
            merged[key] = remote[key];
          }
        });
        return merged;
      }
    }

    // Default: prefer local
    return local;
  };

  // Merge trip info
  const mergedTripInfo = {
    name: mergeFields(localData.tripInfo.name, remoteData.tripInfo.name, 'tripInfo.name'),
    startDate: mergeFields(localData.tripInfo.startDate, remoteData.tripInfo.startDate, 'tripInfo.startDate'),
    endDate: mergeFields(localData.tripInfo.endDate, remoteData.tripInfo.endDate, 'tripInfo.endDate'),
    description: mergeFields(localData.tripInfo.description, remoteData.tripInfo.description, 'tripInfo.description'),
  };

  // Create maps for easier lookup
  const localDaysByNumber = new Map<number, any>();
  localData.days.forEach((day: any) => {
    localDaysByNumber.set(day.dayNumber, day);
  });

  const remoteDaysByNumber = new Map<number, any>();
  remoteData.days.forEach((day: any) => {
    remoteDaysByNumber.set(day.dayNumber, day);
  });

  // Get all day numbers from both local and remote
  const allDayNumbers = new Set([...localDaysByNumber.keys(), ...remoteDaysByNumber.keys()]);

  // Merge each day
  const mergedDays = Array.from(allDayNumbers)
    .sort((a, b) => a - b)
    .map((dayNumber) => {
      const localDay = localDaysByNumber.get(dayNumber);
      const remoteDay = remoteDaysByNumber.get(dayNumber);

      // If only one version exists, use it
      if (!localDay) return remoteDay!;
      if (!remoteDay) return localDay;

      // Both versions exist, merge them field by field
      const mergedDay: any = {
        id: localDay.id, // IDs should be the same
        dayNumber: dayNumber,
        region: mergeFields(localDay.region, remoteDay.region, `day${dayNumber}.region`),
        driveTimeHours: mergeFields(
          localDay.driveTimeHours,
          remoteDay.driveTimeHours,
          `day${dayNumber}.driveTimeHours`
        ),
        driveDistanceKm: mergeFields(
          localDay.driveDistanceKm,
          remoteDay.driveDistanceKm,
          `day${dayNumber}.driveDistanceKm`
        ),
        googleMapsUrl: mergeFields(localDay.googleMapsUrl, remoteDay.googleMapsUrl, `day${dayNumber}.googleMapsUrl`),
        googleMapsEmbedUrl: mergeFields(
          localDay.googleMapsEmbedUrl,
          remoteDay.googleMapsEmbedUrl,
          `day${dayNumber}.googleMapsEmbedUrl`
        ),
        accommodationId: mergeFields(
          localDay.accommodationId,
          remoteDay.accommodationId,
          `day${dayNumber}.accommodationId`
        ),
        nightNumber: mergeFields(localDay.nightNumber, remoteDay.nightNumber, `day${dayNumber}.nightNumber`),
        notes: mergeFields(localDay.notes, remoteDay.notes, `day${dayNumber}.notes`),
        accommodation: mergeFields(localDay.accommodation, remoteDay.accommodation, `day${dayNumber}.accommodation`),
        images: mergeFields(localDay.images, remoteDay.images, `day${dayNumber}.images`),
        places: [],
      };

      // Merge places
      const localPlacesById = new Map<string, any>();
      localDay.places.forEach((place: any) => {
        localPlacesById.set(place.id, place);
      });

      const remotePlacesById = new Map<string, any>();
      remoteDay.places.forEach((place: any) => {
        remotePlacesById.set(place.id, place);
      });

      // Get all place IDs from both versions
      const allPlaceIds = new Set([...localPlacesById.keys(), ...remotePlacesById.keys()]);

      // Merge places
      const mergedPlaces = Array.from(allPlaceIds).map((placeId) => {
        const localPlace = localPlacesById.get(placeId);
        const remotePlace = remotePlacesById.get(placeId);

        if (!localPlace) return remotePlace!;
        if (!remotePlace) return localPlace;

        // Both exist, merge them
        const mergedPlace: any = {
          id: placeId,
          name: mergeFields(localPlace.name, remotePlace.name, `day${dayNumber}.place${placeId}.name`),
          description: mergeFields(
            localPlace.description,
            remotePlace.description,
            `day${dayNumber}.place${placeId}.description`
          ),
          websiteUrl: mergeFields(
            localPlace.websiteUrl,
            remotePlace.websiteUrl,
            `day${dayNumber}.place${placeId}.websiteUrl`
          ),
          googleMapsUrl: mergeFields(
            localPlace.googleMapsUrl,
            remotePlace.googleMapsUrl,
            `day${dayNumber}.place${placeId}.googleMapsUrl`
          ),
          googleMapsEmbedUrl: mergeFields(
            localPlace.googleMapsEmbedUrl,
            remotePlace.googleMapsEmbedUrl,
            `day${dayNumber}.place${placeId}.googleMapsEmbedUrl`
          ),
          images: mergeFields(localPlace.images, remotePlace.images, `day${dayNumber}.place${placeId}.images`),
        };

        return mergedPlace;
      });

      mergedDay.places = mergedPlaces;
      return mergedDay;
    });

  const mergedData = {
    tripInfo: mergedTripInfo,
    days: mergedDays,
  };

  console.log('✅ Deep merge completed:', {
    tripName: mergedData.tripInfo.name,
    dayCount: mergedData.days.length,
    firstDayRegion: mergedData.days[0]?.region,
    totalPlaces: mergedData.days.reduce((sum, day) => sum + day.places.length, 0),
  });

  return mergedData;
};

// Helper function to merge non-conflicting data when no conflicts are detected
const mergeNonConflictingData = (localData: TripData, remoteData: TripData): TripData => {
  // Start with local data as the base
  const mergedData: TripData = JSON.parse(JSON.stringify(localData));

  // Merge trip info (prefer local, but fill in missing fields from remote)
  Object.keys(remoteData.tripInfo).forEach((key) => {
    const localValue = (localData.tripInfo as any)[key];
    const remoteValue = (remoteData.tripInfo as any)[key];

    if (!localValue && remoteValue) {
      (mergedData.tripInfo as any)[key] = remoteValue;
    }
  });

  // Merge days
  const remoteDayMap = new Map(remoteData.days.map((day) => [day.id, day]));

  mergedData.days.forEach((localDay, dayIndex) => {
    const remoteDay = remoteDayMap.get(localDay.id);
    if (remoteDay) {
      // Simple merge for images - if they're different, it should have been a conflict
      // This function should only run when there are no conflicts, so images should be identical
      const localImages = localDay.accommodation.images || [];
      const remoteImages = remoteDay.accommodation.images || [];

      if (JSON.stringify(localImages) === JSON.stringify(remoteImages)) {
        // Images are identical, keep as is
        mergedData.days[dayIndex].accommodation.images = localImages;
      } else {
        // Images differ but no conflict was detected - this shouldn't happen with new logic
        // But just in case, preserve local
        mergedData.days[dayIndex].accommodation.images = localImages;
      }

      // Merge places (add any new places from remote)
      const localPlaceIds = new Set(localDay.places.map((p) => p.id));
      const newRemotePlaces = remoteDay.places.filter((p) => !localPlaceIds.has(p.id));
      mergedData.days[dayIndex].places = [...localDay.places, ...newRemotePlaces];

      // For existing places, simple merge for images
      mergedData.days[dayIndex].places.forEach((place) => {
        const remotePlace = remoteDay.places.find((p) => p.id === place.id);
        if (remotePlace) {
          const localPlaceImages = place.images || [];
          const remotePlaceImages = remotePlace.images || [];

          if (JSON.stringify(localPlaceImages) === JSON.stringify(remotePlaceImages)) {
            // Images are identical, keep as is
            place.images = localPlaceImages;
          } else {
            // Images differ but no conflict - preserve local
            place.images = localPlaceImages;
          }
        }
      });

      // Merge amenities "other" array
      const localOther = localDay.accommodation.amenities.other || [];
      const remoteOther = remoteDay.accommodation.amenities.other || [];
      const combinedOther = [...new Set([...localOther, ...remoteOther])];
      mergedData.days[dayIndex].accommodation.amenities.other = combinedOther;
    }
  });

  // Add any completely new days from remote
  const localDayIds = new Set(localData.days.map((d) => d.id));
  const newRemoteDays = remoteData.days.filter((d) => !localDayIds.has(d.id));
  mergedData.days = [...mergedData.days, ...newRemoteDays];

  // Re-sort days by dayNumber
  mergedData.days.sort((a, b) => a.dayNumber - b.dayNumber);

  return mergedData;
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
    return {
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
      error: null,
      hasLocalChanges: false,
      autoSyncEnabled,
      nextAutoSyncTime: null,
      countdownSeconds: 0,
      // Initialize conflict-related state
      conflictSummary: null,
      showConflictModal: false,
      pendingRemoteData: null,
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
    if (!localTripData) {
      setState((prev) => ({ ...prev, hasLocalChanges: false }));
      return;
    }

    const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
    if (!lastSyncedData) {
      setState((prev) => ({ ...prev, hasLocalChanges: true }));
      return;
    }

    try {
      const parsedLastSynced = JSON.parse(lastSyncedData);
      const hasChanges = JSON.stringify(localTripData) !== JSON.stringify(parsedLastSynced);
      setState((prev) => ({ ...prev, hasLocalChanges: hasChanges }));
    } catch {
      setState((prev) => ({ ...prev, hasLocalChanges: true }));
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

      // Find the trip planner file
      const remoteFile = await service.findTripPlannerFile();

      if (!remoteFile) {
        // No remote file, upload local data if available
        if (localTripData) {
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

      const remoteContent = await service.downloadFile(remoteFile.id);

      if (!remoteContent || remoteContent.trim() === '') {
        // Remote file is empty, upload local data
        if (localTripData) {
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

      // Data is different, check for conflicts

      if (!localTripData) {
        // No local data, just use remote data

        setLocalTripData(remoteData);

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

      const conflictSummary = detectConflicts(localTripData, remoteData);

      if (conflictSummary.hasConflicts) {
        // Show conflict resolution modal
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          conflictSummary,
          showConflictModal: true,
          pendingRemoteData: remoteData,
        }));

        return;
      }

      // No conflicts, data is different but compatible - merge remote additions

      const mergedData = mergeNonConflictingData(localTripData, remoteData);

      console.log('📊 Sync results:', {
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
        setLocalTripData(mergedData);

        // Force a brief delay to ensure state updates are processed
        setTimeout(() => {
          setState((prev) => ({ ...prev }));
        }, 100);
      }

      // Upload merged data

      await service.uploadFile(FILE_NAME, JSON.stringify(mergedData, null, 2), remoteFile.id);

      // Update sync state
      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(mergedData));

      setState((prev) => {
        return {
          ...prev,
          lastSyncTime: now,
          hasLocalChanges: false,
        };
      });

      // Force a refresh to ensure UI updates
      setRefreshKey((prev) => prev + 1);
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

  // Add conflict resolution methods
  const resolveConflicts = useCallback(
    async (resolvedData: TripData) => {
      if (!state.pendingRemoteData) return;

      setState((prev) => ({
        ...prev,
        showConflictModal: false,
        conflictSummary: null,
        pendingRemoteData: null,
      }));

      try {
        const service = getGoogleDriveService();
        const remoteFile = await service.findTripPlannerFile();

        if (remoteFile) {
          // Update local data
          setLocalTripData(resolvedData);

          // Upload resolved data
          await service.uploadFile(FILE_NAME, JSON.stringify(resolvedData, null, 2), remoteFile.id);

          // Update sync state
          const now = new Date();
          localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
          localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(resolvedData));

          setState((prev) => ({
            ...prev,
            lastSyncTime: now,
            hasLocalChanges: false,
            isSyncing: false,
          }));

          setRefreshKey((prev) => prev + 1);
        }
      } catch (error) {
        console.error('Error resolving conflicts:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to resolve conflicts',
          isSyncing: false,
        }));
      }
    },
    [state.pendingRemoteData, setLocalTripData]
  );

  const cancelConflictResolution = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConflictModal: false,
      conflictSummary: null,
      pendingRemoteData: null,
      isSyncing: false,
    }));
  }, []);

  return {
    ...state,
    syncNow,
    forceUpload,
    forceDownload,
    forceReupload,
    clearError,
    toggleAutoSync,
    refreshKey,
    resolveConflicts,
    cancelConflictResolution,
  };
};
