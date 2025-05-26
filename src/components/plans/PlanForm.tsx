
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
import type { WorkoutPlan } from "@/types";

const planFormSchema = z.object({
  name: z.string().min(2, "O nome do plano deve ter pelo menos 2 caracteres.").max(100, "O nome do plano deve ter no máximo 100 caracteres."),
  description: z.string().max(500, "A descrição deve ter no máximo 500 caracteres.").optional(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  plan?: WorkoutPlan; 
  onSubmit: (data: PlanFormValues) => void;
  onCancel: () => void;
}

export function PlanForm({ plan, onSubmit, onCancel }: PlanFormProps) {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: plan ? {
      name: plan.name,
      description: plan.description || "",
    } : {
      name: "",
      description: "",
    },
  });

  function handleSubmit(data: PlanFormValues) {
    onSubmit(data);
    form.reset(); 
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Plano</FormLabel>
              <FormControl>
                <Input placeholder="ex: Meu Plano de Bulk Incrível, Divisão de 3 Dias" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Uma breve visão geral deste plano de treino, seus objetivos ou quaisquer notas específicas."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {plan ? "Salvar Alterações" : "Criar Plano"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
