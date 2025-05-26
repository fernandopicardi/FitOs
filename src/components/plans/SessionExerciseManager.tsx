
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
  onSessionUpdated: (updatedSession: WorkoutSession) => void; 
  onDone: () => void; 
}

export function SessionExerciseManager({ session: initialSession, allExercises, onSessionUpdated, onDone }: SessionExerciseManagerProps) {
  const [currentSession, setCurrentSession] = useState<WorkoutSession>(JSON.parse(JSON.stringify(initialSession)));
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isPlannedExerciseFormOpen, setIsPlannedExerciseFormOpen] = useState(false);
  const [exerciseToPlan, setExerciseToPlan] = useState<Exercise | null>(null); 
  const [plannedExerciseToEdit, setPlannedExerciseToEdit] = useState<PlannedExercise | null>(null);

  const handleOpenExercisePicker = () => setIsExercisePickerOpen(true);

  const handleExerciseSelected = (selectedExercise: Exercise) => {
    setIsExercisePickerOpen(false);
    setExerciseToPlan(selectedExercise);
    setPlannedExerciseToEdit(null); 
    setIsPlannedExerciseFormOpen(true);
  };

  const handleEditPlannedExercise = (plannedExercise: PlannedExercise) => {
    const masterExercise = allExercises.find(ex => ex.id === plannedExercise.exerciseId);
    if (masterExercise) {
      setExerciseToPlan(masterExercise); 
      setPlannedExerciseToEdit(plannedExercise);
      setIsPlannedExerciseFormOpen(true);
    }
  };

  const handleDeletePlannedExercise = (plannedExerciseId: string) => {
    const updatedExercises = currentSession.exercises.filter(pe => pe.id !== plannedExerciseId);
    const updatedSession = { ...currentSession, exercises: updatedExercises };
    setCurrentSession(updatedSession);
    onSessionUpdated(updatedSession); 
  };

  const handlePlannedExerciseFormSubmit = (data: PlannedExerciseFormValues) => {
    let updatedExercises: PlannedExercise[];
    if (plannedExerciseToEdit) { 
      updatedExercises = currentSession.exercises.map(pe =>
        pe.id === plannedExerciseToEdit.id ? { ...plannedExerciseToEdit, ...data } : pe
      );
    } else if (exerciseToPlan) { 
      const newPlannedExercise: PlannedExercise = {
        id: `plannedex-${Date.now()}`,
        exerciseId: exerciseToPlan.id,
        name: exerciseToPlan.name,
        emoji: exerciseToPlan.emoji,
        ...data,
      };
      updatedExercises = [...currentSession.exercises, newPlannedExercise];
    } else {
      return; 
    }

    const updatedSession = { ...currentSession, exercises: updatedExercises };
    setCurrentSession(updatedSession);
    onSessionUpdated(updatedSession); 

    setIsPlannedExerciseFormOpen(false);
    setExerciseToPlan(null);
    setPlannedExerciseToEdit(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <Button variant="ghost" onClick={onDone} className="mb-2 text-primary hover:text-primary/80 -ml-2">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para Sessões
          </Button>
          <h2 className="text-2xl font-bold text-primary">Gerenciar Exercícios para: {currentSession.name}</h2>
          <p className="text-muted-foreground">Adicione, edite ou remova exercícios para esta sessão.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Exercícios nesta Sessão</CardTitle>
          <Button variant="outline" onClick={handleOpenExercisePicker} className="text-primary border-primary hover:bg-primary/10">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Exercício
          </Button>
        </CardHeader>
        <CardContent>
          {currentSession.exercises.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum exercício adicionado a esta sessão ainda. Clique em &quot;Adicionar Exercício&quot; para começar.
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
                      exercise={masterEx} 
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
          exerciseName={exerciseToPlan?.name || plannedExerciseToEdit?.name || "Exercício"}
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
