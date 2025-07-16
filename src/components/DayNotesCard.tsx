import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          Day Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <textarea
          value={day.notes || ''}
          onChange={(e) => onUpdateNotes(day.id, e.target.value)}
          placeholder="Add notes for this day..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </CardContent>
    </Card>
  );
};

export default DayNotesCard;
