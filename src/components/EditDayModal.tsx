import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractEmbedUrl } from '@/lib/utils';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TripDay } from '../hooks/useTripData';

interface EditDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dayData: any) => void;
  day: TripDay | null;
}

const EditDayModal: React.FC<EditDayModalProps> = ({ isOpen, onClose, onSave, day }) => {
  const [formData, setFormData] = useState({
    region: '',
    driveTimeHours: 0,
    driveDistanceKm: 0,
    googleMapsEmbedUrl: ''
  });

  useEffect(() => {
    if (day) {
      setFormData({
        region: day.region,
        driveTimeHours: day.driveTimeHours,
        driveDistanceKm: day.driveDistanceKm,
        googleMapsEmbedUrl: day.googleMapsEmbedUrl || ''
      });
    }
  }, [day]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.region.trim()) {
      onSave({
        region: formData.region.trim(),
        driveTimeHours: Number(formData.driveTimeHours),
        driveDistanceKm: Number(formData.driveDistanceKm),
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl)
      });
      onClose();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }));
  };

  if (!isOpen || !day) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Edit Day {day.dayNumber}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driveTimeHours">Drive Time (hours)</Label>
                <Input
                  id="driveTimeHours"
                  name="driveTimeHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.driveTimeHours}
                  onChange={handleChange}
                  placeholder="2.5"
                />
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
            
            <div>
              <Label htmlFor="googleMapsEmbedUrl">Google Maps Embed URL (optional)</Label>
              <Input
                id="googleMapsEmbedUrl"
                name="googleMapsEmbedUrl"
                value={formData.googleMapsEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Get embed URL from Google Maps → Share → Embed a map
              </p>
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

export default EditDayModal; 