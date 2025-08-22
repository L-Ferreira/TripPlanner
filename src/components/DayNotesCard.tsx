import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TripDay } from '../hooks/useTripData';

interface DayNotesCardProps {
  day: TripDay;
  onUpdateNotes: (dayId: string, notes: string) => void;
}

const DayNotesCard = ({ day, onUpdateNotes }: DayNotesCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          {t('day.notes')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Textarea
          value={day.notes || ''}
          onChange={(e) => onUpdateNotes(day.id, e.target.value)}
          placeholder={t('day.addNotes')}
          className="min-h-[128px]"
        />
      </CardContent>
    </Card>
  );
};

export default DayNotesCard;
