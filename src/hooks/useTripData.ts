import { useEffect, useState } from 'react';
import defaultTripData from '../data/tripData.json';
import { AmenitiesData } from '../lib/amenities';

export interface TripInfo {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  websiteUrl?: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  images: string[];
}

export interface TripDay {
  id: string;
  dayNumber: number;
  region: string;
  driveTimeHours: number;
  driveDistanceKm: number;
  googleMapsEmbedUrl: string;
  accommodationId?: string;  // Links days with same accommodation
  nightNumber?: number;      // Which night of the stay (1, 2, 3, etc.)
  notes?: string;           // Day notes
  accommodation: {
    name: string;
    websiteUrl?: string;
    googleMapsUrl: string;
    googleMapsEmbedUrl?: string;
    description?: string;
    numberOfNights?: number;
    roomType?: string;
    images: string[];
    amenities: AmenitiesData;
  };
  places: Place[];
  images: string[];
}

export interface TripData {
  tripInfo: TripInfo;
  days: TripDay[];
}

const STORAGE_KEY = 'tripPlannerData';

export const useTripData = () => {
  const [tripData, setTripData] = useState<TripData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultTripData;
    } catch (error) {
      console.error('Error loading trip data:', error);
      return defaultTripData;
    }
  });

  // Save to localStorage whenever tripData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tripData));
    } catch (error) {
      console.error('Error saving trip data:', error);
    }
  }, [tripData]);

  // Trip Info CRUD
  const updateTripInfo = (newTripInfo: Partial<TripInfo>) => {
    setTripData(prev => {
      const updatedTripInfo = { ...prev.tripInfo, ...newTripInfo };
      
      // If startDate is being updated, recalculate endDate based on number of days
      if (newTripInfo.startDate && prev.days.length > 0) {
        const newEndDate = calculateEndDate(newTripInfo.startDate, prev.days.length);
        updatedTripInfo.endDate = newEndDate;
      }
      
      return {
        ...prev,
        tripInfo: updatedTripInfo
      };
    });
  };

  // Helper function to calculate end date based on start date and number of days
  const calculateEndDate = (startDate: string, numberOfDays: number): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    // If there are no days, end date should be the same as start date
    if (numberOfDays === 0) {
      return startDate;
    }
    
    
    end.setDate(start.getDate() + numberOfDays -1);
    return end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Day CRUD operations
  const addDay = (dayData: Omit<TripDay, 'id' | 'dayNumber'>) => {
    const newDay: TripDay = {
      ...dayData,
      id: Date.now().toString(),
      dayNumber: tripData.days.length + 1
    };
    
    setTripData(prev => {
      const newDays = [...prev.days, newDay];
      const newEndDate = calculateEndDate(prev.tripInfo.startDate, newDays.length);
      
      return {
        ...prev,
        tripInfo: {
          ...prev.tripInfo,
          endDate: newEndDate
        },
        days: newDays
      };
    });
    
    return newDay.id;
  };

  // Add day and link to accommodation in one operation
  const addDayAndLinkAccommodation = (
    dayData: Omit<TripDay, 'id' | 'dayNumber'>, 
    existingAccommodationDayIds: string[]
  ) => {
    const newDayId = Date.now().toString();
    const accommodationId = existingAccommodationDayIds.length > 0 
      ? tripData.days.find(d => existingAccommodationDayIds.includes(d.id))?.accommodationId || generateAccommodationId()
      : generateAccommodationId();
    
    const newDay: TripDay = {
      ...dayData,
      id: newDayId,
      dayNumber: tripData.days.length + 1,
      accommodationId
    };
    
    setTripData(prev => {
      const updatedDays = [...prev.days, newDay];
      const newEndDate = calculateEndDate(prev.tripInfo.startDate, updatedDays.length);
      
      // Find all days that will be linked (existing + new)
      const allLinkedDayIds = [...existingAccommodationDayIds, newDayId];
      const linkedDays = updatedDays.filter(d => allLinkedDayIds.includes(d.id));
      
      // Sort by dayNumber to assign correct nightNumber
      linkedDays.sort((a, b) => a.dayNumber - b.dayNumber);
      
      // Update all days with proper accommodationId, nightNumber, and accommodation data
      return {
        ...prev,
        tripInfo: {
          ...prev.tripInfo,
          endDate: newEndDate
        },
        days: updatedDays.map(day => {
          const linkedIndex = linkedDays.findIndex(ld => ld.id === day.id);
          if (linkedIndex !== -1) {
            return {
              ...day,
              accommodationId,
              nightNumber: linkedIndex + 1,
              accommodation: dayData.accommodation
            };
          }
          return day;
        })
      };
    });
    
    return newDayId;
  };

  // Helper function to generate accommodation ID
  const generateAccommodationId = (): string => {
    return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get accommodation info for a day
  const getAccommodationInfo = (dayId: string) => {
    const day = tripData.days.find(d => d.id === dayId);
    if (!day) return null;

    const accommodationDays = tripData.days.filter(d => 
      d.accommodationId === day.accommodationId
    ).sort((a, b) => (a.nightNumber || 0) - (b.nightNumber || 0));

    return {
      currentDay: day,
      accommodationDays,
      totalNights: accommodationDays.length,
      currentNight: day.nightNumber || 1,
      isMultiNight: accommodationDays.length > 1
    };
  };

  // Check if previous day accommodation has unused nights
  const checkUnusedNights = (dayNumber: number) => {
    const previousDay = tripData.days.find(d => d.dayNumber === dayNumber - 1);
    if (!previousDay) return null;

    const accommodationInfo = getAccommodationInfo(previousDay.id);
    if (!accommodationInfo) return null;

    const { accommodationDays, currentDay } = accommodationInfo;
    const totalBookedNights = currentDay.accommodation.numberOfNights || 1;
    const usedNights = accommodationDays.length;
    const unusedNights = totalBookedNights - usedNights;

    return {
      previousDay,
      accommodationName: currentDay.accommodation.name,
      totalBookedNights,
      usedNights,
      unusedNights,
      hasUnusedNights: unusedNights > 0
    };
  };

  // Adjust previous accommodation's night count
  const adjustPreviousAccommodationNights = (dayId: string, newNightCount: number) => {
    const day = tripData.days.find(d => d.id === dayId);
    if (!day) return;

    // Update all days with the same accommodation ID
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(d => 
        d.accommodationId === day.accommodationId || d.id === day.id
          ? {
              ...d,
              accommodation: {
                ...d.accommodation,
                numberOfNights: newNightCount
              }
            }
          : d
      )
    }));
  };

  const updateDay = (dayId: string, updates: Partial<TripDay>) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, ...updates } : day
      )
    }));
  };

  // Update notes for a day
  const updateDayNotes = (dayId: string, notes: string) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, notes: notes.trim() || undefined } : day
      )
    }));
  };

  const deleteDay = (dayId: string) => {
    setTripData(prev => {
      const dayToDelete = prev.days.find(d => d.id === dayId);
      const filteredDays = prev.days
        .filter(day => day.id !== dayId)
        .map((day, index) => ({ ...day, dayNumber: index + 1 }));
      
      const newEndDate = calculateEndDate(prev.tripInfo.startDate, filteredDays.length);
      
      // If the deleted day had an accommodationId, we need to reassign nightNumbers
      if (dayToDelete?.accommodationId) {
        const linkedDays = filteredDays.filter(d => d.accommodationId === dayToDelete.accommodationId);
        linkedDays.sort((a, b) => a.dayNumber - b.dayNumber);
        
        // Update nightNumbers for remaining linked days
        linkedDays.forEach((day, index) => {
          const dayIndex = filteredDays.findIndex(d => d.id === day.id);
          if (dayIndex !== -1) {
            filteredDays[dayIndex].nightNumber = index + 1;
          }
        });
      }
      
      return {
        ...prev,
        tripInfo: {
          ...prev.tripInfo,
          endDate: newEndDate
        },
        days: filteredDays
      };
    });
  };

  // Place CRUD operations
  const addPlace = (dayId: string, placeData: Omit<Place, 'id'>) => {
    const newPlace: Place = {
      ...placeData,
      id: Date.now().toString()
    };

    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, places: [...day.places, newPlace] }
          : day
      )
    }));
  };

  const updatePlace = (dayId: string, placeId: string, updates: Partial<Place>) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? {
              ...day,
              places: day.places.map(place => 
                place.id === placeId ? { ...place, ...updates } : place
              )
            }
          : day
      )
    }));
  };

  const deletePlace = (dayId: string, placeId: string) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, places: day.places.filter(place => place.id !== placeId) }
          : day
      )
    }));
  };

  // Find all days that share the same accommodation
  const findLinkedAccommodationDays = (dayId: string) => {
    const day = tripData.days.find(d => d.id === dayId);
    if (!day || !day.accommodationId) {
      return { linkedDays: [], isLinked: false };
    }

    const linkedDays = tripData.days.filter(d => 
      d.accommodationId === day.accommodationId && d.id !== dayId
    );

    return {
      linkedDays,
      isLinked: linkedDays.length > 0,
      currentDay: day
    };
  };

  // Accommodation CRUD
  const updateAccommodation = (dayId: string, accommodationData: TripDay['accommodation']) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, accommodation: accommodationData }
          : day
      )
    }));
  };

  // Update accommodation for all linked days
  const updateLinkedAccommodation = (dayId: string, accommodationData: TripDay['accommodation']) => {
    const day = tripData.days.find(d => d.id === dayId);
    if (!day || !day.accommodationId) {
      // If no accommodationId, just update the single day
      updateAccommodation(dayId, accommodationData);
      return;
    }

    setTripData(prev => ({
      ...prev,
      days: prev.days.map(d => 
        d.accommodationId === day.accommodationId
          ? { ...d, accommodation: accommodationData }
          : d
      )
    }));
  };

  // Place Image management
  const addPlaceImage = (dayId: string, placeId: string, imageUrl: string) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? {
              ...day,
              places: day.places.map(place => 
                place.id === placeId 
                  ? { ...place, images: [...place.images, imageUrl] }
                  : place
              )
            }
          : day
      )
    }));
  };

  const removePlaceImage = (dayId: string, placeId: string, imageUrl: string) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? {
              ...day,
              places: day.places.map(place => 
                place.id === placeId 
                  ? { ...place, images: place.images.filter(img => img !== imageUrl) }
                  : place
              )
            }
          : day
      )
    }));
  };

  // Import/Export functionality
  const exportData = () => {
    const dataStr = JSON.stringify(tripData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `trip-${tripData.tripInfo.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Basic validation
          if (!importedData.tripInfo || !importedData.days) {
            throw new Error('Invalid trip data format');
          }
          
          setTripData(importedData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const resetData = () => {
    // Use today's date as the start date for a fresh start
    const today = new Date().toISOString().split('T')[0];
    const correctEndDate = calculateEndDate(today, defaultTripData.days.length);
    
    const correctedTripData = {
      ...defaultTripData,
      tripInfo: {
        ...defaultTripData.tripInfo,
        startDate: today,
        endDate: correctEndDate
      }
    };
    
    setTripData(correctedTripData);
    
    // Also clear localStorage to ensure complete reset
    localStorage.removeItem(STORAGE_KEY);
  };

  const setFullTripData = (newTripData: TripData) => {
    setTripData(newTripData);
  };

  return {
    tripData,
    // Trip Info
    updateTripInfo,
    // Days
    addDay,
    addDayAndLinkAccommodation,
    updateDay,
    updateDayNotes,
    deleteDay,
    // Places
    addPlace,
    updatePlace,
    deletePlace,
    // Accommodation
    updateAccommodation,
    updateLinkedAccommodation,
    findLinkedAccommodationDays,
    getAccommodationInfo,
    checkUnusedNights,
    adjustPreviousAccommodationNights,
    // Place Images
    addPlaceImage,
    removePlaceImage,
    // Import/Export
    exportData,
    importData,
    resetData,
    setFullTripData
  };
}; 