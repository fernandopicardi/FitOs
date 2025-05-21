
'use client';

import type { WorkoutSession } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, ListChecks } from 'lucide-react';
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
  onEditDetails: (session: WorkoutSession) => void;
  onDelete: (sessionId: string) => void;
  onManageExercises: (session: WorkoutSession) => void;
}

export function SessionCard({ session, onEditDetails, onDelete, onManageExercises }: SessionCardProps) {
  const exerciseCount = session.exercises?.length || 0;

  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border border-border/70">
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4 px-4 gap-2">
        <div className="flex-grow min-w-0"> {/* Ensure title can shrink and wrap */}
          <CardTitle className="text-lg text-foreground break-words">{session.name}</CardTitle>
          {session.dayOfWeek && (
            <Badge variant="outline" className="mt-1 text-xs">{session.dayOfWeek}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEditDetails(session)}>
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit Session Details</span>
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
      <CardContent className="px-4 pb-3 pt-1">
        <Badge variant="secondary" className="text-xs mb-2">
          {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
        </Badge>
        {session.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">{session.notes}</p>
        )}
         {!session.notes && exerciseCount === 0 && <div className="h-5"></div>} {/* Placeholder for consistent height */}
      </CardContent>
      <CardFooter className="pt-3 px-4 pb-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onManageExercises(session)}
        >
          <ListChecks className="mr-2 h-4 w-4" /> Manage Exercises
        </Button>
      </CardFooter>
    </Card>
  );
}
