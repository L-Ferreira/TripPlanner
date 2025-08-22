import { AutoExpandingTextarea } from '@/components/ui/auto-expanding-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractEmbedUrl } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTextareaHeights } from '../hooks/useTextareaHeights';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlace: (place: {
    name: string;
    description: string;
    websiteUrl?: string;
    googleMapsUrl?: string;
    googleMapsEmbedUrl?: string;
    images: string[];
  }) => void;
}

const AddPlaceModal = ({ isOpen, onClose, onAddPlace }: AddPlaceModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    googleMapsUrl: '',
    googleMapsEmbedUrl: '',
    images: [] as string[],
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const { getHeight, saveHeight } = useTextareaHeights();

  const textareaKey = 'add-place-description';
  const savedHeight = getHeight(textareaKey);

  const handleSizeChange = (height: number) => {
    saveHeight(textareaKey, height);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddPlace({
        name: formData.name.trim(),
        description: formData.description.trim(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        googleMapsUrl: formData.googleMapsUrl.trim() || undefined,
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl) || undefined,
        images: formData.images,
      });
      onClose();

      // Reset form
      setFormData({
        name: '',
        description: '',
        websiteUrl: '',
        googleMapsUrl: '',
        googleMapsEmbedUrl: '',
        images: [],
      });
      setNewImageUrl('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>{t('place.addPlace')}</CardTitle>
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
                required
                placeholder={t('place.enterPlaceName')}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('place.description')}</Label>
              <AutoExpandingTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('place.placeDescription')}
                savedHeight={savedHeight}
                onSizeChange={handleSizeChange}
                minHeight={60}
                maxHeight={500}
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
            <Button onClick={handleSubmit} className="flex-1">
              {t('place.addPlace')}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddPlaceModal;
