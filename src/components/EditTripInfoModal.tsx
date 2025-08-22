import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
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
      newErrors.name = 'Nome da viagem é obrigatório';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
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
          <h2 className="text-xl font-bold mb-0">Editar Informação da Viagem</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tripName">Nome da Viagem *</Label>
              <Input
                id="tripName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Introduzir nome da viagem"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="tripDescription">Descrição</Label>
              <Textarea
                id="tripDescription"
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                placeholder="Introduzir descrição da viagem"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              <p className="text-sm text-gray-500 mt-1">
                A data de fim será calculada automaticamente com base nos dias da sua viagem
              </p>
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
