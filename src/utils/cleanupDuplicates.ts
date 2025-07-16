import { TripData } from '../hooks/useTripData';

/**
 * Removes duplicate places from trip data based on place ID
 */
export const cleanupDuplicatePlaces = (tripData: TripData): TripData => {
  const cleanedData = { ...tripData };

  cleanedData.days = tripData.days.map((day) => {
    const seenPlaceIds = new Set<string>();
    const uniquePlaces = day.places.filter((place) => {
      if (seenPlaceIds.has(place.id)) {
        console.warn(`Removing duplicate place "${place.name}" (ID: ${place.id}) from Day ${day.dayNumber}`);
        return false;
      }
      seenPlaceIds.add(place.id);
      return true;
    });

    return {
      ...day,
      places: uniquePlaces,
    };
  });

  return cleanedData;
};

/**
 * Removes duplicate days from trip data based on day ID
 */
export const cleanupDuplicateDays = (tripData: TripData): TripData => {
  const seenDayIds = new Set<string>();
  const uniqueDays = tripData.days.filter((day) => {
    if (seenDayIds.has(day.id)) {
      console.warn(`Removing duplicate day "${day.region}" (ID: ${day.id}, Day Number: ${day.dayNumber})`);
      return false;
    }
    seenDayIds.add(day.id);
    return true;
  });

  return {
    ...tripData,
    days: uniqueDays,
  };
};

/**
 * Removes all duplicates from trip data
 */
export const cleanupAllDuplicates = (tripData: TripData): TripData => {
  let cleanedData = cleanupDuplicateDays(tripData);
  cleanedData = cleanupDuplicatePlaces(cleanedData);
  return cleanedData;
};
