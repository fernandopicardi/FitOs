import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Construction } from 'lucide-react';
import Link from 'next/link';

export default function LogWorkoutPage() {
  return (
    <div className="space-y-8">
      <PageTitle 
        title="Log Your Workout"
        subtitle="Record your sets, reps, and how you felt during your session."
      >
         {/* Potentially add 'Start Empty Workout' or 'Load from Plan' buttons here */}
      </PageTitle>
      
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Construction className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Feature Under Construction</CardTitle>
          <CardDescription className="text-lg">
            The Workout Logging feature is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Get ready to track your performance, note your achievements, and watch your progress soar. This section will be your go-to for recording every drop of sweat!
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
  title: 'Log Workout | Workout Wizard',
  description: 'Log your completed workouts.',
};
