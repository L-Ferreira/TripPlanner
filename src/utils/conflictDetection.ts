import { Place, TripData, TripDay, TripInfo } from '../hooks/useTripData';

export interface Conflict {
  id: string;
  type: 'tripInfo' | 'day' | 'accommodation' | 'place' | 'dayDeleted' | 'dayAdded' | 'placeDeleted' | 'placeAdded';
  path: string; // Human readable path like "Day 2 - Restaurant ABC"
  field: string; // Field name like "name", "region", "notes"
  localValue: any;
  remoteValue: any;
  context?: any; // Additional context like dayNumber, dayId, placeId
}

export interface ConflictSummary {
  hasConflicts: boolean;
  conflicts: Conflict[];
  totalConflicts: number;
}

export const detectConflicts = (localData: TripData, remoteData: TripData): ConflictSummary => {
  const conflicts: Conflict[] = [];

  // 1. Check tripInfo conflicts
  const tripInfoConflicts = detectTripInfoConflicts(localData.tripInfo, remoteData.tripInfo);
  conflicts.push(...tripInfoConflicts);

  // 2. Check day-level conflicts
  const dayConflicts = detectDayConflicts(localData.days, remoteData.days);
  conflicts.push(...dayConflicts);

  // 3. Deduplicate accommodation conflicts that span multiple days
  const deduplicatedConflicts = deduplicateAccommodationConflicts(conflicts);

  return {
    hasConflicts: deduplicatedConflicts.length > 0,
    conflicts: deduplicatedConflicts,
    totalConflicts: deduplicatedConflicts.length,
  };
};

const detectTripInfoConflicts = (local: TripInfo, remote: TripInfo): Conflict[] => {
  const conflicts: Conflict[] = [];
  // Exclude endDate as it's automatically calculated from days
  const fields: (keyof TripInfo)[] = ['name', 'startDate', 'description'];

  fields.forEach((field) => {
    const localValue = local[field] || '';
    const remoteValue = remote[field] || '';

    if (localValue !== remoteValue) {
      conflicts.push({
        id: `tripInfo-${field}`,
        type: 'tripInfo',
        path: 'Trip Info',
        field,
        localValue: local[field],
        remoteValue: remote[field],
      });
    }
  });

  return conflicts;
};

const detectDayConflicts = (localDays: TripDay[], remoteDays: TripDay[]): Conflict[] => {
  const conflicts: Conflict[] = [];

  // Create maps for easier lookup
  const localDayMap = new Map(localDays.map((day) => [day.id, day]));
  const remoteDayMap = new Map(remoteDays.map((day) => [day.id, day]));

  // Find all unique day IDs
  const allDayIds = new Set([...localDayMap.keys(), ...remoteDayMap.keys()]);

  allDayIds.forEach((dayId) => {
    const localDay = localDayMap.get(dayId);
    const remoteDay = remoteDayMap.get(dayId);

    if (!localDay && remoteDay) {
      // Day was deleted locally but exists remotely
      conflicts.push({
        id: `day-deleted-${dayId}`,
        type: 'dayDeleted',
        path: `Day ${remoteDay.dayNumber} - ${remoteDay.region}`,
        field: 'existence',
        localValue: null,
        remoteValue: remoteDay,
        context: { dayId, dayNumber: remoteDay.dayNumber },
      });
    } else if (localDay && !remoteDay) {
      // Day was added locally but doesn't exist remotely
      conflicts.push({
        id: `day-added-${dayId}`,
        type: 'dayAdded',
        path: `Day ${localDay.dayNumber} - ${localDay.region}`,
        field: 'existence',
        localValue: localDay,
        remoteValue: null,
        context: { dayId, dayNumber: localDay.dayNumber },
      });
    } else if (localDay && remoteDay) {
      // Both exist, check for field conflicts
      const dayFieldConflicts = detectDayFieldConflicts(localDay, remoteDay);
      conflicts.push(...dayFieldConflicts);

      // Check accommodation conflicts
      const accommodationConflicts = detectAccommodationConflicts(localDay, remoteDay);
      conflicts.push(...accommodationConflicts);

      // Check place conflicts using intelligent detection
      const placeConflicts = detectPlaceConflictsIntelligent(localDay, remoteDay);
      conflicts.push(...placeConflicts);
    }
  });

  return conflicts;
};

const detectDayFieldConflicts = (localDay: TripDay, remoteDay: TripDay): Conflict[] => {
  const conflicts: Conflict[] = [];
  const simpleFields: (keyof TripDay)[] = ['region', 'driveTimeHours', 'driveDistanceKm', 'notes'];

  simpleFields.forEach((field) => {
    const localValue = localDay[field] || '';
    const remoteValue = remoteDay[field] || '';

    if (localValue !== remoteValue) {
      // Skip if both values are empty after normalization
      if (!localValue && !remoteValue) return;

      conflicts.push({
        id: `day-${localDay.id}-${field}`,
        type: 'day',
        path: `Day ${localDay.dayNumber} - ${localDay.region || 'Unnamed'}`,
        field,
        localValue: localDay[field],
        remoteValue: remoteDay[field],
        context: { dayId: localDay.id, dayNumber: localDay.dayNumber },
      });
    }
  });

  return conflicts;
};

const detectAccommodationConflicts = (localDay: TripDay, remoteDay: TripDay): Conflict[] => {
  const conflicts: Conflict[] = [];
  const localAcc = localDay.accommodation;
  const remoteAcc = remoteDay.accommodation;

  const accFields: (keyof TripDay['accommodation'])[] = [
    'name',
    'websiteUrl',
    'description',
    'numberOfNights',
    'roomType',
  ];

  accFields.forEach((field) => {
    const localValue = localAcc[field] || '';
    const remoteValue = remoteAcc[field] || '';

    if (localValue !== remoteValue) {
      // Skip if both values are empty after normalization
      if (!localValue && !remoteValue) return;

      conflicts.push({
        id: `accommodation-${localDay.id}-${field}`,
        type: 'accommodation',
        path: `Day ${localDay.dayNumber} - ${localAcc.name || 'Unnamed Accommodation'}`,
        field,
        localValue: localAcc[field],
        remoteValue: remoteAcc[field],
        context: { dayId: localDay.id, dayNumber: localDay.dayNumber },
      });
    }
  });

  // Check amenities conflicts
  const amenitiesConflicts = detectAmenitiesConflicts(localDay, remoteDay);
  conflicts.push(...amenitiesConflicts);

  // Check accommodation images - smart conflict detection
  const normalizedLocalImages = !localAcc.images || localAcc.images.length === 0 ? [] : localAcc.images;
  const normalizedRemoteImages = !remoteAcc.images || remoteAcc.images.length === 0 ? [] : remoteAcc.images;

  const imageConflict = detectImageConflicts(normalizedLocalImages, normalizedRemoteImages);
  if (imageConflict) {
    conflicts.push({
      id: `accommodation-${localDay.id}-images`,
      type: 'accommodation',
      path: `Day ${localDay.dayNumber} - ${localAcc.name || 'Unnamed Accommodation'}`,
      field: 'images',
      localValue: localAcc.images,
      remoteValue: remoteAcc.images,
      context: {
        dayId: localDay.id,
        dayNumber: localDay.dayNumber,
        missingImages: imageConflict.missingImages,
        canCombine: imageConflict.canCombine,
      },
    });
  }

  return conflicts;
};

const detectAmenitiesConflicts = (localDay: TripDay, remoteDay: TripDay): Conflict[] => {
  const conflicts: Conflict[] = [];
  const localAmenities = localDay.accommodation.amenities;
  const remoteAmenities = remoteDay.accommodation.amenities;

  // Helper function to normalize values for comparison
  const normalizeValue = (value: any, key: string): any => {
    if (key === 'other') {
      // Normalize empty arrays and undefined/null to empty array
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return [];
      }
      return value;
    }
    return value;
  };

  // Check each amenity category
  (Object.keys(localAmenities) as (keyof typeof localAmenities)[]).forEach((category) => {
    const localCategoryAmenities = localAmenities[category];
    const remoteCategoryAmenities = remoteAmenities[category];

    const normalizedLocal = normalizeValue(localCategoryAmenities, category);
    const normalizedRemote = normalizeValue(remoteCategoryAmenities, category);

    // Use JSON.stringify for array comparison, direct comparison for primitives
    const areEqual =
      category === 'other'
        ? JSON.stringify(normalizedLocal) === JSON.stringify(normalizedRemote)
        : normalizedLocal === normalizedRemote;

    if (!areEqual) {
      conflicts.push({
        id: `amenities-${localDay.id}-${category}`,
        type: 'accommodation',
        path: `Day ${localDay.dayNumber} - ${localDay.accommodation.name || 'Unnamed Accommodation'}`,
        field: `amenities.${category}`,
        localValue: localCategoryAmenities,
        remoteValue: remoteCategoryAmenities,
        context: { dayId: localDay.id, dayNumber: localDay.dayNumber, category },
      });
    }
  });

  return conflicts;
};

const detectPlaceFieldConflicts = (day: TripDay, localPlace: Place, remotePlace: Place): Conflict[] => {
  const conflicts: Conflict[] = [];
  const fields: (keyof Place)[] = ['name', 'description', 'websiteUrl', 'googleMapsUrl'];

  fields.forEach((field) => {
    const localValue = localPlace[field] || '';
    const remoteValue = remotePlace[field] || '';

    if (localValue !== remoteValue) {
      // Skip if both values are empty after normalization
      if (!localValue && !remoteValue) return;

      conflicts.push({
        id: `place-${day.id}-${localPlace.id}-${field}`,
        type: 'place',
        path: `Day ${day.dayNumber} - ${localPlace.name || 'Unnamed Place'}`,
        field,
        localValue: localPlace[field],
        remoteValue: remotePlace[field],
        context: { dayId: day.id, dayNumber: day.dayNumber, placeId: localPlace.id },
      });
    }
  });

  // Check place images using intelligent detection
  const normalizedLocalPlaceImages = !localPlace.images || localPlace.images.length === 0 ? [] : localPlace.images;
  const normalizedRemotePlaceImages = !remotePlace.images || remotePlace.images.length === 0 ? [] : remotePlace.images;

  const placeImageConflict = detectImageConflicts(normalizedLocalPlaceImages, normalizedRemotePlaceImages);
  if (placeImageConflict) {
    conflicts.push({
      id: `place-${day.id}-${localPlace.id}-images`,
      type: 'place',
      path: `Day ${day.dayNumber} - ${localPlace.name || 'Unnamed Place'}`,
      field: 'images',
      localValue: localPlace.images,
      remoteValue: remotePlace.images,
      context: {
        dayId: day.id,
        dayNumber: day.dayNumber,
        placeId: localPlace.id,
        missingImages: placeImageConflict.missingImages,
        canCombine: placeImageConflict.canCombine,
      },
    });
  }

  return conflicts;
};

// Helper function to detect image conflicts intelligently
const detectImageConflicts = (
  localImages: string[],
  remoteImages: string[]
): { missingImages: string[]; canCombine: boolean } | null => {
  // If arrays are identical, no conflict
  if (JSON.stringify(localImages) === JSON.stringify(remoteImages)) {
    return null;
  }

  // Always show conflicts for images when they differ - let user decide

  // Find images that are in local but not in remote (will be lost if choosing remote)
  const missingFromRemote = localImages.filter((img) => !remoteImages.includes(img));

  return {
    missingImages: missingFromRemote,
    canCombine: true,
  };
};

// Helper function to detect place conflicts intelligently
const detectPlaceConflictsIntelligent = (localDay: TripDay, remoteDay: TripDay): Conflict[] => {
  const conflicts: Conflict[] = [];

  // Create maps for easier lookup
  const localPlaceMap = new Map(localDay.places.map((place) => [place.id, place]));
  const remotePlaceMap = new Map(remoteDay.places.map((place) => [place.id, place]));

  // Check for place deletions (local has places that remote doesn't)
  localPlaceMap.forEach((localPlace, placeId) => {
    if (!remotePlaceMap.has(placeId)) {
      // Place was deleted in remote
      conflicts.push({
        id: `place-deleted-${localDay.id}-${placeId}`,
        type: 'placeDeleted',
        path: `Day ${localDay.dayNumber} - ${localPlace.name}`,
        field: 'existence',
        localValue: localPlace,
        remoteValue: null,
        context: { dayId: localDay.id, dayNumber: localDay.dayNumber, placeId },
      });
    }
  });

  // Check for place field changes (same place ID but different content)
  remotePlaceMap.forEach((remotePlace, placeId) => {
    const localPlace = localPlaceMap.get(placeId);
    if (localPlace) {
      // Place exists in both, check for field conflicts
      const placeFieldConflicts = detectPlaceFieldConflicts(localDay, localPlace, remotePlace);
      conflicts.push(...placeFieldConflicts);
    }
    // Note: We don't add conflicts for place additions (remote has new places)
    // This is intentional - adding places is not a conflict
  });

  return conflicts;
};

// Helper function to deduplicate accommodation conflicts across multiple days
const deduplicateAccommodationConflicts = (conflicts: Conflict[]): Conflict[] => {
  const accommodationConflicts = conflicts.filter((c) => c.type === 'accommodation');
  const otherConflicts = conflicts.filter((c) => c.type !== 'accommodation');

  // Group accommodation conflicts by field and values
  const accommodationGroups = new Map<string, Conflict[]>();

  accommodationConflicts.forEach((conflict) => {
    const key = `${conflict.field}-${JSON.stringify(conflict.localValue)}-${JSON.stringify(conflict.remoteValue)}`;

    if (!accommodationGroups.has(key)) {
      accommodationGroups.set(key, []);
    }
    accommodationGroups.get(key)!.push(conflict);
  });

  // For each group, create a single conflict that represents all days
  const deduplicatedAccommodationConflicts: Conflict[] = [];

  accommodationGroups.forEach((groupConflicts) => {
    if (groupConflicts.length === 1) {
      // Only one conflict, keep as is
      deduplicatedAccommodationConflicts.push(groupConflicts[0]);
    } else {
      // Multiple identical conflicts across days, merge them
      const firstConflict = groupConflicts[0];
      const affectedDays = groupConflicts.map((c) => c.context.dayNumber).sort();

      const mergedConflict: Conflict = {
        ...firstConflict,
        id: `accommodation-merged-${firstConflict.field}-${Date.now()}`,
        path: `Days ${affectedDays.join(', ')} - ${firstConflict.path.split(' - ')[1]}`,
        context: {
          ...firstConflict.context,
          affectedDays: groupConflicts.map((c) => c.context.dayId),
          dayNumbers: affectedDays,
        },
      };

      deduplicatedAccommodationConflicts.push(mergedConflict);
    }
  });

  return [...otherConflicts, ...deduplicatedAccommodationConflicts];
};

export const formatConflictValue = (value: any, field: string): string => {
  if (value === null || value === undefined) return 'Not set';
  if (value === '') return 'Empty';

  if (field === 'images' && Array.isArray(value)) {
    if (value.length === 0) return 'No images';

    // For small arrays, show more details
    if (value.length <= 3) {
      return value
        .map((url) => {
          const filename = url.split('/').pop() || url;
          return filename.length > 40 ? filename.substring(0, 40) + '...' : filename;
        })
        .join(', ');
    }

    // For larger arrays, show count and first few
    const firstTwo = value
      .slice(0, 2)
      .map((url) => {
        const filename = url.split('/').pop() || url;
        return filename.length > 30 ? filename.substring(0, 30) + '...' : filename;
      })
      .join(', ');

    return `${value.length} images: ${firstTwo}${value.length > 2 ? ', ...' : ''}`;
  }

  if (field.startsWith('amenities.')) {
    if (field === 'amenities.other') {
      // Handle the "other" amenities array
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return 'No additional amenities';
      }
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    }
    // Handle boolean amenities
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};
