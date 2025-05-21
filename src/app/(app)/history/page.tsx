
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Activity, ListChecks } from 'lucide-react';
import type { ActiveWorkoutLog } from '@/types';
import { WorkoutHistoryCard } from '@/components/history/WorkoutHistoryCard';

export default function WorkoutHistoryPage() {
  const [workoutHistory, setWorkoutHistory] = useState<ActiveWorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      try {
        const savedHistoryString = localStorage.getItem('workoutWizardHistory');
        if (savedHistoryString) {
          const history = JSON.parse(savedHistoryString) as ActiveWorkoutLog[];
          setWorkoutHistory(history);
        }
      } catch (error) {
        console.error("Failed to load workout history from localStorage", error);
        // Optionally, show a toast error using useToast if integrated here
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading && typeof window !== 'undefined') { // Still show loading if localStorage hasn't been read yet
    return (
      <div className="space-y-8">
        <PageTitle 
          title="Workout History"
          subtitle="Review your past workouts and track your fitness journey over time."
        />
        <div className="text-center py-10">
          <ListChecks className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <p className="mt-4 text-lg text-muted-foreground">Loading your workout history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle 
        title="Workout History"
        subtitle="Review your past workouts and track your fitness journey over time."
      />

      {workoutHistory.length === 0 ? (
        <Card className="shadow-lg text-center border-dashed border-muted-foreground/50 py-12">
          <CardHeader className="p-0">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <CalendarClock className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Workout History Yet</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">
              Looks like your fitness journal is waiting for its first entry!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Head over to the "Log Workout" page to record your sessions and build your history.
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <Link href="/log">
                <Activity className="mr-2 h-5 w-5" /> Log Your First Workout
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutHistory.map(log => (
            <WorkoutHistoryCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

// Metadata should be handled by layout or parent server component for client components
// export const metadata = {
//   title: 'Workout History | Workout Wizard',
//   description: 'View your past workouts.',
// };
