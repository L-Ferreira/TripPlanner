import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { TripDay } from '../hooks/useTripData';

interface DayNotesCardProps {
  day: TripDay;
  onUpdateNotes: (dayId: string, notes: string) => void;
}

const DayNotesCard = ({ day, onUpdateNotes }: DayNotesCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          Notas do Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Textarea
          value={day.notes || ''}
          onChange={(e) => onUpdateNotes(day.id, e.target.value)}
          placeholder="Adicionar notas para este dia..."
          className="min-h-[128px]"
        />
      </CardContent>
    </Card>
  );
};

export default DayNotesCard;
