
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Exercise, MuscleGroup, WorkoutType } from "@/types";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

const MUSCLE_GROUPS: MuscleGroup[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Corpo Inteiro', 'Cardio', 'Glúteos', 'Isquiotibiais', 'Quadril', 'Outro'];
const PREDEFINED_WORKOUT_TYPES: WorkoutType[] = ['Força', 'Cardio', 'Flexibilidade', 'Hipertrofia', 'Powerlifting', 'Fisiculturismo', 'CrossFit', 'Yoga', 'Aquecimento', 'Desaquecimento', 'Mobilidade', 'Pliometria', 'Corretivo', 'Calistenia', 'HIIT', 'Resistência', 'Core', 'Avançado', 'Isométrico', 'Outro'];


const exerciseFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres.").max(100),
  emoji: z.string().min(1).max(5, "O emoji deve ser um único caractere ou sequência curta."),
  muscleGroup: z.enum(MUSCLE_GROUPS as [MuscleGroup, ...MuscleGroup[]]),
  customMuscleGroup: z.string().max(50, "O grupo muscular customizado deve ter no máximo 50 caracteres.").optional(),
  workoutType: z.array(z.string()).min(1, "Selecione pelo menos um tipo de treino."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres.").max(500),
  instructions: z.string().optional(),
  tips: z.string().optional(),
  imageUrl: z.string().url("Deve ser uma URL válida.").optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.muscleGroup === 'Outro') {
      return data.customMuscleGroup && data.customMuscleGroup.trim().length >= 2;
    }
    return true;
  },
  {
    message: "O nome do grupo muscular customizado deve ter pelo menos 2 caracteres.",
    path: ['customMuscleGroup'],
  }
);

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  exercise?: Exercise;
  onSubmit: (data: ExerciseFormValues) => void;
  onCancel: () => void;
}

export function ExerciseForm({ exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const getInitialMuscleGroup = (ex?: Exercise) => {
    if (!ex) return "Outro" as MuscleGroup;
    if (MUSCLE_GROUPS.includes(ex.muscleGroup as MuscleGroup)) {
      return ex.muscleGroup as MuscleGroup;
    }
    return "Outro" as MuscleGroup;
  };

  const getInitialCustomMuscleGroup = (ex?: Exercise) => {
    if (!ex) return "";
    if (MUSCLE_GROUPS.includes(ex.muscleGroup as MuscleGroup)) {
      return "";
    }
    return ex.muscleGroup;
  };

  const [displayableWorkoutTypes, setDisplayableWorkoutTypes] = useState<string[]>([...PREDEFINED_WORKOUT_TYPES]);
  const [newWorkoutTypeInput, setNewWorkoutTypeInput] = useState("");

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: exercise ? {
      ...exercise,
      muscleGroup: getInitialMuscleGroup(exercise),
      customMuscleGroup: getInitialCustomMuscleGroup(exercise),
      instructions: exercise.instructions?.join('\\n'),
      tips: exercise.tips?.join('\\n'),
      workoutType: exercise.workoutType || [],
    } : {
      name: "",
      emoji: "💪",
      muscleGroup: "Outro" as MuscleGroup,
      customMuscleGroup: "",
      workoutType: [],
      description: "",
      instructions: "",
      tips: "",
      imageUrl: "",
    },
  });

  const watchedMuscleGroup = form.watch("muscleGroup");

  useEffect(() => {
    if (watchedMuscleGroup !== 'Outro') {
      form.setValue('customMuscleGroup', '');
      if (form.formState.errors.customMuscleGroup) {
        form.clearErrors('customMuscleGroup');
      }
    }
  }, [watchedMuscleGroup, form]);

  useEffect(() => {
    if (exercise && exercise.workoutType) {
      const allTypes = new Set([...PREDEFINED_WORKOUT_TYPES, ...exercise.workoutType]);
      setDisplayableWorkoutTypes(Array.from(allTypes));
    }
  }, [exercise]);

  function handleSubmit(data: ExerciseFormValues) {
    const submissionData = { ...data };
    if (data.muscleGroup !== 'Outro') {
      submissionData.customMuscleGroup = '';
    }
    onSubmit(submissionData);
  }

  const handleAddCustomWorkoutType = () => {
    const newType = newWorkoutTypeInput.trim();
    if (newType && !displayableWorkoutTypes.includes(newType)) {
      setDisplayableWorkoutTypes(prev => [...prev, newType]);
    }
    if (newType) {
      const currentSelected = form.getValues("workoutType") || [];
      if (!currentSelected.includes(newType)) {
        form.setValue("workoutType", [...currentSelected, newType]);
      }
    }
    setNewWorkoutTypeInput("");
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Exercício</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Supino Reto com Barra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji</FormLabel>
                <FormControl>
                  <Input placeholder="🏋️" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="muscleGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo Muscular Principal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo muscular" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedMuscleGroup === 'Outro' && (
          <FormField
            control={form.control}
            name="customMuscleGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Grupo Muscular Customizado</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Antebraços, Panturrilhas" {...field} />
                </FormControl>
                <FormDescription>
                  Digite o nome para seu novo grupo muscular.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="workoutType"
          render={() => (
            <FormItem>
              <FormLabel>Tipos de Treino</FormLabel>
              <FormDescription>Selecione os tipos de treino aplicáveis ou adicione novos.</FormDescription>
              <ScrollArea className="h-40 rounded-md border p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayableWorkoutTypes.map((type) => (
                  <FormField
                    key={type}
                    control={form.control}
                    name="workoutType"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={type}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), type])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== type
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {type}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <Label htmlFor="newWorkoutTypeInput">Adicionar Novo Tipo de Treino</Label>
            <Input
              id="newWorkoutTypeInput"
              placeholder="ex: Levantamento Olímpico"
              value={newWorkoutTypeInput}
              onChange={(e) => setNewWorkoutTypeInput(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="button" variant="outline" onClick={handleAddCustomWorkoutType} className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tipo
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição detalhada do exercício..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruções (Opcional)</FormLabel>
              <FormDescription>Digite cada passo em uma nova linha.</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="1. Passo um...\\n2. Passo dois..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tips"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dicas (Opcional)</FormLabel>
              <FormDescription>Digite cada dica em uma nova linha.</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="- Mantenha o core firme.\\n- Respire normalmente."
                  className="resize-y min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/imagem.png" {...field} />
              </FormControl>
              <FormDescription>Cole uma URL para uma imagem do exercício.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {exercise ? "Salvar Alterações" : "Criar Exercício"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
