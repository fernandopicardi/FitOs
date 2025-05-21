
'use client';

import type { LoggedExerciseEntry, LoggedSetData, Exercise } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, PlusSquare, BookOpen, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

interface LoggedExerciseItemCardProps {
  loggedExercise: LoggedExerciseEntry;
  masterExercise?: Exercise; // Full details of the exercise
  onRemove: () => void;
  onAddSet: () => void;
  onUpdateSetData: (setId: string, field: keyof LoggedSetData, value: string | boolean) => void;
  onRemoveSet: (setId: string) => void;
}

export function LoggedExerciseItemCard({
  loggedExercise,
  masterExercise,
  onRemove,
  onAddSet,
  onUpdateSetData,
  onRemoveSet,
}: LoggedExerciseItemCardProps) {
  const displayName = masterExercise?.name || loggedExercise.name;
  const displayEmoji = masterExercise?.emoji || loggedExercise.emoji;

  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">{displayEmoji}</span>
            {displayName}
          </CardTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {loggedExercise.plannedSets && <Badge variant="outline" className="text-xs">Plan: {loggedExercise.plannedSets} sets</Badge>}
            {loggedExercise.plannedReps && <Badge variant="outline" className="text-xs">{loggedExercise.plannedReps} reps</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove Exercise</span>
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {masterExercise && (
          <div className="space-y-3">
            {masterExercise.imageUrl && (
              <div className="relative w-full h-40 sm:h-48 rounded-md overflow-hidden my-2">
                <Image
                  src={masterExercise.imageUrl}
                  alt={masterExercise.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={masterExercise.dataAiHint || `${masterExercise.muscleGroup} exercise`}
                  className="transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{masterExercise.muscleGroup}</Badge>
              {masterExercise.workoutType.slice(0, 2).map((wt) => ( // Show max 2 workout types
                <Badge key={wt} variant="outline">{wt}</Badge>
              ))}
            </div>
            {masterExercise.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{masterExercise.description}</p>
            )}
            <Accordion type="single" collapsible className="w-full text-sm">
              {masterExercise.instructions && masterExercise.instructions.length > 0 && (
                <AccordionItem value="instructions">
                  <AccordionTrigger className="text-primary hover:no-underline py-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Instructions
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 pl-1">
                    <ul className="list-disc list-outside space-y-1 pl-5 text-muted-foreground">
                      {masterExercise.instructions.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              {masterExercise.tips && masterExercise.tips.length > 0 && (
                <AccordionItem value="tips" className="border-b-0">
                  <AccordionTrigger className="text-primary hover:no-underline py-2">
                     <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" /> Tips
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 pl-1">
                    <ul className="list-disc list-outside space-y-1 pl-5 text-muted-foreground">
                      {masterExercise.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
             <Separator className="my-3 bg-border/50" />
          </div>
        )}

        {/* Sets Management UI */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Log Your Sets:</h4>
          {loggedExercise.sets.map((set, index) => (
            <div key={set.id} className="flex items-center gap-3 p-2.5 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="font-medium text-sm text-muted-foreground w-10">Set {index + 1}</span>
              <div className="flex-1 grid grid-cols-2 gap-3 sm:flex sm:gap-3">
                <Input
                  type="text" // Changed to text to allow "BW" etc. Can add validation later.
                  placeholder="Weight"
                  value={set.weight}
                  onChange={(e) => onUpdateSetData(set.id, 'weight', e.target.value)}
                  className="h-9 text-sm bg-background/70"
                  aria-label={`Weight for set ${index + 1}`}
                />
                <Input
                  type="text" // Changed to text to allow "AMRAP" etc.
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(e) => onUpdateSetData(set.id, 'reps', e.target.value)}
                  className="h-9 text-sm bg-background/70"
                  aria-label={`Reps for set ${index + 1}`}
                />
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                 <Checkbox
                    id={`completed-${loggedExercise.id}-${set.id}`} // More unique ID
                    checked={set.isCompleted}
                    onCheckedChange={(checked) => onUpdateSetData(set.id, 'isCompleted', !!checked)}
                    aria-label={`Mark set ${index + 1} as completed`}
                  />
                  <Label htmlFor={`completed-${loggedExercise.id}-${set.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only sm:not-sr-only">
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
          className="w-full mt-3 text-primary border-primary hover:text-primary hover:bg-primary/10" 
          onClick={onAddSet}
        >
          <PlusSquare className="mr-2 h-4 w-4" /> Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
