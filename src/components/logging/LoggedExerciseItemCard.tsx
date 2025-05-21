
'use client';

import type { LoggedExerciseEntry, LoggedSetData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, PlusSquare, CheckSquare, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // For associating with checkbox

interface LoggedExerciseItemCardProps {
  loggedExercise: LoggedExerciseEntry;
  onRemove: () => void;
  onAddSet: () => void;
  onUpdateSetData: (setId: string, field: keyof LoggedSetData, value: string | boolean) => void;
  onRemoveSet: (setId: string) => void;
}

export function LoggedExerciseItemCard({
  loggedExercise,
  onRemove,
  onAddSet,
  onUpdateSetData,
  onRemoveSet,
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
        <div className="space-y-3 my-2">
          {loggedExercise.sets.map((set, index) => (
            <div key={set.id} className="flex items-center gap-3 p-2 border rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
              <span className="font-medium text-sm text-muted-foreground w-10">Set {index + 1}</span>
              <div className="flex-1 grid grid-cols-2 gap-3 sm:flex sm:gap-3">
                <Input
                  type="text"
                  placeholder="Weight"
                  value={set.weight}
                  onChange={(e) => onUpdateSetData(set.id, 'weight', e.target.value)}
                  className="h-9 text-sm"
                  aria-label={`Weight for set ${index + 1}`}
                />
                <Input
                  type="text"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(e) => onUpdateSetData(set.id, 'reps', e.target.value)}
                  className="h-9 text-sm"
                  aria-label={`Reps for set ${index + 1}`}
                />
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                 <Checkbox
                    id={`completed-${set.id}`}
                    checked={set.isCompleted}
                    onCheckedChange={(checked) => onUpdateSetData(set.id, 'isCompleted', !!checked)}
                    aria-label={`Mark set ${index + 1} as completed`}
                  />
                  <Label htmlFor={`completed-${set.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only">
                    Done
                  </Label>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => onRemoveSet(set.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove Set {index + 1}</span>
              </Button>
            </div>
          ))}
          {loggedExercise.sets.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-2">No sets added yet for this exercise.</p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 text-primary border-primary hover:text-primary hover:bg-primary/10" 
          onClick={onAddSet}
        >
          <PlusSquare className="mr-2 h-4 w-4" /> Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
