import { Download, Edit2, Plus, RotateCcw, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GoogleDriveAuth } from './GoogleDriveAuth';
import { Button } from './ui/button';

interface TripHeaderProps {
  tripTitle: string;
  tripDestination: string;
  tripStartDate: string;
  tripEndDate: string;
  onEditTrip: () => void;
  onAddDay: () => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<void>;
  onResetData: () => void;
}

export const TripHeader = ({ 
  tripTitle, 
  tripDestination, 
  tripStartDate, 
  tripEndDate, 
  onEditTrip, 
  onAddDay,
  onExportData,
  onImportData,
  onResetData
}: TripHeaderProps) => {
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const addDayButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onImportData(file);
      } catch (error) {
        alert('Failed to import file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating button when original button is not visible
        setShowFloatingButton(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -100px 0px' // Start showing floating button a bit before the original disappears
      }
    );

    if (addDayButtonRef.current) {
      observer.observe(addDayButtonRef.current);
    }

    return () => {
      if (addDayButtonRef.current) {
        observer.unobserve(addDayButtonRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Google Drive Controls Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
          <GoogleDriveAuth />
        </div>

        {/* Trip Info Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {tripTitle || 'Untitled Trip'}
            </h1>
            <Button
              onClick={onEditTrip}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit Trip
            </Button>
          </div>
          
          <div className="text-gray-700 mb-4">
            {tripDestination && <p className="text-lg font-medium">{tripDestination}</p>}
            <p className="text-sm">
              {tripStartDate && tripEndDate 
                ? `${formatDate(tripStartDate)} - ${formatDate(tripEndDate)}`
                : 'No dates set'
              }
            </p>
          </div>

          <Button
            ref={addDayButtonRef}
            onClick={onAddDay}
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            <Plus size={16} />
            Add Day
          </Button>

          {/* Data Management Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onExportData}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Download size={16} />
              Export
            </Button>
            <Button
              onClick={handleImportClick}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Upload size={16} />
              Import
            </Button>
            <Button
              onClick={onResetData}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Floating Add Day Button */}
      {showFloatingButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={onAddDay}
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center p-0 h-14 w-14 [&_svg]:size-8"
            size="icon"
          >
            <Plus  />
          </Button>
        </div>
      )}
    </>
  );
}; 