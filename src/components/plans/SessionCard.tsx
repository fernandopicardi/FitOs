
'use client';

import type { WorkoutSession } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, CalendarPlus, GripVertical, ListChecks } from 'lucide-react'; // Changed CalendarPlus to ListChecks
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SessionCardProps {
  session: WorkoutSession;
  onEdit: (session: WorkoutSession) => void;
  onDelete: (sessionId: string) => void;
  // onManageExercises: (session: WorkoutSession) => void; // For future implementation
}

export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  const exerciseCount = session.exercises?.length || 0;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-border/70">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <div className="flex items-center gap-3">
          {/* <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" /> */}
          <CardTitle className="text-lg text-foreground">{session.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(session)}>
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit Session</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Session</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Session: {session.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this session and all its planned exercises. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(session.id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {session.dayOfWeek && (
          <Badge variant="outline" className="mr-2 mb-2 text-xs">{session.dayOfWeek}</Badge>
        )}
        <Badge variant="secondary" className="text-xs">
          {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
        </Badge>
        {session.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{session.notes}</p>
        )}
      </CardContent>
      {/* Footer can be used for "Manage Exercises" button later */}
      {/* <CardFooter className="pt-3 px-4 pb-4 border-t">
        <Button 
          variant="link" 
          className="p-0 text-sm text-primary hover:text-primary/80"
          // onClick={() => onManageExercises(session)} // For future
        >
          <ListChecks className="mr-2 h-4 w-4" /> Manage Exercises
        </Button>
      </CardFooter> */}
    </Card>
  );
}
