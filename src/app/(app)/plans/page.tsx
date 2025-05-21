
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
import { PlanEditor } from '@/components/plans/PlanEditor';
import type { WorkoutPlan, Exercise } from '@/types';
import { PRELOADED_EXERCISES } from '@/constants/exercises'; // Import all exercises

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [selectedPlanForEditing, setSelectedPlanForEditing] = useState<WorkoutPlan | null>(null);
  
  // Make all exercises available
  const allExercises: Exercise[] = PRELOADED_EXERCISES; // In a real app, this might include custom exercises

  const handleAddPlan = (data: PlanFormValues) => {
    const newPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      name: data.name,
      description: data.description,
      sessions: [], 
    };
    setPlans(prev => [newPlan, ...prev]);
    setIsPlanFormOpen(false);
  };

  const handleManagePlan = (plan: WorkoutPlan) => {
    setSelectedPlanForEditing(plan);
  };

  const handleClosePlanEditor = () => {
    setSelectedPlanForEditing(null);
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    setPlans(prevPlans => 
      prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
    // We might want to keep the editor open if it was just a session exercise update
    // setSelectedPlanForEditing(null); 
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
    if (selectedPlanForEditing?.id === planId) {
      setSelectedPlanForEditing(null);
    }
  };

  if (selectedPlanForEditing) {
    return (
      <PlanEditor 
        initialPlan={selectedPlanForEditing}
        allExercises={allExercises} // Pass all exercises to the editor
        onUpdatePlan={handleUpdatePlan}
        onClose={handleClosePlanEditor}
        onDeletePlan={handleDeletePlan} // Pass delete handler
      />
    );
  }

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
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onManagePlan={handleManagePlan} // Changed from onManageSessions
              onDeletePlan={handleDeletePlan} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
