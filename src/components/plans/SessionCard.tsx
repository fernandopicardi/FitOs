
'use client';

import type { WorkoutSession } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/70">
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4 px-4 gap-2">
        <div className="flex-grow min-w-0"> 
          <CardTitle className="text-lg text-foreground break-words">{session.name}</CardTitle>
          {session.dayOfWeek && (
            <Badge variant="outline" className="mt-1 text-xs">{session.dayOfWeek}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEditDetails(session)}>
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Editar Detalhes da Sessão</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir Sessão</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Sessão: {session.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá permanentemente esta sessão e todos os seus exercícios planejados. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(session.id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Excluir Sessão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-1">
        <Badge variant="secondary" className="text-xs mb-2">
          {exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}
        </Badge>
        {session.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">{session.notes}</p>
        )}
         {!session.notes && exerciseCount === 0 && <div className="h-5"></div>} 
      </CardContent>
      <CardFooter className="pt-3 px-4 pb-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onManageExercises(session)}
        >
          <ListChecks className="mr-2 h-4 w-4" /> Gerenciar Exercícios
        </Button>
      </CardFooter>
    </Card>
  );
}
