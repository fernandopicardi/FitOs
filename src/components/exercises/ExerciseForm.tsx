'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Exercise, MuscleGroup, WorkoutType } from "@/types";

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

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Full Body', 'Cardio', 'Other'];
const WORKOUT_TYPES: WorkoutType[] = ['Strength', 'Cardio', 'Flexibility', 'Hypertrophy', 'Powerlifting', 'Bodybuilding', 'CrossFit', 'Yoga', 'Other'];

const exerciseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  emoji: z.string().min(1).max(5, "Emoji should be a single character or short sequence."),
  muscleGroup: z.enum(MUSCLE_GROUPS as [MuscleGroup, ...MuscleGroup[]]), // Cast to satisfy zod's non-empty array requirement
  workoutType: z.array(z.enum(WORKOUT_TYPES as [WorkoutType, ...WorkoutType[]])).min(1, "Select at least one workout type."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  instructions: z.string().optional(),
  tips: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  exercise?: Exercise; // For editing existing exercises
  onSubmit: (data: ExerciseFormValues) => void;
  onCancel: () => void;
}

export function ExerciseForm({ exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: exercise ? {
      ...exercise,
      instructions: exercise.instructions?.join('\n'),
      tips: exercise.tips?.join('\n'),
    } : {
      name: "",
      emoji: "💪",
      muscleGroup: "Other",
      workoutType: [],
      description: "",
      instructions: "",
      tips: "",
      imageUrl: "",
    },
  });

  function handleSubmit(data: ExerciseFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Barbell Bench Press" {...field} />
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
              <FormLabel>Primary Muscle Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a muscle group" />
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

        <FormField
          control={form.control}
          name="workoutType"
          render={() => (
            <FormItem>
              <FormLabel>Workout Types</FormLabel>
              <FormDescription>Select applicable workout types.</FormDescription>
              <ScrollArea className="h-40 rounded-md border p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {WORKOUT_TYPES.map((type) => (
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
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the exercise..."
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
              <FormLabel>Instructions (Optional)</FormLabel>
              <FormDescription>Enter each step on a new line.</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="1. Step one...\n2. Step two..."
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
              <FormLabel>Tips (Optional)</FormLabel>
              <FormDescription>Enter each tip on a new line.</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="- Keep your core tight.\n- Breathe normally."
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
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormDescription>Paste a URL for an image of the exercise.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {exercise ? "Save Changes" : "Create Exercise"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
