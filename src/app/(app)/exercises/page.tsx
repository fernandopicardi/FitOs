
import { PageTitle } from '@/components/shared/PageTitle';
import { ExerciseListClient } from '@/components/exercises/ExerciseListClient';
import { PRELOADED_EXERCISES } from '@/constants/exercises';
import type { Exercise } from '@/types';

// PRELOADED_EXERCISES are now passed directly to the client component
// which will handle merging with custom exercises from localStorage.

export default async function ExercisesPage() {
  // The initial set of exercises are the preloaded ones.
  // The ExerciseListClient will load custom exercises from localStorage and merge them.
  const exercises: Exercise[] = PRELOADED_EXERCISES.map(ex => ({...ex, isCustom: false}));

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

    