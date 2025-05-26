
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { WorkoutSession, DayOfWeek } from "@/types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS_OF_WEEK: DayOfWeek[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Dia Customizado', 'Dia de Descanso'];

const sessionFormSchema = z.object({
  name: z.string().min(2, "O nome da sessão deve ter pelo menos 2 caracteres.").max(100),
  dayOfWeek: z.enum(DAYS_OF_WEEK as [DayOfWeek, ...DayOfWeek[]]).optional(),
  notes: z.string().max(500, "As notas devem ter no máximo 500 caracteres.").optional(),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
  session?: Omit<WorkoutSession, 'id' | 'exercises'>; 
  onSubmit: (data: SessionFormValues) => void;
  onCancel: () => void;
}

export function SessionForm({ session, onSubmit, onCancel }: SessionFormProps) {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: session ? {
      name: session.name,
      dayOfWeek: session.dayOfWeek || undefined,
      notes: session.notes || "",
    } : {
      name: "",
      notes: "",
    },
  });

  function handleSubmit(data: SessionFormValues) {
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
              <FormLabel>Nome da Sessão</FormLabel>
              <FormControl>
                <Input placeholder="ex: Dia de Empurrar, Aniquilação de Pernas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia da Semana (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dia (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Qualquer foco específico para esta sessão, lembretes, etc."
                  className="resize-y min-h-[80px]"
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
            {session ? "Salvar Sessão" : "Adicionar Sessão"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
