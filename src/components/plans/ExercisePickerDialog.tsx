
'use client';

import type { Exercise } from '@/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import Image from 'next/image'; 

interface ExercisePickerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allExercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExercisePickerDialog({ isOpen, onOpenChange, allExercises, onSelectExercise }: ExercisePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExercises = allExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Selecionar um Exercício</DialogTitle>
          <DialogDescription>Navegue ou pesquise na biblioteca de exercícios para adicionar à sessão.</DialogDescription>
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar exercícios por nome ou grupo muscular..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-grow pr-1 min-h-0"> 
          <div className="space-y-3">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(exercise => (
                <div 
                  key={exercise.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {exercise.imageUrl && (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                        <Image 
                          src={exercise.imageUrl} 
                          alt={exercise.name} 
                          fill 
                          style={{ objectFit: "cover" }}
                          data-ai-hint={exercise.dataAiHint || `${exercise.muscleGroup} exercise`}
                        />
                      </div>
                    )}
                    {!exercise.imageUrl && (
                       <span className="text-2xl shrink-0">{exercise.emoji}</span>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">{exercise.muscleGroup}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSelectExercise(exercise)}
                    className="text-primary border-primary hover:text-primary hover:bg-primary/10"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Selecionar
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum exercício encontrado para sua busca.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
