
'use client';

import type { WorkoutSession, Exercise, PlannedExercise } from '@/types';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { ExercisePickerDialog } from './ExercisePickerDialog';
import { PlannedExerciseFormDialog } from './PlannedExerciseFormDialog';
import type { PlannedExerciseFormValues } from '@/types';
import { PlannedExerciseCard } from './PlannedExerciseCard';

interface SessionExerciseManagerProps {
  session: WorkoutSession;
  allExercises: Exercise[];
  onSessionUpdated: (updatedSession: WorkoutSession) => void; // Callback to inform PlanEditor of changes
  onDone: () => void; // Callback to go back to PlanEditor's session list
}

export function SessionExerciseManager({ session: initialSession, allExercises, onSessionUpdated, onDone }: SessionExerciseManagerProps) {
  const [currentSession, setCurrentSession] = useState<WorkoutSession>(JSON.parse(JSON.stringify(initialSession)));
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isPlannedExerciseFormOpen, setIsPlannedExerciseFormOpen] = useState(false);
  const [exerciseToPlan, setExerciseToPlan] = useState<Exercise | null>(null); // Exercise selected from picker
  const [plannedExerciseToEdit, setPlannedExerciseToEdit] = useState<PlannedExercise | null>(null);

  const handleOpenExercisePicker = () => setIsExercisePickerOpen(true);

  const handleExerciseSelected = (selectedExercise: Exercise) => {
    setIsExercisePickerOpen(false);
    setExerciseToPlan(selectedExercise);
    setPlannedExerciseToEdit(null); // Ensure we're adding new, not editing
    setIsPlannedExerciseFormOpen(true);
  };

  const handleEditPlannedExercise = (plannedExercise: PlannedExercise) => {
    const masterExercise = allExercises.find(ex => ex.id === plannedExercise.exerciseId);
    if (masterExercise) {
      setExerciseToPlan(masterExercise); // To provide context like name/emoji
      setPlannedExerciseToEdit(plannedExercise);
      setIsPlannedExerciseFormOpen(true);
    }
  };

  const handleDeletePlannedExercise = (plannedExerciseId: string) => {
    const updatedExercises = currentSession.exercises.filter(pe => pe.id !== plannedExerciseId);
    const updatedSession = { ...currentSession, exercises: updatedExercises };
    setCurrentSession(updatedSession);
    onSessionUpdated(updatedSession); // Inform parent immediately
  };

  const handlePlannedExerciseFormSubmit = (data: PlannedExerciseFormValues) => {
    let updatedExercises: PlannedExercise[];
    if (plannedExerciseToEdit) { // Editing existing
      updatedExercises = currentSession.exercises.map(pe =>
        pe.id === plannedExerciseToEdit.id ? { ...plannedExerciseToEdit, ...data } : pe
      );
    } else if (exerciseToPlan) { // Adding new
      const newPlannedExercise: PlannedExercise = {
        id: `plannedex-${Date.now()}`,
        exerciseId: exerciseToPlan.id,
        name: exerciseToPlan.name,
        emoji: exerciseToPlan.emoji,
        ...data,
      };
      updatedExercises = [...currentSession.exercises, newPlannedExercise];
    } else {
      return; // Should not happen
    }

    const updatedSession = { ...currentSession, exercises: updatedExercises };
    setCurrentSession(updatedSession);
    onSessionUpdated(updatedSession); // Inform parent immediately

    setIsPlannedExerciseFormOpen(false);
    setExerciseToPlan(null);
    setPlannedExerciseToEdit(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <Button variant="ghost" onClick={onDone} className="mb-2 text-primary hover:text-primary/80 -ml-2">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Sessions
          </Button>
          <h2 className="text-2xl font-bold text-primary">Manage Exercises for: {currentSession.name}</h2>
          <p className="text-muted-foreground">Add, edit, or remove exercises for this session.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Exercises in this Session</CardTitle>
          <Button variant="outline" onClick={handleOpenExercisePicker} className="text-primary border-primary hover:bg-primary/10">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Exercise
          </Button>
        </CardHeader>
        <CardContent>
          {currentSession.exercises.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No exercises added to this session yet. Click &quot;Add Exercise&quot; to get started.
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {currentSession.exercises.map(plannedEx => {
                  const masterEx = allExercises.find(e => e.id === plannedEx.exerciseId);
                  return (
                    <PlannedExerciseCard
                      key={plannedEx.id}
                      plannedExercise={plannedEx}
                      exercise={masterEx} // Pass master exercise for name/emoji if not on plannedEx
                      onEdit={() => handleEditPlannedExercise(plannedEx)}
                      onDelete={() => handleDeletePlannedExercise(plannedEx.id)}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <ExercisePickerDialog
        isOpen={isExercisePickerOpen}
        onOpenChange={setIsExercisePickerOpen}
        allExercises={allExercises}
        onSelectExercise={handleExerciseSelected}
      />
      
      {isPlannedExerciseFormOpen && (exerciseToPlan || plannedExerciseToEdit) && (
        <PlannedExerciseFormDialog
          isOpen={isPlannedExerciseFormOpen}
          onOpenChange={(isOpen) => {
            setIsPlannedExerciseFormOpen(isOpen);
            if (!isOpen) {
              setExerciseToPlan(null);
              setPlannedExerciseToEdit(null);
            }
          }}
          onSubmit={handlePlannedExerciseFormSubmit}
          exerciseName={exerciseToPlan?.name || plannedExerciseToEdit?.name || "Exercise"}
          initialValues={plannedExerciseToEdit ? {
            sets: plannedExerciseToEdit.sets || "",
            reps: plannedExerciseToEdit.reps || "",
            rest: plannedExerciseToEdit.rest || "",
            notes: plannedExerciseToEdit.notes || "",
          } : undefined}
        />
      )}
    </div>
  );
}
