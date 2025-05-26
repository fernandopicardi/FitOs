
import { PageTitle } from '@/components/shared/PageTitle';
import { ExerciseListClient } from '@/components/exercises/ExerciseListClient';
import { PRELOADED_EXERCISES } from '@/constants/exercises';
import type { Exercise } from '@/types';

export default async function ExercisesPage() {
  const exercises: Exercise[] = PRELOADED_EXERCISES.map(ex => ({...ex, isCustom: false}));

  return (
    <div className="space-y-8">
      <PageTitle 
        title="Biblioteca de Exercícios"
        subtitle="Descubra exercícios ou adicione os seus para montar o treino perfeito."
      />
      <ExerciseListClient initialExercises={exercises} />
    </div>
  );
}

export const metadata = {
  title: 'Biblioteca de Exercícios | FitOS',
  description: 'Navegue e gerencie seus exercícios.',
};
