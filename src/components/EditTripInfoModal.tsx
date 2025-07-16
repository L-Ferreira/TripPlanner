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

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: tripInfo.name,
        description: tripInfo.description,
        startDate: tripInfo.startDate,
      });
    }
  }, [isOpen, tripInfo]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 p-6 pb-4">
          <h2 className="text-xl font-bold mb-0">Edit Trip Information</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter trip name"
                required
              />
            </div>

            <div>
              <Label htmlFor="tripDescription">Description</Label>
              <Textarea
                id="tripDescription"
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                placeholder="Enter trip description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                End date will be automatically calculated based on your trip days
              </p>
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
