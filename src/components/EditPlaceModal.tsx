import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { extractEmbedUrl } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Place } from '../hooks/useTripData';

interface EditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (placeData: Partial<Place>) => void;
  place: Place | null;
}

const EditPlaceModal = ({ isOpen, onClose, onSave, place }: EditPlaceModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: place?.name || '',
    description: place?.description || '',
    websiteUrl: place?.websiteUrl || '',
    googleMapsUrl: place?.googleMapsUrl || '',
    googleMapsEmbedUrl: place?.googleMapsEmbedUrl || '',
    images: place?.images || [],
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name,
        description: place.description,
        websiteUrl: place.websiteUrl || '',
        googleMapsUrl: place.googleMapsUrl || '',
        googleMapsEmbedUrl: place.googleMapsEmbedUrl || '',
        images: place.images || [],
      });
      setErrors({});
    }
  }, [place]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('place.placeNameRequired');
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
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        googleMapsUrl: formData.googleMapsUrl.trim() || undefined,
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl) || undefined,
        images: formData.images,
      });
      onClose();
    } catch (error) {
      console.error('Error saving place:', error);
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

  const handleRemoveImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  if (!isOpen || !place) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>{t('place.editPlace')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('place.placeName')} *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('place.enterPlaceName')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{t('place.placeNameRequired')}</p>}
            </div>

            <div>
              <Label htmlFor="description">{t('place.description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('place.placeDescription')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="websiteUrl">{t('place.websiteUrl')}</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder={t('place.websiteUrlPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="googleMapsUrl">{t('place.googleMapsUrl')}</Label>
              <Input
                id="googleMapsUrl"
                name="googleMapsUrl"
                type="url"
                value={formData.googleMapsUrl}
                onChange={handleChange}
                placeholder={t('place.googleMapsUrlPlaceholder')}
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
                placeholder={t('place.embedInstructions')}
              />
              <p className="text-sm text-gray-500 mt-1">{t('place.embedInstructions')}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">
                {t('place.images')} ({formData.images.length})
              </Label>
              <div className="mt-2 space-y-3">
                {/* Current Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img src={imageUrl} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(imageUrl)}
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
                      onKeyPress={handleKeyPress}
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
                  <p className="text-sm text-gray-500 mt-1">{t('images.addImagesByPastingUrls')}</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditPlaceModal;
