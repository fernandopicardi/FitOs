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
