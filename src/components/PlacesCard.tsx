import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, ExternalLink, MapPin, Plus, Trash2 } from 'lucide-react';
import { TripDay } from '../hooks/useTripData';
import ImageCarousel from './ImageCarousel';

interface PlacesCardProps {
  day: TripDay;
  onAddPlace: (dayId: string) => void;
  onEditPlace: (dayId: string, place: any) => void;
  onDeletePlace: (dayId: string, placeId: string) => void;
  onAddPlaceImage: (dayId: string, placeId: string, imageUrl: string) => void;
}

const PlacesCard: React.FC<PlacesCardProps> = ({ 
  day, 
  onAddPlace, 
  onEditPlace, 
  onDeletePlace, 
  onAddPlaceImage 
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${day.places.length > 0 ? 'pb-0' : ''}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Places to Visit
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onAddPlace(day.id)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Plus size={14} />
          </Button>
        </div>
      </CardHeader>
      {day.places.length > 0 && (
        <CardContent className="p-6">
          <div className="space-y-6">
            {day.places.map((place) => (
              <div key={place.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 break-words">{place.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPlace(day.id, place)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePlace(day.id, place.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
        <div className={`${((place.images && place.images.length > 0) || place.googleMapsEmbedUrl) ? 'border-b border-gray-50 pb-3 mb-3' : ''}`}>

                {place.description && (
                  <p className="text-gray-600 text-sm mb-4 text-left">{place.description}</p>
                )}
                
                {/* Links - conditional spacing based on content above */}
                {(place.websiteUrl || place.googleMapsUrl) && <div className={`flex gap-3`}>
                  {place.websiteUrl && (
                    <a
                      href={place.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      <ExternalLink size={14} />
                      Website
                    </a>
                  )}
                  {place.googleMapsUrl && (
                    <a
                      href={place.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm transition-colors"
                    >
                      <MapPin size={14} />
                      Maps
                    </a>
                  )}
                </div>}
                </div>

                {/* Carousel and Map Section */}
                {((place.images && place.images.length > 0) || place.googleMapsEmbedUrl) && (
                  <div className="flex flex-col lg:flex-row gap-4 max-h-[700px]">

                    {/* Image Carousel Section */}
                    {place.images && place.images.length > 0 && (
                      <div className={`${place.googleMapsEmbedUrl ? 'lg:w-[60%]' : 'w-full'} relative`}>
                        <div className="h-64 lg:h-80 max-h-[400px] rounded-lg overflow-hidden">
                          <ImageCarousel
                            images={place.images}
                            onAddImage={(imageUrl: string) => onAddPlaceImage(day.id, place.id, imageUrl)}
                            className="h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Map Section */}
                    {place.googleMapsEmbedUrl && (
                      <div className={`${place.images && place.images.length > 0 ? 'lg:w-[40%]' : 'w-full'} bg-gray-100 rounded-lg overflow-hidden`}>
                        <div className="h-64 lg:h-80 max-h-[400px]">
                          <iframe
                            src={place.googleMapsEmbedUrl}
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
              </div>
            ))}
          </div>
        </CardContent>
      )} 
    </Card>
  );
};

export default PlacesCard; 