
'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanForm, type PlanFormValues } from '@/components/plans/PlanForm';
import { PlanCard } from '@/components/plans/PlanCard';
import type { WorkoutPlan } from '@/types';

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);

  const handleAddPlan = (data: PlanFormValues) => {
    const newPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`, // Simple unique ID for client-side
      name: data.name,
      description: data.description,
      sessions: [], // Sessions will be added in a later step
    };
    setPlans(prev => [newPlan, ...prev]);
    setIsPlanFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageTitle
        title="Workout Plans"
        subtitle="Design your weekly workout routines and stay organized."
      >
        <Dialog open={isPlanFormOpen} onOpenChange={setIsPlanFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">Create New Workout Plan</DialogTitle>
              <DialogDescription>
                Give your plan a name and an optional description to get started. You can add sessions and exercises later.
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              onSubmit={handleAddPlan}
              onCancel={() => setIsPlanFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageTitle>

      {plans.length === 0 ? (
        <Card className="shadow-lg text-center border-dashed border-muted-foreground/50 py-12">
          <CardHeader className="p-0">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <LayoutGrid className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Workout Plans Yet</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">
              It looks a bit empty here. Let&apos;s fix that!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Click the &quot;Create New Plan&quot; button to design your fitness roadmap, organize your workouts, and start achieving your goals.
            </p>
            <Button onClick={() => setIsPlanFormOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
