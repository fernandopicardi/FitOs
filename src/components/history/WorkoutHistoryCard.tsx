
'use client';

import type { ActiveWorkoutLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, CalendarDays, Clock, ListChecks, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface WorkoutHistoryCardProps {
  log: ActiveWorkoutLog;
}

export function WorkoutHistoryCard({ log }: WorkoutHistoryCardProps) {
  const { toast } = useToast();
  const workoutDate = parseISO(log.date);
  const formattedDate = format(workoutDate, "MMMM d, yyyy 'at' h:mm a");
  
  let duration = 'N/A';
  if (log.startTime && log.endTime && log.endTime > log.startTime) {
    try {
      duration = formatDistanceStrict(new Date(log.endTime), new Date(log.startTime));
    } catch (error) {
      console.error("Error formatting duration for log:", log.id, error);
      duration = "Error";
    }
  } else if (log.startTime && log.endTime && log.endTime <= log.startTime) {
    duration = "Invalid times";
  }

  const exercisesCount = log.exercises.length;

  const handleViewDetails = () => {
    toast({
      title: `Details for: ${log.planName || log.workoutName}`,
      description: (
        <div className="text-sm space-y-3 max-h-[70vh] w-full sm:w-[380px] overflow-y-auto text-card-foreground p-1 rounded-md bg-card">
          <div className="space-y-1 mb-2">
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Duration:</strong> {duration}</p>
          </div>
          
          {log.exercises.map((exercise, index) => (
            <div key={exercise.id} className="py-2 border-t border-muted/30 first:border-t-0">
              <p className="font-semibold text-base text-primary flex items-center">
                <span className="text-xl mr-2">{exercise.emoji}</span> 
                {exercise.name}
              </p>
              {exercise.plannedSets && exercise.plannedReps && (
                <p className="text-xs text-muted-foreground mb-1">
                  Plan: {exercise.plannedSets} sets of {exercise.plannedReps}
                </p>
              )}
              {exercise.sets.length > 0 ? (
                <ul className="list-none pl-1 text-xs space-y-1 mt-1.5">
                  {exercise.sets.map((set, setIndex) => (
                    <li key={set.id} className="flex items-center justify-between p-1.5 bg-background/50 rounded-md">
                      <span className="flex-1">
                        Set {setIndex + 1}: {set.weight || 'N/A'} x {set.reps || 'N/A'} reps
                      </span>
                      {set.isCompleted ? 
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-2 shrink-0" /> : 
                        <XCircle className="h-4 w-4 text-red-500 ml-2 shrink-0" />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic mt-1">No sets logged for this exercise.</p>
              )}
              {exercise.notes && <p className="text-xs text-muted-foreground mt-1.5"><em>Exercise Notes: {exercise.notes}</em></p>}
            </div>
          ))}
          
          {log.notes && (
            <div className="pt-2 mt-3 border-t border-muted/30">
              <p className="font-semibold text-base text-primary">Overall Workout Notes:</p>
              <p className="text-xs text-muted-foreground">{log.notes}</p>
            </div>
          )}

          {!log.exercises.length && !log.notes && (
             <p className="text-muted-foreground italic text-center py-4">No specific details logged for this workout.</p>
          )}
        </div>
      ),
      duration: 8000, // Reduced duration
      className: 'sm:max-w-md w-full', // Custom class for toast width
    });
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
          <Activity className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
          <span className="truncate" title={log.planName || log.workoutName}>{log.planName || log.workoutName}</span>
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
          <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" /> {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4 space-y-1.5 md:space-y-2 text-sm">
        <div className="flex items-center text-foreground/90">
          <ListChecks className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{exercisesCount} exercise{exercisesCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center text-foreground/90">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Duration: {duration}</span>
        </div>
        {log.notes && (
          <div className="pt-1 md:pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Notes:</p>
            <p className="text-xs text-foreground/80 line-clamp-2" title={log.notes}>{log.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 pb-3 md:pt-4 md:pb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary"
          onClick={handleViewDetails}
        >
          <Eye className="mr-2 h-4 w-4" /> View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
