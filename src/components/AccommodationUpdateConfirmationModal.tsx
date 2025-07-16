import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripDay } from '../hooks/useTripData';
import { extendedAmenityLabels } from '../lib/amenities';

interface AccommodationUpdateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affectedDays: TripDay[];
  currentDay: TripDay;
  oldAccommodation: TripDay['accommodation'];
  newAccommodation: TripDay['accommodation'];
}

const AccommodationUpdateConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  affectedDays,
  currentDay,
  oldAccommodation,
  newAccommodation,
}: AccommodationUpdateConfirmationModalProps) => {
  if (!isOpen) return null;

  // Helper function to get changed fields
  const getChangedFields = () => {
    const changes: Array<{
      field: string;
      label: string;
      oldValue: any;
      newValue: any;
    }> = [];

    const fieldsToCheck = [
      { key: 'name', label: 'Name' },
      { key: 'websiteUrl', label: 'Website URL' },
      { key: 'googleMapsUrl', label: 'Google Maps URL' },
      { key: 'googleMapsEmbedUrl', label: 'Google Maps Embed URL' },
      { key: 'description', label: 'Description' },
      { key: 'numberOfNights', label: 'Number of Nights' },
      { key: 'roomType', label: 'Room Type' },
    ];

    fieldsToCheck.forEach((field) => {
      const oldValue = oldAccommodation[field.key as keyof TripDay['accommodation']];
      const newValue = newAccommodation[field.key as keyof TripDay['accommodation']];

      if (oldValue !== newValue) {
        changes.push({
          field: field.key,
          label: field.label,
          oldValue: oldValue || '(empty)',
          newValue: newValue || '(empty)',
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
        oldValue:
          oldImages.length > 0
            ? oldImages.map((img, i) => `Image ${i + 1}: ${img.substring(0, 50)}...`).join('\n')
            : '(no images)',
        newValue:
          newImages.length > 0
            ? newImages.map((img, i) => `Image ${i + 1}: ${img.substring(0, 50)}...`).join('\n')
            : '(no images)',
      });
    }

    // Check amenities with detailed comparison
    const oldAmenities = oldAccommodation.amenities;
    const newAmenities = newAccommodation.amenities;

    const getAmenityChanges = () => {
      const changedAmenities = [];

      // Check boolean amenities
      Object.entries(extendedAmenityLabels).forEach(([key, label]) => {
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
        newValue: amenityChanges.join('\n'),
      });
    }

    return changes;
  };

  const changedFields = getChangedFields();
  const allAffectedDays = [currentDay, ...affectedDays];

  // Sort affected days by day number
  const sortedAffectedDays = allAffectedDays.sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Update Accommodation</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-6">
            {/* Affected Days */}
            <div>
              <h3 className="font-semibold mb-2">This change will affect the following days:</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {sortedAffectedDays.map((day) => (
                  <span key={day.id} className="bg-gray-100 px-2 py-1 rounded">
                    Day {day.dayNumber}: {day.region}
                  </span>
                ))}
              </div>
            </div>

            {/* Changed Fields */}
            {changedFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Changes to be made:</h3>
                <div className="space-y-3">
                  {changedFields.map((change, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="font-medium text-sm">{change.label}:</div>
                      <div className="text-sm mt-1 space-y-1">
                        <div className="text-red-600">Old: {change.oldValue}</div>
                        <div className="text-green-600">New: {change.newValue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will update the accommodation details for all linked days. If you only want
                to update the current day, you&apos;ll need to create a separate accommodation entry.
              </p>
            </div>
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 pt-4 border-t">
          <Button onClick={onConfirm} className="flex-1">
            Confirm Update
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccommodationUpdateConfirmationModal;
