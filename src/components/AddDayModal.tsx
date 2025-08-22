import {
  decimalHoursToTimeString,
  extractEmbedUrl,
  getDefaultAccommodationFormData,
  timeStringToDecimalHours,
} from '@/lib/utils';
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TripData, TripDay } from '../hooks/useTripData';
import AmenitiesChecklist from './AmenitiesChecklist';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface AddDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dayData: Omit<TripDay, 'id' | 'dayNumber'>) => string;
  addDayAndLinkAccommodation: (
    dayData: Omit<TripDay, 'id' | 'dayNumber'>,
    existingAccommodationDayIds: string[]
  ) => string;
  tripData: TripData;
  checkUnusedNights: (dayNumber: number) => {
    previousDay: TripDay;
    accommodationName: string;
    totalBookedNights: number;
    usedNights: number;
    unusedNights: number;
    hasUnusedNights: boolean;
  } | null;
  adjustPreviousAccommodationNights: (dayId: string, newNightCount: number) => void;
}

const AddDayModal = ({
  isOpen,
  onClose,
  onAdd,
  addDayAndLinkAccommodation,
  tripData,
  checkUnusedNights,
  adjustPreviousAccommodationNights,
}: AddDayModalProps) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'accommodation-choice' | 'main-form'>('accommodation-choice');
  const [usingSameAccommodation, setUsingSameAccommodation] = useState(false);
  const [unusedNightsWarning, setUnusedNightsWarning] = useState<any>(null);
  const [showUnusedNightsWarning, setShowUnusedNightsWarning] = useState(false);
  const [adjustPreviousNights, setAdjustPreviousNights] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newDayNumber = tripData.days.length + 1;
  const previousDay = tripData.days.find((d: TripDay) => d.dayNumber === newDayNumber - 1);
  const hasPreviousDay = !!previousDay;

  const [formData, setFormData] = useState({
    ...getDefaultAccommodationFormData(),
    driveTime: '',
    driveDistanceKm: '',
    accommodationNights: '1',
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      // Check for unused nights
      const unusedInfo = checkUnusedNights(newDayNumber);
      setUnusedNightsWarning(unusedInfo);

      // Determine if we should show accommodation choice
      const shouldShowChoice = hasPreviousDay && unusedInfo?.hasUnusedNights;
      setStep(shouldShowChoice ? 'accommodation-choice' : 'main-form');

      setUsingSameAccommodation(false);
      setShowUnusedNightsWarning(false);
      setErrors({});
      setIsSubmitting(false);

      // Reset form
      setFormData({
        ...getDefaultAccommodationFormData(),
        driveTime: '',
        driveDistanceKm: '',
        accommodationNights: '1',
      });
    }
  }, [isOpen, hasPreviousDay, newDayNumber, checkUnusedNights]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.region.trim()) {
      newErrors.region = t('day.regionRequired');
    }

    if (!usingSameAccommodation && !formData.accommodationName.trim()) {
      newErrors.accommodationName = t('accommodation.accommodationNameRequired');
    }

    if (!usingSameAccommodation) {
      const nights = parseInt(formData.accommodationNights, 10);
      if (isNaN(nights) || nights < 1) {
        newErrors.accommodationNights = t('accommodation.nightsRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccommodationChoice = (sameAccommodation: boolean) => {
    setUsingSameAccommodation(sameAccommodation);

    if (sameAccommodation && previousDay) {
      // Pre-fill form with previous day's accommodation AND region
      setFormData((prev) => ({
        ...prev,
        region: previousDay.region, // Auto-fill region too!
        driveTime: decimalHoursToTimeString(previousDay.driveTimeHours),
        driveDistanceKm: previousDay.driveDistanceKm.toString(),
        accommodationName: previousDay.accommodation.name,
        accommodationWebsite: previousDay.accommodation.websiteUrl || '',
        accommodationMapsUrl: previousDay.accommodation.googleMapsUrl || '',
        accommodationMapsEmbedUrl: previousDay.accommodation.googleMapsEmbedUrl || '',
        accommodationDescription: previousDay.accommodation.description || '',
        accommodationNights: (previousDay.accommodation.numberOfNights || 1).toString(),
        accommodationRoomType: previousDay.accommodation.roomType || '',
        accommodationImages: previousDay.accommodation.images,
        accommodationAmenities: previousDay.accommodation.amenities,
      }));
      setStep('main-form');
    } else if (!sameAccommodation && unusedNightsWarning?.hasUnusedNights) {
      // Show warning about unused nights and offer to adjust
      setShowUnusedNightsWarning(true);
    } else {
      setStep('main-form');
    }
  };

  const handleAdjustPreviousNights = (adjust: boolean) => {
    setAdjustPreviousNights(adjust);
    setShowUnusedNightsWarning(false);
    setStep('main-form');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const decimalHours = timeStringToDecimalHours(formData.driveTime);
      const dayData: Omit<TripDay, 'id' | 'dayNumber'> = {
        region: formData.region.trim(),
        driveTimeHours: decimalHours,
        driveDistanceKm: Number(formData.driveDistanceKm) || 0,
        googleMapsUrl: formData.googleMapsUrl.trim() || undefined,
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl),
        notes: undefined,
        accommodation: {
          name: formData.accommodationName,
          websiteUrl: formData.accommodationWebsite.trim() || undefined,
          googleMapsUrl: formData.accommodationMapsUrl.trim() || undefined,
          googleMapsEmbedUrl: extractEmbedUrl(formData.accommodationMapsEmbedUrl) || undefined,
          description: formData.accommodationDescription.trim() || undefined,
          numberOfNights: parseInt(formData.accommodationNights, 10),
          roomType: formData.accommodationRoomType.trim() || undefined,
          images: formData.accommodationImages,
          amenities: formData.accommodationAmenities,
        },
        places: [],
        images: [],
      };

      // Use the appropriate function based on accommodation choice
      if (usingSameAccommodation && previousDay) {
        // Get all days that should be linked with the same accommodation
        const linkedDays = tripData.days.filter(
          (d: TripDay) => d.accommodationId === previousDay.accommodationId || d.id === previousDay.id
        );

        // Use the specialized function to add day and link accommodation
        addDayAndLinkAccommodation(
          dayData,
          linkedDays.map((d: TripDay) => d.id)
        );
      } else {
        // Regular day addition without accommodation linking
        onAdd(dayData);

        // If user chose to adjust previous accommodation's night count
        if (adjustPreviousNights && previousDay && unusedNightsWarning) {
          const newNightCount = unusedNightsWarning.usedNights;
          adjustPreviousAccommodationNights(previousDay.id, newNightCount);
        }
      }

      // Reset form and close modal
      setFormData({
        ...getDefaultAccommodationFormData(),
        driveTime: '',
        driveDistanceKm: '',
        accommodationNights: '1',
      });
      setNewImageUrl('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error adding day:', error);
      // You could set a general error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Handle the change without immediate parsing for number inputs
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        accommodationImages: [...prev.accommodationImages, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      accommodationImages: prev.accommodationImages.filter((_, i) => i !== index),
    }));
  };

  const calculateDayDate = (dayNumber: number) => {
    if (!tripData.tripInfo.startDate) return '';

    const startDate = new Date(tripData.tripInfo.startDate);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayNumber - 1);

    return targetDate.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'pt-PT', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>{t('day.addDay')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {/* Accommodation Choice Step */}
          {step === 'accommodation-choice' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {t('accommodation.accommodationForDay')} {newDayNumber}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('day.unusedNightsWarning', {
                    accommodationName: previousDay?.accommodation?.name || t('accommodation.previousAccommodation'),
                    nights: unusedNightsWarning?.unusedNights || 0,
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleAccommodationChoice(true)}
                  className="p-6 h-auto flex flex-col items-center justify-start text-center min-h-[120px] w-full"
                >
                  <div className="text-lg font-semibold mb-2">{t('accommodation.stayAtSamePlace')}</div>
                  <div className="text-sm text-gray-600 break-words whitespace-normal leading-relaxed max-w-full">
                    {t('accommodation.continueStayingAt')}{' '}
                    {previousDay?.accommodation?.name || t('accommodation.previousAccommodation')}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleAccommodationChoice(false)}
                  className="p-6 h-auto flex flex-col items-center justify-start text-center min-h-[120px] w-full"
                >
                  <div className="text-lg font-semibold mb-2">{t('accommodation.bookNewAccommodation')}</div>
                  <div className="text-sm text-gray-600 break-words whitespace-normal leading-relaxed max-w-full">
                    {t('accommodation.findNewPlaceForDay')} {newDayNumber}
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Unused Nights Warning */}
          {showUnusedNightsWarning && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">{t('day.unusedAccommodationNights')}</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {t('sync.unusedNightsDetails', {
                        accommodationName: unusedNightsWarning?.accommodationName,
                        unusedNights: unusedNightsWarning?.unusedNights,
                        totalBookedNights: unusedNightsWarning?.totalBookedNights,
                        usedNights: unusedNightsWarning?.usedNights,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">{t('sync.adjustAccommodationNights')}</p>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => handleAdjustPreviousNights(true)}
                    className="flex-1 max-w-xs"
                  >
                    {t('day.yesAdjustTo', { nights: unusedNightsWarning?.usedNights })}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAdjustPreviousNights(false)}
                    className="flex-1 max-w-xs"
                  >
                    {t('day.noKeepAs', { nights: unusedNightsWarning?.totalBookedNights })}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Form Step */}
          {step === 'main-form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Day Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">{t('day.region')} *</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder={t('day.exampleRegions')}
                    className={errors.region ? 'border-red-500' : ''}
                  />
                  {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>

                <div>
                  <Label htmlFor="dateLabel">{t('common.date')}</Label>
                  <Input
                    id="dateLabel"
                    value={calculateDayDate(newDayNumber)}
                    disabled
                    className="bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Travel Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driveTime">{t('day.driveTime')}</Label>
                  <Input
                    id="driveTime"
                    name="driveTime"
                    type="time"
                    value={formData.driveTime}
                    onChange={handleChange}
                    placeholder="03:35"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('day.leaveEmptyIfNoDriving')}</p>
                </div>

                <div>
                  <Label htmlFor="driveDistanceKm">{t('day.driveDistance')} (km)</Label>
                  <Input
                    id="driveDistanceKm"
                    name="driveDistanceKm"
                    type="number"
                    min="0"
                    value={formData.driveDistanceKm}
                    onChange={handleChange}
                    placeholder="150"
                  />
                </div>
              </div>

              {/* Google Maps */}
              <div>
                <Label htmlFor="googleMapsUrl">{t('place.googleMapsUrl')}</Label>
                <Input
                  id="googleMapsUrl"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={handleChange}
                  placeholder={t('place.googleMapsUrlPlaceholder')}
                />
                <p className="text-sm text-gray-500 mt-1">{t('place.googleMapsUrlDescription')}</p>
              </div>

              <div>
                <Label htmlFor="googleMapsEmbedUrl">{t('place.googleMapsEmbedUrl')}</Label>
                <Input
                  id="googleMapsEmbedUrl"
                  name="googleMapsEmbedUrl"
                  value={formData.googleMapsEmbedUrl}
                  onChange={handleChange}
                  placeholder={t('place.embedInstructions')}
                />
              </div>

              {/* Only show accommodation section if creating new accommodation */}
              {!usingSameAccommodation && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{t('sync.accommodationInformation')}</h3>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="accommodationName">{t('accommodation.accommodationName')} *</Label>
                      <Input
                        id="accommodationName"
                        name="accommodationName"
                        value={formData.accommodationName}
                        onChange={handleChange}
                        placeholder={t('accommodation.enterHotelName')}
                        className={errors.accommodationName ? 'border-red-500' : ''}
                      />
                      {errors.accommodationName && (
                        <p className="text-red-500 text-sm mt-1">{errors.accommodationName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="accommodationWebsite">{t('place.websiteUrl')}</Label>
                      <Input
                        id="accommodationWebsite"
                        name="accommodationWebsite"
                        type="url"
                        value={formData.accommodationWebsite}
                        onChange={handleChange}
                        placeholder={t('place.websiteUrlPlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <Label htmlFor="accommodationDescription">{t('place.description')}</Label>
                    <Textarea
                      id="accommodationDescription"
                      name="accommodationDescription"
                      value={formData.accommodationDescription}
                      onChange={handleChange}
                      placeholder={t('accommodation.accommodationDescriptionPlaceholder')}
                      rows={3}
                    />
                  </div>

                  {/* Room Type and Nights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="accommodationRoomType">{t('day.roomTypeOptional')}</Label>
                      <Input
                        id="accommodationRoomType"
                        name="accommodationRoomType"
                        value={formData.accommodationRoomType}
                        onChange={handleChange}
                        placeholder={t('accommodation.roomTypeExample')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="accommodationNights">{t('accommodation.nights')} *</Label>
                      <Input
                        id="accommodationNights"
                        name="accommodationNights"
                        type="number"
                        min="1"
                        value={formData.accommodationNights}
                        onChange={handleChange}
                        placeholder="1"
                        className={errors.accommodationNights ? 'border-red-500' : ''}
                      />
                      {errors.accommodationNights && (
                        <p className="text-red-500 text-sm mt-1">{errors.accommodationNights}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="accommodationMapsUrl">{t('place.googleMapsUrl')}</Label>
                      <Input
                        id="accommodationMapsUrl"
                        name="accommodationMapsUrl"
                        type="url"
                        value={formData.accommodationMapsUrl}
                        onChange={handleChange}
                        placeholder={t('place.googleMapsUrlPlaceholder')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="accommodationMapsEmbedUrl">{t('place.googleMapsEmbedUrl')}</Label>
                      <Input
                        id="accommodationMapsEmbedUrl"
                        name="accommodationMapsEmbedUrl"
                        type="url"
                        value={formData.accommodationMapsEmbedUrl}
                        onChange={handleChange}
                        placeholder={t('place.googleMapsEmbedUrlPlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium">
                      {t('place.images')} ({formData.accommodationImages.length})
                    </Label>
                    <div className="mt-2 space-y-3">
                      {/* Current Images */}
                      {formData.accommodationImages.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {formData.accommodationImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img src={imageUrl} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Image */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            placeholder={t('images.enterImageUrl')}
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddImage}
                            disabled={!newImageUrl.trim()}
                            className="flex items-center gap-1"
                          >
                            <Plus size={14} />
                            {t('common.add')}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {t('images.addImage')} ({formData.accommodationImages.length})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <AmenitiesChecklist
                    amenities={formData.accommodationAmenities}
                    onChange={(amenities) =>
                      setFormData((prev) => ({
                        ...prev,
                        accommodationAmenities: amenities,
                      }))
                    }
                  />
                </div>
              )}
            </form>
          )}
        </CardContent>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex gap-2">
            {step === 'main-form' && (
              <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? t('day.adding') : t('day.addDay')}
              </Button>
            )}
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddDayModal;
