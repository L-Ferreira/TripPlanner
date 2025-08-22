import { Download, Edit2, Plus, RotateCcw, Upload } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortugalFlag, UKFlag } from './FlagIcons';
import { GoogleDriveAuth } from './GoogleDriveAuth';
import MarkdownRenderer from './MarkdownRenderer';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  onResetData,
}: TripHeaderProps) => {
  const { t, i18n } = useTranslation();
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const addDayButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onImportData(file);
      } catch (error) {
        alert(t('import.importFailed'));
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
        rootMargin: '0px 0px -100px 0px', // Start showing floating button a bit before the original disappears
      }
    );

    const currentButtonRef = addDayButtonRef.current;
    if (currentButtonRef) {
      observer.observe(currentButtonRef);
    }

    return () => {
      if (currentButtonRef) {
        observer.unobserve(currentButtonRef);
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
            <h1 className="text-2xl font-bold text-gray-900">{tripTitle || t('trip.untitled')}</h1>
            <div className="flex items-center gap-2">
              <Button onClick={onEditTrip} variant="outline" size="sm" className="flex items-center gap-2">
                <Edit2 size={16} />
                <span className="hidden sm:inline">{t('trip.editTrip')}</span>
              </Button>

              {/* Language Selector */}
              <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                <SelectTrigger className="h-8 rounded-md px-3 text-xs border border-gray-300 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-auto min-w-[40px] sm:min-w-[120px] [&>svg]:hidden sm:[&>svg]:block">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center">
                        {i18n.language === 'pt' ? <PortugalFlag size={16} /> : <UKFlag size={16} />}
                      </span>
                      <span className="hidden sm:inline">
                        {i18n.language === 'pt' ? t('language.portuguese') : t('language.english')}
                      </span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">
                    <span className="flex items-center gap-2">
                      <PortugalFlag size={16} />
                      <span>{t('language.portuguese')}</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="en">
                    <span className="flex items-center gap-2">
                      <UKFlag size={16} />
                      <span>{t('language.english')}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-gray-700 mb-4">
            {tripDestination && (
              <div className="text-lg font-medium">
                <MarkdownRenderer content={tripDestination} />
              </div>
            )}
            <p className="text-sm">
              {tripStartDate && tripEndDate
                ? `${formatDate(tripStartDate)} - ${formatDate(tripEndDate)}`
                : t('trip.noDatesDefined')}
            </p>
          </div>

          <Button
            ref={addDayButtonRef}
            onClick={onAddDay}
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            <Plus size={16} />
            {t('trip.addDay')}
          </Button>

          {/* Data Management Buttons */}
          <div className="flex gap-2">
            <Button onClick={onExportData} variant="outline" size="sm" className="flex-1">
              <Download size={16} />
              <span className="hidden sm:inline">{t('trip.export')}</span>
            </Button>
            <Button onClick={handleImportClick} variant="outline" size="sm" className="flex-1">
              <Upload size={16} />
              <span className="hidden sm:inline">{t('trip.import')}</span>
            </Button>
            <Button onClick={onResetData} variant="outline" size="sm" className="flex-1">
              <RotateCcw size={16} />
              <span className="hidden sm:inline">{t('trip.reset')}</span>
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
            <Plus />
          </Button>
        </div>
      )}
    </>
  );
};
