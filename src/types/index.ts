
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
  | 'Glutes'
  | 'Hamstrings'
  | 'Hips'
  | 'Other' // Standard "Other" option
  | string; // Allows for custom string values

export type WorkoutType = 
  | 'Strength' 
  | 'Cardio' 
  | 'Flexibility' 
  | 'Hypertrophy' 
  | 'Powerlifting' 
  | 'Bodybuilding'
  | 'CrossFit'
  | 'Yoga'
  | 'Warm-up'
  | 'Cooldown'
  | 'Mobilidade'
  | 'Plyometrics'
  | 'Corrective'
  | 'Calisthenics'
  | 'HIIT'
  | 'Endurance'
  | 'Core'
  | 'Advanced'
  | 'Isometric' // Added for Plank nas Argolas
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  muscleGroup: MuscleGroup; // Can now be any string if custom
  secondaryMuscleGroups?: MuscleGroup[];
  workoutType: WorkoutType[];
  description: string;
  instructions?: string[];
  tips?: string[];
  isCustom?: boolean;
  imageUrl?: string; 
  dataAiHint?: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ElementType;
}

// --- Workout Plans ---
export interface PlannedExercise {
  id: string; 
  exerciseId: string; 
  name?: string; 
  emoji?: string; 
  sets?: string; 
  reps?: string; 
  rest?: string; 
  notes?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Custom Day' | 'Rest Day';


export interface WorkoutSession {
  id: string;
  name: string; 
  dayOfWeek?: DayOfWeek;
  exercises: PlannedExercise[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  sessions: WorkoutSession[];
  isArchived?: boolean; 
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
  weight: string; 
  reps: string;   
  isCompleted: boolean;
  notes?: string; 
}

export interface LoggedExerciseEntry {
  id: string; 
  exerciseId: string; 
  name: string; 
  emoji: string; 
  plannedSets?: string; 
  plannedReps?: string; 
  sets: LoggedSetData[]; 
  notes?: string; 
}

export interface ActiveWorkoutLog {
  id: string; 
  planId?: string; 
  planName?: string; 
  workoutName: string; 
  date: string; 
  startTime: number; 
  endTime?: number; 
  exercises: LoggedExerciseEntry[];
  notes?: string; 
}
