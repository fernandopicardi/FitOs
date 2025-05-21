
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
  sets: z.string().min(1, "Sets are required."),
  reps: z.string().min(1, "Reps are required."),
  rest: z.string().optional(),
  notes: z.string().max(300, "Notes must be 300 characters or less.").optional(),
});

interface PlannedExerciseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: PlannedExerciseFormValues) => void;
  exerciseName: string; // To display in the title
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
    form.reset(); // Reset form after submission for next use
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">
            {initialValues ? "Edit" : "Add"} Details for: {exerciseName}
          </DialogTitle>
          <DialogDescription>
            Specify the sets, reps, rest, and any notes for this exercise in the session.
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
                    <FormLabel>Sets</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3 or 3-4" {...field} />
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
                    <FormLabel>Reps / Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10, 8-12, 30s" {...field} />
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
                  <FormLabel>Rest (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 60s, 1-2min" {...field} />
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Focus on form, RPE 8, use dropset on last set..."
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
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {initialValues ? "Save Changes" : "Add to Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
