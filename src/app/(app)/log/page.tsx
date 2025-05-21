
'use client';

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Play, Save, XCircle, Trash2 } from 'lucide-react';
import { ExercisePickerDialog } from '@/components/plans/ExercisePickerDialog'; // Re-using this
import { LoggedExerciseItemCard } from '@/components/logging/LoggedExerciseItemCard';
import type { WorkoutPlan, Exercise, ActiveWorkoutLog, LoggedExerciseEntry, WorkoutSession } from '@/types';
import { PRELOADED_EXERCISES } from '@/constants/exercises'; // For picker and adding exercises
import { useToast } from '@/hooks/use-toast';

// Simulate fetching plans for now, as global state/persistence isn't implemented yet
const SIMULATED_PLANS: WorkoutPlan[] = [
  {
    id: 'sim-plan-1',
    name: 'Simulated Strength Plan',
    description: 'A 3-day simulated strength focused plan.',
    sessions: [
      { id: 'sim-session-1a', name: 'Day 1: Push', exercises: [
        { id: 'pe-1', exerciseId: 'bench-press', name: 'Bench Press', emoji: '🏋️', sets: '3', reps: '5' },
        { id: 'pe-2', exerciseId: 'overhead-press', name: 'Overhead Press', emoji: '⬆️', sets: '3', reps: '5' },
      ]},
      { id: 'sim-session-1b', name: 'Day 2: Pull', exercises: [
        { id: 'pe-3', exerciseId: 'pull-up', name: 'Pull-up', emoji: '🤸', sets: '3', reps: 'AMRAP' },
        { id: 'pe-4', exerciseId: 'deadlift', name: 'Deadlift', emoji: '💪', sets: '1', reps: '5' },
      ]},
      { id: 'sim-session-1c', name: 'Day 3: Legs', exercises: [
        { id: 'pe-5', exerciseId: 'squat', name: 'Barbell Squat', emoji: '🦵', sets: '3', reps: '5' },
      ]},
    ],
  },
  {
    id: 'sim-plan-2',
    name: 'Simulated Cardio & Core',
    description: 'Focus on cardio and core exercises.',
    sessions: [
      { id: 'sim-session-2a', name: 'Full Body Blast', exercises: [
        { id: 'pe-6', exerciseId: 'running', name: 'Running', emoji: '🏃', sets: '1', reps: '30min' },
        { id: 'pe-7', exerciseId: 'plank', name: 'Plank', emoji: '🧍', sets: '3', reps: '60s' },
        { id: 'pe-8', exerciseId: 'burpees', name: 'Burpees', emoji: '🥵', sets: '3', reps: '15' },
      ]},
    ],
  }
];

export default function LogWorkoutPage() {
  const [availablePlans, setAvailablePlans] = useState<WorkoutPlan[]>(SIMULATED_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [activeWorkoutLog, setActiveWorkoutLog] = useState<ActiveWorkoutLog | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const { toast } = useToast();

  // In a real app, availablePlans would be fetched or come from global state
  // useEffect(() => { /* Fetch plans logic */ }, []);

  const getExerciseDetails = (exerciseId: string): Exercise | undefined => {
    return PRELOADED_EXERCISES.find(ex => ex.id === exerciseId);
  }

  const handleStartEmptyWorkout = () => {
    const newLog: ActiveWorkoutLog = {
      id: `log-${Date.now()}`,
      workoutName: `Ad-hoc Workout - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      startTime: Date.now(),
      exercises: [],
    };
    setActiveWorkoutLog(newLog);
    setSelectedPlanId(undefined);
    toast({ title: "Empty workout started!", description: "Add exercises to begin logging." });
  };

  const handleStartFromPlan = () => {
    if (!selectedPlanId) {
      toast({ title: "No Plan Selected", description: "Please select a plan to start logging.", variant: "destructive" });
      return;
    }
    const plan = availablePlans.find(p => p.id === selectedPlanId);
    if (!plan) {
      toast({ title: "Plan Not Found", description: "Could not find the selected plan.", variant: "destructive" });
      return;
    }

    const exercisesFromPlan: LoggedExerciseEntry[] = plan.sessions.flatMap(session => 
      session.exercises.map(pe => {
        const masterExercise = getExerciseDetails(pe.exerciseId);
        return {
          id: `le-${Date.now()}-${pe.exerciseId}`,
          exerciseId: pe.exerciseId,
          name: masterExercise?.name || pe.name || 'Unknown Exercise',
          emoji: masterExercise?.emoji || '❓',
          plannedSets: pe.sets,
          plannedReps: pe.reps,
          sets: [], // To be filled during logging
        };
      })
    );
    
    const newLog: ActiveWorkoutLog = {
      id: `log-${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      workoutName: `Logging: ${plan.name}`,
      date: new Date().toISOString(),
      startTime: Date.now(),
      exercises: exercisesFromPlan,
    };
    setActiveWorkoutLog(newLog);
    toast({ title: `Workout started: ${plan.name}`, description: "Begin logging your exercises." });
  };

  const handleAddExerciseToLog = (exercise: Exercise) => {
    if (!activeWorkoutLog) return;

    const newLoggedExercise: LoggedExerciseEntry = {
      id: `le-${Date.now()}-${exercise.id}`,
      exerciseId: exercise.id,
      name: exercise.name,
      emoji: exercise.emoji,
      sets: [], // Will be populated when actually logging sets/reps
    };

    setActiveWorkoutLog(prev => prev ? ({ ...prev, exercises: [...prev.exercises, newLoggedExercise] }) : null);
    setIsExercisePickerOpen(false);
    toast({ title: `${exercise.name} added to workout.`});
  };

  const handleRemoveExerciseFromLog = (loggedExerciseId: string) => {
    if (!activeWorkoutLog) return;
    setActiveWorkoutLog(prev => prev ? ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== loggedExerciseId),
    }) : null);
    toast({ title: "Exercise removed from log." });
  };
  
  const handleSaveWorkout = () => {
    if (!activeWorkoutLog) return;
    const logToSave = { ...activeWorkoutLog, endTime: Date.now() };
    console.log("Workout Log to Save:", JSON.stringify(logToSave, null, 2)); 
    // In a real app, this would be saved to localStorage, Firebase, or an API
    // For now, we just log it and reset.
    toast({ title: "Workout Saved!", description: `${logToSave.workoutName} has been logged. (Check console for data)` });
    setActiveWorkoutLog(null);
    setSelectedPlanId(undefined);
  };

  const handleCancelWorkout = () => {
    setActiveWorkoutLog(null);
    setSelectedPlanId(undefined);
    toast({ title: "Workout Canceled", description: "No data was logged." });
  };

  return (
    <div className="space-y-8">
      {!activeWorkoutLog ? (
        <>
          <PageTitle 
            title="Log Your Workout"
            subtitle="Record your sets, reps, and how you felt during your session."
          />
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Start a New Logging Session</CardTitle>
              <CardDescription>Choose how you want to begin your workout log.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                onClick={handleStartEmptyWorkout}
              >
                <Play className="mr-2 h-5 w-5" /> Start Empty Workout
              </Button>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Or, start from a plan:</p>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a workout plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.length > 0 ? (
                      availablePlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-plans" disabled>No plans available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                 <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={handleStartFromPlan}
                  disabled={!selectedPlanId || availablePlans.length === 0}
                >
                  <Play className="mr-2 h-5 w-5" /> Start Selected Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <PageTitle title={activeWorkoutLog.workoutName} subtitle="Log your performance for each exercise." />
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Exercises in this Workout</CardTitle>
                <Button variant="outline" onClick={() => setIsExercisePickerOpen(true)} className="text-primary border-primary hover:bg-primary/10">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Exercise
                </Button>
              </CardHeader>
              <CardContent>
                {activeWorkoutLog.exercises.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No exercises added to this workout yet. Click "Add Exercise" to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeWorkoutLog.exercises.map(loggedEx => (
                      <LoggedExerciseItemCard 
                        key={loggedEx.id} 
                        loggedExercise={loggedEx} 
                        onRemove={() => handleRemoveExerciseFromLog(loggedEx.id)}
                        // onAddSet and onUpdateSet will be added in the next phase
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancelWorkout} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
                <XCircle className="mr-2 h-5 w-5" /> Cancel Workout
              </Button>
              <Button onClick={handleSaveWorkout} className="bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-5 w-5" /> Save Workout
              </Button>
            </div>
          </div>
        </>
      )}

      <ExercisePickerDialog
        isOpen={isExercisePickerOpen}
        onOpenChange={setIsExercisePickerOpen}
        allExercises={PRELOADED_EXERCISES} // Use all available exercises
        onSelectExercise={handleAddExerciseToLog}
      />
    </div>
  );
}

export const metadata = {
  title: 'Log Workout | Workout Wizard',
  description: 'Log your completed workouts.',
};
