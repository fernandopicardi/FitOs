
export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Legs' 
  | 'Shoulders' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Abs' 
  | 'Full Body'
  | 'Cardio'
  | 'Other';

export type WorkoutType = 
  | 'Strength' 
  | 'Cardio' 
  | 'Flexibility' 
  | 'Hypertrophy' 
  | 'Powerlifting' 
  | 'Bodybuilding'
  | 'CrossFit'
  | 'Yoga'
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  muscleGroup: MuscleGroup;
  secondaryMuscleGroups?: MuscleGroup[];
  workoutType: WorkoutType[];
  description: string;
  instructions?: string[];
  tips?: string[];
  isCustom?: boolean;
  imageUrl?: string; // Optional image for the exercise
  dataAiHint?: string; // For placeholder image generation
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ElementType;
}

// --- Workout Plans ---
export interface PlannedExercise {
  id: string; // Unique ID for this specific instance of the exercise in the plan
  exerciseId: string; // Reference to Exercise.id
  name?: string; // Store name for easier display, populated when added
  emoji?: string; // Store emoji for easier display
  sets?: string; // e.g., 3 or "3-4" or "AMRAP"
  reps?: string; // e.g., 10 or "8-12" or "To Failure"
  rest?: string; // e.g., "60s" or "1-2min"
  notes?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Custom Day' | 'Rest Day';


export interface WorkoutSession {
  id: string;
  name: string; // e.g., "Day 1: Push", "Leg Day"
  dayOfWeek?: DayOfWeek;
  exercises: PlannedExercise[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  sessions: WorkoutSession[];
  isArchived?: boolean; // To hide from active plans without deleting
}

export interface PlannedExerciseFormValues {
  sets: string;
  reps: string;
  rest?: string;
  notes?: string;
}

// --- Workout Logging ---
export interface LoggedSetData {
  id: string;
  setNumber: number;
  reps?: number | string; // Actual reps performed
  weight?: number | string; // Weight used
  duration?: string; // For time-based sets like planks
  notes?: string;
  isCompleted: boolean;
}

export interface LoggedExerciseEntry {
  id: string; // Unique ID for this logged instance of an exercise
  exerciseId: string; // Reference to Exercise.id
  name: string; // From Exercise
  emoji: string; // From Exercise
  plannedSets?: string; // From WorkoutPlan if applicable
  plannedReps?: string; // From WorkoutPlan if applicable
  sets: LoggedSetData[]; // Actual performance data
  notes?: string; // Overall notes for this exercise during this log
}

export interface ActiveWorkoutLog {
  id: string; // Unique ID for this workout log
  planId?: string; // If started from a plan
  planName?: string; // If started from a plan
  workoutName: string; // e.g., "Leg Day Log" or "Ad-hoc Workout - Oct 26"
  date: string; // ISO string
  startTime: number; // Timestamp
  endTime?: number; // Timestamp
  exercises: LoggedExerciseEntry[];
  notes?: string; // Overall workout notes
}
