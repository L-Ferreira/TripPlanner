import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ConflictResolutionModal } from '../components/ConflictResolutionModal';
import defaultTripData from '../data/tripData.json';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';
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

// Provider Component
export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SyncState>(() => {
    const savedData = localStorage.getItem('tripData');
    const parsedData = savedData ? JSON.parse(savedData) : defaultTripData;
    return {
      tripData: parsedData,
      hasLocalChanges: false,
      isSyncing: false,
      isAuthenticated: false,
      lastSyncTime: null,
      error: null,
      autoSyncEnabled: true,
      nextAutoSyncTime: null,
      countdownSeconds: 0,
    };
  });

  // Use the Google Drive sync hook with conflict detection
  const syncHook = useGoogleDriveSync(state.isAuthenticated, state.tripData, (newData: TripData) => {
    setState((prev) => ({ ...prev, tripData: newData }));
    localStorage.setItem('tripData', JSON.stringify(newData));
  });

  // Sync the hook state with our context state
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      hasLocalChanges: syncHook.hasLocalChanges,
      isSyncing: syncHook.isSyncing,
      lastSyncTime: syncHook.lastSyncTime,
      error: syncHook.error,
      autoSyncEnabled: syncHook.autoSyncEnabled,
      nextAutoSyncTime: syncHook.nextAutoSyncTime,
      countdownSeconds: syncHook.countdownSeconds,
    }));
  }, [
    syncHook.hasLocalChanges,
    syncHook.isSyncing,
    syncHook.lastSyncTime,
    syncHook.error,
    syncHook.autoSyncEnabled,
    syncHook.nextAutoSyncTime,
    syncHook.countdownSeconds,
  ]);

  // Update trip data and save to localStorage
  const updateTripData = useCallback((newData: TripData) => {
    setState((prev) => ({ ...prev, tripData: newData }));
    localStorage.setItem('tripData', JSON.stringify(newData));
  }, []);

  // Set full trip data
  const setFullTripData = useCallback((newData: TripData) => {
    setState((prev) => ({ ...prev, tripData: newData }));
    localStorage.setItem('tripData', JSON.stringify(newData));
  }, []);

  // Set authenticated state
  const setAuthenticated = useCallback((isAuth: boolean) => {
    setState((prev) => ({ ...prev, isAuthenticated: isAuth }));
  }, []);

  // Trip operations
  const updateTripInfo = useCallback((newTripInfo: Partial<TripInfo>) => {
    setState((prev) => {
      const updatedTripInfo = { ...prev.tripData.tripInfo, ...newTripInfo };

      // If startDate is being updated, recalculate endDate based on number of days
      if (newTripInfo.startDate && prev.tripData.days.length > 0) {
        const newEndDate = calculateEndDate(newTripInfo.startDate, prev.tripData.days.length);
        updatedTripInfo.endDate = newEndDate;
      }

      const newData = {
        ...prev.tripData,
        tripInfo: updatedTripInfo,
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  // Helper function to calculate end date based on start date and number of days
  const calculateEndDate = (startDate: string, numberOfDays: number): string => {
    const start = new Date(startDate);
    const end = new Date(start);

    // If there are no days, end date should be the same as start date
    if (numberOfDays === 0) {
      return startDate;
    }

    end.setDate(start.getDate() + numberOfDays - 1);
    return end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Day operations
  const addDay = useCallback((dayData: Omit<TripDay, 'id' | 'dayNumber'>) => {
    const newId = Date.now().toString();
    setState((prev) => {
      const newDay: TripDay = {
        ...dayData,
        id: newId,
        dayNumber: prev.tripData.days.length + 1,
      };

      const newDays = [...prev.tripData.days, newDay];
      const newEndDate = calculateEndDate(prev.tripData.tripInfo.startDate, newDays.length);

      const newData = {
        ...prev.tripData,
        tripInfo: {
          ...prev.tripData.tripInfo,
          endDate: newEndDate,
        },
        days: newDays,
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
    return newId;
  }, []);

  const updateDay = useCallback((dayId: string, updates: Partial<TripDay>) => {
    setState((prev) => {
      const newData = {
        ...prev.tripData,
        days: prev.tripData.days.map((day) => (day.id === dayId ? { ...day, ...updates } : day)),
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  const updateDayNotes = useCallback((dayId: string, notes: string) => {
    setState((prev) => {
      const newData = {
        ...prev.tripData,
        days: prev.tripData.days.map((day) => (day.id === dayId ? { ...day, notes: notes.trim() || undefined } : day)),
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  const deleteDay = useCallback((dayId: string) => {
    setState((prev) => {
      const filteredDays = prev.tripData.days
        .filter((day) => day.id !== dayId)
        .map((day, index) => ({ ...day, dayNumber: index + 1 }));

      const newEndDate = calculateEndDate(prev.tripData.tripInfo.startDate, filteredDays.length);

      const newData = {
        ...prev.tripData,
        tripInfo: {
          ...prev.tripData.tripInfo,
          endDate: newEndDate,
        },
        days: filteredDays,
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  // Place operations
  const addPlace = useCallback((dayId: string, placeData: Omit<Place, 'id'>) => {
    setState((prev) => {
      const newPlace: Place = {
        ...placeData,
        id: Date.now().toString(),
      };

      const newData = {
        ...prev.tripData,
        days: prev.tripData.days.map((day) => (day.id === dayId ? { ...day, places: [...day.places, newPlace] } : day)),
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  const updatePlace = useCallback((dayId: string, placeId: string, updates: Partial<Place>) => {
    setState((prev) => {
      const newData = {
        ...prev.tripData,
        days: prev.tripData.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                places: day.places.map((place) => (place.id === placeId ? { ...place, ...updates } : place)),
              }
            : day
        ),
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  const deletePlace = useCallback((dayId: string, placeId: string) => {
    setState((prev) => {
      const newData = {
        ...prev.tripData,
        days: prev.tripData.days.map((day) =>
          day.id === dayId ? { ...day, places: day.places.filter((place) => place.id !== placeId) } : day
        ),
      };

      localStorage.setItem('tripData', JSON.stringify(newData));
      return { ...prev, tripData: newData };
    });
  }, []);

  // Context value - use sync functions from the hook
  const contextValue: SyncState & SyncActions = {
    // State
    tripData: state.tripData,
    hasLocalChanges: syncHook.hasLocalChanges,
    isSyncing: syncHook.isSyncing,
    isAuthenticated: state.isAuthenticated,
    lastSyncTime: syncHook.lastSyncTime,
    error: syncHook.error,
    autoSyncEnabled: syncHook.autoSyncEnabled,
    nextAutoSyncTime: syncHook.nextAutoSyncTime,
    countdownSeconds: syncHook.countdownSeconds,

    // Actions - use sync functions from the hook
    updateTripData,
    setFullTripData,
    syncNow: syncHook.syncNow,
    forceUpload: syncHook.forceUpload,
    forceDownload: syncHook.forceDownload,
    forceReupload: syncHook.forceReupload,
    setAuthenticated,
    clearError: syncHook.clearError,
    toggleAutoSync: syncHook.toggleAutoSync,
    updateTripInfo,
    addDay,
    updateDay,
    updateDayNotes,
    deleteDay,
    addPlace,
    updatePlace,
    deletePlace,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
      {/* Conflict Resolution Modal */}
      {syncHook.showConflictModal && syncHook.conflictSummary && syncHook.pendingRemoteData && (
        <ConflictResolutionModal
          conflicts={syncHook.conflictSummary.conflicts}
          localData={state.tripData}
          remoteData={syncHook.pendingRemoteData}
          onResolve={syncHook.resolveConflicts}
          onCancel={syncHook.cancelConflictResolution}
        />
      )}
    </SyncContext.Provider>
  );
};

// Hook to use the context
export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
};
