
'use client';

import type { PlannedExercise, Exercise as MasterExercise } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlannedExerciseCardProps {
  plannedExercise: PlannedExercise;
  exercise?: MasterExercise; // Master exercise details for name/emoji
  onEdit: () => void;
  onDelete: () => void;
}

export function PlannedExerciseCard({ plannedExercise, exercise, onEdit, onDelete }: PlannedExerciseCardProps) {
  const displayName = plannedExercise.name || exercise?.name || "Exercise";
  const displayEmoji = plannedExercise.emoji || exercise?.emoji || "💪";

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <span className="text-2xl hidden sm:inline">{displayEmoji}</span>
          <div className="flex-grow">
            <p className="font-medium text-foreground truncate">{displayName}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {plannedExercise.sets && <Badge variant="secondary" className="text-xs">Sets: {plannedExercise.sets}</Badge>}
              {plannedExercise.reps && <Badge variant="secondary" className="text-xs">Reps: {plannedExercise.reps}</Badge>}
              {plannedExercise.rest && <Badge variant="outline" className="text-xs">Rest: {plannedExercise.rest}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit Exercise</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove Exercise</span>
          </Button>
        </div>
      </CardContent>
      {plannedExercise.notes && (
        <div className="px-3 pb-3 pt-0 border-t mt-2">
          <p className="text-xs text-muted-foreground pt-2"><strong>Notes:</strong> {plannedExercise.notes}</p>
        </div>
      )}
    </Card>
  );
}
