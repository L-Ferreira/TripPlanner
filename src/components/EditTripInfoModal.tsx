import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TripInfo } from '../hooks/useTripData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface EditTripInfoModalProps {
  isOpen: boolean;
  tripInfo: TripInfo;
  onSave: (updatedInfo: Partial<TripInfo>) => void;
  onCancel: () => void;
}

export const EditTripInfoModal = ({ isOpen, tripInfo, onSave, onCancel }: EditTripInfoModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: tripInfo.name,
    description: tripInfo.description,
    startDate: tripInfo.startDate,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: tripInfo.name,
        description: tripInfo.description,
        startDate: tripInfo.startDate,
      });
      setErrors({});
    }
  }, [isOpen, tripInfo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('trip.tripNameRequired');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('trip.startDateRequired');
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
      onSave(formData);
    } catch (error) {
      console.error('Error saving trip info:', error);
      // You could set a general error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 p-6 pb-4">
          <h2 className="text-xl font-bold mb-0">{t('trip.editTrip')}</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tripName">{t('trip.tripName')} *</Label>
              <Input
                id="tripName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('trip.enterTripName')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="tripDescription">{t('trip.tripDescription')}</Label>
              <Textarea
                id="tripDescription"
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                placeholder={t('trip.enterTripDescription')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="startDate">{t('trip.startDate')} *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              <p className="text-sm text-gray-500 mt-1">{t('trip.endDateWillBeCalculated')}</p>
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
