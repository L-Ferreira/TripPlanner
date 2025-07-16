import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import defaultTripData from '../data/tripData.json';
import { getGoogleDriveService } from '../hooks/useGoogleAuth';
import { Place, TripData, TripDay, TripInfo } from '../hooks/useTripData';

// Interfaces
export interface SyncState {
  tripData: TripData;
  hasLocalChanges: boolean;
  isSyncing: boolean;
  isAuthenticated: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  autoSyncEnabled: boolean;
  nextAutoSyncTime: Date | null;
  countdownSeconds: number;
}

export interface SyncActions {
  // Trip data actions
  updateTripData: (newData: TripData) => void;
  setFullTripData: (newData: TripData) => void;

  // Trip operations
  updateTripInfo: (newTripInfo: Partial<TripInfo>) => void;
  addDay: (dayData: Omit<TripDay, 'id' | 'dayNumber'>) => string;
  updateDay: (dayId: string, updates: Partial<TripDay>) => void;
  updateDayNotes: (dayId: string, notes: string) => void;
  deleteDay: (dayId: string) => void;
  addPlace: (dayId: string, placeData: Omit<Place, 'id'>) => void;
  updatePlace: (dayId: string, placeId: string, updates: Partial<Place>) => void;
  deletePlace: (dayId: string, placeId: string) => void;

  // Sync actions
  syncNow: () => Promise<void>;
  forceUpload: () => Promise<void>;
  forceDownload: () => Promise<void>;
  forceReupload: () => Promise<void>;

  // Auth actions
  setAuthenticated: (isAuth: boolean) => void;

  // Utility actions
  clearError: () => void;
  toggleAutoSync: () => void;
}

// Context
const SyncContext = createContext<(SyncState & SyncActions) | null>(null);

// Constants
const STORAGE_KEY = 'tripPlannerData';
const LAST_SYNC_KEY = 'lastSyncTime';
const LAST_SYNCED_DATA_KEY = 'lastSyncedData';
const AUTO_SYNC_ENABLED_KEY = 'autoSyncEnabled';
const FILE_NAME = 'trip-planner-data.json';
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Helper functions
const isValidTripData = (data: any): data is TripData => {
  if (!data || typeof data !== 'object') return false;
  if (!data.tripInfo || typeof data.tripInfo !== 'object') return false;
  if (!Array.isArray(data.days)) return false;
  if (!data.tripInfo.name || typeof data.tripInfo.name !== 'string') return false;
  return true;
};

const mergeData = (localData: TripData, remoteData: TripData): TripData => {
  console.log('🔄 Properly merging local and remote changes');

  // Create a map of local days by day number for easy lookup
  const localDaysByNumber = new Map<number, TripDay>();
  localData.days.forEach((day: TripDay) => {
    localDaysByNumber.set(day.dayNumber, day);
  });

  // Create a map of remote days by day number for easy lookup
  const remoteDaysByNumber = new Map<number, TripDay>();
  remoteData.days.forEach((day: TripDay) => {
    remoteDaysByNumber.set(day.dayNumber, day);
  });

  // Start with the trip info that has the most recent changes
  // For simplicity, we'll use the one with more days, or remote if equal
  const mergedTripInfo = localData.days.length > remoteData.days.length ? localData.tripInfo : remoteData.tripInfo;

  // Get all day numbers from both local and remote
  const allDayNumbers = new Set([...localDaysByNumber.keys(), ...remoteDaysByNumber.keys()]);

  // Merge each day
  const mergedDays = Array.from(allDayNumbers)
    .sort((a, b) => a - b)
    .map((dayNumber) => {
      const localDay = localDaysByNumber.get(dayNumber);
      const remoteDay = remoteDaysByNumber.get(dayNumber);

      // If only one version exists, use it (we know at least one exists since dayNumber came from one of the sets)
      if (!localDay) return remoteDay!;
      if (!remoteDay) return localDay;

      // Both versions exist, merge them
      const mergedDay = { ...localDay }; // Start with local as base

      // Merge places by creating a map of all places from both versions
      const localPlacesById = new Map<string, Place>();
      localDay.places.forEach((place: Place) => {
        localPlacesById.set(place.id, place);
      });

      const remotePlacesById = new Map<string, Place>();
      remoteDay.places.forEach((place: Place) => {
        remotePlacesById.set(place.id, place);
      });

      // Get all place IDs from both versions
      const allPlaceIds = new Set([...localPlacesById.keys(), ...remotePlacesById.keys()]);

      // Merge places - prefer local version if both exist, otherwise take the one that exists
      const mergedPlaces = Array.from(allPlaceIds).map((placeId) => {
        const localPlace = localPlacesById.get(placeId);
        const remotePlace = remotePlacesById.get(placeId);

        if (localPlace && remotePlace) {
          // Both exist, merge them (prefer local for most fields, but merge images)
          const mergedImages = Array.from(new Set([...localPlace.images, ...remotePlace.images]));

          return {
            ...localPlace,
            images: mergedImages,
          };
        }

        // Only one exists, use it (we know at least one exists since we got the ID from the sets)
        return localPlace || remotePlace!;
      });

      // Update the merged day with merged places
      mergedDay.places = mergedPlaces;

      // For other fields like accommodation, prefer the version with more detailed info
      if (
        remoteDay.accommodation &&
        Object.keys(remoteDay.accommodation).length > Object.keys(localDay.accommodation).length
      ) {
        mergedDay.accommodation = remoteDay.accommodation;
      }

      // Merge images at day level
      const mergedDayImages = Array.from(new Set([...localDay.images, ...remoteDay.images]));
      mergedDay.images = mergedDayImages;

      return mergedDay;
    });

  const mergedData = {
    tripInfo: mergedTripInfo,
    days: mergedDays,
  };

  console.log('✅ Merge completed:', {
    localDays: localData.days.length,
    remoteDays: remoteData.days.length,
    mergedDays: mergedDays.length,
    totalPlaces: mergedDays.reduce((sum, day) => sum + day.places.length, 0),
  });

  return mergedData;
};

// Helper function to calculate end date based on start date and number of days
const calculateEndDate = (startDate: string, numberOfDays: number): string => {
  const start = new Date(startDate);
  const end = new Date(start);

  // If there are no days, end date should be the same as start date
  if (numberOfDays === 0) {
    return startDate;
  }

  // Add numberOfDays - 1 to get the end date (since we're counting nights)
  end.setDate(start.getDate() + numberOfDays - 1);
  return end.toISOString().split('T')[0];
};

// Provider Component
export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data
  const [state, setState] = useState<SyncState>(() => {
    // Load trip data from localStorage
    let tripData = defaultTripData;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        tripData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading trip data:', error);
    }

    // Load auto-sync preference
    const autoSyncEnabled = (() => {
      try {
        const saved = localStorage.getItem(AUTO_SYNC_ENABLED_KEY);
        return saved !== null ? JSON.parse(saved) : true;
      } catch {
        return true;
      }
    })();

    // Load last sync time
    const lastSyncTime = (() => {
      try {
        const saved = localStorage.getItem(LAST_SYNC_KEY);
        return saved ? new Date(saved) : null;
      } catch {
        return null;
      }
    })();

    // Check if there are local changes
    const hasLocalChanges = (() => {
      try {
        const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
        if (!lastSyncedData) return true;
        const parsedLastSynced = JSON.parse(lastSyncedData);
        return JSON.stringify(tripData) !== JSON.stringify(parsedLastSynced);
      } catch {
        return true;
      }
    })();

    console.log('🔧 SyncProvider initialized:', {
      hasLocalChanges,
      autoSyncEnabled,
      lastSyncTime,
      tripDataDays: tripData.days.length,
    });

    return {
      tripData,
      hasLocalChanges,
      isSyncing: false,
      isAuthenticated: false,
      lastSyncTime,
      error: null,
      autoSyncEnabled,
      nextAutoSyncTime: null,
      countdownSeconds: 0,
    };
  });

  const autoSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save trip data to localStorage and update sync state
  const updateTripData = useCallback((newData: TripData) => {
    console.log('📝 Trip data updated');

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving trip data:', error);
    }

    // Check if there are local changes
    const hasLocalChanges = (() => {
      try {
        const lastSyncedData = localStorage.getItem(LAST_SYNCED_DATA_KEY);
        if (!lastSyncedData) return true;
        const parsedLastSynced = JSON.parse(lastSyncedData);
        return JSON.stringify(newData) !== JSON.stringify(parsedLastSynced);
      } catch {
        return true;
      }
    })();

    console.log('🔍 Local changes detected:', hasLocalChanges);

    setState((prev) => ({
      ...prev,
      tripData: newData,
      hasLocalChanges,
    }));
  }, []);

  const setFullTripData = useCallback(
    (newData: TripData) => {
      console.log('📥 Full trip data replacement');
      updateTripData(newData);
    },
    [updateTripData]
  );

  const setAuthenticated = useCallback((isAuth: boolean) => {
    console.log('🔐 Authentication state changed:', isAuth);
    setState((prev) => ({ ...prev, isAuthenticated: isAuth }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const toggleAutoSync = useCallback(() => {
    setState((prev) => {
      const newValue = !prev.autoSyncEnabled;
      localStorage.setItem(AUTO_SYNC_ENABLED_KEY, JSON.stringify(newValue));
      console.log('🔄 Auto-sync toggled:', newValue);
      return { ...prev, autoSyncEnabled: newValue };
    });
  }, []);

  // Sync operations
  const syncNow = useCallback(async () => {
    if (!state.isAuthenticated) {
      setState((prev) => ({ ...prev, error: 'Not authenticated with Google Drive' }));
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('🔄 Starting sync operation');

      const remoteFile = await service.findTripPlannerFile();

      if (!remoteFile) {
        console.log('📤 No remote file found, uploading local data');
        await service.uploadFile(FILE_NAME, JSON.stringify(state.tripData, null, 2));

        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(state.tripData));

        setState((prev) => ({
          ...prev,
          lastSyncTime: now,
          hasLocalChanges: false,
          isSyncing: false,
        }));
        return;
      }

      const remoteContent = await service.downloadFile(remoteFile.id);

      if (!remoteContent || remoteContent.trim() === '') {
        console.log('📤 Remote file is empty, uploading local data');
        await service.uploadFile(FILE_NAME, JSON.stringify(state.tripData, null, 2), remoteFile.id);

        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(state.tripData));

        setState((prev) => ({
          ...prev,
          lastSyncTime: now,
          hasLocalChanges: false,
          isSyncing: false,
        }));
        return;
      }

      let remoteData: TripData;
      try {
        remoteData = JSON.parse(remoteContent);
        if (!isValidTripData(remoteData)) {
          throw new Error('Invalid trip data structure');
        }
      } catch (parseError) {
        console.error('Failed to parse remote data:', parseError);
        setState((prev) => ({
          ...prev,
          error: 'Remote file contains invalid data',
          isSyncing: false,
        }));
        return;
      }

      // Check if data is identical
      if (JSON.stringify(state.tripData) === JSON.stringify(remoteData)) {
        console.log('✅ Data is identical, updating sync time');
        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(remoteData));

        setState((prev) => ({
          ...prev,
          lastSyncTime: now,
          hasLocalChanges: false,
          isSyncing: false,
        }));
        return;
      }

      // Merge data
      const mergedData = mergeData(state.tripData, remoteData);

      // Update local data if needed
      if (JSON.stringify(state.tripData) !== JSON.stringify(mergedData)) {
        console.log('🔄 Updating local data with merged result');
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
        } catch (error) {
          console.error('Error saving merged data:', error);
        }
      }

      // Upload merged data
      console.log('📤 Uploading merged data');
      await service.uploadFile(FILE_NAME, JSON.stringify(mergedData, null, 2), remoteFile.id);

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(mergedData));

      setState((prev) => ({
        ...prev,
        tripData: mergedData,
        lastSyncTime: now,
        hasLocalChanges: false,
        isSyncing: false,
      }));

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed',
        isSyncing: false,
      }));
    }
  }, [state.isAuthenticated, state.tripData]);

  const forceUpload = useCallback(async () => {
    if (!state.isAuthenticated) {
      setState((prev) => ({ ...prev, error: 'Not authenticated with Google Drive' }));
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('📤 Force uploading local data');

      const remoteFile = await service.findTripPlannerFile();

      if (remoteFile) {
        await service.uploadFile(FILE_NAME, JSON.stringify(state.tripData, null, 2), remoteFile.id);
      } else {
        await service.uploadFile(FILE_NAME, JSON.stringify(state.tripData, null, 2));
      }

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(state.tripData));

      setState((prev) => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
        isSyncing: false,
      }));

      console.log('✅ Force upload completed');
    } catch (error) {
      console.error('Force upload failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
        isSyncing: false,
      }));
    }
  }, [state.isAuthenticated, state.tripData]);

  const forceDownload = useCallback(async () => {
    if (!state.isAuthenticated) {
      setState((prev) => ({ ...prev, error: 'Not authenticated with Google Drive' }));
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('📥 Force downloading remote data');

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

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
      } catch (error) {
        console.error('Error saving downloaded data:', error);
      }

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(remoteData));

      setState((prev) => ({
        ...prev,
        tripData: remoteData,
        lastSyncTime: now,
        hasLocalChanges: false,
        isSyncing: false,
      }));

      console.log('✅ Force download completed');
    } catch (error) {
      console.error('Force download failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Download failed',
        isSyncing: false,
      }));
    }
  }, [state.isAuthenticated]);

  const forceReupload = useCallback(async () => {
    if (!state.isAuthenticated) {
      setState((prev) => ({ ...prev, error: 'Not authenticated with Google Drive' }));
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const service = getGoogleDriveService();
      console.log('🔄 Force re-upload: deleting and recreating file');

      const existingFile = await service.findTripPlannerFile();
      if (existingFile) {
        await service.deleteFile(existingFile.id);
      }

      await service.uploadFile(FILE_NAME, JSON.stringify(state.tripData, null, 2));

      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      localStorage.setItem(LAST_SYNCED_DATA_KEY, JSON.stringify(state.tripData));

      setState((prev) => ({
        ...prev,
        lastSyncTime: now,
        hasLocalChanges: false,
        isSyncing: false,
      }));

      console.log('✅ Force re-upload completed');
    } catch (error) {
      console.error('Force re-upload failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Re-upload failed',
        isSyncing: false,
      }));
    }
  }, [state.isAuthenticated, state.tripData]);

  // Trip operations
  const updateTripInfo = useCallback(
    (newTripInfo: Partial<TripInfo>) => {
      const updatedTripInfo = { ...state.tripData.tripInfo, ...newTripInfo };

      // If startDate is being updated, recalculate endDate based on number of days
      if (newTripInfo.startDate && state.tripData.days.length > 0) {
        const newEndDate = calculateEndDate(newTripInfo.startDate, state.tripData.days.length);
        updatedTripInfo.endDate = newEndDate;
      }

      const newTripData = {
        ...state.tripData,
        tripInfo: updatedTripInfo,
      };

      updateTripData(newTripData);
    },
    [state.tripData, updateTripData]
  );

  const addDay = useCallback(
    (dayData: Omit<TripDay, 'id' | 'dayNumber'>) => {
      const newDay: TripDay = {
        ...dayData,
        id: Date.now().toString(),
        dayNumber: state.tripData.days.length + 1,
      };

      const newDays = [...state.tripData.days, newDay];
      const newEndDate = calculateEndDate(state.tripData.tripInfo.startDate, newDays.length);

      updateTripData({
        ...state.tripData,
        days: newDays,
        tripInfo: {
          ...state.tripData.tripInfo,
          endDate: newEndDate,
        },
      });

      return newDay.id;
    },
    [state.tripData, updateTripData]
  );

  const updateDay = useCallback(
    (dayId: string, updates: Partial<TripDay>) => {
      updateTripData({
        ...state.tripData,
        days: state.tripData.days.map((day) => (day.id === dayId ? { ...day, ...updates } : day)),
      });
    },
    [state.tripData, updateTripData]
  );

  const updateDayNotes = useCallback(
    (dayId: string, notes: string) => {
      updateTripData({
        ...state.tripData,
        days: state.tripData.days.map((day) => (day.id === dayId ? { ...day, notes: notes } : day)),
      });
    },
    [state.tripData, updateTripData]
  );

  const deleteDay = useCallback(
    (dayId: string) => {
      const filteredDays = state.tripData.days
        .filter((day) => day.id !== dayId)
        .map((day, index) => ({ ...day, dayNumber: index + 1 }));

      const newEndDate = calculateEndDate(state.tripData.tripInfo.startDate, filteredDays.length);

      updateTripData({
        ...state.tripData,
        days: filteredDays,
        tripInfo: {
          ...state.tripData.tripInfo,
          endDate: newEndDate,
        },
      });
    },
    [state.tripData, updateTripData]
  );

  const addPlace = useCallback(
    (dayId: string, placeData: Omit<Place, 'id'>) => {
      const newPlace: Place = {
        ...placeData,
        id: Date.now().toString(),
      };

      updateTripData({
        ...state.tripData,
        days: state.tripData.days.map((day) =>
          day.id === dayId ? { ...day, places: [...day.places, newPlace] } : day
        ),
      });
    },
    [state.tripData, updateTripData]
  );

  const updatePlace = useCallback(
    (dayId: string, placeId: string, updates: Partial<Place>) => {
      updateTripData({
        ...state.tripData,
        days: state.tripData.days.map((day) =>
          day.id === dayId
            ? { ...day, places: day.places.map((place) => (place.id === placeId ? { ...place, ...updates } : place)) }
            : day
        ),
      });
    },
    [state.tripData, updateTripData]
  );

  const deletePlace = useCallback(
    (dayId: string, placeId: string) => {
      updateTripData({
        ...state.tripData,
        days: state.tripData.days.map((day) =>
          day.id === dayId ? { ...day, places: day.places.filter((place) => place.id !== placeId) } : day
        ),
      });
    },
    [state.tripData, updateTripData]
  );

  // Auto-sync setup
  useEffect(() => {
    if (state.autoSyncEnabled && state.isAuthenticated && !state.isSyncing) {
      console.log('🔄 Setting up auto-sync');

      const nextSyncTime = new Date(Date.now() + AUTO_SYNC_INTERVAL);
      setState((prev) => ({ ...prev, nextAutoSyncTime: nextSyncTime }));

      autoSyncIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-sync triggered');
        syncNow();
      }, AUTO_SYNC_INTERVAL);

      return () => {
        if (autoSyncIntervalRef.current) {
          clearInterval(autoSyncIntervalRef.current);
        }
      };
    } else {
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
        autoSyncIntervalRef.current = null;
      }
      setState((prev) => ({ ...prev, nextAutoSyncTime: null }));
    }
  }, [state.autoSyncEnabled, state.isAuthenticated, state.isSyncing, syncNow]);

  // Countdown timer
  useEffect(() => {
    if (state.nextAutoSyncTime && state.autoSyncEnabled) {
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

      updateCountdown();
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
  }, [state.nextAutoSyncTime, state.autoSyncEnabled]);

  const contextValue = {
    ...state,
    updateTripData,
    setFullTripData,
    syncNow,
    forceUpload,
    forceDownload,
    forceReupload,
    setAuthenticated,
    clearError,
    toggleAutoSync,
    updateTripInfo,
    addDay,
    updateDay,
    updateDayNotes,
    deleteDay,
    addPlace,
    updatePlace,
    deletePlace,
  };

  return <SyncContext.Provider value={contextValue}>{children}</SyncContext.Provider>;
};

// Hook to use the context
export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
};
