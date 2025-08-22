import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { decimalHoursToTimeString, extractEmbedUrl, timeStringToDecimalHours } from '@/lib/utils';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TripDay } from '../hooks/useTripData';

interface EditDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dayData: any) => void;
  day: TripDay | null;
}

const EditDayModal = ({ isOpen, onClose, onSave, day }: EditDayModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    region: '',
    driveTime: '',
    driveDistanceKm: '',
    googleMapsUrl: '',
    googleMapsEmbedUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (day) {
      setFormData({
        region: day.region,
        driveTime: decimalHoursToTimeString(day.driveTimeHours),
        driveDistanceKm: day.driveDistanceKm.toString(),
        googleMapsUrl: day.googleMapsUrl || '',
        googleMapsEmbedUrl: day.googleMapsEmbedUrl || '',
      });
      setErrors({});
    }
  }, [day]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.region.trim()) {
      newErrors.region = t('day.regionRequired');
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
      const decimalHours = timeStringToDecimalHours(formData.driveTime);
      onSave({
        region: formData.region.trim(),
        driveTimeHours: decimalHours,
        driveDistanceKm: Number(formData.driveDistanceKm) || 0,
        googleMapsUrl: formData.googleMapsUrl.trim() || '',
        googleMapsEmbedUrl: extractEmbedUrl(formData.googleMapsEmbedUrl),
      });
      onClose();
    } catch (error) {
      console.error('Error saving day:', error);
      // You could set a general error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  if (!isOpen || !day) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('day.editDay')} {day.dayNumber}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {errors.region && <p className="text-red-500 text-sm mt-1">{t('day.regionRequired')}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <p className="text-sm text-gray-500 mt-1">{t('place.embedInstructions')}</p>
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

export default EditDayModal;
