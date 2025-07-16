import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { AmenitiesData, amenityCategories } from '../lib/amenities';

interface AmenitiesChecklistProps {
  amenities: AmenitiesData;
  onChange: (amenities: AmenitiesData) => void;
}

const AmenitiesChecklist = ({ amenities, onChange }: AmenitiesChecklistProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Amenities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {amenityCategories.map((category) => (
          <div key={category.title}>
            <h4 className="font-medium text-sm text-gray-800 mb-3">{category.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.items.map((item) => (
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
          </div>
        ))}

        {/* Other amenities section */}
        <div>
          <h4 className="font-medium text-sm text-gray-800 mb-3">Custom Amenities</h4>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add custom amenity"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOtherAmenity();
                }
              }}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddOtherAmenity}>
              <Plus size={16} />
            </Button>
          </div>
          {amenities.other.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.other.map((amenity, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                  <span className="text-sm">{amenity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOtherAmenity(index)}
                    className="h-auto p-1 hover:bg-gray-200"
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmenitiesChecklist;
