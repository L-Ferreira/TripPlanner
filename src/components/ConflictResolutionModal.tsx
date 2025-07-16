import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { TripData } from '../hooks/useTripData';
import { Conflict, formatConflictValue } from '../utils/conflictDetection';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ConflictResolutionModalProps {
  conflicts: Conflict[];
  localData: TripData;
  remoteData: TripData;
  onResolve: (resolvedData: TripData) => void;
  onCancel: () => void;
}

type ConflictResolution = {
  conflictId: string;
  resolution: 'local' | 'remote' | 'manual' | 'combine';
  manualValue?: any;
};

// Simple image carousel for the conflict resolution modal
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (images.length === 0) {
    return <div className="text-gray-500 text-sm">No images</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-700">{title}</div>
      <div className="relative">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img src={images[currentIndex]} alt={`${title} ${currentIndex + 1}`} className="w-full h-full object-cover" />
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} of {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Combined images display with carousel and editable JSON
const CombinedImagesDisplay: React.FC<{
  images: string[];
  onUpdate: (newImages: string[]) => void;
}> = ({ images, onUpdate }) => {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(images, null, 2));
  const [isValidJson, setIsValidJson] = useState(true);

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setIsValidJson(true);
        onUpdate(parsed);
      } else {
        setIsValidJson(false);
      }
    } catch (error) {
      setIsValidJson(false);
    }
  };

  return (
    <div className="space-y-4">
      <ImageCarousel images={images} title="Combined Images Preview" />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Edit Image Order (JSON)</label>
        <textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          className={`w-full h-32 p-2 border rounded-md font-mono text-sm ${
            isValidJson ? 'border-gray-300' : 'border-red-500'
          }`}
          placeholder="Edit the JSON array to reorder images..."
        />
        {!isValidJson && <p className="text-red-500 text-sm">Invalid JSON format</p>}
      </div>
    </div>
  );
};

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  conflicts,
  localData,
  remoteData, // Keep this for future use
  onResolve,
  onCancel,
}) => {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [manualEdits, setManualEdits] = useState<Map<string, string>>(new Map());
  const [showCombineView, setShowCombineView] = useState<Map<string, boolean>>(new Map());

  const updateResolution = (conflictId: string, resolution: ConflictResolution['resolution'], manualValue?: any) => {
    setResolutions((prev) => {
      const newMap = new Map(prev);
      newMap.set(conflictId, { conflictId, resolution, manualValue });
      return newMap;
    });
  };

  const updateManualEdit = (conflictId: string, value: string) => {
    setManualEdits((prev) => {
      const newMap = new Map(prev);
      newMap.set(conflictId, value);
      return newMap;
    });
  };

  const toggleCombineView = (conflictId: string) => {
    setShowCombineView((prev) => {
      const newMap = new Map(prev);
      newMap.set(conflictId, !newMap.get(conflictId));
      return newMap;
    });
  };

  const updateCombinedImages = (conflictId: string, newImages: string[]) => {
    updateResolution(conflictId, 'combine', newImages);
  };

  const allConflictsResolved = conflicts.every((conflict) => resolutions.has(conflict.id));

  const applyResolutions = () => {
    // Create a merged data object by applying all resolutions
    const mergedData: TripData = JSON.parse(JSON.stringify(localData)); // Deep copy of local data

    conflicts.forEach((conflict) => {
      const resolution = resolutions.get(conflict.id);
      if (!resolution) return;

      const value =
        resolution.resolution === 'local'
          ? conflict.localValue
          : resolution.resolution === 'remote'
            ? conflict.remoteValue
            : resolution.resolution === 'combine'
              ? resolution.manualValue // For combine, the combined value is stored in manualValue
              : resolution.manualValue;

      applyResolutionToData(mergedData, conflict, value);
    });

    onResolve(mergedData);
  };

  const applyResolutionToData = (data: TripData, conflict: Conflict, value: any) => {
    switch (conflict.type) {
      case 'tripInfo':
        (data.tripInfo as any)[conflict.field] = value;
        break;

      case 'day':
        const day = data.days.find((d) => d.id === conflict.context.dayId);
        if (day) {
          (day as any)[conflict.field] = value;
        }
        break;

      case 'accommodation':
        // Handle merged conflicts that affect multiple days
        const affectedDayIds = conflict.context.affectedDays || [conflict.context.dayId];

        affectedDayIds.forEach((dayId: string) => {
          const accDay = data.days.find((d) => d.id === dayId);
          if (accDay) {
            if (conflict.field.startsWith('amenities.')) {
              const amenityKey = conflict.field.replace('amenities.', '');
              (accDay.accommodation.amenities as any)[amenityKey] = value;
            } else {
              (accDay.accommodation as any)[conflict.field] = value;
            }
          }
        });
        break;

      case 'place':
        const placeDay = data.days.find((d) => d.id === conflict.context.dayId);
        if (placeDay) {
          const place = placeDay.places.find((p) => p.id === conflict.context.placeId);
          if (place) {
            (place as any)[conflict.field] = value;
          }
        }
        break;

      case 'dayAdded':
        // Remove the locally added day if choosing remote (which means don't add it)
        if (value === null) {
          data.days = data.days.filter((d) => d.id !== conflict.context.dayId);
        }
        break;

      case 'dayDeleted':
        // Add the remotely existing day if choosing remote
        if (value !== null) {
          data.days.push(value);
        }
        break;

      case 'placeAdded':
        // Remove the locally added place if choosing remote (which means don't add it)
        if (value === null) {
          const placeDay = data.days.find((d) => d.id === conflict.context.dayId);
          if (placeDay) {
            placeDay.places = placeDay.places.filter((p) => p.id !== conflict.context.placeId);
          }
        }
        break;

      case 'placeDeleted':
        // Add the remotely existing place if choosing remote
        if (value !== null) {
          const placeDay = data.days.find((d) => d.id === conflict.context.dayId);
          if (placeDay) {
            placeDay.places.push(value);
          }
        }
        break;
    }
  };

  const getConflictTypeLabel = (type: Conflict['type']) => {
    switch (type) {
      case 'tripInfo':
        return 'Trip Information';
      case 'day':
        return 'Day Information';
      case 'accommodation':
        return 'Accommodation';
      case 'place':
        return 'Place';
      case 'dayAdded':
        return 'Day Added';
      case 'dayDeleted':
        return 'Day Deleted';
      case 'placeAdded':
        return 'Place Added';
      case 'placeDeleted':
        return 'Place Deleted';
      default:
        return type;
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'name':
        return 'Name';
      case 'startDate':
        return 'Start Date';
      case 'endDate':
        return 'End Date';
      case 'description':
        return 'Description';
      case 'region':
        return 'Region';
      case 'notes':
        return 'Notes';
      case 'driveTimeHours':
        return 'Drive Time (hours)';
      case 'driveDistanceKm':
        return 'Drive Distance (km)';
      case 'websiteUrl':
        return 'Website URL';
      case 'googleMapsUrl':
        return 'Google Maps URL';
      case 'numberOfNights':
        return 'Number of Nights';
      case 'roomType':
        return 'Room Type';
      case 'images':
        return 'Images';
      case 'existence':
        return 'Existence';
      default:
        if (field.startsWith('amenities.')) {
          return field
            .replace('amenities.', '')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
        }
        return field;
    }
  };

  const canEditManually = (conflict: Conflict) => {
    const textFields = ['name', 'description', 'region', 'notes', 'websiteUrl', 'roomType'];
    return textFields.includes(conflict.field);
  };

  const renderConflictValue = (conflict: Conflict, isLocal: boolean) => {
    const value = isLocal ? conflict.localValue : conflict.remoteValue;

    if (conflict.type === 'dayAdded' || conflict.type === 'dayDeleted') {
      return isLocal ? (conflict.localValue ? 'Exists' : 'Deleted') : conflict.remoteValue ? 'Exists' : 'Deleted';
    }

    if (conflict.type === 'placeAdded' || conflict.type === 'placeDeleted') {
      return isLocal ? (conflict.localValue ? 'Exists' : 'Deleted') : conflict.remoteValue ? 'Exists' : 'Deleted';
    }

    // Handle images specially
    if (conflict.field === 'images') {
      const images = value || [];
      if (images.length === 0) {
        return <div className="text-gray-500 text-sm">No images</div>;
      }

      return (
        <div className="space-y-2">
          <ImageCarousel images={images} title={`${images.length} image${images.length !== 1 ? 's' : ''}`} />
        </div>
      );
    }

    const formattedValue = formatConflictValue(value, conflict.field);
    return formattedValue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Resolve Sync Conflicts</h2>
            <div className="text-sm text-gray-600">
              {conflicts.length - resolutions.size} of {conflicts.length} conflicts remaining
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              We found {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} between your local changes and the
              remote data. Please review each conflict and choose which version to keep.
            </p>
          </div>

          <div className="space-y-4">
            {conflicts.map((conflict) => {
              const resolution = resolutions.get(conflict.id);
              const manualValue = manualEdits.get(conflict.id);
              const showingCombine = showCombineView.get(conflict.id);

              return (
                <Card key={conflict.id} className="p-4 border-l-4 border-l-yellow-400">
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{conflict.path}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getConflictTypeLabel(conflict.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Field: <span className="font-medium">{getFieldLabel(conflict.field)}</span>
                    </p>
                  </div>

                  {showingCombine && resolution?.resolution === 'combine' ? (
                    <div className="space-y-4">
                      <CombinedImagesDisplay
                        images={resolution.manualValue || []}
                        onUpdate={(newImages) => updateCombinedImages(conflict.id, newImages)}
                      />

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleCombineView(conflict.id)}>
                          Back to Options
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Local Version</label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded min-h-[3rem]">
                            {renderConflictValue(conflict, true)}
                          </div>
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'local' ? 'default' : 'outline'}
                            onClick={() => updateResolution(conflict.id, 'local')}
                            className="w-full"
                          >
                            Keep Local
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Remote Version</label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded min-h-[3rem]">
                            {renderConflictValue(conflict, false)}
                          </div>
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'remote' ? 'default' : 'outline'}
                            onClick={() => updateResolution(conflict.id, 'remote')}
                            className="w-full"
                          >
                            Keep Remote
                          </Button>
                        </div>
                      </div>

                      {/* Show combine option for images */}
                      {conflict.field === 'images' && conflict.context?.canCombine && (
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'combine' ? 'default' : 'outline'}
                            onClick={() => {
                              // Combine arrays by merging unique items
                              const localImages = conflict.localValue || [];
                              const remoteImages = conflict.remoteValue || [];
                              const combined = [...new Set([...localImages, ...remoteImages])];
                              updateResolution(conflict.id, 'combine', combined);
                              toggleCombineView(conflict.id);
                            }}
                            className="w-full"
                          >
                            Combine Images
                          </Button>

                          {/* Show detailed change summary for images */}
                          {conflict.field === 'images' && (
                            <div className="text-sm space-y-2">
                              {(() => {
                                const localImages = conflict.localValue || [];
                                const remoteImages = conflict.remoteValue || [];
                                const addedImages = remoteImages.filter((img: string) => !localImages.includes(img));
                                const deletedImages = localImages.filter((img: string) => !remoteImages.includes(img));

                                return (
                                  <div className="bg-gray-50 p-3 rounded space-y-2">
                                    <div className="font-medium text-gray-700">Change Summary:</div>

                                    {addedImages.length > 0 && (
                                      <div className="text-green-700 bg-green-50 p-2 rounded">
                                        <strong>Added in remote ({addedImages.length}):</strong>
                                        <div className="mt-1">
                                          {addedImages.map((img: string, idx: number) => {
                                            const filename = img.split('/').pop() || img;
                                            return (
                                              <div key={idx} className="text-xs truncate">
                                                • {filename.length > 50 ? filename.substring(0, 50) + '...' : filename}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {deletedImages.length > 0 && (
                                      <div className="text-red-700 bg-red-50 p-2 rounded">
                                        <strong>Deleted from remote ({deletedImages.length}):</strong>
                                        <div className="mt-1">
                                          {deletedImages.map((img: string, idx: number) => {
                                            const filename = img.split('/').pop() || img;
                                            return (
                                              <div key={idx} className="text-xs truncate">
                                                • {filename.length > 50 ? filename.substring(0, 50) + '...' : filename}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {addedImages.length === 0 && deletedImages.length === 0 && (
                                      <div className="text-gray-600 bg-gray-50 p-2 rounded">
                                        Images are different but no clear additions/deletions detected.
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {conflict.context?.missingImages && conflict.context.missingImages.length > 0 && (
                            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                              <strong>Missing from remote:</strong>{' '}
                              {conflict.context.missingImages
                                .map((img: string) => {
                                  const filename = img.split('/').pop() || img;
                                  return filename.length > 50 ? filename.substring(0, 50) + '...' : filename;
                                })
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {canEditManually(conflict) && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Manual Edit</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={manualValue || ''}
                              onChange={(e) => updateManualEdit(conflict.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter custom value..."
                            />
                            <Button
                              size="sm"
                              variant={resolution?.resolution === 'manual' ? 'default' : 'outline'}
                              onClick={() => updateResolution(conflict.id, 'manual', manualValue)}
                              disabled={!manualValue}
                            >
                              Use Manual
                            </Button>
                          </div>
                        </div>
                      )}

                      {resolution && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Resolution:</strong>{' '}
                          {resolution.resolution === 'local'
                            ? 'Keep local version'
                            : resolution.resolution === 'remote'
                              ? 'Keep remote version'
                              : resolution.resolution === 'combine'
                                ? 'Combine images'
                                : `Use manual value: "${resolution.manualValue}"`}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel Sync
            </Button>
            <Button
              onClick={applyResolutions}
              disabled={!allConflictsResolved}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Resolutions & Sync
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
