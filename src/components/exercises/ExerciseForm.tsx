
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
import { Label } from "@/components/ui/label"; // Added import

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Full Body', 'Cardio', 'Glutes', 'Hamstrings', 'Hips', 'Other'];
const PREDEFINED_WORKOUT_TYPES: WorkoutType[] = ['Strength', 'Cardio', 'Flexibility', 'Hypertrophy', 'Powerlifting', 'Bodybuilding', 'CrossFit', 'Yoga', 'Warm-up', 'Cooldown', 'Mobilidade', 'Plyometrics', 'Corrective', 'Calisthenics', 'HIIT', 'Endurance', 'Core', 'Advanced', 'Isometric', 'Other'];


const exerciseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  emoji: z.string().min(1).max(5, "Emoji should be a single character or short sequence."),
  muscleGroup: z.enum(MUSCLE_GROUPS as [MuscleGroup, ...MuscleGroup[]]),
  customMuscleGroup: z.string().max(50, "Custom muscle group must be 50 characters or less.").optional(),
  workoutType: z.array(z.string()).min(1, "Select at least one workout type."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  instructions: z.string().optional(),
  tips: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.muscleGroup === 'Other') {
      return data.customMuscleGroup && data.customMuscleGroup.trim().length >= 2;
    }
    return true;
  },
  {
    message: "Custom muscle group name must be at least 2 characters.",
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
    if (!ex) return "Other" as MuscleGroup;
    if (MUSCLE_GROUPS.includes(ex.muscleGroup as MuscleGroup)) {
      return ex.muscleGroup as MuscleGroup;
    }
    return "Other" as MuscleGroup;
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
      muscleGroup: "Other" as MuscleGroup,
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
    if (watchedMuscleGroup !== 'Other') {
      form.setValue('customMuscleGroup', '');
      if (form.formState.errors.customMuscleGroup) {
        form.clearErrors('customMuscleGroup');
      }
    }
  }, [watchedMuscleGroup, form]);

  useEffect(() => {
    // Initialize displayableWorkoutTypes with predefined types + any custom types from the exercise being edited
    if (exercise && exercise.workoutType) {
      const allTypes = new Set([...PREDEFINED_WORKOUT_TYPES, ...exercise.workoutType]);
      setDisplayableWorkoutTypes(Array.from(allTypes));
    }
  }, [exercise]);

  function handleSubmit(data: ExerciseFormValues) {
    const submissionData = { ...data };
    if (data.muscleGroup !== 'Other') {
      submissionData.customMuscleGroup = '';
    }
    // The actual workout types are already in data.workoutType from the checkboxes
    onSubmit(submissionData);
  }

  const handleAddCustomWorkoutType = () => {
    const newType = newWorkoutTypeInput.trim();
    if (newType && !displayableWorkoutTypes.includes(newType)) {
      setDisplayableWorkoutTypes(prev => [...prev, newType]);
    }
    if (newType) {
      // Also add to selected workout types if not already there
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

        {watchedMuscleGroup === 'Other' && (
          <FormField
            control={form.control}
            name="customMuscleGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Muscle Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Forearms, Calves" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the name for your new muscle group.
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
              <FormLabel>Workout Types</FormLabel>
              <FormDescription>Select applicable workout types or add new ones.</FormDescription>
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
            <Label htmlFor="newWorkoutTypeInput">Add New Workout Type</Label>
            <Input
              id="newWorkoutTypeInput"
              placeholder="e.g., Olympic Lifting"
              value={newWorkoutTypeInput}
              onChange={(e) => setNewWorkoutTypeInput(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="button" variant="outline" onClick={handleAddCustomWorkoutType} className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Type
          </Button>
        </div>
        
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
                  placeholder="1. Step one...\\n2. Step two..."
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
                  placeholder="- Keep your core tight.\\n- Breathe normally."
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
