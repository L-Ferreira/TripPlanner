import { AutoExpandingTextarea } from '@/components/ui/auto-expanding-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTextareaHeights } from '../hooks/useTextareaHeights';
import { TripDay } from '../hooks/useTripData';
import MarkdownRenderer from './MarkdownRenderer';

interface DayNotesCardProps {
  day: TripDay;
  onUpdateNotes: (dayId: string, notes: string) => void;
}

const DayNotesCard = ({ day, onUpdateNotes }: DayNotesCardProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(day.notes || '');
  const { getHeight, saveHeight } = useTextareaHeights();

  const textareaKey = `day-notes-${day.id}`;
  const savedHeight = getHeight(textareaKey);

  const handleEdit = () => {
    setEditValue(day.notes || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(day.notes || '');
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdateNotes(day.id, editValue);
    setIsEditing(false);
  };

  const handleSizeChange = (height: number) => {
    saveHeight(textareaKey, height);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            {t('day.notes')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Edit2 size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <AutoExpandingTextarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={t('day.addNotes')}
              savedHeight={savedHeight}
              onSizeChange={handleSizeChange}
              minHeight={60}
              maxHeight={500}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {t('common.save')}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[58px]">
            {day.notes ? (
              <MarkdownRenderer content={day.notes} />
            ) : (
              <p className="text-gray-500 text-sm italic">{t('day.addNotes')}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DayNotesCard;
