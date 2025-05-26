
'use client';

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanForm, type PlanFormValues } from '@/components/plans/PlanForm';
import { PlanCard } from '@/components/plans/PlanCard';
import { PlanEditor } from '@/components/plans/PlanEditor';
import type { WorkoutPlan, Exercise, WorkoutSession, PlannedExercise } from '@/types';
import { PRELOADED_EXERCISES } from '@/constants/exercises';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_PLANS_KEY = 'workoutWizardPlans';

const getExerciseByName = (name: string): Exercise | undefined => {
  const found = PRELOADED_EXERCISES.find(ex => ex.name.toLowerCase() === name.toLowerCase());
  return found;
};

const createPlannedExercise = (
  ex: Exercise | undefined, 
  sets: string, 
  reps: string, 
  notes: string, 
  rest?:string 
): PlannedExercise | null => {
  if (!ex) return null;
  return {
    id: `plannedex-${Date.now()}-${ex.id}-${Math.random().toString(36).substring(2,7)}`,
    exerciseId: ex.id,
    name: ex.name, 
    emoji: ex.emoji, 
    sets,
    reps,
    notes, 
    rest,
  };
};

const seededPlanDefinitions: Array<{id: string, name: string, description: string, session: Omit<WorkoutSession, 'id' | 'exercises'> & { exercises: Array<{exerciseName: string, sets: string, reps: string, notes: string, rest?:string }>}}> = [
  {
    id: 'seed-plan-monday-v1',
    name: "Segunda: Upper Push + Cardio",
    description: "Foco: Peito, Ombros, Tríceps. Cardio opcional.",
    session: {
      name: "Upper Push + Cardio",
      dayOfWeek: 'Monday',
      notes: "Treino principal de empurrar para parte superior do corpo, com aquecimento e cardio opcional.",
      exercises: [
        { exerciseName: "Rotação de Ombros com Superband", sets: "2", reps: "20s", notes: "Isso não é só aquecimento... é ativar o modo *tanquinho*." },
        { exerciseName: "Flexão Inclinada", sets: "1", reps: "10", notes: "Aquecimento para peito." },
        { exerciseName: "Flexão nas Argolas", sets: "4", reps: "12", notes: "Se tremer, é só o músculo fazendo live!" },
        { exerciseName: "Kettlebell Press", sets: "4", reps: "8/cada", notes: "Hoje você é um guindaste humano!" },
        { exerciseName: "Liberação de Peitoral (Rodinha)", sets: "2", reps: "1min", notes: "Parece tortura, mas seu futuro eu agradece." },
        { exerciseName: "Pular Corda", sets: "1", reps: "10min", notes: "Cardio opcional para finalizar." },
      ]
    }
  },
  {
    id: 'seed-plan-tuesday-v1',
    name: "Terça: Lower Body + Core",
    description: "Foco: Pernas, Glúteos, Abdômen. Dia da Rodinha!",
    session: {
      name: "Lower Body + Core",
      dayOfWeek: 'Tuesday',
      notes: "Foco em pernas, glúteos e abdômen, com destaque para o rollout com rodinha.",
      exercises: [
        { exerciseName: "Agachamento Livre", sets: "2", reps: "15", notes: "Aquecimento para pernas." },
        { exerciseName: "Mobilidade de Quadril (Rodinha)", sets: "1", reps: "1min", notes: "Aquecimento e mobilidade para o quadril." },
        { exerciseName: "Agachamento Goblet (KB)", sets: "4", reps: "15", notes: "Glúteos de aço em construção!" },
        { exerciseName: "Rollout com Rodinha (Ajoelhado)", sets: "4", reps: "8", notes: "Abdominais hoje = tanquinho no verão!" },
        { exerciseName: "Ponte Glútea (1 perna)", sets: "3", reps: "12/cada", notes: "Glúteos de aço em 3... 2... 1..." },
        { exerciseName: "Alongamento de Isquiotibiais (Sentado)", sets: "2", reps: "30s/cada", notes: "Alongar é como resetar o músculo." },
      ]
    }
  },
  {
    id: 'seed-plan-wednesday-v1',
    name: "Quarta: HIIT + Mobilidade",
    description: "Foco: Condicionamento e mobilidade.",
    session: {
      name: "HIIT + Mobilidade",
      dayOfWeek: 'Wednesday',
      notes: "Treino intervalado de alta intensidade seguido de mobilidade. Circuito: 4 rounds. Mobilidade: 10 min total.",
      exercises: [
        { exerciseName: "Burpees", sets: "4 rounds", reps: "30s", notes: "Odeie agora, ame os resultados depois.", rest: "30s" },
        { exerciseName: "Saltos com Superband", sets: "4 rounds", reps: "30s", notes: "Explosão total!", rest: "30s" },
        { exerciseName: "Liberação de Peitoral (Rodinha)", sets: "1", reps: "5min", notes: "Parte da mobilidade de 10 min." },
        { exerciseName: "Alongamento de Isquiotibiais (Sentado)", sets: "1", reps: "5min", notes: "Parte da mobilidade de 10 min." },
      ]
    }
  },
  {
    id: 'seed-plan-thursday-v1',
    name: "Quinta: Upper Pull + Core",
    description: "Foco: Costas, Bíceps, Core.",
    session: {
      name: "Upper Pull + Core",
      dayOfWeek: 'Thursday',
      notes: "Foco em puxadas para a parte superior do corpo e fortalecimento do core.",
      exercises: [
        { exerciseName: "Remada invertida com Superband", sets: "2", reps: "15", notes: "Aquecimento para costas." },
        { exerciseName: "Alongamento Gato-Vaca", sets: "1", reps: "1min", notes: "Aquecimento e mobilidade para coluna." },
        { exerciseName: "Pull-Up nas Argolas", sets: "4", reps: "8", notes: "Cada repetição te deixa mais largo!" },
        { exerciseName: "Remada Curvada (KB)", sets: "4", reps: "12/cada", notes: "Costas largas = postura de vencedor." },
        { exerciseName: "Rollout em Pé (Avançado)", sets: "3", reps: "5", notes: "Só para quem já domina o rollout ajoelhado. *Você foi avisado.*" },
      ]
    }
  },
  {
    id: 'seed-plan-friday-v1',
    name: "Sexta: Full Body",
    description: "Foco: Resistência muscular geral. Treino em circuito.",
    session: {
      name: "Full Body Circuit",
      dayOfWeek: 'Friday',
      notes: "Treino de corpo inteiro em formato de circuito. 3 rounds, com descanso entre exercícios conforme necessário (ex: 30s).",
      exercises: [
        { exerciseName: "Agachamento com Salto", sets: "3 rounds", reps: "15", notes: "Pernas explosivas = fuga rápida de zumbis." },
        { exerciseName: "Flexão Diamante", sets: "3 rounds", reps: "12", notes: "Tríceps de diamante!" },
        { exerciseName: "Prancha com Rotação", sets: "3 rounds", reps: "40s", notes: "Core forte e estável." },
      ]
    }
  },
  {
    id: 'seed-plan-saturday-v1',
    name: "Sábado: Recuperação Ativa",
    description: "Foco: Mobilidade e Core leve.",
    session: {
      name: "Recuperação Ativa",
      dayOfWeek: 'Saturday',
      notes: "Sessão leve para auxiliar na recuperação, focar na mobilidade e manter o core ativo.",
      exercises: [
        { exerciseName: "Rollout com Rodinha (Ajoelhado)", sets: "3", reps: "8", notes: "Foco na forma e controle." }, 
        { exerciseName: "Ponte Glútea (1 perna)", sets: "3", reps: "15/cada", notes: "Foco na ativação do glúteo e estabilidade." }, 
        { exerciseName: "Alongamento Dinâmico", sets: "1", reps: "10min", notes: "Movimentos fluidos para todo o corpo." },
      ]
    }
  }
];


export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [selectedPlanForEditing, setSelectedPlanForEditing] = useState<WorkoutPlan | null>(null);
  const { toast } = useToast();
  
  const allExercises: Exercise[] = PRELOADED_EXERCISES; 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPlansString = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
        const loadedPlans: WorkoutPlan[] = savedPlansString ? JSON.parse(savedPlansString) : [];
        let plansWereSeeded = false;
        let newPlansCount = 0;

        for (const planDef of seededPlanDefinitions) {
          if (!loadedPlans.some(p => p.id === planDef.id)) {
            const exercisesForSession: PlannedExercise[] = planDef.session.exercises.map(exDef => 
              createPlannedExercise(
                getExerciseByName(exDef.exerciseName),
                exDef.sets,
                exDef.reps,
                exDef.notes,
                exDef.rest
              )
            ).filter(ex => ex !== null) as PlannedExercise[];

            if (exercisesForSession.length !== planDef.session.exercises.length) {
              console.warn(`Some exercises for plan ${planDef.name} could not be found and were skipped.`);
            }

            const newPlan: WorkoutPlan = {
              id: planDef.id,
              name: planDef.name,
              description: planDef.description,
              sessions: [{
                id: `session-${planDef.id}-${Date.now()}`,
                name: planDef.session.name,
                dayOfWeek: planDef.session.dayOfWeek,
                notes: planDef.session.notes,
                exercises: exercisesForSession,
              }],
            };
            loadedPlans.unshift(newPlan); 
            plansWereSeeded = true;
            newPlansCount++;
          }
        }
        
        if (plansWereSeeded) {
           toast({
            title: "Planos de Treino Padrão Adicionados!",
            description: `${newPlansCount} plano(s) de treino diário(s) foram adicionados à sua lista.`,
            duration: 3000,
          });
        }
        setPlans(loadedPlans);

      } catch (error) {
        console.error("Failed to load or seed plans from localStorage", error);
        toast({
          title: "Error Loading Plans",
          description: "Could not retrieve or seed your plans. Previous data might be affected.",
          variant: "destructive",
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (plans.length > 0 || localStorage.getItem(LOCAL_STORAGE_PLANS_KEY)) {
         try {
          localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
        } catch (error) {
          console.error("Failed to save plans to localStorage", error);
          toast({
            title: "Error Saving Plans",
            description: "Your plans could not be saved automatically. Changes might be lost.",
            variant: "destructive",
          });
        }
      }
    }
  }, [plans, toast]);


  const handleAddPlan = (data: PlanFormValues) => {
    const newPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      name: data.name,
      description: data.description,
      sessions: [], 
    };
    setPlans(prev => [newPlan, ...prev]);
    setIsPlanFormOpen(false);
    toast({ title: "Plan Created!", description: `"${data.name}" has been added.`, duration: 3000 });
  };

  const handleManagePlan = (plan: WorkoutPlan) => {
    setSelectedPlanForEditing(plan);
  };

  const handleClosePlanEditor = () => {
    setSelectedPlanForEditing(null);
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    setPlans(prevPlans => 
      prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
    toast({ title: "Plan Updated!", description: `Changes to "${updatedPlan.name}" have been saved.`, duration: 3000});
  };

  const handleDeletePlan = (planId: string) => {
    const planToDelete = plans.find(p => p.id === planId);
    setPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
    if (selectedPlanForEditing?.id === planId) {
      setSelectedPlanForEditing(null);
    }
    if (planToDelete) {
      toast({ title: "Plan Deleted", description: `"${planToDelete.name}" has been removed.`, variant: "destructive" });
    }
  };

  if (selectedPlanForEditing) {
    return (
      <PlanEditor 
        initialPlan={selectedPlanForEditing}
        allExercises={allExercises}
        onUpdatePlan={handleUpdatePlan}
        onClose={handleClosePlanEditor}
        onDeletePlan={handleDeletePlan}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Workout Plans"
        subtitle="Design your weekly workout routines and stay organized."
      >
        <Dialog open={isPlanFormOpen} onOpenChange={setIsPlanFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">Create New Workout Plan</DialogTitle>
              <DialogDescription>
                Give your plan a name and an optional description to get started. You can add sessions and exercises later.
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              onSubmit={handleAddPlan}
              onCancel={() => setIsPlanFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageTitle>

      {plans.length === 0 ? (
        <Card className="shadow-lg text-center border-dashed border-muted-foreground/50 py-12">
          <CardHeader className="p-0">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <LayoutGrid className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Workout Plans Yet</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">
              It looks a bit empty here. Let&apos;s fix that!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Click the &quot;Create New Plan&quot; button to design your fitness roadmap, organize your workouts, and start achieving your goals.
            </p>
            <Button onClick={() => setIsPlanFormOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map(plan => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onManagePlan={handleManagePlan}
              onDeletePlan={handleDeletePlan} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

    
