import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Construction } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutHistoryPage() {
  return (
    <div className="space-y-8">
      <PageTitle 
        title="Workout History"
        subtitle="Review your past workouts and track your fitness journey over time."
      >
        {/* Filter options (e.g., date range, calendar/list view toggle) could go here */}
      </PageTitle>

      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Construction className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Feature Under Construction</CardTitle>
          <CardDescription className="text-lg">
            Your Workout History page is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Soon, this space will be filled with a calendar and list view of all your logged workouts. Visualize your dedication and see your consistency pay off!
          </p>
          <Button variant="outline" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'Workout History | Workout Wizard',
  description: 'View your past workouts.',
};
