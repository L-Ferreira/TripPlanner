import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { decimalHoursToTimeString, extractEmbedUrl, timeStringToDecimalHours } from '@/lib/utils';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TripDay } from '../hooks/useTripData';

interface EditDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dayData: any) => void;
  day: TripDay | null;
}

const EditDayModal = ({ isOpen, onClose, onSave, day }: EditDayModalProps) => {
  const [formData, setFormData] = useState({
    region: '',
    driveTime: '',
    driveDistanceKm: '',
    googleMapsUrl: '',
    googleMapsEmbedUrl: '',
  });

  useEffect(() => {
    if (day) {
      setFormData({
        region: day.region,
        driveTime: decimalHoursToTimeString(day.driveTimeHours),
        driveDistanceKm: day.driveDistanceKm.toString(),
        googleMapsUrl: day.googleMapsUrl || '',
        googleMapsEmbedUrl: day.googleMapsEmbedUrl || '',
      });
    }
  }, [day]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.region.trim()) {
      const decimalHours = timeStringToDecimalHours(formData.driveTime);
      onSave({
        region: formData.region.trim(),
        driveTimeHours: decimalHours,
        driveDistanceKm: Number(formData.driveDistanceKm) || 0,
        googleMapsUrl: formData.googleMapsUrl.trim() || '',
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl),
      });
      onClose();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

            <div>
              <Label htmlFor="googleMapsUrl">Google Maps URL (optional)</Label>
              <Input
                id="googleMapsUrl"
                name="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={handleChange}
                placeholder="Google Maps URL for the route"
              />
              <p className="text-sm text-gray-500 mt-1">URL to open the route in Google Maps</p>
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
