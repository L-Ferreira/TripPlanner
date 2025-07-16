import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractEmbedUrl, generateGoogleMapsUrl } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Place } from '../hooks/useTripData';

interface EditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (placeData: Partial<Place>) => void;
  place: Place | null;
}

const EditPlaceModal: React.FC<EditPlaceModalProps> = ({ isOpen, onClose, onSave, place }) => {
  const [formData, setFormData] = useState({
    name: place?.name || '',
    description: place?.description || '',
    websiteUrl: place?.websiteUrl || '',
    googleMapsUrl: place?.googleMapsUrl || '',
    googleMapsEmbedUrl: place?.googleMapsEmbedUrl || '',
    images: place?.images || []
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name,
        description: place.description,
        websiteUrl: place.websiteUrl || '',
        googleMapsUrl: place.googleMapsUrl,
        googleMapsEmbedUrl: place.googleMapsEmbedUrl || '',
        images: place.images || []
      });
    }
  }, [place]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        googleMapsUrl: formData.googleMapsUrl.trim() || generateGoogleMapsUrl(formData.name),
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl) || undefined,
        images: formData.images
      });
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  if (!isOpen || !place) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Edit Place</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Place Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter place name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the place (optional)"
              />
            </div>
            
            <div>
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="googleMapsUrl">Google Maps URL (optional)</Label>
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
              <Label htmlFor="googleMapsEmbedUrl">Google Maps Embed URL (optional)</Label>
              <Input
                id="googleMapsEmbedUrl"
                name="googleMapsEmbedUrl"
                type="url"
                value={formData.googleMapsEmbedUrl}
                onChange={handleChange}
                placeholder="Paste iframe HTML or embed URL here"
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the full iframe HTML from Google Maps → Share → Embed a map
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Images ({formData.images.length})</Label>
              <div className="mt-2 space-y-3">
                {/* Current Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
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
                      placeholder="Enter image URL"
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
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Add images by pasting URL links
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditPlaceModal; 