
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
  // From API Ninjas (alguns são mais específicos, podem ser mapeados ou adicionados)
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'calves'
  | 'forearms'
  | 'lats'
  | 'lower_back'
  | 'middle_back'
  | 'neck'
  | 'quadriceps'
  | 'traps'
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
  // From API Ninjas
  | 'olympic_weightlifting'
  | 'stretching'
  | 'strongman'
  | 'Other'
  | string; // Allows for custom string values

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'expert' | string;

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
  imageUrl?: string; 
  dataAiHint?: string;
  // Fields from API Ninjas
  equipment?: string;
  difficulty?: ExerciseDifficulty;
  isFetchedFromAPI?: boolean; // Flag to identify API exercises
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
  rpe?: string; // Rate of Perceived Exertion
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

// Type for raw exercise data from API Ninjas
export interface ApiNinjaExercise {
  name: string;
  type: string; // e.g., "strength"
  muscle: string; // e.g., "biceps"
  equipment: string; // e.g., "dumbbell"
  difficulty: string; // e.g., "beginner"
  instructions: string;
}
