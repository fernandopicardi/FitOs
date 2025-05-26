
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Activity, ListChecks, Trash2, AlertTriangle, BarChart3, Trophy } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend as RechartsLegend } from 'recharts'; 
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';

const LOCAL_STORAGE_HISTORY_KEY = 'workoutWizardHistory';

interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  emoji: string;
  maxWeight: number;
  reps: string;
  date: string; // ISO string
  formattedDate: string;
}

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
          history.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
          setWorkoutHistory(history);
        }
      } catch (error) {
        console.error("Failed to load workout history from localStorage", error);
        toast({
          title: "Erro ao Carregar Histórico",
          description: "Não foi possível recuperar seu histórico de treino.",
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }
  }, [toast]);

  const monthlyWorkoutData = useMemo(() => {
    if (!workoutHistory.length) return [];
    const dataByMonth: { [key: string]: number } = {};
    workoutHistory.forEach(log => {
      const date = parseISO(log.date);
      const monthYear = format(date, 'MMM yyyy', { locale: ptBR });
      if (dataByMonth[monthYear]) {
        dataByMonth[monthYear]++;
      } else {
        dataByMonth[monthYear] = 1;
      }
    });
    const sortedMonths = Object.keys(dataByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      // Ensure month names are correctly parsed by creating a full date string
      // This assumes month names from format 'MMM' are English for Date constructor
      const dateA = new Date(Date.parse(monthA + " 1," + yearA));
      const dateB = new Date(Date.parse(monthB + " 1," + yearB));
      return dateA.getTime() - dateB.getTime();
    });
    return sortedMonths.map(monthYear => ({
      month: monthYear.charAt(0).toUpperCase() + monthYear.slice(1), // Capitalize first letter
      workouts: dataByMonth[monthYear],
    }));
  }, [workoutHistory]);

  const chartConfig = {
    workouts: {
      label: "Treinos Registrados",
      color: "hsl(var(--chart-1))",
    },
  };

  const personalRecordsData = useMemo(() => {
    if (!workoutHistory.length) return [];

    const prs: { [exerciseId: string]: PersonalRecord } = {};

    workoutHistory.forEach(log => {
      log.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          const weight = parseFloat(set.weight);
          if (!isNaN(weight) && set.reps && set.isCompleted) { 
            const existingPr = prs[exercise.exerciseId];
            if (!existingPr || weight > existingPr.maxWeight || (weight === existingPr.maxWeight && parseInt(set.reps) > parseInt(existingPr.reps || '0'))) {
              prs[exercise.exerciseId] = {
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.name,
                emoji: exercise.emoji,
                maxWeight: weight,
                reps: set.reps,
                date: log.date,
                formattedDate: format(parseISO(log.date), "dd/MM/yy"),
              };
            }
          }
        });
      });
    });
    return Object.values(prs).sort((a,b) => a.exerciseName.localeCompare(b.exerciseName));
  }, [workoutHistory]);


  const handleClearAllHistory = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
        setWorkoutHistory([]);
        toast({
          title: "Histórico Apagado!",
          description: "Todo o seu histórico de treinos foi removido.",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Failed to clear workout history from localStorage", error);
      toast({
        title: "Erro ao Apagar Histórico",
        description: "Não foi possível limpar o histórico. Tente novamente.",
        variant: 'destructive',
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
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageTitle
          title="Histórico de Treino"
          subtitle="Revise seus treinos passados e acompanhe sua jornada fitness ao longo do tempo."
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
        title="Histórico de Treino"
        subtitle="Revise seus treinos passados e acompanhe sua jornada fitness ao longo do tempo."
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
                  <AlertTriangle className="h-6 w-6 text-destructive" />{' '}
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
            <CardDescription className="text-lg text-muted-foreground mt-1">Looks like your fitness journal is waiting for its first entry!&quot;</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <Link
                href="/log"
              >
                <Activity className="mr-2 h-5 w-5" /> Log Your First Workout
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {monthlyWorkoutData.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Monthly Workout Consistency
                </CardTitle>
                <CardDescription>Number of workouts logged per month.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2 pr-6 pb-6 pt-2">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyWorkoutData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        allowDecimals={false}
                        className="fill-muted-foreground"
                      />
                      <ChartTooltip
                        cursorStyle={{ fill: 'hsl(var(--muted)/0.3)' }}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <RechartsLegend content={<ChartLegendContent />} />
                      <Bar dataKey="workouts" fill="var(--color-workouts)" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Personal Records Card Section */}
          {workoutHistory.length > 0 && ( // Only show PR card if there is history to analyze
            <Card className="shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Seus Recordes Pessoais (PRs)
                </CardTitle>
                <CardDescription>Seu melhor desempenho em cada exercício com peso registrado.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                   <p className="text-muted-foreground text-center py-4">Carregando recordes...</p>
                ) : personalRecordsData.length === 0 ? (
 <p className="text-muted-foreground text-center py-4">{' '}{`
 Nenhuma recorde pessoal encontrado ainda. Registre alguns treinos com peso para ver seus PRs!
 `}</p>
                ) : (
                    <ul className="space-y-3">
                    {personalRecordsData.map(pr => (
                        <li key={pr.exerciseId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-card-foreground/5 rounded-md">
                        <div className="flex items-center gap-2 mb-1 sm:mb-0">
                            <span className="text-xl">{pr.emoji}</span>
                            <span className="font-medium text-foreground">{pr.exerciseName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                            <span className="font-semibold text-primary">✨ {pr.maxWeight}kg x {pr.reps} reps</span>{' '}
                            <span className="ml-2 text-xs">({pr.formattedDate})</span>
                        </div>
                        </li>
                    ))}
                    </ul>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {workoutHistory.map(log => (
              <WorkoutHistoryCard key={log.id} log={log} onDeleteLog={handleDeleteSpecificLog} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
