
'use client';

import type { Exercise, MuscleGroup, ApiNinjaExercise, ExerciseDifficulty, WorkoutType } from '@/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Zap, Cloud, UserCog, Star } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from './ExerciseForm';
import type { ExerciseFormValues } from './ExerciseForm';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_EXERCISES_KEY = 'workoutWizardCustomExercises';

// --- START OF API INTEGRATION ---
const sampleApiNinjaData: ApiNinjaExercise[] = [
  {
    "name": "Incline Hammer Curls",
    "type": "strength",
    "muscle": "biceps",
    "equipment": "dumbbell",
    "difficulty": "beginner",
    "instructions": "Seat yourself on an incline bench with a dumbbell in each hand. You should pressed firmly against he back with your feet together. Allow the dumbbells to hang straight down at your side, holding them with a neutral grip. This will be your starting position. Initiate the movement by flexing at the elbow, attempting to keep the upper arm stationary. Continue to the top of the movement and pause, then slowly return to the start position."
  },
  {
    "name": "Barbell Full Squat",
    "type": "powerlifting",
    "muscle": "quadriceps",
    "equipment": "barbell",
    "difficulty": "intermediate",
    "instructions": "This exercise is not recommended for people with back problems. Begin with the barbell supported on top of the traps. The chest should be up and the head facing forward. Adopt a hip-width stance with the feet turned out as needed. Descend by flexing the knees, refraining from moving the hips back as much as possible. This requires that the knees travel forward. Ensure that they stay align with the feet. The goal is to keep the torso as upright as possible. Continue all the way down, keeping the weight on the front of the heel. At the moment the upper legs contact the lower legs reverse the motion, driving the weight upward."
  },
  {
    "name": "Pushups",
    "type": "strength",
    "muscle": "chest",
    "equipment": "body_only",
    "difficulty": "beginner",
    "instructions": "Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Next, lower yourself downward until your chest almost touches the floor as you inhale. Now breathe out and press your upper body back up to the starting position while squeezing your chest. After a brief pause at the top contracted position, you can begin to lower yourself downward again. Repeat for the recommended amount of repetitions."
  },
  {
    "name": "Dumbbell Bench Press",
    "type": "strength",
    "muscle": "chest",
    "equipment": "dumbbell",
    "difficulty": "beginner",
    "instructions": "Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other. Then, using your thighs to help push the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width."
  },
  {
    "name": "Lat Pulldown",
    "type": "strength",
    "muscle": "lats",
    "equipment": "machine",
    "difficulty": "beginner",
    "instructions": "Sit down on a pull-down machine with a wide bar attached to the top pulley. Ensure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar."
  },
  {
    "name": "Leg Press",
    "type": "strength",
    "muscle": "quadriceps",
    "equipment": "machine",
    "difficulty": "beginner",
    "instructions": "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot stance. Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you."
  },
  {
    "name": "Machine Bicep Curl",
    "type": "strength",
    "muscle": "biceps",
    "equipment": "machine",
    "difficulty": "beginner",
    "instructions": "Sit on the bicep curl machine, adjust the seat height so your upper arms rest comfortably on the pad. Grab the handles with an underhand grip. Curl the handles up towards your shoulders, squeezing your biceps. Slowly lower back to the starting position."
  },
  {
    "name": "Triceps Pushdown - Rope Attachment",
    "type": "strength",
    "muscle": "triceps",
    "equipment": "cable",
    "difficulty": "beginner",
    "instructions": "Attach a rope attachment to a high pulley and grab with a neutral grip (palms facing each other). Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the rope. This is your starting position. Using the triceps, bring the rope down as you bring each side of the rope to the side of your thighs. At the end of the movement the arms are fully extended and perpendicular to the floor. The upper arms should always remain stationary next to your torso and only the forearms should move. Exhale as you perform this movement. After holding for a second, bring the rope slowly up to the starting point. Breathe in as you perform this step. Repeat for the recommended amount of repetitions."
  },
  {
    "name": "Romanian Deadlift",
    "type": "strength",
    "muscle": "hamstrings",
    "equipment": "barbell",
    "difficulty": "intermediate",
    "instructions": "Hold a barbell with a pronated (palms facing down) grip. Stand with your feet hip-width apart. Keeping your back straight and knees slightly bent, hinge at your hips to lower the barbell. Keep the barbell close to your legs. Lower until you feel a stretch in your hamstrings, or the bar reaches mid-shin. Return to the starting position by extending your hips."
  },
  {
    "name": "Calf Raises (Standing)",
    "type": "strength",
    "muscle": "calves",
    "equipment": "body_only",
    "difficulty": "beginner",
    "instructions": "Stand tall with your feet flat on the floor. You can hold onto something for balance if needed. Slowly rise up onto the balls of your feet, lifting your heels as high as possible. Squeeze your calf muscles at the top. Slowly lower your heels back to the starting position. Repeat."
  }
];

const transformApiExercise = (apiEx: ApiNinjaExercise): Exercise => {
  const id = `api-${apiEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
  
  let emoji = '💪'; // Default emoji
  if (apiEx.muscle) {
    const muscleLower = apiEx.muscle.toLowerCase();
    if (['biceps', 'triceps', 'forearms'].includes(muscleLower)) emoji = '💪';
    else if (['quadriceps', 'hamstrings', 'glutes', 'calves', 'legs', 'adductors', 'abductors'].includes(muscleLower)) emoji = '🦵';
    else if (['chest'].includes(muscleLower)) emoji = '🏋️';
    else if (['lats', 'traps', 'middle_back', 'lower_back', 'back'].includes(muscleLower)) emoji = '🤸';
    else if (['abdominals', 'abs'].includes(muscleLower)) emoji = '🧍';
    else if (['shoulders', 'neck'].includes(muscleLower)) emoji = '⬆️';
    else if (apiEx.type?.toLowerCase().includes('cardio') || apiEx.type?.toLowerCase().includes('plyometrics')) emoji = '🏃';
    else if (apiEx.type?.toLowerCase().includes('stretching')) emoji = '🧘';
  }


  const instructionSteps = apiEx.instructions
    ?.split(/[.]\s*(?=[A-Z0-9])|\n/) 
    .map(step => step.trim().replace(/\.$/, '')) // Remove trailing period
    .filter(step => step.length > 5);

  return {
    id,
    name: apiEx.name || 'Unnamed Exercise',
    emoji,
    muscleGroup: apiEx.muscle as MuscleGroup || 'Other',
    workoutType: apiEx.type ? [apiEx.type as WorkoutType] : ['Other' as WorkoutType],
    description: instructionSteps && instructionSteps.length > 0 ? instructionSteps[0] : apiEx.instructions || 'No description available.',
    instructions: instructionSteps && instructionSteps.length > 1 ? instructionSteps : (apiEx.instructions ? [apiEx.instructions] : undefined),
    equipment: apiEx.equipment,
    difficulty: apiEx.difficulty as ExerciseDifficulty,
    isFetchedFromAPI: true,
    isCustom: false,
    imageUrl: 'https://placehold.co/600x400.png', // Placeholder for API exercises
    dataAiHint: `${apiEx.muscle || 'exercise'} ${apiEx.type || 'general'}`,
  };
};
// --- END OF API INTEGRATION ---


export function ExerciseListClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [apiFetchedExercises, setApiFetchedExercises] = useState<Exercise[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const { toast } = useToast();
  const [isLoadingApiExercises, setIsLoadingApiExercises] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedExercisesString = localStorage.getItem(LOCAL_STORAGE_EXERCISES_KEY);
        if (savedExercisesString) {
          const loadedExercises = JSON.parse(savedExercisesString) as Exercise[];
          setCustomExercises(loadedExercises.map(ex => ({...ex, isCustom: true, isFetchedFromAPI: false })));
        }
      } catch (error) {
        console.error("Failed to load custom exercises from localStorage", error);
        toast({
          title: "Error Loading Custom Exercises",
          description: "Could not retrieve your saved exercises.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && customExercises.length > 0) {
      // Only save if there's something to save, or if localStorage already had the key (to allow clearing)
      // For now, we'll just save if customExercises has content.
      try {
        localStorage.setItem(LOCAL_STORAGE_EXERCISES_KEY, JSON.stringify(customExercises));
      } catch (error) {
        console.error("Failed to save custom exercises to localStorage", error);
        toast({
          title: "Error Saving Custom Exercises",
          description: "Your custom exercises could not be saved automatically.",
          variant: "destructive",
        });
      }
    } else if (typeof window !== 'undefined' && customExercises.length === 0 && localStorage.getItem(LOCAL_STORAGE_EXERCISES_KEY)) {
      // If customExercises is empty AND there was something in localStorage, remove it.
      // This handles the case where all custom exercises are deleted by the user (if such a feature existed)
      // For now, this part might not be strictly necessary as we don't have a "delete all custom" feature.
      // localStorage.removeItem(LOCAL_STORAGE_EXERCISES_KEY); 
    }
  }, [customExercises, toast]);

  const allDisplayableExercises = useMemo<Exercise[]>(() => {
    const uniqueExercisesMap = new Map<string, Exercise>();
    
    initialExercises.forEach(ex => uniqueExercisesMap.set(ex.id, {...ex, isCustom: false, isFetchedFromAPI: false}));
    
    customExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex)); // Custom exercises overwrite core if IDs collide (though unlikely)
    
    apiFetchedExercises.forEach(ex => {
      if (!uniqueExercisesMap.has(ex.id)) { // Add API exercises only if they don't collide with existing core/custom
        uniqueExercisesMap.set(ex.id, ex);
      }
    });
    
    return Array.from(uniqueExercisesMap.values()).sort((a,b) => a.name.localeCompare(b.name));
  }, [initialExercises, customExercises, apiFetchedExercises]);


  const handleOpenFormForCreate = () => {
    setExerciseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenFormForEdit = (exercise: Exercise) => {
    if (exercise.isFetchedFromAPI) {
      toast({
        title: "Read-only Exercise",
        description: "Exercises fetched from the external API cannot be edited directly. You can create a custom version if needed.",
        variant: "default",
        duration: 4000,
      });
      return;
    }
    setExerciseToEdit(exercise);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ExerciseFormValues) => {
    const actualMuscleGroup = data.muscleGroup === 'Other' && data.customMuscleGroup && data.customMuscleGroup.trim() !== ''
      ? data.customMuscleGroup.trim() as MuscleGroup
      : data.muscleGroup;

    let finalWorkoutTypes = [...(data.workoutType || [])];
    // Custom types are now handled by the dynamic list in ExerciseForm, so data.workoutType should contain everything.
    
    finalWorkoutTypes = Array.from(new Set(finalWorkoutTypes.filter(wt => wt && wt.trim() !== ''))).map(wt => wt as WorkoutType);
    if (finalWorkoutTypes.length === 0) {
      finalWorkoutTypes.push('Other' as WorkoutType);
    }


    const exerciseDataPayload = {
      ...data,
      muscleGroup: actualMuscleGroup,
      workoutType: finalWorkoutTypes,
      instructions: data.instructions?.split('\\n').filter(line => line.trim() !== ''),
      tips: data.tips?.split('\\n').filter(line => line.trim() !== ''),
      imageUrl: data.imageUrl || undefined,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { customMuscleGroup, ...finalExerciseData } = exerciseDataPayload;

    if (exerciseToEdit && !exerciseToEdit.isFetchedFromAPI) { // Ensure we don't edit API exercises
      const updatedExercise: Exercise = {
        ...exerciseToEdit, 
        ...finalExerciseData,
        isCustom: true, 
        isFetchedFromAPI: false, 
      };
      setCustomExercises(prev => {
        const existingIndex = prev.findIndex(ex => ex.id === updatedExercise.id);
        if (existingIndex > -1) {
          const newCustom = [...prev];
          newCustom[existingIndex] = updatedExercise;
          return newCustom;
        }
        // This case handles editing a "core" exercise for the first time, making it custom
        return prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex);
      });
      // If editing a core exercise, add it to customExercises if not already there
      if (!customExercises.find(ex => ex.id === updatedExercise.id)) {
        setCustomExercises(prev => [...prev, updatedExercise]);
      }


      toast({
        title: "Exercise Updated!",
        description: `"${updatedExercise.name}" has been updated.`,
        duration: 3000,
      });

    } else { // Creating new custom exercise
      const newExercise: Exercise = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...finalExerciseData,
        isCustom: true,
        isFetchedFromAPI: false,
      };
      setCustomExercises(prev => [newExercise, ...prev]);
      toast({
        title: "Custom Exercise Added!",
        description: `"${newExercise.name}" has been added to your library.`,
        duration: 3000,
      });
    }
    setIsFormOpen(false);
    setExerciseToEdit(null);
  };

  const handleViewDetails = (exercise: Exercise) => {
     toast({
      title: `${exercise.name} ${exercise.emoji}`,
      description: (
        <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
          <p><strong>Muscle Group:</strong> {exercise.muscleGroup}</p>
          {exercise.equipment && <p><strong>Equipment:</strong> {exercise.equipment}</p>}
          {exercise.difficulty && <p><strong>Difficulty:</strong> {exercise.difficulty}</p>}
          <p><strong>Type:</strong> {exercise.workoutType.join(', ')}</p>
          <p><strong>Description:</strong> {exercise.description}</p>
          {exercise.instructions && exercise.instructions.length > 0 && (<div><strong>Instructions:</strong><ul className="list-disc pl-5">{(exercise.instructions).map((inst, i) => <li key={i}>{inst}</li>)}</ul></div>)}
          {exercise.tips && exercise.tips.length > 0 && exercise.tips[0].length > 0 && (<div><strong>Tips:</strong><ul className="list-disc pl-5">{(exercise.tips).map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>)}
          {exercise.isCustom && !exercise.isFetchedFromAPI && <p className="italic text-amber-400">This is a custom exercise.</p>}
          {exercise.isFetchedFromAPI && <p className="italic text-sky-400">Fetched from cloud API.</p>}
          {!exercise.isCustom && !exercise.isFetchedFromAPI && <p className="italic text-gray-400">This is a core exercise.</p>}
        </div>
      ),
      duration: 7000, 
    });
  };

  const availableMuscleGroups = useMemo(() => {
    const groups = new Set<MuscleGroup>(allDisplayableExercises.map(ex => ex.muscleGroup as MuscleGroup));
    return ['All', ...Array.from(groups).sort((a,b) => (a||"").localeCompare(b||""))];
  }, [allDisplayableExercises]);

  const filteredExercises = allDisplayableExercises.filter(exercise => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = 
      exercise.name.toLowerCase().includes(searchTermLower) ||
      exercise.description.toLowerCase().includes(searchTermLower) ||
      (exercise.muscleGroup as string).toLowerCase().includes(searchTermLower) ||
      exercise.workoutType.some(wt => wt.toLowerCase().includes(searchTermLower)) ||
      (exercise.equipment && exercise.equipment.toLowerCase().includes(searchTermLower));

    const matchesMuscleGroup = selectedMuscleGroup === 'All' || exercise.muscleGroup === selectedMuscleGroup;
    return matchesSearchTerm && matchesMuscleGroup;
  });

  const handleFetchApiExercises = async () => {
    setIsLoadingApiExercises(true);
    let queryString = '';
    if (searchTerm) {
      queryString += `name=${encodeURIComponent(searchTerm)}`;
    }
    if (selectedMuscleGroup && selectedMuscleGroup !== 'All') {
      queryString += `${searchTerm ? '&' : ''}muscle=${encodeURIComponent(selectedMuscleGroup.toLowerCase())}`;
    }

    toast({ title: "Fetching exercises from cloud...", description: "This may take a moment.", duration: 2000 });
    try {
      const response = await fetch(`/api/exercises?${queryString}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      const fetchedApiExercisesData: ApiNinjaExercise[] = await response.json();
      
      if (fetchedApiExercisesData.length === 0) {
        toast({ title: "No New Exercises Found", description: "No new exercises matched your criteria from the cloud API.", duration: 3000 });
      } else {
        const transformedNewExercises = fetchedApiExercisesData.map(transformApiExercise);
        setApiFetchedExercises(prevApiExercises => {
          const existingApiIds = new Set(prevApiExercises.map(ex => ex.id));
          const uniqueExercisesMap = new Map<string, Exercise>();
          initialExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex));
          customExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex));

          const trulyNewExercises = transformedNewExercises.filter(newEx => 
            !existingApiIds.has(newEx.id) && !uniqueExercisesMap.has(newEx.id) // Check against all existing local exercises too
          );
          
          if (trulyNewExercises.length === 0 && transformedNewExercises.length > 0) {
             toast({ title: "Exercises Already Loaded", description: "The fetched exercises are already in your library or conflict with existing IDs.", duration: 3000 });
          } else if (trulyNewExercises.length > 0) {
             toast({ title: "Cloud Exercises Loaded!", description: `${trulyNewExercises.length} new exercise(s) added.`, duration: 3000 });
          }
          return [...prevApiExercises, ...trulyNewExercises];
        });
      }
    } catch (error) {
      console.error("Failed to fetch exercises from API:", error);
      toast({ title: "API Fetch Error", description: (error as Error).message || "Could not load exercises from the cloud.", variant: "destructive" });
    } finally {
      setIsLoadingApiExercises(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search exercises by name, muscle, equipment..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by muscle group" />
          </SelectTrigger>
          <SelectContent>
            {availableMuscleGroups.map(group => (
              <SelectItem key={group || 'no-group'} value={group || 'no-group'}>{group || 'Uncategorized'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
            onClick={handleOpenFormForCreate} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
        >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Custom
        </Button>
        <Button 
            onClick={handleFetchApiExercises} 
            variant="outline"
            className="w-full sm:w-auto text-primary border-primary hover:bg-primary/10"
            disabled={isLoadingApiExercises}
        >
            <Zap className="mr-2 h-5 w-5" /> 
            {isLoadingApiExercises ? "Fetching..." : "Fetch from Cloud"}
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setExerciseToEdit(null); 
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl text-primary">
                {exerciseToEdit ? `Edit: ${exerciseToEdit.name}` : "Create Custom Exercise"}
            </DialogTitle>
            <DialogDescription>
                {exerciseToEdit ? "Modify the details of this exercise." : "Add your own exercise to the library. Fill in the details below."}
            </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4 max-h-[calc(90vh-100px)] overflow-y-auto"> {/* Adjusted padding and max-height */}
            <ExerciseForm 
                exercise={exerciseToEdit || undefined} 
                onSubmit={handleFormSubmit} 
                onCancel={() => {
                    setIsFormOpen(false);
                    setExerciseToEdit(null);
                }} 
            />
            </div>
        </DialogContent>
      </Dialog>

      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
                key={exercise.id} 
                exercise={exercise} 
                onViewDetails={handleViewDetails}
                onEditExercise={exercise.isFetchedFromAPI ? undefined : handleOpenFormForEdit}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No exercises found matching your criteria.</p>
          <p className="text-foreground/70 mt-2">Try adjusting your search or filter, or add a new custom exercise!</p>
        </div>
      )}
    </div>
  );
}
