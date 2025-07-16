import {
  decimalHoursToTimeString,
  extractEmbedUrl,
  generateGoogleMapsUrl,
  getDefaultAccommodationFormData,
  timeStringToDecimalHours,
} from '@/lib/utils';
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TripData, TripDay } from '../hooks/useTripData';
import AmenitiesChecklist from './AmenitiesChecklist';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
  const [step, setStep] = useState<'accommodation-choice' | 'main-form'>('accommodation-choice');
  const [usingSameAccommodation, setUsingSameAccommodation] = useState(false);
  const [unusedNightsWarning, setUnusedNightsWarning] = useState<any>(null);
  const [showUnusedNightsWarning, setShowUnusedNightsWarning] = useState(false);
  const [adjustPreviousNights, setAdjustPreviousNights] = useState(false);

  const newDayNumber = tripData.days.length + 1;
  const previousDay = tripData.days.find((d: TripDay) => d.dayNumber === newDayNumber - 1);
  const hasPreviousDay = !!previousDay;

  const [formData, setFormData] = useState({
    ...getDefaultAccommodationFormData(),
    driveTime: '',
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

      // Reset form
      setFormData({
        ...getDefaultAccommodationFormData(),
        driveTime: '',
      });
    }
  }, [isOpen, hasPreviousDay, newDayNumber, checkUnusedNights]);

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
        accommodationMapsUrl: previousDay.accommodation.googleMapsUrl,
        accommodationMapsEmbedUrl: previousDay.accommodation.googleMapsEmbedUrl || '',
        accommodationDescription: previousDay.accommodation.description || '',
        accommodationNights: previousDay.accommodation.numberOfNights || 1,
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.region.trim() && formData.accommodationName.trim()) {
      const decimalHours = timeStringToDecimalHours(formData.driveTime);
      const dayData: Omit<TripDay, 'id' | 'dayNumber'> = {
        region: formData.region.trim(),
        driveTimeHours: decimalHours,
        driveDistanceKm: Number(formData.driveDistanceKm) || 0,
        googleMapsUrl: formData.googleMapsUrl.trim() || generateGoogleMapsUrl(formData.region),
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl),
        notes: undefined,
        accommodation: {
          name: formData.accommodationName,
          websiteUrl: formData.accommodationWebsite.trim() || undefined,
          googleMapsUrl: formData.accommodationMapsUrl.trim() || generateGoogleMapsUrl(formData.accommodationName),
          googleMapsEmbedUrl: extractEmbedUrl(formData.accommodationMapsEmbedUrl) || undefined,
          description: formData.accommodationDescription.trim() || undefined,
          numberOfNights: formData.accommodationNights,
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
      });
      setNewImageUrl('');
      onClose();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || (name === 'accommodationNights' ? 1 : 0) : value,
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

    return targetDate.toLocaleDateString('en-US', {
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
            <CardTitle>Add New Day</CardTitle>
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
                <h3 className="text-lg font-semibold mb-2">Accommodation for Day {newDayNumber}</h3>
                <p className="text-gray-600 mb-4">
                  {previousDay?.accommodation?.name || 'Previous accommodation'} has{' '}
                  {unusedNightsWarning?.unusedNights || 0} unused night
                  {(unusedNightsWarning?.unusedNights || 0) !== 1 ? 's' : ''}. Would you like to stay there or book a
                  new accommodation?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleAccommodationChoice(true)}
                  className="p-6 h-auto flex flex-col items-center justify-center text-center"
                >
                  <div className="text-lg font-semibold mb-2">Stay at Same Place</div>
                  <div className="text-sm text-gray-600">
                    Continue staying at {previousDay?.accommodation?.name || 'previous accommodation'}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleAccommodationChoice(false)}
                  className="p-6 h-auto flex flex-col items-center justify-center text-center"
                >
                  <div className="text-lg font-semibold mb-2">Book New Accommodation</div>
                  <div className="text-sm text-gray-600">Find a new place to stay for Day {newDayNumber}</div>
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
                    <h4 className="font-semibold text-yellow-800">Unused Accommodation Nights</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {unusedNightsWarning?.accommodationName} has {unusedNightsWarning?.unusedNights} unused night
                      {unusedNightsWarning?.unusedNights !== 1 ? 's' : ''}. You booked{' '}
                      {unusedNightsWarning?.totalBookedNights} night
                      {unusedNightsWarning?.totalBookedNights !== 1 ? 's' : ''} but only used{' '}
                      {unusedNightsWarning?.usedNights}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Would you like to adjust the previous accommodation&apos;s night count to match actual usage?
                </p>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => handleAdjustPreviousNights(true)}
                    className="flex-1 max-w-xs"
                  >
                    Yes, Adjust to {unusedNightsWarning?.usedNights} Night
                    {unusedNightsWarning?.usedNights !== 1 ? 's' : ''}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAdjustPreviousNights(false)}
                    className="flex-1 max-w-xs"
                  >
                    No, Keep as {unusedNightsWarning?.totalBookedNights} Night
                    {unusedNightsWarning?.totalBookedNights !== 1 ? 's' : ''}
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
                  <Label htmlFor="region">Region/Location *</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Porto, Lisbon, Aveiro"
                  />
                </div>

                <div>
                  <Label htmlFor="dateLabel">Date</Label>
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
                  <Label htmlFor="driveTime">Drive Time</Label>
                  <Input
                    id="driveTime"
                    name="driveTime"
                    type="time"
                    value={formData.driveTime}
                    onChange={handleChange}
                    placeholder="03:35"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if no driving</p>
                </div>

                <div>
                  <Label htmlFor="driveDistanceKm">Distance (km)</Label>
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
                <Label htmlFor="googleMapsUrl">Google Maps URL (optional)</Label>
                <Input
                  id="googleMapsUrl"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={handleChange}
                  placeholder="Google Maps URL for the route"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL to open the route in Google Maps (will auto-generate if not provided)
                </p>
              </div>

              <div>
                <Label htmlFor="googleMapsEmbedUrl">Google Maps Embed URL (optional)</Label>
                <Input
                  id="googleMapsEmbedUrl"
                  name="googleMapsEmbedUrl"
                  value={formData.googleMapsEmbedUrl}
                  onChange={handleChange}
                  placeholder="Paste iframe HTML or embed URL here"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste the full iframe HTML from Google Maps → Share → Embed a map
                </p>
              </div>

              {/* Only show accommodation section if creating new accommodation */}
              {!usingSameAccommodation && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Accommodation Information</h3>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="accommodationName">Hotel/Accommodation Name *</Label>
                      <Input
                        id="accommodationName"
                        name="accommodationName"
                        value={formData.accommodationName}
                        onChange={handleChange}
                        required
                        placeholder="Hotel Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accommodationWebsite">Website URL (optional)</Label>
                      <Input
                        id="accommodationWebsite"
                        name="accommodationWebsite"
                        type="url"
                        value={formData.accommodationWebsite}
                        onChange={handleChange}
                        placeholder="https://hotel-website.com"
                      />
                    </div>
                  </div>

                  {/* Description and Stay Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="accommodationDescription">Description</Label>
                      <Input
                        id="accommodationDescription"
                        name="accommodationDescription"
                        value={formData.accommodationDescription}
                        onChange={handleChange}
                        placeholder="Brief description of the accommodation"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accommodationNights">Number of Nights *</Label>
                      <Input
                        id="accommodationNights"
                        name="accommodationNights"
                        type="number"
                        min="1"
                        value={formData.accommodationNights}
                        onChange={handleChange}
                        required
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="mb-6">
                    <Label htmlFor="accommodationRoomType">Room Type (optional)</Label>
                    <Input
                      id="accommodationRoomType"
                      name="accommodationRoomType"
                      value={formData.accommodationRoomType}
                      onChange={handleChange}
                      placeholder="e.g., Deluxe Room, Suite, Standard Room"
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="accommodationMapsUrl">Google Maps URL (optional)</Label>
                      <Input
                        id="accommodationMapsUrl"
                        name="accommodationMapsUrl"
                        type="url"
                        value={formData.accommodationMapsUrl}
                        onChange={handleChange}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="accommodationMapsEmbedUrl">Google Maps Embed URL (optional)</Label>
                      <Input
                        id="accommodationMapsEmbedUrl"
                        name="accommodationMapsEmbedUrl"
                        type="url"
                        value={formData.accommodationMapsEmbedUrl}
                        onChange={handleChange}
                        placeholder="https://www.google.com/maps/embed?..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Go to Google Maps → Share → Embed a map → Copy the iframe src URL
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium">Images ({formData.accommodationImages.length})</Label>
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
                            placeholder="Enter image URL"
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
                            Add
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formData.accommodationImages.length} image(s) added
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
              <Button onClick={handleSubmit} className="flex-1">
                Add Day
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddDayModal;
