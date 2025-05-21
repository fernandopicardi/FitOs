
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
const SEEDED_PLAN_ID = 'hybrid-weekly-plan-seed-v1';

const createSeededPlan = (): WorkoutPlan => {
  const getExerciseByName = (name: string) => PRELOADED_EXERCISES.find(ex => ex.name.toLowerCase() === name.toLowerCase());
  
  const rotaçãoOmbros = getExerciseByName("Rotação de Ombros com Superband");
  const flexaoArgolas = getExerciseByName("Flexão nas Argolas");
  const kbCleanPress = getExerciseByName("Kettlebell Clean & Press");
  const liberacaoPeitoral = getExerciseByName("Liberação de Peitoral (Rodinha)");
  const agachamentoGoblet = getExerciseByName("Agachamento Goblet (KB)");
  const rolloutAjoelhado = getExerciseByName("Rollout com Rodinha (Ajoelhado)");
  const ponteGlutea1Perna = getExerciseByName("Ponte Glútea (1 perna)");
  const alongamentoIsquios = getExerciseByName("Alongamento de Isquiotibiais (Sentado)");
  const burpees = getExerciseByName("Burpees");
  const mobilidadeQuadrilRodinha = getExerciseByName("Mobilidade de Quadril (Rodinha)");
  const pullUpArgolas = getExerciseByName("Pull-Up nas Argolas");
  const remadaKb = getExerciseByName("Remada Curvada (KB)");
  const rolloutPe = getExerciseByName("Rollout em Pé (Avançado)");
  const agachamentoSalto = getExerciseByName("Agachamento com Salto");
  const pranchaArgolas = getExerciseByName("Prancha nas Argolas");
  const russianTwistKb = getExerciseByName("Russian Twist (KB)");

  const createPlannedExercise = (ex: Exercise | undefined, sets: string, reps: string, notes: string, rest?: string): PlannedExercise | null => {
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

  const mondayExercises: PlannedExercise[] = [
    createPlannedExercise(rotaçãoOmbros, "2", "20s", "Isso não é só aquecimento... é ativar o modo *tanquinho*."),
    createPlannedExercise(flexaoArgolas, "4", "12", "Se balançar, finja que é de propósito (mas não é)."),
    createPlannedExercise(kbCleanPress, "4", "8/cada lado", "Parece que você está arremessando um alienígena para o espaço."),
    createPlannedExercise(liberacaoPeitoral, "2", "1min", "Parece tortura, mas seu futuro eu agradece."),
  ].filter(Boolean) as PlannedExercise[];

  const tuesdayExercises: PlannedExercise[] = [
    createPlannedExercise(agachamentoGoblet, "4", "15", "Seu glúteo vai reclamar, mas é só drama."),
    createPlannedExercise(rolloutAjoelhado, "4", "8", "Parece fácil até você tentar... boa sorte!"),
    createPlannedExercise(ponteGlutea1Perna, "3", "12/cada", "Glúteos de aço em 3... 2... 1..."),
    createPlannedExercise(alongamentoIsquios, "2", "30s/cada", "Alongar é como resetar o músculo."),
  ].filter(Boolean) as PlannedExercise[];
  
  const wednesdayExercises: PlannedExercise[] = [
    createPlannedExercise(burpees, "8", "30s", "Odeie agora, ame os resultados depois.", "20s"),
    createPlannedExercise(mobilidadeQuadrilRodinha, "2", "1min", "Parece massagem, mas você é o massagista."),
  ].filter(Boolean) as PlannedExercise[];

  const thursdayExercises: PlannedExercise[] = [
    createPlannedExercise(pullUpArgolas, "4", "8", "Se não conseguir, grite 'EU CONSIGO' e tente de novo."),
    createPlannedExercise(remadaKb, "4", "12/cada lado", "Costas largas em 3 meses? Sim, por favor."),
    createPlannedExercise(rolloutPe, "3", "5", "Só para quem já domina o rollout ajoelhado. *Você foi avisado.*"),
  ].filter(Boolean) as PlannedExercise[];
  
  const fridayExercises: PlannedExercise[] = [
    createPlannedExercise(burpees, "3", "12", "Exercício parte do circuito."), // Note: Burpee com Salto, using Burpees ID
    createPlannedExercise(agachamentoGoblet, "3", "15", "Exercício parte do circuito."), // Note: Agachamento com KB
    createPlannedExercise(rolloutAjoelhado, "3", "10", "Exercício parte do circuito."),
    createPlannedExercise(pranchaArgolas, "3", "40s", "Exercício parte do circuito."),
    createPlannedExercise(russianTwistKb, "3", "20/cada lado", "Exercício parte do circuito."),
  ].filter(Boolean) as PlannedExercise[];

  return {
    id: SEEDED_PLAN_ID,
    name: "Treino Híbrido Semanal Completo",
    description: "Um plano de treino híbrido de 5 dias focado em força e condicionamento, utilizando argolas, kettlebell, superbands e rodinha abdominal.",
    sessions: [
      { id: `session-mon-${Date.now()}`, name: "Segunda-feira: Upper Body Push", dayOfWeek: 'Monday', exercises: mondayExercises, notes: "Foco: Peito, Ombros, Tríceps." },
      { id: `session-tue-${Date.now()}`, name: "Terça-feira: Lower Body + Core", dayOfWeek: 'Tuesday', exercises: tuesdayExercises, notes: "Foco: Pernas, Glúteos, Abdômen. Dia da Rodinha!" },
      { id: `session-wed-${Date.now()}`, name: "Quarta-feira: HIIT + Mobilidade", dayOfWeek: 'Wednesday', exercises: wednesdayExercises, notes: "Cardio Intenso e Mobilidade." },
      { id: `session-thu-${Date.now()}`, name: "Quinta-feira: Upper Body Pull + Core", dayOfWeek: 'Thursday', exercises: thursdayExercises, notes: "Foco: Costas, Bíceps, Posterior de Ombros." },
      { id: `session-fri-${Date.now()}`, name: "Sexta-feira: Full Body + Core (Circuito)", dayOfWeek: 'Friday', exercises: fridayExercises, notes: "Realize como um circuito por 3 rounds, com 30s de descanso entre exercícios. Dica final: Terminou? Parabéns! Agora vá comer um frango com batata doce e durma como um bebê... que levanta peso." },
    ],
  };
};


export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [selectedPlanForEditing, setSelectedPlanForEditing] = useState<WorkoutPlan | null>(null);
  const { toast } = useToast();
  
  const allExercises: Exercise[] = PRELOADED_EXERCISES; 

  // Load plans from localStorage on mount and seed if necessary
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPlansString = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
        let loadedPlans: WorkoutPlan[] = savedPlansString ? JSON.parse(savedPlansString) : [];
        
        const seededPlanExists = loadedPlans.some(plan => plan.id === SEEDED_PLAN_ID);
        if (!seededPlanExists) {
          const seededPlan = createSeededPlan();
          loadedPlans = [seededPlan, ...loadedPlans]; // Add seeded plan to the beginning
           toast({
            title: "Plano de Treino Padrão Adicionado!",
            description: `"${seededPlan.name}" foi adicionado à sua lista de planos.`,
          });
        }
        setPlans(loadedPlans);

      } catch (error) {
        console.error("Failed to load plans from localStorage", error);
        toast({
          title: "Error Loading Plans",
          description: "Could not retrieve your saved plans. Previous data might be lost.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Save plans to localStorage whenever the plans state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only save if plans array has been initialized (not initial empty array before loading)
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
    toast({ title: "Plan Created!", description: `"${data.name}" has been added.` });
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
    toast({ title: "Plan Updated!", description: `Changes to "${updatedPlan.name}" have been saved.`});
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
