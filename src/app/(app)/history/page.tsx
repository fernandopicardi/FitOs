
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Activity, ListChecks, Trash2, AlertTriangle } from 'lucide-react';
import type { ActiveWorkoutLog } from '@/types';
import { WorkoutHistoryCard } from '@/components/history/WorkoutHistoryCard';
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

const LOCAL_STORAGE_HISTORY_KEY = 'workoutWizardHistory';

export default function WorkoutHistoryPage() {
  const [workoutHistory, setWorkoutHistory] = useState<ActiveWorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedHistoryString = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        if (savedHistoryString) {
          const history = JSON.parse(savedHistoryString) as ActiveWorkoutLog[];
          setWorkoutHistory(history);
        }
      } catch (error) {
        console.error("Failed to load workout history from localStorage", error);
        toast({
          title: "Error Loading History",
          description: "Could not retrieve your workout history.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
  }, [toast]);

  const handleClearAllHistory = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
        setWorkoutHistory([]);
        toast({
          title: "Histórico Apagado!",
          description: "Todo o seu histórico de treinos foi removido.",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Failed to clear workout history from localStorage", error);
      toast({
        title: "Erro ao Apagar Histórico",
        description: "Não foi possível limpar o histórico. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecificLog = (logId: string) => {
    try {
      if (typeof window !== 'undefined') {
        const updatedHistory = workoutHistory.filter(log => log.id !== logId);
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
        setWorkoutHistory(updatedHistory);
        toast({
          title: "Treino Removido",
          description: "O registro do treino foi apagado do seu histórico.",
        });
      }
    } catch (error) {
      console.error(`Failed to delete log ${logId} from localStorage`, error);
      toast({
        title: "Erro ao Apagar Treino",
        description: "Não foi possível remover o registro deste treino. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && typeof window !== 'undefined') {
    return (
      <div className="space-y-8">
        <PageTitle 
          title="Workout History"
          subtitle="Review your past workouts and track your fitness journey over time."
        />
        <div className="text-center py-10">
          <ListChecks className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <p className="mt-4 text-lg text-muted-foreground">Loading your workout history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle 
        title="Workout History"
        subtitle="Review your past workouts and track your fitness journey over time."
      >
        {workoutHistory.length > 0 && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Limpar Todo o Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Tem Certeza Absoluta?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso apagará permanentemente todo o seu histórico de treinos.
                  Seus planos de treino não serão afetados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllHistory}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Sim, Apagar Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </PageTitle>

      {workoutHistory.length === 0 ? (
        <Card className="shadow-lg text-center border-dashed border-muted-foreground/50 py-12">
          <CardHeader className="p-0">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <CalendarClock className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Workout History Yet</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">
              Looks like your fitness journal is waiting for its first entry!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Head over to the "Log Workout" page to record your sessions and build your history.
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <Link href="/log">
                <Activity className="mr-2 h-5 w-5" /> Log Your First Workout
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutHistory.map(log => (
            <WorkoutHistoryCard key={log.id} log={log} onDeleteLog={handleDeleteSpecificLog} />
          ))}
        </div>
      )}
    </div>
  );
}
