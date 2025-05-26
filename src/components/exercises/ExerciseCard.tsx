
import type { Exercise } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Edit3, Cloud, UserCog, Star } from 'lucide-react';
import Image from 'next/image';

interface ExerciseCardProps {
  exercise: Exercise;
  onViewDetails?: (exercise: Exercise) => void;
  onEditExercise?: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onViewDetails, onEditExercise }: ExerciseCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.03] flex flex-col overflow-hidden h-full">
      {exercise.imageUrl && (
        <div className="relative w-full h-48">
          <Image 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            fill
            style={{ objectFit: "cover" }} // Alterado para style object
            data-ai-hint={exercise.dataAiHint || `${exercise.muscleGroup} ${exercise.name.split(' ')[0]}`}
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div> 
            <CardTitle className="text-2xl mb-1 flex items-center">
              <span className="text-3xl mr-2">{exercise.emoji}</span>
              {exercise.name}
            </CardTitle>
            <div className="flex flex-wrap gap-1 mt-1 mb-2"> 
              {exercise.isFetchedFromAPI && (
                <Badge variant="outline" className="text-xs text-sky-500 border-sky-500">
                  <Cloud className="mr-1 h-3 w-3" /> API
                </Badge>
              )}
              {exercise.isCustom && !exercise.isFetchedFromAPI && (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500">
                  <UserCog className="mr-1 h-3 w-3" /> Customizado
                </Badge>
              )}
              {!exercise.isCustom && !exercise.isFetchedFromAPI && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="mr-1 h-3 w-3" /> Padrão
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="secondary">{exercise.muscleGroup}</Badge>
          {exercise.workoutType.map(wt => (
            <Badge key={wt} variant="outline">{wt}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <CardDescription className="line-clamp-3 text-foreground/70">
          {exercise.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {onViewDetails && (
          <Button variant="ghost" className="text-primary hover:text-primary/80 p-0" onClick={() => onViewDetails(exercise)}>
            Ver Detalhes <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
        {onEditExercise && !exercise.isFetchedFromAPI && ( 
          <Button variant="outline" size="sm" onClick={() => onEditExercise(exercise)} className="text-accent border-accent hover:bg-accent/10 hover:text-accent">
            <Edit3 className="mr-2 h-4 w-4" /> Editar
          </Button>
        )}
         {(!onViewDetails && (!onEditExercise || exercise.isFetchedFromAPI)) && <div className="h-10"></div>} 
      </CardFooter>
    </Card>
  );
}
