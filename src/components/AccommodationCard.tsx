import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Edit2, ExternalLink, MapPin } from 'lucide-react';
import { TripDay } from '../hooks/useTripData';
import ImageCarousel from './ImageCarousel';

interface AccommodationCardProps {
  day: TripDay;
  onEditAccommodation: (dayId: string, accommodation: any) => void;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({ day, onEditAccommodation }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bed size={20} />
            <span>{day.accommodation.name}</span>
            <div className="text-sm text-gray-600 font-normal">
              Night {day.nightNumber || 1} of {day.accommodation.numberOfNights || 1}
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditAccommodation(day.id, day.accommodation)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Edit2 size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Accommodation Details */}
        <div className={`${(day.accommodation.images && day.accommodation.images.length > 0) || day.accommodation.googleMapsEmbedUrl ? 'border-b border-gray-100 pb-6 mb-6' : ''}`}>
          <div className="space-y-1 text-left">
            {day.accommodation.numberOfNights && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Nights:</span> {day.accommodation.numberOfNights} night{day.accommodation.numberOfNights > 1 ? 's' : ''}
              </p>
            )}
            
            {day.accommodation.roomType && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Room type:</span> {day.accommodation.roomType}
              </p>
            )}
            
            {day.accommodation.description && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Description:</span> {day.accommodation.description}
              </p>
            )}
            
            {/* Amenities Section */}
            {day.accommodation.amenities && (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sm text-gray-700">Amenities:</span>
                  {Object.entries(day.accommodation.amenities).map(([key, value]) => {
                    if (key === 'other') {
                      return (day.accommodation.amenities.other || []).map((amenity, index) => (
                        <span key={`other-${index}`} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {amenity}
                        </span>
                      ));
                    }
                    
                    if (value === true) {
                      const labels: { [key: string]: string } = {
                        breakfast: 'Breakfast',
                        kitchen: 'Kitchen',
                        wifi: 'WiFi',
                        airConditioning: 'A/C',
                        heating: 'Heating',
                        washer: 'Washer',
                        dryer: 'Dryer',
                        parking: 'Parking',
                        pool: 'Pool',
                        gym: 'Gym',
                        spa: 'Spa',
                        petFriendly: 'Pet Friendly',
                        smokingAllowed: 'Smoking',
                        balcony: 'Balcony',
                        oceanView: 'Ocean View',
                        mountainView: 'Mountain View',
                        cityView: 'City View'
                      };
                      
                      return (
                        <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {labels[key] || key}
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                </div>
              </div>
            )}
            
            {/* Links - conditional spacing based on content below */}
            <div className={`flex gap-3 mt-3 ${
                 ((day.accommodation.images && day.accommodation.images.length > 0) || day.accommodation.googleMapsEmbedUrl) 
                  && 'mb-4' 
            }`}>
              {day.accommodation.websiteUrl && (
                <a
                  href={day.accommodation.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  <ExternalLink size={14} />
                  Website
                </a>
              )}
              {day.accommodation.googleMapsUrl && (
                <a
                  href={day.accommodation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm transition-colors"
                >
                  <MapPin size={14} />
                  Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Images and Map Section */}
        {((day.accommodation.images && day.accommodation.images.length > 0) || day.accommodation.googleMapsEmbedUrl) && (
          <div className="flex flex-col lg:flex-row gap-4 max-h-[700px]">
            {/* Image Carousel Section */}
            {day.accommodation.images && day.accommodation.images.length > 0 && (
              <div className={`${day.accommodation.googleMapsEmbedUrl ? 'lg:w-[60%]' : 'w-full'} relative`}>
                <div className="h-64 lg:h-80 max-h-[400px] rounded-lg overflow-hidden">
                  <ImageCarousel
                    images={day.accommodation.images}
                    className="h-full"
                  />
                </div>
              </div>
            )}

            {/* Map Section */}
            {day.accommodation.googleMapsEmbedUrl && (
              <div className={`${day.accommodation.images && day.accommodation.images.length > 0 ? 'lg:w-[40%]' : 'w-full'} bg-gray-100 rounded-lg overflow-hidden`}>
                <div className="h-64 lg:h-80 max-h-[400px]">
                  <iframe
                    src={day.accommodation.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccommodationCard; 