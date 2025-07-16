import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';
import { TripDay } from '../hooks/useTripData';

interface AccommodationUpdateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affectedDays: TripDay[];
  currentDay: TripDay;
  oldAccommodation: TripDay['accommodation'];
  newAccommodation: TripDay['accommodation'];
}

const AccommodationUpdateConfirmationModal: React.FC<AccommodationUpdateConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  affectedDays,
  currentDay,
  oldAccommodation,
  newAccommodation
}) => {
  if (!isOpen) return null;

  // Helper function to get changed fields
  const getChangedFields = () => {
    const changes: Array<{field: string, label: string, oldValue: any, newValue: any}> = [];
    
    const fieldsToCheck = [
      { key: 'name', label: 'Name' },
      { key: 'websiteUrl', label: 'Website URL' },
      { key: 'googleMapsUrl', label: 'Google Maps URL' },
      { key: 'googleMapsEmbedUrl', label: 'Google Maps Embed URL' },
      { key: 'description', label: 'Description' },
      { key: 'numberOfNights', label: 'Number of Nights' },
      { key: 'roomType', label: 'Room Type' },
    ];

    fieldsToCheck.forEach(field => {
      const oldValue = oldAccommodation[field.key as keyof TripDay['accommodation']];
      const newValue = newAccommodation[field.key as keyof TripDay['accommodation']];
      
      if (oldValue !== newValue) {
        changes.push({
          field: field.key,
          label: field.label,
          oldValue: oldValue || '(empty)',
          newValue: newValue || '(empty)'
        });
      }
    });

    // Check images
    const oldImages = oldAccommodation.images || [];
    const newImages = newAccommodation.images || [];
    if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
      changes.push({
        field: 'images',
        label: 'Images',
        oldValue: oldImages.length > 0 ? oldImages.map((img, i) => `Image ${i + 1}: ${img.substring(0, 50)}...`).join('\n') : '(no images)',
        newValue: newImages.length > 0 ? newImages.map((img, i) => `Image ${i + 1}: ${img.substring(0, 50)}...`).join('\n') : '(no images)'
      });
    }

    // Check amenities with detailed comparison
    const oldAmenities = oldAccommodation.amenities;
    const newAmenities = newAccommodation.amenities;
    
    const getAmenityChanges = () => {
      const changedAmenities = [];
      const amenityLabels = {
        breakfast: 'Breakfast',
        kitchen: 'Kitchen',
        wifi: 'WiFi',
        airConditioning: 'Air Conditioning',
        heating: 'Heating',
        washer: 'Washer',
        dryer: 'Dryer',
        parking: 'Parking',
        pool: 'Pool',
        gym: 'Gym',
        spa: 'Spa',
        petFriendly: 'Pet Friendly',
        smokingAllowed: 'Smoking Allowed',
        balcony: 'Balcony',
        oceanView: 'Ocean View',
        mountainView: 'Mountain View',
        cityView: 'City View'
      };

      // Check boolean amenities
      Object.entries(amenityLabels).forEach(([key, label]) => {
        const oldValue = oldAmenities[key as keyof typeof oldAmenities];
        const newValue = newAmenities[key as keyof typeof newAmenities];
        if (oldValue !== newValue) {
          changedAmenities.push(`${label}: ${oldValue ? 'Yes' : 'No'} → ${newValue ? 'Yes' : 'No'}`);
        }
      });

      // Check 'other' amenities
      const oldOther = oldAmenities.other || [];
      const newOther = newAmenities.other || [];
      if (JSON.stringify(oldOther) !== JSON.stringify(newOther)) {
        changedAmenities.push(`Other: [${oldOther.join(', ')}] → [${newOther.join(', ')}]`);
      }

      return changedAmenities;
    };

    const amenityChanges = getAmenityChanges();
    if (amenityChanges.length > 0) {
      changes.push({
        field: 'amenities',
        label: 'Amenities',
        oldValue: 'See detailed changes below',
        newValue: amenityChanges.join('\n')
      });
    }

    return changes;
  };

  const changedFields = getChangedFields();
  const allAffectedDays = [currentDay, ...affectedDays];
  
  // Sort affected days by day number
  const sortedAffectedDays = allAffectedDays.sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} />
              Accommodation Update Confirmation
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1 text-center">
                <h3 className="font-semibold text-amber-800 mb-1">
                  This accommodation is used in multiple days
                </h3>
                <p className="text-amber-700 text-sm">
                  The changes you're making will affect all days that use this accommodation.
                </p>
              </div>
            </div>
          </div>

          {/* Affected Days */}
          <div>
            <h4 className="font-medium mb-3">Affected Days ({sortedAffectedDays.length})</h4>
            <div className="flex flex-wrap gap-2">
              {sortedAffectedDays.map(day => (
                <div key={day.id} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="font-medium text-blue-700">Day #{day.dayNumber}</span>
                  <span className="text-blue-600 text-sm">({day.region})</span>
                  {day.nightNumber && (
                    <span className="text-blue-500 text-xs">
                      Night {day.nightNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Changes Preview */}
          <div>
            <h4 className="font-medium mb-3">Changes Being Made</h4>
            {changedFields.length > 0 ? (
              <div className="space-y-3">
                {changedFields.map((change, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-700 mb-2">{change.label}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-red-600 font-medium">Before:</span>
                        <div className="bg-red-50 border border-red-200 rounded px-2 py-1 mt-1 whitespace-pre-wrap">
                          {typeof change.oldValue === 'string' ? change.oldValue : JSON.stringify(change.oldValue)}
                        </div>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">After:</span>
                        <div className="bg-green-50 border border-green-200 rounded px-2 py-1 mt-1 whitespace-pre-wrap">
                          {change.field === 'amenities' && change.newValue !== 'See detailed changes below' 
                            ? change.newValue 
                            : typeof change.newValue === 'string' ? change.newValue : JSON.stringify(change.newValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
                No changes detected
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onConfirm} className="flex-1">
              Yes, Update All Days
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccommodationUpdateConfirmationModal; 