
export type MuscleGroup = 
  | 'Peito' 
  | 'Costas' 
  | 'Pernas' 
  | 'Ombros' 
  | 'Bíceps' 
  | 'Tríceps' 
  | 'Abdômen' 
  | 'Corpo Inteiro'
  | 'Cardio'
  | 'Glúteos'
  | 'Isquiotibiais'
  | 'Quadril'
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
  | 'Outro' 
  | string; 

export type WorkoutType = 
  | 'Força' 
  | 'Cardio' 
  | 'Flexibilidade' 
  | 'Hipertrofia' 
  | 'Powerlifting' 
  | 'Fisiculturismo'
  | 'CrossFit'
  | 'Yoga'
  | 'Aquecimento'
  | 'Desaquecimento'
  | 'Mobilidade'
  | 'Pliometria'
  | 'Corretivo'
  | 'Calistenia'
  | 'HIIT'
  | 'Resistência'
  | 'Core'
  | 'Avançado'
  | 'Isométrico'
  | 'olympic_weightlifting'
  | 'stretching'
  | 'strongman'
  | 'Outro'
  | string; 

export type ExerciseDifficulty = 'iniciante' | 'intermediário' | 'avançado' | string;

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
  equipment?: string;
  difficulty?: ExerciseDifficulty;
  isFetchedFromAPI?: boolean; 
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ElementType;
}

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

export type DayOfWeek = 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado' | 'Domingo' | 'Dia Customizado' | 'Dia de Descanso';


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

export interface LoggedSetData {
  id: string;
  setNumber: number;
  weight: string; 
  reps: string;   
  rpe?: string; 
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

export interface ApiNinjaExercise {
  name: string;
  type: string; 
  muscle: string; 
  equipment: string; 
  difficulty: string; 
  instructions: string;
}
