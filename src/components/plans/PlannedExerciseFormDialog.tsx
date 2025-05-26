
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { PlannedExerciseFormValues } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const plannedExerciseSchema = z.object({
  sets: z.string().min(1, "Séries são obrigatórias."),
  reps: z.string().min(1, "Repetições são obrigatórias."),
  rest: z.string().optional(),
  notes: z.string().max(300, "As notas devem ter no máximo 300 caracteres.").optional(),
});

interface PlannedExerciseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: PlannedExerciseFormValues) => void;
  exerciseName: string; 
  initialValues?: PlannedExerciseFormValues;
}

export function PlannedExerciseFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  exerciseName,
  initialValues,
}: PlannedExerciseFormDialogProps) {
  const form = useForm<PlannedExerciseFormValues>({
    resolver: zodResolver(plannedExerciseSchema),
    defaultValues: initialValues || {
      sets: "",
      reps: "",
      rest: "",
      notes: "",
    },
  });

  const handleSubmit = (data: PlannedExerciseFormValues) => {
    onSubmit(data);
    form.reset(); 
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">
            {initialValues ? "Editar" : "Adicionar"} Detalhes para: {exerciseName}
          </DialogTitle>
          <DialogDescription>
            Especifique as séries, repetições, descanso e quaisquer notas para este exercício na sessão.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Séries</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 3 ou 3-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reps / Duração</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 10, 8-12, 30s" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="rest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descanso (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: 60s, 1-2min" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ex: Foco na forma, RPE 8, usar dropset na última série..."
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {initialValues ? "Salvar Alterações" : "Adicionar à Sessão"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
