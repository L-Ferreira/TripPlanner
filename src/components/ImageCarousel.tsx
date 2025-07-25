import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ChangeEvent, CSSProperties, TouchEvent, useEffect, useRef, useState } from 'react';

interface ImageCarouselProps {
  images: string[];
  onAddImage?: (imageUrl: string) => void;
  className?: string;
}

const ImageCarousel = ({ images, onAddImage, className = '' }: ImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Touch handling for swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Handle image array changes (additions/deletions)
  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= images.length) {
      // If current index is out of bounds, set to last image
      setCurrentImageIndex(images.length - 1);
    }
  }, [images.length, currentImageIndex]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      onAddImage?.(newImageUrl.trim());
      setNewImageUrl('');
      setShowAddForm(false);
    }
  };

  // Touch event handlers for swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  return (
    <Card className={`relative h-full ${className}`}>
      <CardContent className="p-0 h-full">
        <div
          className="h-full relative bg-gray-100 rounded-lg overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <>
              {/* Image container with sliding animation */}
              <div
                className="flex h-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {images.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      style={
                        {
                          imageRendering: 'crisp-edges' as const,
                          WebkitImageRendering: 'crisp-edges' as const,
                          MozImageRendering: 'crisp-edges' as const,
                          msImageRendering: 'crisp-edges' as const,
                        } as CSSProperties
                      }
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-sm mb-2">No images</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Image
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add image form */}
        {showAddForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-white p-4 rounded-lg w-full max-w-sm">
              <h3 className="text-sm font-medium mb-3">Add Image</h3>
              <div className="space-y-3">
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  value={newImageUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewImageUrl(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddImage} className="flex-1">
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewImageUrl('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add image button (when images exist) */}
        {images.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="absolute bottom-2 right-2 bg-green-500/80 hover:bg-green-600 text-white p-1"
          >
            <Plus size={14} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageCarousel;
