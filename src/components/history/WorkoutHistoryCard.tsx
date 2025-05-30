
'use client';

import type { ActiveWorkoutLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, CalendarDays, Clock, ListChecks, Eye, CheckCircle2, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
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

interface WorkoutHistoryCardProps {
  log: ActiveWorkoutLog;
  onDeleteLog: (logId: string) => void;
}

export function WorkoutHistoryCard({ log, onDeleteLog }: WorkoutHistoryCardProps) {
  const { toast } = useToast();
  const workoutDate = parseISO(log.date);
  const formattedDate = format(workoutDate, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  
  let duration = 'N/D';
  if (log.startTime && log.endTime && log.endTime > log.startTime) {
    try {
      duration = formatDistanceStrict(new Date(log.endTime), new Date(log.startTime), { locale: ptBR, addSuffix: false });
    } catch (error) {
      console.error("Erro ao formatar duração para o log:", log.id, error);
      duration = "Erro";
    }
  } else if (log.startTime && log.endTime && log.endTime <= log.startTime) {
    duration = "Tempos inválidos";
  }

  const exercisesCount = log.exercises.length;

  const handleViewDetails = () => {
    toast({
      title: `Detalhes para: ${log.planName || log.workoutName}`,
      description: (
        <div className="text-sm space-y-3 max-h-[70vh] w-full sm:w-[380px] overflow-y-auto text-card-foreground p-1 rounded-md bg-card">
          <div className="space-y-1 mb-2">
            <p><strong>Data:</strong> {formattedDate}</p>
            <p><strong>Duração:</strong> {duration}</p>
          </div>
          
          {log.exercises.map((exercise, index) => (
            <div key={exercise.id} className="py-2 border-t border-muted/30 first:border-t-0">
              <p className="font-semibold text-base text-primary flex items-center" key={index}>
                <span className="text-xl mr-2">{exercise.emoji}</span> 
                {exercise.name}
              </p>
              {exercise.plannedSets && exercise.plannedReps && (
                <p className="text-xs text-muted-foreground mb-1">
                  Plano: {exercise.plannedSets} séries de {exercise.plannedReps}
                </p>
              )}
              {exercise.sets.length > 0 ? (
                <ul className="list-none pl-1 text-xs space-y-1 mt-1.5">
                  {exercise.sets.map((set, setIndex) => (
                    <li key={set.id} className="flex items-center justify-between p-1.5 bg-background/50 rounded-md">
                      <span className="flex-1">
                        Série {setIndex + 1}: {set.weight || 'N/A'}kg x {set.reps || 'N/A'} reps
                        {set.rpe && <span className="text-muted-foreground text-xs italic"> (RPE: {set.rpe})</span>}
                        {set.notes && <span className="block text-muted-foreground text-xs italic mt-0.5">Notas: {set.notes}</span>}
                      </span>
                       {set.isCompleted ?
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-2 shrink-0" /> : 
                        <XCircle className="h-4 w-4 text-red-500 ml-2 shrink-0" />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic mt-1">Nenhuma série registrada para este exercício.</p>
              )}
              {exercise.notes && <p className="text-xs text-muted-foreground mt-1.5"><em>Notas do Exercício: {exercise.notes}</em></p>}
            </div>
          ))}
          
          {log.notes && (
            <div className="pt-2 mt-3 border-t border-muted/30">
              <p className="font-semibold text-base text-primary">Notas Gerais do Treino:</p>
              <p className="text-xs text-muted-foreground">{log.notes}</p>
            </div>
          )}

          {!log.exercises.length && !log.notes && (
             <p className="text-muted-foreground italic text-center py-4">Nenhum detalhe específico registrado para este treino.</p>
          )}
        </div>
      ),
      duration: 8000, 
      className: 'sm:max-w-md w-full', 
    });
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.03] flex flex-col h-full bg-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow min-w-0">
            <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
              <Activity className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
              <span className="truncate" title={log.planName || log.workoutName}>{log.planName || log.workoutName}</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
              <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" /> {formattedDate}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
                aria-label="Excluir este registro de treino"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                   <AlertTriangle className="h-6 w-6 text-destructive" />
                  Excluir este Treino?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o registro do treino &quot;{log.planName || log.workoutName}&quot; de {formattedDate}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteLog(log.id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Sim, Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4 space-y-1.5 md:space-y-2 text-sm">
        <div className="flex items-center text-foreground/90">
          <ListChecks className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{exercisesCount} exercício{exercisesCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center text-foreground/90">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Duração: {duration}</span>
        </div>
        {log.notes && (
          <div className="pt-1 md:pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Notas:</p>
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
          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
