import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface AmenitiesData {
  breakfast: boolean;
  kitchen: boolean;
  wifi: boolean;
  airConditioning: boolean;
  heating: boolean;
  washer: boolean;
  dryer: boolean;
  parking: boolean;
  pool: boolean;
  gym: boolean;
  spa: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  balcony: boolean;
  oceanView: boolean;
  mountainView: boolean;
  cityView: boolean;
  other: string[];
}

interface AmenitiesChecklistProps {
  amenities: AmenitiesData;
  onChange: (amenities: AmenitiesData) => void;
}

const AmenitiesChecklist: React.FC<AmenitiesChecklistProps> = ({ amenities, onChange }) => {
  const [newAmenity, setNewAmenity] = useState('');

  const handleCheckboxChange = (key: keyof Omit<AmenitiesData, 'other'>) => {
    onChange({
      ...amenities,
      [key]: !amenities[key],
    });
  };

  const handleAddOtherAmenity = () => {
    const trimmedAmenity = newAmenity.trim();
    if (trimmedAmenity && trimmedAmenity.length > 0 && !amenities.other.includes(trimmedAmenity)) {
      onChange({
        ...amenities,
        other: [...amenities.other, trimmedAmenity],
      });
      setNewAmenity('');
    }
  };

  const handleRemoveOtherAmenity = (index: number) => {
    onChange({
      ...amenities,
      other: amenities.other.filter((_, i) => i !== index),
    });
  };

  const amenityItems = [
    { key: 'breakfast' as const, label: 'Breakfast included' },
    { key: 'kitchen' as const, label: 'Kitchen/Kitchenette' },
    { key: 'wifi' as const, label: 'Free WiFi' },
    { key: 'airConditioning' as const, label: 'Air Conditioning' },
    { key: 'heating' as const, label: 'Heating' },
    { key: 'washer' as const, label: 'Washing Machine' },
    { key: 'dryer' as const, label: 'Dryer' },
    { key: 'parking' as const, label: 'Parking' },
    { key: 'pool' as const, label: 'Swimming Pool' },
    { key: 'gym' as const, label: 'Gym/Fitness Center' },
    { key: 'spa' as const, label: 'Spa' },
    { key: 'petFriendly' as const, label: 'Pet Friendly' },
    { key: 'smokingAllowed' as const, label: 'Smoking Allowed' },
    { key: 'balcony' as const, label: 'Balcony/Terrace' },
    { key: 'oceanView' as const, label: 'Ocean View' },
    { key: 'mountainView' as const, label: 'Mountain View' },
    { key: 'cityView' as const, label: 'City View' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {amenityItems.map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={amenities[item.key]}
                onCheckedChange={() => handleCheckboxChange(item.key)}
              />
              <Label htmlFor={item.key} className="text-sm font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </div>

        {/* Other amenities section */}
        <div className="mt-6">
          <Label className="text-sm font-medium">Other Amenities</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add custom amenity"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddOtherAmenity()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOtherAmenity}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          {amenities.other.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {amenities.other.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                >
                  {amenity}
                  <button
                    onClick={() => handleRemoveOtherAmenity(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmenitiesChecklist; 