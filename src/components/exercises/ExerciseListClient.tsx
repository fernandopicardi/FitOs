
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
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
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
    const correctlyMarkedInitial = initialExercises.map(ex => ({ ...ex, isCustom: false }));
    const merged = [...correctlyMarkedInitial, ...customExercises.map(ex => ({ ...ex, isCustom: true }))];
    
    const uniqueExercisesMap = new Map<string, Exercise>();
    // Add preloaded first
    correctlyMarkedInitial.forEach(ex => uniqueExercisesMap.set(ex.id, ex));
    // Then add/override with custom
    customExercises.forEach(ex => uniqueExercisesMap.set(ex.id, { ...ex, isCustom: true }));
    
    setAllExercises(Array.from(uniqueExercisesMap.values()));
  }, [initialExercises, customExercises]);

  // Save custom exercises to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    setExerciseToEdit(exercise);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ExerciseFormValues) => {
    const actualMuscleGroup = data.muscleGroup === 'Other' && data.customMuscleGroup && data.customMuscleGroup.trim() !== ''
      ? data.customMuscleGroup.trim() as MuscleGroup // Cast as MuscleGroup, assuming it's valid for user's intent
      : data.muscleGroup;

    const exerciseData = {
      ...data,
      muscleGroup: actualMuscleGroup,
      instructions: data.instructions?.split('\\n').filter(line => line.trim() !== ''),
      tips: data.tips?.split('\\n').filter(line => line.trim() !== ''),
      imageUrl: data.imageUrl || undefined,
    };
    // Remove customMuscleGroup from the final exercise object if it was just a temporary holder
    const { customMuscleGroup, ...finalExerciseData } = exerciseData;


    if (exerciseToEdit) {
      const updatedExercise: Exercise = {
        ...exerciseToEdit,
        ...finalExerciseData,
        isCustom: true, 
      };

      setCustomExercises(prev => {
        const existingIndex = prev.findIndex(ex => ex.id === updatedExercise.id);
        if (existingIndex > -1) {
          const newCustom = [...prev];
          newCustom[existingIndex] = updatedExercise;
          return newCustom;
        }
        return [updatedExercise, ...prev.filter(ex => ex.id !== updatedExercise.id)];
      });
      
      toast({
        title: "Exercise Updated!",
        description: `"${updatedExercise.name}" has been updated.`,
      });

    } else {
      const newExercise: Exercise = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...finalExerciseData,
        isCustom: true,
      };
      setCustomExercises(prev => [newExercise, ...prev]);
      toast({
        title: "Custom Exercise Added!",
        description: `"${newExercise.name}" has been added to your library.`,
      });
    }
    setIsFormOpen(false);
    setExerciseToEdit(null);
  };

  const handleViewDetails = (exercise: Exercise) => {
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
      duration: 7000,
    });
  };

  const availableMuscleGroups = useMemo(() => {
    const groups = new Set<MuscleGroup>(allExercises.map(ex => ex.muscleGroup as MuscleGroup));
    return ['All', ...Array.from(groups).sort()];
  }, [allExercises]);

  const filteredExercises = allExercises.filter(exercise => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = 
      exercise.name.toLowerCase().includes(searchTermLower) ||
      exercise.description.toLowerCase().includes(searchTermLower) ||
      (exercise.muscleGroup as string).toLowerCase().includes(searchTermLower) || // Cast to string for safety
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
        <Button 
            onClick={handleOpenFormForCreate} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
        >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Custom Exercise
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setExerciseToEdit(null); // Reset on close
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
            <div className="p-6 pt-4 max-h-[calc(90vh-100px)] overflow-y-auto"> {/* Scrollable content area */}
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
                onEditExercise={handleOpenFormForEdit}
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
