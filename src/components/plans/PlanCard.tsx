
'use client';

import type { WorkoutPlan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarDays, ClipboardList, Settings2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PlanCardProps {
  plan: WorkoutPlan;
  onManagePlan: (plan: WorkoutPlan) => void; 
  onDeletePlan: (planId: string) => void; 
}

export function PlanCard({ plan, onManagePlan, onDeletePlan }: PlanCardProps) {
  const sessionCount = plan.sessions?.length || 0;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.03] flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl mb-1 text-primary flex items-center gap-2">
             <ClipboardList className="h-6 w-6 shrink-0" />
            {plan.name}
          </CardTitle>
        </div>
        {plan.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1 h-10">
            {plan.description}
          </CardDescription>
        )}
         {!plan.description && <div className="h-10 mt-1"></div>}
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>{sessionCount} sessão{sessionCount !== 1 ? 'ões' : ''}</span> 
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 bg-primary hover:bg-primary/90"
          onClick={() => onManagePlan(plan)} 
        >
          <Settings2 className="mr-2 h-4 w-4" /> Gerenciar Plano
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 ml-2"
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Excluir Plano</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o plano de treino
                &quot;{plan.name}&quot; e todas as suas sessões associadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeletePlan(plan.id)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Excluir Plano
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
