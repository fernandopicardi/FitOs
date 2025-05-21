
'use client';

import type { ActiveWorkoutLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, CalendarDays, Clock, ListChecks, Eye } from 'lucide-react';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast'; // For future detailed view toast

interface WorkoutHistoryCardProps {
  log: ActiveWorkoutLog;
}

export function WorkoutHistoryCard({ log }: WorkoutHistoryCardProps) {
  const { toast } = useToast();
  const workoutDate = parseISO(log.date); // Ensure date is parsed correctly
  const formattedDate = format(workoutDate, "MMMM d, yyyy 'at' h:mm a");
  
  let duration = 'N/A';
  if (log.startTime && log.endTime && log.endTime > log.startTime) {
    try {
      duration = formatDistanceStrict(new Date(log.endTime), new Date(log.startTime));
    } catch (error) {
      console.error("Error formatting duration for log:", log.id, error);
      duration = "Error"; // Indicate if there was an issue with duration calculation
    }
  } else if (log.startTime && log.endTime && log.endTime <= log.startTime) {
    duration = "Invalid times";
  }


  const exercisesCount = log.exercises.length;

  const handleViewDetails = () => {
    // For now, we'll just log the details. A modal/dialog would be better.
    console.log("Workout Log Details:", log);
    toast({
      title: `Details for: ${log.planName || log.workoutName}`,
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-card p-4 overflow-x-auto">
          <code className="text-card-foreground">{JSON.stringify(log, null, 2)}</code>
        </pre>
      ),
      duration: 9000, // Make it last longer to view details
    });
  };

  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
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
