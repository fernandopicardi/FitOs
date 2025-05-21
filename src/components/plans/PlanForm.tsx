
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import type { WorkoutPlan } from "@/types";

const planFormSchema = z.object({
  name: z.string().min(2, "Plan name must be at least 2 characters.").max(100, "Plan name must be 100 characters or less."),
  description: z.string().max(500, "Description must be 500 characters or less.").optional(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  plan?: WorkoutPlan; // For editing existing plans in the future
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
    form.reset(); // Reset form after submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Awesome Bulk Plan, 3-Day Split" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief overview of this workout plan, its goals, or any specific notes."
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
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {plan ? "Save Changes" : "Create Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
