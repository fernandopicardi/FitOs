import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Construction } from 'lucide-react';
import Link from 'next/link';

export default function PlansPage() {
  return (
    <div className="space-y-8">
      <PageTitle 
        title="Workout Plans"
        subtitle="Design your weekly workout routines and stay organized."
      >
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Plan
        </Button>
      </PageTitle>
      
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Construction className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Feature Under Construction</CardTitle>
          <CardDescription className="text-lg">
            The Workout Planning section is currently being built. Stay tuned for updates!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Soon you&apos;ll be able to create detailed workout plans, assign exercises to specific days, and track your schedule like a pro.
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
  title: 'Workout Plans | Workout Wizard',
  description: 'Manage your workout plans.',
};
