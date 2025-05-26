
'use client';

import type { Exercise, MuscleGroup, ApiNinjaExercise, ExerciseDifficulty } from '@/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Zap } from 'lucide-react'; // Added Zap for API button
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

const LOCAL_STORAGE_CUSTOM_EXERCISES_KEY = 'workoutWizardCustomExercises';

// --- START OF API INTEGRATION PLACEHOLDER ---
// This is a sample of how data might look from the API Ninjas /v1/exercises endpoint
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
  }
];

// Function to transform API data to our Exercise type
const transformApiExercise = (apiEx: ApiNinjaExercise): Exercise => {
  // Basic slug for ID, replace with more robust generation if needed
  const id = `api-${apiEx.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Simple emoji mapping - can be expanded
  let emoji = '💪';
  if (apiEx.muscle.includes('biceps') || apiEx.muscle.includes('triceps')) emoji = '💪';
  if (apiEx.muscle.includes('legs') || apiEx.muscle.includes('quadriceps') || apiEx.muscle.includes('hamstrings') || apiEx.muscle.includes('glutes') || apiEx.muscle.includes('calves')) emoji = '🦵';
  if (apiEx.muscle.includes('chest')) emoji = '🏋️';
  if (apiEx.muscle.includes('cardio')) emoji = '🏃';
  if (apiEx.muscle.includes('abs') || apiEx.muscle.includes('abdominals')) emoji = '🧍';


  // Split instructions into steps if they are newline separated or sentence separated.
  // This is a basic attempt; more sophisticated parsing might be needed.
  const instructionSteps = apiEx.instructions
    .split(/[.\n]/)
    .map(step => step.trim())
    .filter(step => step.length > 5); // Filter out very short or empty strings

  return {
    id,
    name: apiEx.name,
    emoji,
    muscleGroup: apiEx.muscle as MuscleGroup,
    workoutType: [apiEx.type as WorkoutType], // API provides one type, our model uses an array
    description: instructionSteps.length > 1 ? instructionSteps[0] : apiEx.instructions, // Use first step as desc if multiple, else full
    instructions: instructionSteps.length > 1 ? instructionSteps : [apiEx.instructions],
    equipment: apiEx.equipment,
    difficulty: apiEx.difficulty as ExerciseDifficulty,
    isFetchedFromAPI: true,
    isCustom: false, // API exercises are not user-custom
    imageUrl: 'https://placehold.co/600x400.png', // Placeholder
    dataAiHint: `${apiEx.muscle} ${apiEx.type}`,
  };
};


// IMPORTANT: Placeholder for actual API fetching logic
// In a real application, this function would make a call to your backend (Next.js API Route)
// which would then securely call the API Ninjas API.
// DO NOT put your API key directly in frontend code.
async function fetchExercisesFromAPIPlaceholder(): Promise<Exercise[]> {
  console.log("Simulating API call to fetch exercises...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real scenario:
  // 1. Check if the API server (Free tier) is up. The documentation says it's "Down".
  // 2. Make a GET request to 'https://api.api-ninjas.com/v1/exercises' with appropriate parameters
  //    and your API key in the 'X-Api-Key' header. This call should be made from a backend proxy.
  // const response = await fetch('/api/fetch-exercises-from-ninjas?muscle=biceps'); // Example of calling your own backend
  // if (!response.ok) {
  //   throw new Error('Failed to fetch exercises from API');
  // }
  // const data: ApiNinjaExercise[] = await response.json();
  // return data.map(transformApiExercise);

  // For now, we use the sample hardcoded data:
  console.log("Using sample API data for demonstration.");
  return sampleApiNinjaData.map(transformApiExercise);
}
// --- END OF API INTEGRATION PLACEHOLDER ---


export function ExerciseListClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [apiFetchedExercises, setApiFetchedExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>(initialExercises);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const { toast } = useToast();
  const [isLoadingApiExercises, setIsLoadingApiExercises] = useState(false);


  // Load custom exercises from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCustomExercisesString = localStorage.getItem(LOCAL_STORAGE_CUSTOM_EXERCISES_KEY);
        if (savedCustomExercisesString) {
          const loadedCustomExercises = JSON.parse(savedCustomExercisesString) as Exercise[];
          setCustomExercises(loadedCustomExercises);
        }
      } catch (error) {
        console.error("Failed to load custom exercises from localStorage", error);
        toast({
          title: "Error Loading Custom Exercises",
          description: "Could not retrieve your saved custom exercises.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Combine all exercise sources: initial (preloaded), custom (localStorage), and API-fetched
  useEffect(() => {
    const correctlyMarkedInitial = initialExercises.map(ex => ({ ...ex, isCustom: false, isFetchedFromAPI: false }));
    
    const uniqueExercisesMap = new Map<string, Exercise>();
    
    correctlyMarkedInitial.forEach(ex => uniqueExercisesMap.set(ex.id, ex));
    customExercises.forEach(ex => uniqueExercisesMap.set(ex.id, { ...ex, isCustom: true, isFetchedFromAPI: false }));
    apiFetchedExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex)); // API exercises are already flagged
    
    setAllExercises(Array.from(uniqueExercisesMap.values()).sort((a,b) => a.name.localeCompare(b.name)));
  }, [initialExercises, customExercises, apiFetchedExercises]);

  // Save custom exercises to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only save if customExercises has items or if the key already exists (to allow clearing)
      if (customExercises.length > 0 || localStorage.getItem(LOCAL_STORAGE_CUSTOM_EXERCISES_KEY)) {
        try {
          localStorage.setItem(LOCAL_STORAGE_CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
        } catch (error) {
          console.error("Failed to save custom exercises to localStorage", error);
          toast({
            title: "Error Saving Custom Exercises",
            description: "Your custom exercises could not be saved automatically.",
            variant: "destructive",
          });
        }
      }
    }
  }, [customExercises, toast]);

  const handleOpenFormForCreate = () => {
    setExerciseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenFormForEdit = (exercise: Exercise) => {
    // Do not allow editing of API-fetched exercises directly through this form
    // They should be treated as read-only or copied to custom if modification is needed.
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

    const finalWorkoutTypes = Array.from(new Set(data.workoutType.map(wt => wt.trim()).filter(wt => wt)));


    const exerciseData = {
      ...data,
      muscleGroup: actualMuscleGroup,
      workoutType: finalWorkoutTypes,
      instructions: data.instructions?.split('\\n').filter(line => line.trim() !== ''),
      tips: data.tips?.split('\\n').filter(line => line.trim() !== ''),
      imageUrl: data.imageUrl || undefined,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { customMuscleGroup, ...finalExerciseData } = exerciseData;


    if (exerciseToEdit) { // Editing existing custom exercise
      const updatedExercise: Exercise = {
        ...exerciseToEdit,
        ...finalExerciseData,
        isCustom: true, // Ensure it's marked as custom
        isFetchedFromAPI: false,
      };
      setCustomExercises(prev => prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
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
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div><strong>Instructions:</strong><ul className="list-disc pl-5">{(exercise.instructions || []).map((inst, i) => <li key={i}>{inst}</li>)}</ul></div>
          )}
          {exercise.tips && exercise.tips.length > 0 && (
             <div><strong>Tips:</strong><ul className="list-disc pl-5">{(exercise.tips || []).map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>
          )}
          {exercise.isCustom && <p className="italic text-muted-foreground">This is a custom exercise.</p>}
          {exercise.isFetchedFromAPI && <p className="italic text-accent">Fetched from external API.</p>}
        </div>
      ),
      duration: 7000,
    });
  };

  const availableMuscleGroups = useMemo(() => {
    const groups = new Set<MuscleGroup>(allExercises.map(ex => ex.muscleGroup as MuscleGroup));
    return ['All', ...Array.from(groups).sort((a,b) => (a||"").localeCompare(b||""))];
  }, [allExercises]);

  const filteredExercises = allExercises.filter(exercise => {
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
    toast({ title: "Fetching exercises from API...", description: "This is a simulation.", duration: 2000 });
    try {
      const fetched = await fetchExercisesFromAPIPlaceholder();
      setApiFetchedExercises(prevApiExercises => {
        const newApiExercisesMap = new Map(prevApiExercises.map(ex => [ex.id, ex]));
        fetched.forEach(ex => newApiExercisesMap.set(ex.id, ex));
        return Array.from(newApiExercisesMap.values());
      });
      toast({ title: "API Exercises Loaded (Simulated)", description: `${fetched.length} exercises were processed.`, duration: 3000 });
    } catch (error) {
      console.error("Failed to fetch exercises from API (Placeholder):", error);
      toast({ title: "API Fetch Error (Simulated)", description: "Could not load exercises.", variant: "destructive" });
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
            {isLoadingApiExercises ? "Loading API..." : "Load from API (Demo)"}
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
            <div className="p-6 pt-4 max-h-[calc(90vh-100px)] overflow-y-auto">
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
                onEditExercise={exercise.isFetchedFromAPI ? undefined : handleOpenFormForEdit} // Disable edit for API exercises
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
