
'use client';

import type { Exercise, MuscleGroup, ApiNinjaExercise, ExerciseDifficulty, WorkoutType } from '@/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Zap } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from './ExerciseForm';
import type { ExerciseFormValues } from './ExerciseForm';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_EXERCISES_KEY = 'workoutWizardCustomExercises';

const transformApiExercise = (apiEx: ApiNinjaExercise): Exercise => {
  const id = `api-${apiEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
  
  let emoji = '💪'; 
  if (apiEx.muscle) {
    const muscleLower = apiEx.muscle.toLowerCase();
    if (['biceps', 'triceps', 'forearms'].includes(muscleLower)) emoji = '💪';
    else if (['quadriceps', 'hamstrings', 'glutes', 'calves', 'legs', 'adductors', 'abductors'].includes(muscleLower)) emoji = '🦵';
    else if (['chest'].includes(muscleLower)) emoji = '🏋️';
    else if (['lats', 'traps', 'middle_back', 'lower_back', 'back'].includes(muscleLower)) emoji = '🤸';
    else if (['abdominals', 'abs'].includes(muscleLower)) emoji = '🧍';
    else if (['shoulders', 'neck'].includes(muscleLower)) emoji = '⬆️';
    else if (apiEx.type?.toLowerCase().includes('cardio') || apiEx.type?.toLowerCase().includes('plyometrics')) emoji = '🏃';
    else if (apiEx.type?.toLowerCase().includes('stretching')) emoji = '🧘';
  }

  const instructionSteps = apiEx.instructions
    ?.split(/[.]\s*(?=[A-Z0-9])|\n/) 
    .map(step => step.trim().replace(/\.$/, '')) 
    .filter(step => step.length > 5);

  return {
    id,
    name: apiEx.name || 'Exercício Sem Nome',
    emoji,
    muscleGroup: apiEx.muscle as MuscleGroup || 'Outro',
    workoutType: apiEx.type ? [apiEx.type as WorkoutType] : ['Outro' as WorkoutType],
    description: instructionSteps && instructionSteps.length > 0 ? instructionSteps[0] : apiEx.instructions || 'Sem descrição disponível.',
    instructions: instructionSteps && instructionSteps.length > 1 ? instructionSteps : (apiEx.instructions ? [apiEx.instructions] : undefined),
    equipment: apiEx.equipment,
    difficulty: apiEx.difficulty as ExerciseDifficulty,
    isFetchedFromAPI: true,
    isCustom: false, 
    imageUrl: 'https://placehold.co/600x400.png', 
    dataAiHint: `${apiEx.muscle || 'exercicio'} ${apiEx.type || 'geral'}`,
  };
};


export function ExerciseListClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [apiFetchedExercises, setApiFetchedExercises] = useState<Exercise[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Todos');
  const { toast } = useToast();
  const [isLoadingApiExercises, setIsLoadingApiExercises] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedExercisesString = localStorage.getItem(LOCAL_STORAGE_EXERCISES_KEY);
        if (savedExercisesString) {
          const loadedExercises = JSON.parse(savedExercisesString) as Exercise[];
          setCustomExercises(loadedExercises.map(ex => ({...ex, isCustom: true, isFetchedFromAPI: false })));
        }
      } catch (error) {
        console.error("Falha ao carregar exercícios customizados do localStorage", error);
        toast({
          title: "Erro ao Carregar Exercícios Customizados",
          description: "Não foi possível recuperar seus exercícios salvos.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && customExercises.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_EXERCISES_KEY, JSON.stringify(customExercises));
      } catch (error) {
        console.error("Falha ao salvar exercícios customizados no localStorage", error);
        toast({
          title: "Erro ao Salvar Exercícios Customizados",
          description: "Seus exercícios customizados não puderam ser salvos automaticamente.",
          variant: "destructive",
        });
      }
    }
  }, [customExercises, toast]);

  const allDisplayableExercises = useMemo<Exercise[]>(() => {
    const uniqueExercisesMap = new Map<string, Exercise>();
    
    initialExercises.forEach(ex => uniqueExercisesMap.set(ex.id, {...ex, isCustom: false, isFetchedFromAPI: false}));
    customExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex)); 
    apiFetchedExercises.forEach(ex => {
      if (!uniqueExercisesMap.has(ex.id)) { 
        uniqueExercisesMap.set(ex.id, ex);
      }
    });
    
    return Array.from(uniqueExercisesMap.values()).sort((a,b) => a.name.localeCompare(b.name));
  }, [initialExercises, customExercises, apiFetchedExercises]);


  const handleOpenFormForCreate = () => {
    setExerciseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenFormForEdit = (exercise: Exercise) => {
    if (exercise.isFetchedFromAPI) {
      toast({
        title: "Exercício Somente Leitura",
        description: "Exercícios buscados da API externa não podem ser editados diretamente. Você pode criar uma versão customizada se necessário.",
        variant: "default",
        duration: 4000,
      });
      return;
    }
    setExerciseToEdit(exercise);
    setIsFormOpen(true);
  };

 const handleFormSubmit = (data: ExerciseFormValues) => {
    const actualMuscleGroup = data.muscleGroup === 'Outro' && data.customMuscleGroup && data.customMuscleGroup.trim() !== ''
      ? data.customMuscleGroup.trim() as MuscleGroup
      : data.muscleGroup;

    let finalWorkoutTypes = [...(data.workoutType || [])];
    finalWorkoutTypes = Array.from(new Set(finalWorkoutTypes.filter(wt => wt && wt.trim() !== ''))).map(wt => wt as WorkoutType);
    if (finalWorkoutTypes.length === 0) {
      finalWorkoutTypes.push('Outro' as WorkoutType);
    }

    const exerciseDataPayload = {
      ...data,
      muscleGroup: actualMuscleGroup,
      workoutType: finalWorkoutTypes,
      instructions: data.instructions?.split('\\n').filter(line => line.trim() !== ''),
      tips: data.tips?.split('\\n').filter(line => line.trim() !== ''),
      imageUrl: data.imageUrl || undefined,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { customMuscleGroup, ...finalExerciseData } = exerciseDataPayload;

    if (exerciseToEdit && !exerciseToEdit.isFetchedFromAPI) {
      const updatedExercise: Exercise = {
        ...exerciseToEdit, 
        ...finalExerciseData,
        isCustom: true, 
        isFetchedFromAPI: false, 
      };
      setCustomExercises(prev => {
        const existingIndex = prev.findIndex(ex => ex.id === updatedExercise.id);
        if (existingIndex > -1) {
          const newCustom = [...prev];
          newCustom[existingIndex] = updatedExercise;
          return newCustom;
        }
        return prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex);
      });
      if (!customExercises.find(ex => ex.id === updatedExercise.id) && !initialExercises.find(ex => ex.id === updatedExercise.id)) {
        setCustomExercises(prev => [...prev, updatedExercise]);
      }


      toast({
        title: "Exercício Atualizado!",
        description: `"${updatedExercise.name}" foi atualizado.`,
        duration: 3000,
      });

    } else { 
      const newExercise: Exercise = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...finalExerciseData,
        isCustom: true,
        isFetchedFromAPI: false,
      };
      setCustomExercises(prev => [newExercise, ...prev]);
      toast({
        title: "Exercício Customizado Adicionado!",
        description: `"${newExercise.name}" foi adicionado à sua biblioteca.`,
        duration: 3000,
      });
    }
    setIsFormOpen(false);
    setExerciseToEdit(null);
  };

  const handleViewDetails = (exercise: Exercise) => {
     toast({
      title: `${exercise.name} ${exercise.emoji}`,
      description: (
        <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
          <p><strong>Grupo Muscular:</strong> {exercise.muscleGroup}</p>
          {exercise.equipment && <p><strong>Equipamento:</strong> {exercise.equipment}</p>}
          {exercise.difficulty && <p><strong>Dificuldade:</strong> {exercise.difficulty}</p>}
          <p><strong>Tipo:</strong> {exercise.workoutType.join(', ')}</p>
          <p><strong>Descrição:</strong> {exercise.description}</p>
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <strong>Instruções:</strong>
              <ul className="list-disc pl-5">
                {exercise.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
              </ul>
            </div>
          )}
          {exercise.tips && exercise.tips.length > 0 && exercise.tips[0].length > 0 && (
            <div>
              <strong>Dicas:</strong>
              <ul className="list-disc pl-5">
                {exercise.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
          {exercise.isCustom && !exercise.isFetchedFromAPI && <p className="italic text-amber-400">Este é um exercício customizado.</p>}
          {exercise.isFetchedFromAPI && <p className="italic text-sky-400">Buscado da API na nuvem.</p>}
          {!exercise.isCustom && !exercise.isFetchedFromAPI && <p className="italic text-gray-400">Este é um exercício padrão.</p>}
        </div>
      ),
      duration: 7000, 
    });
  };

  const availableMuscleGroups = useMemo(() => {
    const groups = new Set<MuscleGroup>(allDisplayableExercises.map(ex => ex.muscleGroup as MuscleGroup));
    return ['Todos', ...Array.from(groups).sort((a,b) => (a||"").localeCompare(b||""))];
  }, [allDisplayableExercises]);

  const filteredExercises = allDisplayableExercises.filter(exercise => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = 
      exercise.name.toLowerCase().includes(searchTermLower) ||
      exercise.description.toLowerCase().includes(searchTermLower) ||
      (exercise.muscleGroup as string).toLowerCase().includes(searchTermLower) ||
      exercise.workoutType.some(wt => wt.toLowerCase().includes(searchTermLower)) ||
      (exercise.equipment && exercise.equipment.toLowerCase().includes(searchTermLower));

    const matchesMuscleGroup = selectedMuscleGroup === 'Todos' || exercise.muscleGroup === selectedMuscleGroup;
    return matchesSearchTerm && matchesMuscleGroup;
  });

  const handleFetchApiExercises = async () => {
    setIsLoadingApiExercises(true);
    let queryString = '';
    if (searchTerm) {
      queryString += `name=${encodeURIComponent(searchTerm)}`;
    }
    if (selectedMuscleGroup && selectedMuscleGroup !== 'Todos') {
      queryString += `${searchTerm ? '&' : ''}muscle=${encodeURIComponent(selectedMuscleGroup.toLowerCase())}`;
    }

    toast({ title: "Buscando exercícios na nuvem...", description: "Isso pode levar um momento.", duration: 2000 });
    try {
      const response = await fetch(`/api/exercises?${queryString}`);
      
      if (!response.ok) {
        let errorText = `Requisição à API falhou com status ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                errorText = errorData.error;
            } else {
                const htmlError = await response.text();
                const titleMatch = htmlError.match(/<title>(.*?)<\/title>/i);
                const h1Match = htmlError.match(/<h1>(.*?)<\/h1>/i);
                if (titleMatch && titleMatch[1]) {
                    errorText = `${response.status}: ${titleMatch[1]}`;
                } else if (h1Match && h1Match[1]) {
                    errorText = `${response.status}: ${h1Match[1]}`;
                } else {
                    errorText = `Requisição à API falhou com status ${response.status}. Resposta não era JSON válido.`;
                }
            }
        } catch (e) {
            // Falha ao analisar JSON ou texto, usar texto de erro original
        }
        throw new Error(errorText);
      }

      const fetchedApiExercisesData: ApiNinjaExercise[] = await response.json();
      
      if (fetchedApiExercisesData.length === 0) {
        toast({ title: "Nenhum Novo Exercício Encontrado", description: "Nenhum novo exercício correspondeu aos seus critérios na API da nuvem.", duration: 3000 });
      } else {
        const transformedNewExercises = fetchedApiExercisesData.map(transformApiExercise);
        setApiFetchedExercises(prevApiExercises => {
          const existingApiIds = new Set(prevApiExercises.map(ex => ex.id));
          const uniqueExercisesMap = new Map<string, Exercise>();
          initialExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex));
          customExercises.forEach(ex => uniqueExercisesMap.set(ex.id, ex));

          const trulyNewExercises = transformedNewExercises.filter(newEx => 
            !existingApiIds.has(newEx.id) && !uniqueExercisesMap.has(newEx.id) 
          );
          
          if (trulyNewExercises.length === 0 && transformedNewExercises.length > 0) {
             toast({ title: "Exercícios Já Carregados", description: "Os exercícios buscados já estão na sua biblioteca ou conflitam com IDs existentes.", duration: 3000 });
          } else if (trulyNewExercises.length > 0) {
             toast({ title: "Exercícios da Nuvem Carregados!", description: `${trulyNewExercises.length} novo(s) exercício(s) adicionado(s).`, duration: 3000 });
          }
          return [...prevApiExercises, ...trulyNewExercises];
        });
      }
    } catch (error) {
      console.error("Falha ao buscar exercícios da API:", error);
      toast({ title: "Erro na Busca da API", description: (error as Error).message || "Não foi possível carregar exercícios da nuvem.", variant: "destructive" });
    } finally {
      setIsLoadingApiExercises(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar exercícios por nome, músculo, equipamento..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por grupo muscular" />
          </SelectTrigger>
          <SelectContent>
            {availableMuscleGroups.map(group => (
              <SelectItem key={group || 'no-group'} value={group || 'no-group'}>{group || 'Sem Categoria'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
            onClick={handleOpenFormForCreate} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
        >
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Customizado
        </Button>
        <Button 
            onClick={handleFetchApiExercises} 
            variant="outline"
            className="w-full sm:w-auto text-primary border-primary hover:bg-primary/10"
            disabled={isLoadingApiExercises}
        >
            <Zap className="mr-2 h-5 w-5" /> 
            {isLoadingApiExercises ? "Buscando..." : "Buscar na Nuvem"}
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setExerciseToEdit(null); 
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl text-primary">
                {exerciseToEdit ? `Editar: ${exerciseToEdit.name}` : "Criar Exercício Customizado"}
            </DialogTitle>
            <DialogDescription>
                {exerciseToEdit ? "Modifique os detalhes deste exercício." : "Adicione seu próprio exercício à biblioteca. Preencha os detalhes abaixo."}
            </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4 max-h-[calc(90vh-100px)] overflow-y-auto">
            <ExerciseForm 
                exercise={exerciseToEdit || undefined} 
                onSubmit={handleFormSubmit} 
                onCancel={() => {
                    setIsFormOpen(false);
                    setExerciseToEdit(null);
                }} 
            />
            </div>
        </DialogContent>
      </Dialog>

      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
                key={exercise.id} 
                exercise={exercise} 
                onViewDetails={handleViewDetails}
                onEditExercise={exercise.isFetchedFromAPI ? undefined : handleOpenFormForEdit}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">Nenhum exercício encontrado para seus critérios.</p>
          <p className="text-foreground/70 mt-2">Tente ajustar sua busca ou filtro, ou adicione um novo exercício customizado!</p>
        </div>
      )}
    </div>
  );
}
