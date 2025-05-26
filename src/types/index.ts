
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
  | 'Antebraços' // Adicionado para cobrir mais variações
  | 'Panturrilhas' // Adicionado
  | 'Pescoço' // Adicionado
  | 'Trapézio' // Adicionado
  | 'Lombar' // Adicionado
  | 'Adutores' // Adicionado
  | 'Abdutores' // Adicionado
  | 'Oblíquos' // Adicionado
  // API values that might come:
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower_back'
  | 'middle_back'
  | 'neck'
  | 'quadriceps'
  | 'traps'
  | 'triceps'
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
  | 'Cooldown' // Adicionado
  // API values that might come:
  | 'olympic_weightlifting'
  | 'plyometrics'
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
  name?: string; // Nome do exercício para fácil referência
  emoji?: string; // Emoji do exercício para fácil referência
  sets?: string; // ex: "3", "3-4", "4 rounds"
  reps?: string; // ex: "8-12", "15", "30s"
  rest?: string; // ex: "60s", "1-2min"
  notes?: string; // Observações específicas para este exercício nesta sessão
}

export type DayOfWeek = 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado' | 'Domingo' | 'Dia Customizado' | 'Dia de Descanso';


export interface WorkoutSession {
  id: string;
  name: string; // ex: "Upper Body Push", "Lower Body Strength"
  dayOfWeek?: DayOfWeek;
  exercises: PlannedExercise[];
  notes?: string; // Observações gerais para a sessão
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  sessions: WorkoutSession[];
  isArchived?: boolean;
  isGeneratedByAI?: boolean; // Novo campo para identificar planos gerados por IA
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
  weight: string; // Armazenar como string para flexibilidade no input
  reps: string;   // Armazenar como string
  rpe?: string; // Rate of Perceived Exertion
  isCompleted: boolean;
  notes?: string; // Notas específicas do set
}

export interface LoggedExerciseEntry {
  id: string; // ID único para esta entrada no log
  exerciseId: string; // ID do exercício da biblioteca
  name: string; // Nome do exercício (copiado da biblioteca para snapshot)
  emoji: string; // Emoji (copiado da biblioteca)
  plannedSets?: string; // O que foi planejado (ex: "3")
  plannedReps?: string; // O que foi planejado (ex: "8-12")
  sets: LoggedSetData[]; // Dados registrados para cada set
  notes?: string; // Notas gerais para este exercício durante o treino
}

export interface ActiveWorkoutLog {
  id: string; // ID único para este log de treino
  planId?: string; // Se baseado em um plano
  planName?: string; // Nome do plano, se aplicável
  workoutName: string; // Nome do treino (pode ser o nome do plano ou ad-hoc)
  date: string; // ISO string da data
  startTime: number; // Timestamp do início
  endTime?: number; // Timestamp do fim
  exercises: LoggedExerciseEntry[];
  notes?: string; // Notas gerais do treino
}

// Para a API Externa
export interface ApiNinjaExercise {
  name: string;
  type: string; // Ex: "strength", "cardio"
  muscle: string; // Ex: "biceps", "chest"
  equipment: string; // Ex: "dumbbell", "barbell"
  difficulty: string; // Ex: "beginner", "intermediate"
  instructions: string;
}

// Tipos para o fluxo de IA de geração de plano
export interface AISimplifiedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  workoutType: string[];
}
