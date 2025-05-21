
'use client';

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Play, Save, XCircle } from 'lucide-react';
import { ExercisePickerDialog } from '@/components/plans/ExercisePickerDialog';
import { LoggedExerciseItemCard } from '@/components/logging/LoggedExerciseItemCard';
import type { WorkoutPlan, Exercise, ActiveWorkoutLog, LoggedExerciseEntry, LoggedSetData } from '@/types';
import { PRELOADED_EXERCISES } from '@/constants/exercises';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_PLANS_KEY = 'workoutWizardPlans';
const LOCAL_STORAGE_HISTORY_KEY = 'workoutWizardHistory';
const LOCAL_STORAGE_CUSTOM_EXERCISES_KEY = 'workoutWizardCustomExercises';

export default function LogWorkoutPage() {
  const [availablePlans, setAvailablePlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [activeWorkoutLog, setActiveWorkoutLog] = useState<ActiveWorkoutLog | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [allAvailableExercises, setAllAvailableExercises] = useState<Exercise[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPlansString = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
        if (savedPlansString) {
          const loadedPlans = JSON.parse(savedPlansString) as WorkoutPlan[];
          setAvailablePlans(loadedPlans);
        }

        const savedCustomExercisesString = localStorage.getItem(LOCAL_STORAGE_CUSTOM_EXERCISES_KEY);
        const customExercises = savedCustomExercisesString ? JSON.parse(savedCustomExercisesString) as Exercise[] : [];
        
        const preloadedWithFlag = PRELOADED_EXERCISES.map(ex => ({ ...ex, isCustom: false }));
        const customWithFlag = customExercises.map(ex => ({ ...ex, isCustom: true }));

        const exerciseMap = new Map<string, Exercise>();
        preloadedWithFlag.forEach(ex => exerciseMap.set(ex.id, ex));
        customWithFlag.forEach(ex => exerciseMap.set(ex.id, ex)); 
        
        setAllAvailableExercises(Array.from(exerciseMap.values()));

      } catch (error) {
        console.error("Failed to load data from localStorage for logging", error);
        toast({
          title: "Error Loading Data",
          description: "Could not retrieve plans or custom exercises.",
          variant: "destructive",
        });
        setAllAvailableExercises(PRELOADED_EXERCISES.map(ex => ({ ...ex, isCustom: false })));
      }
    }
  }, [toast]);

  const getExerciseDetails = (exerciseId: string): Exercise | undefined => {
    return allAvailableExercises.find(ex => ex.id === exerciseId);
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
          id: `le-${Date.now()}-${pe.exerciseId}-${Math.random().toString(36).substring(2,7)}`,
          exerciseId: pe.exerciseId,
          name: masterExercise?.name || pe.name || 'Unknown Exercise',
          emoji: masterExercise?.emoji || '❓',
          plannedSets: pe.sets,
          plannedReps: pe.reps,
          sets: [], 
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
      id: `le-${Date.now()}-${exercise.id}-${Math.random().toString(36).substring(2,7)}`,
      exerciseId: exercise.id,
      name: exercise.name,
      emoji: exercise.emoji,
      sets: [], // Initialize with empty sets array
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

  const handleAddSetToLoggedExercise = (loggedExerciseId: string) => {
    if (!activeWorkoutLog) return;
    setActiveWorkoutLog(prevLog => {
      if (!prevLog) return null;
      const updatedExercises = prevLog.exercises.map(ex => {
        if (ex.id === loggedExerciseId) {
          const newSet: LoggedSetData = {
            id: `set-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
            setNumber: ex.sets.length + 1,
            weight: '',
            reps: '',
            rpe: '',
            notes: '',
            isCompleted: false,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      });
      return { ...prevLog, exercises: updatedExercises };
    });
  };

  const handleUpdateLoggedSetData = (
    loggedExerciseId: string, 
    setId: string, 
    field: keyof LoggedSetData, 
    value: string | boolean
  ) => {
    if (!activeWorkoutLog) return;
    setActiveWorkoutLog(prevLog => {
      if (!prevLog) return null;
      const updatedExercises = prevLog.exercises.map(ex => {
        if (ex.id === loggedExerciseId) {
          const updatedSets = ex.sets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value };
            }
            return set;
          });
          return { ...ex, sets: updatedSets };
        }
        return ex;
      });
      return { ...prevLog, exercises: updatedExercises };
    });
  };

  const handleRemoveSetFromLoggedExercise = (loggedExerciseId: string, setId: string) => {
    if (!activeWorkoutLog) return;
    setActiveWorkoutLog(prevLog => {
      if (!prevLog) return null;
      const updatedExercises = prevLog.exercises.map(ex => {
        if (ex.id === loggedExerciseId) {
          const updatedSets = ex.sets.filter(set => set.id !== setId);
          return { ...ex, sets: updatedSets };
        }
        return ex;
      });
      return { ...prevLog, exercises: updatedExercises };
    });
    toast({ title: "Set removed."});
  };
  
  const handleSaveWorkout = () => {
    if (!activeWorkoutLog || activeWorkoutLog.exercises.length === 0) {
      toast({ title: "Cannot Save Empty Workout", description: "Add some exercises and log your sets before saving.", variant: "destructive" });
      return;
    }
    const logToSave: ActiveWorkoutLog = { ...activeWorkoutLog, endTime: Date.now() };
    
    try {
      if (typeof window !== 'undefined') {
        const existingHistoryString = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        const history: ActiveWorkoutLog[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
        history.unshift(logToSave); 
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
        
        toast({ 
          title: "Workout Saved! 🎉", 
          description: `${logToSave.workoutName} has been logged successfully.`,
          className: "border-accent animate-subtle-pulse-bg-accent", // Fancy toast
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Failed to save workout to localStorage", error);
      toast({ title: "Save Failed", description: "Could not save workout. Check console for details.", variant: "destructive" });
    }
    
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
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={availablePlans.length === 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={availablePlans.length > 0 ? "Select a workout plan..." : "No plans available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.length > 0 ? (
                      availablePlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-plans" disabled>No plans created yet</SelectItem>
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
                    {activeWorkoutLog.exercises.map(loggedEx => {
                      const masterExercise = allAvailableExercises.find(ex => ex.id === loggedEx.exerciseId);
                      return (
                        <LoggedExerciseItemCard 
                          key={loggedEx.id} 
                          loggedExercise={loggedEx}
                          masterExercise={masterExercise} 
                          onRemove={() => handleRemoveExerciseFromLog(loggedEx.id)}
                          onAddSet={() => handleAddSetToLoggedExercise(loggedEx.id)}
                          onUpdateSetData={(setId, field, value) => handleUpdateLoggedSetData(loggedEx.id, setId, field, value)}
                          onRemoveSet={(setId) => handleRemoveSetFromLoggedExercise(loggedEx.id, setId)}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelWorkout} 
                className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
              >
                <XCircle className="mr-2 h-5 w-5" /> Cancel Workout
              </Button>
              <Button 
                onClick={handleSaveWorkout} 
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto" 
                disabled={activeWorkoutLog.exercises.length === 0}
              >
                <Save className="mr-2 h-5 w-5" /> Save Workout
              </Button>
            </div>
          </div>
        </>
      )}

      <ExercisePickerDialog
        isOpen={isExercisePickerOpen}
        onOpenChange={setIsExercisePickerOpen}
        allExercises={allAvailableExercises}
        onSelectExercise={handleAddExerciseToLog}
      />
    </div>
  );
}

