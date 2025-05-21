'use client';

import type { Exercise } from '@/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ExerciseForm } from './ExerciseForm';
import type { ExerciseFormValues } from './ExerciseForm'; // Assuming ExerciseForm exports this type
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRELOADED_EXERCISES } from '@/constants/exercises'; // For muscle group options

const ALL_MUSCLE_GROUPS = ['All', ...new Set(PRELOADED_EXERCISES.map(ex => ex.muscleGroup))];


export function ExerciseListClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');

  // This would eventually be an API call
  const handleAddCustomExercise = (data: ExerciseFormValues) => {
    console.log('Custom exercise data:', data);
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`, // Simple unique ID for client-side
      name: data.name,
      emoji: data.emoji,
      muscleGroup: data.muscleGroup,
      workoutType: data.workoutType,
      description: data.description,
      instructions: data.instructions?.split('\n').filter(line => line.trim() !== ''),
      tips: data.tips?.split('\n').filter(line => line.trim() !== ''),
      imageUrl: data.imageUrl || undefined,
      isCustom: true,
    };
    setExercises(prev => [newExercise, ...prev]);
    setIsFormOpen(false); 
  };

  const handleViewDetails = (exercise: Exercise) => {
    // For now, just log. Later this could open a detailed modal.
    console.log("View details for:", exercise.name);
    // Example: Open a dialog with full exercise details
    // setSelectedExerciseForDetails(exercise); setIsDetailsModalOpen(true);
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearchTerm = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
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
            {ALL_MUSCLE_GROUPS.map(group => (
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">Create Custom Exercise</DialogTitle>
              <DialogDescription>
                Add your own exercise to the library. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <ExerciseForm 
              onSubmit={handleAddCustomExercise} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No exercises found matching your criteria.</p>
          <p className="text-foreground/70 mt-2">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
