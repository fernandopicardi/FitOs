import { PageTitle } from '@/components/shared/PageTitle';
import { ExerciseListClient } from '@/components/exercises/ExerciseListClient';
import { PRELOADED_EXERCISES } from '@/constants/exercises';
import type { Exercise } from '@/types';

// This function could fetch data in a real app
async function getExercises(): Promise<Exercise[]> {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 500));
  return PRELOADED_EXERCISES;
}

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-8">
      <PageTitle 
        title="Exercise Library"
        subtitle="Discover exercises or add your own to build the perfect workout."
      />
      <ExerciseListClient initialExercises={exercises} />
    </div>
  );
}

export const metadata = {
  title: 'Exercise Library | Workout Wizard',
  description: 'Browse and manage your exercises.',
};
