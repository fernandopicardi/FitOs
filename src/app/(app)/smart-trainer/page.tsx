
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { generateWorkoutPlan, type GenerateWorkoutPlanInput, type GenerateWorkoutPlanOutput } from '@/ai/flows/generate-workout-plan-flow';
import type { Exercise, WorkoutPlan, WorkoutSession, PlannedExercise, MuscleGroup, WorkoutType, AISimplifiedExercise } from '@/types';
import { PRELOADED_EXERCISES } from '@/constants/exercises';
import { Loader2, Wand2, Save } from 'lucide-react';
// O PlanCard não é usado aqui para exibir o plano gerado, a visualização é customizada abaixo.
// Importaremos se precisarmos dele para algo diferente.

const LOCAL_STORAGE_PLANS_KEY = 'workoutWizardPlans';
const LOCAL_STORAGE_CUSTOM_EXERCISES_KEY = 'workoutWizardCustomExercises';

const WORKOUT_CATEGORIES_OPTIONS: WorkoutType[] = ['Força', 'Hipertrofia', 'Resistência', 'HIIT', 'Mobilidade', 'Cardio', 'Calistenia', 'Powerlifting', 'Flexibilidade', 'Core', 'Aquecimento', 'Desaquecimento'];
const MUSCLE_GROUPS_OPTIONS: MuscleGroup[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Corpo Inteiro', 'Glúteos', 'Isquiotibiais', 'Panturrilhas', 'Antebraços', 'Oblíquos', 'Trapézio', 'Lombar'];
const EQUIPMENT_OPTIONS: string[] = ['Argolas', 'Kettlebell', 'Superbands', 'Rodinha Abdominal', 'Peso Corporal', 'Halteres', 'Barra', 'Elásticos', 'Outro'];

const formSchema = z.object({
  planName: z.string().min(3, 'O nome do plano deve ter pelo menos 3 caracteres.'),
  planDescription: z.string().optional(),
  categories: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria de treino.'),
  muscleGroups: z.array(z.string()).min(1, 'Selecione pelo menos um grupo muscular.'),
  availableEquipment: z.array(z.string()).min(1, 'Selecione pelo menos um equipamento disponível (Peso Corporal é uma opção).'),
  durationMinutes: z.coerce.number().min(15, 'Duração mínima de 15 minutos.').max(180, 'Duração máxima de 180 minutos.'),
});
type SmartTrainerFormValues = z.infer<typeof formSchema>;

export default function SmartTrainerPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  const form = useForm<SmartTrainerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: '',
      planDescription: '',
      categories: [],
      muscleGroups: [],
      availableEquipment: ['Peso Corporal'],
      durationMinutes: 30,
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customExercisesString = localStorage.getItem(LOCAL_STORAGE_CUSTOM_EXERCISES_KEY);
      const customExercisesLoaded = customExercisesString ? JSON.parse(customExercisesString) as Exercise[] : [];
      
      const preloadedWithFlag = PRELOADED_EXERCISES.map(ex => ({ ...ex, isCustom: false, isFetchedFromAPI: false }));
      const customWithFlag = customExercisesLoaded.map(ex => ({ ...ex, isCustom: true, isFetchedFromAPI: false }));
      
      const combinedExercises = [...preloadedWithFlag, ...customWithFlag];
      
      const uniqueExercisesMap = new Map<string, Exercise>();
      combinedExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex));
      setAllExercises(Array.from(uniqueExercisesMap.values()));
    }
  }, []);

  const onSubmit = async (data: SmartTrainerFormValues) => {
    if (allExercises.length === 0) {
      toast({
        title: "Nenhum Exercício Disponível",
        description: "A biblioteca de exercícios está vazia. Adicione exercícios ou recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedPlan(null);

    const simplifiedExercisesForAI: AISimplifiedExercise[] = allExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup as string, 
      workoutType: ex.workoutType as string[],
    }));

    const inputForAI: GenerateWorkoutPlanInput = {
      ...data,
      availableExercises: simplifiedExercisesForAI,
    };

    try {
      const aiOutput = await generateWorkoutPlan(inputForAI);

      const newPlan: WorkoutPlan = {
        id: `ai-plan-${Date.now()}`,
        name: aiOutput.name,
        description: aiOutput.description,
        isGeneratedByAI: true,
        sessions: aiOutput.sessions.map((session, sessionIndex) => ({
          id: `ai-session-${Date.now()}-${sessionIndex}`,
          name: session.name,
          notes: session.notes,
          exercises: session.exercises.map((plannedEx, exIndex) => {
            const masterExercise = allExercises.find(ex => ex.id === plannedEx.exerciseId);
            if (!masterExercise) {
                console.error(`Exercício com ID ${plannedEx.exerciseId} (nome IA: ${plannedEx.name}) não encontrado na lista local.`);
                 return {
                  id: `ai-plannedex-error-${Date.now()}-${exIndex}`,
                  exerciseId: plannedEx.exerciseId,
                  name: plannedEx.name || 'Exercício Desconhecido (Erro IA)',
                  emoji: plannedEx.emoji || '⚠️',
                  sets: plannedEx.sets,
                  reps: plannedEx.reps,
                  rest: plannedEx.rest,
                  notes: plannedEx.notes + (plannedEx.notes ? '; ' : '') + 'Erro: Detalhes do exercício original não encontrados.',
                };
            }
            return {
              id: `ai-plannedex-${Date.now()}-${sessionIndex}-${exIndex}`,
              exerciseId: plannedEx.exerciseId,
              name: masterExercise.name, 
              emoji: plannedEx.emoji || masterExercise.emoji,
              sets: plannedEx.sets,
              reps: plannedEx.reps,
              rest: plannedEx.rest,
              notes: plannedEx.notes,
            };
          }),
        })),
      };
      setGeneratedPlan(newPlan);
      toast({
        title: 'Plano de Treino Gerado por IA!',
        description: `Seu plano "${newPlan.name}" está pronto. Revise e salve se gostar.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao gerar plano de treino via IA:', error);
      toast({
        title: 'Erro na Geração do Plano',
        description: (error as Error).message || 'Não foi possível gerar o plano. Tente refinar suas preferências ou verifique os logs.',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneratedPlan = () => {
    if (!generatedPlan) return;
    try {
      if (typeof window !== 'undefined') {
        const existingPlansString = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
        const plans: WorkoutPlan[] = existingPlansString ? JSON.parse(existingPlansString) : [];
        // Adiciona o novo plano no início da lista para aparecer primeiro
        plans.unshift(generatedPlan); 
        localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
        toast({
          title: 'Plano Gerado Salvo!',
          description: `O plano "${generatedPlan.name}" foi adicionado à sua lista de planos. Você pode acessá-lo na página 'Planos'.`,
          duration: 3000,
        });
        setGeneratedPlan(null); // Limpa o plano gerado da tela após salvar
        form.reset(); // Reseta o formulário para uma nova geração
      }
    } catch (error) {
      console.error("Falha ao salvar plano gerado por IA no localStorage", error);
      toast({ title: "Falha ao Salvar Plano Gerado", description: "Não foi possível salvar o plano gerado por IA.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <PageTitle
        title="Assistente de Treino Inteligente FitOS"
        subtitle="Defina suas preferências e deixe nossa IA montar o treino perfeito para você!"
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Wand2 className="text-primary h-6 w-6" /> Personalize seu Treino</CardTitle>
          <CardDescription>Informe seus objetivos, equipamentos e tempo disponível para a IA.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="planName">Nome para o Plano Gerado</Label>
                <Input id="planName" {...form.register('planName')} className="mt-1" placeholder="Ex: Meu Treino de Força Rápido" />
                {form.formState.errors.planName && <p className="text-sm text-destructive mt-1">{form.formState.errors.planName.message}</p>}
              </div>
              <div>
                <Label htmlFor="durationMinutes">Duração do Treino (minutos)</Label>
                <Input id="durationMinutes" type="number" {...form.register('durationMinutes')} className="mt-1" placeholder="Ex: 30, 45, 60" />
                {form.formState.errors.durationMinutes && <p className="text-sm text-destructive mt-1">{form.formState.errors.durationMinutes.message}</p>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="planDescription">Descrição (Opcional)</Label>
              <Textarea id="planDescription" {...form.register('planDescription')} className="mt-1" placeholder="Ex: Foco em hipertrofia para parte superior, mantendo a intensidade." />
            </div>

            <div>
              <Label className="mb-2 block font-medium">Categorias de Treino (selecione uma ou mais)</Label>
              <ScrollArea className="h-32 rounded-md border bg-background/30 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WORKOUT_CATEGORIES_OPTIONS.map((category) => (
                    <Controller
                      key={category}
                      name="categories"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={field.value?.includes(category)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, category])
                                : field.onChange(field.value?.filter((value) => value !== category));
                            }}
                          />
                          <Label htmlFor={`category-${category}`} className="font-normal text-sm cursor-pointer">{category}</Label>
                        </div>
                      )}
                    />
                  ))}
                </div>
              </ScrollArea>
              {form.formState.errors.categories && <p className="text-sm text-destructive mt-1">{form.formState.errors.categories.message}</p>}
            </div>
            
            <div>
              <Label className="mb-2 block font-medium">Grupos Musculares Foco (selecione um ou mais)</Label>
               <ScrollArea className="h-32 rounded-md border bg-background/30 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MUSCLE_GROUPS_OPTIONS.map((group) => (
                     <Controller
                      key={group}
                      name="muscleGroups"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`muscle-${group}`}
                            checked={field.value?.includes(group)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, group])
                                : field.onChange(field.value?.filter((value) => value !== group));
                            }}
                          />
                          <Label htmlFor={`muscle-${group}`} className="font-normal text-sm cursor-pointer">{group}</Label>
                        </div>
                      )}
                    />
                  ))}
                </div>
              </ScrollArea>
              {form.formState.errors.muscleGroups && <p className="text-sm text-destructive mt-1">{form.formState.errors.muscleGroups.message}</p>}
            </div>

            <div>
              <Label className="mb-2 block font-medium">Equipamentos Disponíveis (selecione um ou mais)</Label>
              <ScrollArea className="h-32 rounded-md border bg-background/30 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <Controller
                      key={equipment}
                      name="availableEquipment"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`equipment-${equipment}`}
                            checked={field.value?.includes(equipment)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, equipment])
                                : field.onChange(field.value?.filter((value) => value !== equipment));
                            }}
                          />
                          <Label htmlFor={`equipment-${equipment}`} className="font-normal text-sm cursor-pointer">{equipment}</Label>
                        </div>
                      )}
                    />
                  ))}
                </div>
              </ScrollArea>
              {form.formState.errors.availableEquipment && <p className="text-sm text-destructive mt-1">{form.formState.errors.availableEquipment.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading || allExercises.length === 0} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando seu treino...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Gerar Treino Inteligente
                </>
              )}
            </Button>
             {allExercises.length === 0 && !isLoading && (
                <p className="text-sm text-amber-500 mt-2 text-center">Carregando biblioteca de exercícios... Por favor, aguarde antes de gerar.</p>
            )}
          </form>
        </CardContent>
      </Card>

      {generatedPlan && (
        <Card className="mt-8 shadow-lg border-primary animate-subtle-pulse-border-primary">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-xl text-primary">✨ Seu Plano Gerado por IA! ✨</CardTitle>
                <CardDescription>Revise o plano abaixo. Se gostar, salve-o para usar depois!</CardDescription>
              </div>
              <Button onClick={handleSaveGeneratedPlan} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4"/>
                Salvar este Plano
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Visualização Detalhada Customizada */}
            <div className="space-y-4 mt-2">
              <h3 className="text-2xl font-semibold text-accent">{generatedPlan.name}</h3>
              {generatedPlan.description && <p className="text-sm text-muted-foreground italic mb-3">{generatedPlan.description}</p>}
              {generatedPlan.sessions.map((session, sIdx) => (
                <div key={session.id} className="p-4 border bg-card-foreground/5 rounded-lg shadow">
                  <h4 className="text-lg font-semibold text-primary mb-1">Sessão {sIdx + 1}: {session.name}</h4>
                  {session.notes && <p className="text-xs text-muted-foreground mb-2"><em>{session.notes}</em></p>}
                  <ul className="space-y-2">
                    {session.exercises.map(ex => (
                      <li key={ex.id} className="text-sm p-2 border-b border-border/50 last:border-b-0">
                        <div className="flex items-center gap-2">
                           <span className="text-xl">{ex.emoji}</span>
                           <span className="font-medium text-foreground">{ex.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-7">
                            <span>Séries: {ex.sets}</span> | <span>Reps: {ex.reps}</span>
                            {ex.rest && <span> | Descanso: {ex.rest}</span>}
                        </div>
                        {ex.notes && <p className="text-xs italic text-muted-foreground/80 ml-7 mt-0.5">- {ex.notes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
