import type { Exercise } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Tag } from 'lucide-react';
import Image from 'next/image';

interface ExerciseCardProps {
  exercise: Exercise;
  onViewDetails?: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onViewDetails }: ExerciseCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full">
      {exercise.imageUrl && (
        <div className="relative w-full h-48">
          <Image 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            fill // Changed layout to fill
            objectFit="cover"
            data-ai-hint={`${exercise.muscleGroup} ${exercise.name.split(' ')[0]}`}
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
            {exercise.isCustom && (
              <Badge variant="outline" className="mb-2 border-accent text-accent">
                <Tag className="mr-1 h-3 w-3" /> Custom
              </Badge>
            )}
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
      <CardFooter>
        {onViewDetails ? (
          <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/80 p-0" onClick={() => onViewDetails(exercise)}>
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
           <div className="h-10"></div> // Placeholder to maintain height consistency if no button
        )}
      </CardFooter>
    </Card>
  );
}
