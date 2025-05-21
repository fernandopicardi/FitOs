
'use client';

import type { Exercise, MuscleGroup } from '@/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExerciseForm } from './ExerciseForm';
import type { ExerciseFormValues } from './ExerciseForm';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_CUSTOM_EXERCISES_KEY = 'workoutWizardCustomExercises';


export function ExerciseListClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>(initialExercises);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const { toast } = useToast();

  // Load custom exercises from localStorage on mount
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

  // Merge initial (preloaded) and custom exercises whenever either changes
  useEffect(() => {
    // Ensure custom exercises are marked correctly, and preloaded ones are not marked as custom
    const correctlyMarkedInitial = initialExercises.map(ex => ({ ...ex, isCustom: false }));
    const merged = [...correctlyMarkedInitial, ...customExercises.map(ex => ({ ...ex, isCustom: true }))];
    
    // Remove duplicates by ID, prioritizing custom exercises if IDs clash (though unlikely with current ID generation)
    const uniqueExercises = merged.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        // If a preloaded and custom exercise somehow have the same ID, prefer the custom one.
        // Or, if both are custom/preloaded, prefer the one later in the merge (effectively the custom one).
        if (current.isCustom) {
          return acc.map(item => item.id === current.id ? current : item);
        }
        return acc;
      }
    }, [] as Exercise[]);

    setAllExercises(uniqueExercises);
  }, [initialExercises, customExercises]);

  // Save custom exercises to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, [customExercises, toast]);


  const handleAddCustomExercise = (data: ExerciseFormValues) => {
    const newExercise: Exercise = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More robust unique ID
      name: data.name,
      emoji: data.emoji,
      muscleGroup: data.muscleGroup,
      workoutType: data.workoutType,
      description: data.description,
      instructions: data.instructions?.split('\n').filter(line => line.trim() !== ''),
      tips: data.tips?.split('\n').filter(line => line.trim() !== ''),
      imageUrl: data.imageUrl || undefined,
      isCustom: true, // Explicitly mark as custom
    };
    setCustomExercises(prev => [newExercise, ...prev]);
    setIsFormOpen(false); 
    toast({
      title: "Custom Exercise Added!",
      description: `"${newExercise.name}" has been added to your library.`,
    });
  };

  const handleViewDetails = (exercise: Exercise) => {
    // For now, just log. Later this could open a detailed modal.
    console.log("View details for:", exercise);
     toast({
      title: `Details for: ${exercise.name} ${exercise.emoji}`,
      description: (
        <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
          <p><strong>Muscle Group:</strong> {exercise.muscleGroup}</p>
          <p><strong>Type:</strong> {exercise.workoutType.join(', ')}</p>
          <p><strong>Description:</strong> {exercise.description}</p>
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div><strong>Instructions:</strong><ul className="list-disc pl-5">{(exercise.instructions || []).map((inst, i) => <li key={i}>{inst}</li>)}</ul></div>
          )}
          {exercise.tips && exercise.tips.length > 0 && (
             <div><strong>Tips:</strong><ul className="list-disc pl-5">{(exercise.tips || []).map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>
          )}
          {exercise.isCustom && <p className="italic text-muted-foreground">This is a custom exercise.</p>}
        </div>
      ),
      duration: 9000,
    });
  };

  const availableMuscleGroups = useMemo(() => {
    const groups = new Set<MuscleGroup>(allExercises.map(ex => ex.muscleGroup));
    return ['All', ...Array.from(groups).sort()];
  }, [allExercises]);

  const filteredExercises = allExercises.filter(exercise => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = 
      exercise.name.toLowerCase().includes(searchTermLower) ||
      exercise.description.toLowerCase().includes(searchTermLower) ||
      exercise.muscleGroup.toLowerCase().includes(searchTermLower) ||
      exercise.workoutType.some(wt => wt.toLowerCase().includes(searchTermLower));
      
    const matchesMuscleGroup = selectedMuscleGroup === 'All' || exercise.muscleGroup === selectedMuscleGroup;
    return matchesSearchTerm && matchesMuscleGroup;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search exercises..." 
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
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Custom Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
             <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl text-primary">Create Custom Exercise</DialogTitle>
              <DialogDescription>
                Add your own exercise to the library. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4 max-h-[calc(90vh-100px)] overflow-y-auto">
              <ExerciseForm 
                onSubmit={handleAddCustomExercise} 
                onCancel={() => setIsFormOpen(false)} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} onViewDetails={handleViewDetails} />
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

    