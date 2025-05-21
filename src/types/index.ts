
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
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ElementType;
}

// New types for Workout Plans
export interface PlannedExercise {
  exerciseId: string; // Reference to Exercise.id
  sets?: number | string; // e.g., 3 or "3-4"
  reps?: number | string; // e.g., 10 or "8-12"
  rest?: string; // e.g., "60s" or "1-2min"
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string; // e.g., "Day 1: Push", "Leg Day"
  dayOfWeek?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Custom';
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
