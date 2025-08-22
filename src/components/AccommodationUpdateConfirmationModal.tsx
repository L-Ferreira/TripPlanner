import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TripDay } from '../hooks/useTripData';
import { useExtendedAmenityLabels } from '../lib/amenities';

interface AccommodationUpdateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affectedDays: TripDay[];
  currentDay: TripDay;
  oldAccommodation: TripDay['accommodation'];
  newAccommodation: TripDay['accommodation'];
}

// Simple image carousel for the confirmation modal
const ImageCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (images.length === 0) {
    return <div className="text-gray-500 text-sm">{t('images.noImages')}</div>;
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

const AccommodationUpdateConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  affectedDays,
  currentDay,
  oldAccommodation,
  newAccommodation,
}: AccommodationUpdateConfirmationModalProps) => {
  const { t } = useTranslation();
  const extendedAmenityLabels = useExtendedAmenityLabels();

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
      { key: 'name', label: t('accommodation.accommodationName') },
      { key: 'websiteUrl', label: t('place.websiteUrl') },
      { key: 'googleMapsUrl', label: t('place.googleMapsUrl') },
      { key: 'googleMapsEmbedUrl', label: t('place.googleMapsEmbedUrl') },
      { key: 'description', label: t('place.description') },
      { key: 'numberOfNights', label: t('accommodation.nights') },
      { key: 'roomType', label: t('accommodation.roomType') },
    ];

    fieldsToCheck.forEach((field) => {
      const oldValue = oldAccommodation[field.key as keyof TripDay['accommodation']];
      const newValue = newAccommodation[field.key as keyof TripDay['accommodation']];

      if (oldValue !== newValue) {
        changes.push({
          field: field.key,
          label: field.label,
          oldValue: oldValue || t('common.empty'),
          newValue: newValue || t('common.empty'),
        });
      }
    });

    // Check images
    const oldImages = oldAccommodation.images || [];
    const newImages = newAccommodation.images || [];
    if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
      changes.push({
        field: 'images',
        label: t('place.images'),
        oldValue: oldImages,
        newValue: newImages,
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
          changedAmenities.push(
            `${label}: ${oldValue ? t('common.yes') : t('common.no')} → ${newValue ? t('common.yes') : t('common.no')}`
          );
        }
      });

      // Check 'other' amenities
      const oldOther = oldAmenities.other || [];
      const newOther = newAmenities.other || [];
      if (JSON.stringify(oldOther) !== JSON.stringify(newOther)) {
        changedAmenities.push(`${t('conflicts.other')}: [${oldOther.join(', ')}] → [${newOther.join(', ')}]`);
      }

      return changedAmenities;
    };

    const amenityChanges = getAmenityChanges();
    if (amenityChanges.length > 0) {
      changes.push({
        field: 'amenities',
        label: t('accommodation.amenities'),
        oldValue: t('conflicts.seeDetailedChangesBelow'),
        newValue: amenityChanges.join('\n'),
      });
    }

    return changes;
  };

  const renderFieldValue = (field: string, value: any) => {
    if (field === 'images') {
      const images = value || [];
      if (images.length === 0) {
        return <div className="text-gray-500 text-sm">{t('images.noImages')}</div>;
      }

      return <ImageCarousel images={images} title={`${images.length} image${images.length !== 1 ? 's' : ''}`} />;
    }

    return <div className="text-sm">{value}</div>;
  };

  const changedFields = getChangedFields();
  const allAffectedDays = [currentDay, ...affectedDays];

  // Sort affected days by day number
  const sortedAffectedDays = allAffectedDays.sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-xl">{t('accommodation.updateAccommodation')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Affected Days */}
            <div>
              <h3 className="font-semibold mb-2">{t('accommodation.thisChangeWillAffectFollowingDays')}:</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {sortedAffectedDays.map((day) => (
                  <span key={day.id} className="bg-gray-100 px-2 py-1 rounded">
                    {t('day.day')} {day.dayNumber}: {day.region}
                  </span>
                ))}
              </div>
            </div>

            {/* Changed Fields */}
            {changedFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('accommodation.changesToBeMade')}:</h3>
                <div className="space-y-3">
                  {changedFields.map((change, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="font-medium text-sm">{change.label}:</div>
                      <div className="mt-2 space-y-3">
                        <div>
                          <div className="text-red-600 text-xs font-medium mb-1">{t('common.old')}:</div>
                          {renderFieldValue(change.field, change.oldValue)}
                        </div>
                        <div>
                          <div className="text-green-600 text-xs font-medium mb-1">{t('common.new')}:</div>
                          {renderFieldValue(change.field, change.newValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>{t('common.note')}:</strong> {t('accommodation.updateNote')}
              </p>
            </div>
          </div>
        </CardContent>
        <div className="flex-shrink-0 p-6 pt-4 border-t">
          <div className="flex gap-2">
            <Button onClick={onConfirm} className="flex-1">
              {t('common.confirm')} {t('accommodation.updateAccommodation')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccommodationUpdateConfirmationModal;
