
'use client';

import type { WorkoutPlan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, CalendarDays, ClipboardList } from 'lucide-react';

interface PlanCardProps {
  plan: WorkoutPlan;
  onEdit?: (plan: WorkoutPlan) => void; // Future use
  onDelete?: (planId: string) => void; // Future use
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const sessionCount = plan.sessions?.length || 0;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl mb-1 text-primary flex items-center gap-2">
             <ClipboardList className="h-6 w-6 shrink-0" />
            {plan.name}
          </CardTitle>
          {/* Placeholder for a potential menu or quick actions */}
        </div>
        {plan.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span> 
          {/* Placeholder for more details like "3 days/week" */}
        </div>
        {/* Future: Could show a preview of days or muscle groups targeted */}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary"
          onClick={() => onEdit?.(plan)} 
          disabled={!onEdit} // Disable if no handler
        >
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive/80 hover:text-destructive"
          onClick={() => onDelete?.(plan.id)}
          disabled={!onDelete} // Disable if no handler
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
