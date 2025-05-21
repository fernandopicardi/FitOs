
'use client';

import type { LoggedExerciseEntry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, PlusSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LoggedExerciseItemCardProps {
  loggedExercise: LoggedExerciseEntry;
  onRemove: () => void;
  // onAddSet: () => void; // To be implemented
  // onUpdateSet: (setId: string, setData: Partial<LoggedSetData>) => void; // To be implemented
  // onRemoveSet: (setId: string) => void; // To be implemented
}

export function LoggedExerciseItemCard({
  loggedExercise,
  onRemove,
}: LoggedExerciseItemCardProps) {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="p-4 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{loggedExercise.emoji}</span>
            {loggedExercise.name}
          </CardTitle>
          { (loggedExercise.plannedSets || loggedExercise.plannedReps) &&
            <div className="flex flex-wrap gap-1 mt-1">
                {loggedExercise.plannedSets && <Badge variant="outline" className="text-xs">Plan: {loggedExercise.plannedSets} sets</Badge>}
                {loggedExercise.plannedReps && <Badge variant="outline" className="text-xs">{loggedExercise.plannedReps} reps</Badge>}
            </div>
          }
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove Exercise</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Placeholder for Set Inputs - to be implemented in next phase */}
        <div className="space-y-2 my-2">
            <p className="text-sm text-muted-foreground italic">
                (Set input fields will appear here in the next phase)
            </p>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-2 text-primary border-primary hover:text-primary hover:bg-primary/10" disabled>
          <PlusSquare className="mr-2 h-4 w-4" /> Add Set (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
