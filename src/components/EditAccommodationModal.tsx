import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractEmbedUrl, generateGoogleMapsUrl, getDefaultAmenities } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TripDay } from '../hooks/useTripData';
import AmenitiesChecklist from './AmenitiesChecklist';

interface EditAccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accommodationData: TripDay['accommodation']) => void;
  accommodation: TripDay['accommodation'] | null;
  dayNumber: number;
}

const EditAccommodationModal: React.FC<EditAccommodationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  accommodation,
  dayNumber 
}) => {
  const [formData, setFormData] = useState({
    name: accommodation?.name || '',
    websiteUrl: accommodation?.websiteUrl || '',
    googleMapsUrl: accommodation?.googleMapsUrl || '',
    googleMapsEmbedUrl: accommodation?.googleMapsEmbedUrl || '',
    description: accommodation?.description || '',
    numberOfNights: accommodation?.numberOfNights || 1,
    roomType: accommodation?.roomType || '',
    images: accommodation?.images || [],
    amenities: accommodation?.amenities || getDefaultAmenities()
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (accommodation) {
      setFormData({
        name: accommodation.name,
        websiteUrl: accommodation.websiteUrl || '',
        googleMapsUrl: accommodation.googleMapsUrl,
        googleMapsEmbedUrl: accommodation.googleMapsEmbedUrl || '',
        description: accommodation.description || '',
        numberOfNights: accommodation.numberOfNights || 1,
        roomType: accommodation.roomType || '',
        images: accommodation.images || [],
        amenities: accommodation.amenities || getDefaultAmenities()
      });
    }
  }, [accommodation]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.numberOfNights > 0) {
      // Filter out empty amenities from the 'other' array
      const filteredAmenities = {
        ...formData.amenities,
        other: formData.amenities.other.filter(amenity => amenity.trim() !== '')
      };
      
      onSave({
        name: formData.name.trim(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        googleMapsUrl: formData.googleMapsUrl.trim() || generateGoogleMapsUrl(formData.name),
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl) || undefined,
        description: formData.description.trim() || undefined,
        numberOfNights: formData.numberOfNights,
        roomType: formData.roomType.trim() || undefined,
        images: formData.images,
        amenities: filteredAmenities
      });
      onClose();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 1 : value
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

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAmenitiesChange = (amenities: typeof formData.amenities) => {
    setFormData(prev => ({
      ...prev,
      amenities
    }));
  };

  if (!isOpen || !accommodation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Edit Accommodation - Day {dayNumber}</CardTitle>
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
                <Label htmlFor="name">Hotel/Accommodation Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Hotel Name"
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
                  placeholder="https://hotel-website.com"
                />
              </div>
            </div>

            {/* Description and Stay Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the accommodation"
                />
              </div>
              
              <div>
                <Label htmlFor="numberOfNights">Number of Nights *</Label>
                <Input
                  id="numberOfNights"
                  name="numberOfNights"
                  type="number"
                  min="1"
                  value={formData.numberOfNights}
                  onChange={handleChange}
                  required
                  placeholder="1"
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <Label htmlFor="roomType">Room Type (optional)</Label>
              <Input
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                placeholder="e.g., Deluxe Room, Suite, Standard Room"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Go to Google Maps → Share → Embed a map → Copy the iframe src URL
                </p>
              </div>
            </div>

            {/* Images */}
            <div>
              <Label className="text-sm font-medium">Images ({formData.images.length})</Label>
              <div className="mt-2 space-y-3">
                {/* Current Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                    {formData.images.length} image(s) added
                  </p>
                </div>

                {/* Amenities */}
                <AmenitiesChecklist
                  amenities={formData.amenities}
                  onChange={handleAmenitiesChange}
                />
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

export default EditAccommodationModal; 