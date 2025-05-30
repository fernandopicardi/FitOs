
'use client';

import type { WorkoutPlan, WorkoutSession, Exercise } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { SessionForm, type SessionFormValues } from './SessionForm';
import { SessionExerciseManager } from './SessionExerciseManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from "@/components/ui/alert-dialog";

interface PlanEditorProps {
  initialPlan: WorkoutPlan;
  allExercises: Exercise[]; 
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
  onClose: () => void;
  onDeletePlan: (planId: string) => void;
}

export function PlanEditor({ initialPlan, allExercises, onUpdatePlan, onClose, onDeletePlan }: PlanEditorProps) {
  const [editedPlan, setEditedPlan] = useState<WorkoutPlan>(JSON.parse(JSON.stringify(initialPlan)));
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [sessionToEditDetails, setSessionToEditDetails] = useState<WorkoutSession | null>(null);
  const [managingExercisesForSession, setManagingExercisesForSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    setEditedPlan(JSON.parse(JSON.stringify(initialPlan)));
  }, [initialPlan]);

  const handlePlanDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPlan(prev => ({ ...prev, [name]: value }));
  };

  const openSessionForm = (session?: WorkoutSession) => {
    setSessionToEditDetails(session || null);
    setIsSessionFormOpen(true);
  };

  const handleSessionDetailsSubmit = (data: SessionFormValues) => {
    if (sessionToEditDetails) {
      setEditedPlan(prev => ({
        ...prev,
        sessions: prev.sessions.map(s => 
          s.id === sessionToEditDetails.id ? { ...s, ...data, exercises: s.exercises } : s 
        ),
      }));
    } else {
      const newSession: WorkoutSession = {
        id: `session-${Date.now()}`,
        ...data,
        exercises: [], 
      };
      setEditedPlan(prev => ({
        ...prev,
        sessions: [...prev.sessions, newSession],
      }));
    }
    setIsSessionFormOpen(false);
    setSessionToEditDetails(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setEditedPlan(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId),
    }));
  };
  
  const handleSaveChangesToPlan = () => {
    onUpdatePlan(editedPlan);
  };

  const handleManageSessionExercises = (session: WorkoutSession) => {
    setManagingExercisesForSession(session);
  };

  const handleSessionExercisesUpdated = (updatedSession: WorkoutSession) => {
    setEditedPlan(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === updatedSession.id ? updatedSession : s)
    }));
  };

  if (managingExercisesForSession) {
    return (
      <SessionExerciseManager
        session={managingExercisesForSession}
        allExercises={allExercises}
        onSessionUpdated={handleSessionExercisesUpdated} 
        onDone={() => setManagingExercisesForSession(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b gap-4">
        <div>
          <Button variant="ghost" onClick={onClose} className="mb-2 text-primary hover:text-primary/80 -ml-2 sm:ml-0">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para Planos
          </Button>
          <h1 className="text-3xl font-bold text-primary break-all">{editedPlan.name}</h1>
          {editedPlan.description && <p className="text-muted-foreground mt-1">{editedPlan.description}</p>}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1 sm:flex-none">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Plano
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Plano: {editedPlan.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é permanente e não pode ser desfeita. Tem certeza de que deseja excluir este plano de treino?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeletePlan(editedPlan.id);
                    onClose(); 
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSaveChangesToPlan} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md flex-1 sm:flex-none">
            <Save className="mr-2 h-5 w-5" /> Salvar Plano
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Detalhes do Plano</CardTitle>
          <CardDescription>Modifique o nome e a descrição do seu plano de treino.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="planName">Nome do Plano</Label>
            <Input 
              id="planName" 
              name="name" 
              value={editedPlan.name} 
              onChange={handlePlanDetailsChange} 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="planDescription">Descrição (Opcional)</Label>
            <Textarea 
              id="planDescription" 
              name="description" 
              value={editedPlan.description || ""} 
              onChange={handlePlanDetailsChange} 
              className="mt-1 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Sessões de Treino</CardTitle>
            <CardDescription>Organize as sessões e seus exercícios dentro deste plano.</CardDescription>
          </div>
          <Dialog open={isSessionFormOpen} onOpenChange={(isOpen) => {
            setIsSessionFormOpen(isOpen);
            if (!isOpen) setSessionToEditDetails(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
                <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">
                  {sessionToEditDetails ? 'Editar Detalhes da Sessão' : 'Adicionar Nova Sessão de Treino'}
                </DialogTitle>
                <DialogDescription>
                  {sessionToEditDetails ? 'Modifique os detalhes desta sessão.' : 'Defina uma nova sessão para o seu plano. Exercícios são adicionados separadamente.'}
                </DialogDescription>
              </DialogHeader>
              <SessionForm
                onSubmit={handleSessionDetailsSubmit}
                onCancel={() => {
                  setIsSessionFormOpen(false);
                  setSessionToEditDetails(null);
                }}
                session={sessionToEditDetails || undefined} 
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {editedPlan.sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma sessão adicionada a este plano ainda. Clique em &quot;Adicionar Sessão&quot; para começar.
            </p>
          ) : (
            <ScrollArea className="max-h-[500px] pr-3"> 
              <div className="space-y-4">
                {editedPlan.sessions.map(session => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onEditDetails={() => openSessionForm(session)}
                    onDelete={() => handleDeleteSession(session.id)}
                    onManageExercises={() => handleManageSessionExercises(session)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
