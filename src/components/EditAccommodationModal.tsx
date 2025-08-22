import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { extractEmbedUrl } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TripDay } from '../hooks/useTripData';
import { AmenitiesData, getDefaultAmenities } from '../lib/amenities';
import AmenitiesChecklist from './AmenitiesChecklist';

interface EditAccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accommodationData: TripDay['accommodation']) => void;
  accommodation: TripDay['accommodation'] | null;
  dayNumber: number;
}

const EditAccommodationModal = ({ isOpen, onClose, onSave, accommodation, dayNumber }: EditAccommodationModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: accommodation?.name || '',
    websiteUrl: accommodation?.websiteUrl || '',
    googleMapsUrl: accommodation?.googleMapsUrl || '',
    googleMapsEmbedUrl: accommodation?.googleMapsEmbedUrl || '',
    description: accommodation?.description || '',
    numberOfNights: (accommodation?.numberOfNights || 1).toString(),
    roomType: accommodation?.roomType || '',
    images: accommodation?.images || [],
    amenities: accommodation?.amenities || getDefaultAmenities(),
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accommodation) {
      setFormData({
        name: accommodation.name,
        websiteUrl: accommodation.websiteUrl || '',
        googleMapsUrl: accommodation.googleMapsUrl || '',
        googleMapsEmbedUrl: accommodation.googleMapsEmbedUrl || '',
        description: accommodation.description || '',
        numberOfNights: (accommodation.numberOfNights || 1).toString(),
        roomType: accommodation.roomType || '',
        images: accommodation.images || [],
        amenities: accommodation.amenities || getDefaultAmenities(),
      });
      setErrors({});
    }
  }, [accommodation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('accommodation.accommodationNameRequired');
    }

    const nights = parseInt(formData.numberOfNights, 10);
    if (isNaN(nights) || nights < 1) {
      newErrors.numberOfNights = t('accommodation.nightsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty amenities from the 'other' array
      const filteredAmenities = {
        ...formData.amenities,
        other: formData.amenities.other.filter((amenity) => amenity.trim() !== ''),
      };

      onSave({
        name: formData.name.trim(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        googleMapsUrl: formData.googleMapsUrl.trim() || undefined,
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl) || undefined,
        description: formData.description.trim() || undefined,
        numberOfNights: parseInt(formData.numberOfNights, 10),
        roomType: formData.roomType.trim() || undefined,
        images: formData.images,
        amenities: filteredAmenities,
      });
      onClose();
    } catch (error) {
      console.error('Error saving accommodation:', error);
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
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAmenitiesChange = (amenities: AmenitiesData) => {
    setFormData((prev) => ({
      ...prev,
      amenities,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('accommodation.editAccommodation')} - {t('day.day')} {dayNumber}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('accommodation.accommodationName')} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('accommodation.enterHotelName')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{t('accommodation.accommodationNameRequired')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="websiteUrl">{t('place.websiteUrl')}</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://hotel-website.com"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                {t('place.description')} ({t('common.optional')})
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('accommodation.accommodationDescriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* Room Type and Nights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType">
                  {t('accommodation.roomType')} ({t('common.optional')})
                </Label>
                <Input
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  placeholder={t('accommodation.roomTypeExample')}
                />
              </div>

              <div>
                <Label htmlFor="numberOfNights">{t('accommodation.nights')} *</Label>
                <Input
                  id="numberOfNights"
                  name="numberOfNights"
                  type="number"
                  min="1"
                  value={formData.numberOfNights}
                  onChange={handleChange}
                  placeholder="1"
                  className={errors.numberOfNights ? 'border-red-500' : ''}
                />
                {errors.numberOfNights && (
                  <p className="text-red-500 text-sm mt-1">{t('accommodation.nightsRequired')}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="googleMapsUrl">{t('place.googleMapsUrl')}</Label>
                <Input
                  id="googleMapsUrl"
                  name="googleMapsUrl"
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div>
                <Label htmlFor="googleMapsEmbedUrl">{t('place.googleMapsEmbedUrl')}</Label>
                <Input
                  id="googleMapsEmbedUrl"
                  name="googleMapsEmbedUrl"
                  type="url"
                  value={formData.googleMapsEmbedUrl}
                  onChange={handleChange}
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-xs text-gray-500 mt-1">{t('place.embedInstructions')}</p>
              </div>
            </div>

            {/* Images */}
            <div>
              <Label className="text-sm font-medium">
                {t('place.images')} ({formData.images.length})
              </Label>
              <div className="mt-2 space-y-3">
                {/* Current Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {formData.images.map((imageUrl, index) => (
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
                    {formData.images.length} {t('images.addImage')}(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <AmenitiesChecklist amenities={formData.amenities} onChange={handleAmenitiesChange} />
          </form>
        </CardContent>

        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditAccommodationModal;
