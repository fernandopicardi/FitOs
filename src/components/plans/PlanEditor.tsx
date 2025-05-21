
'use client';

import type { WorkoutPlan, WorkoutSession, DayOfWeek } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save, XCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { SessionForm, type SessionFormValues } from './SessionForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlanEditorProps {
  initialPlan: WorkoutPlan;
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
  onClose: () => void;
}

export function PlanEditor({ initialPlan, onUpdatePlan, onClose }: PlanEditorProps) {
  const [editedPlan, setEditedPlan] = useState<WorkoutPlan>(JSON.parse(JSON.stringify(initialPlan))); // Deep copy
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    setEditedPlan(JSON.parse(JSON.stringify(initialPlan)));
  }, [initialPlan]);

  const handlePlanDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPlan(prev => ({ ...prev, [name]: value }));
  };

  const openSessionForm = (session?: WorkoutSession) => {
    setSessionToEdit(session || null);
    setIsSessionFormOpen(true);
  };

  const handleSessionSubmit = (data: SessionFormValues) => {
    if (sessionToEdit) {
      // Update existing session
      setEditedPlan(prev => ({
        ...prev,
        sessions: prev.sessions.map(s => 
          s.id === sessionToEdit.id ? { ...s, ...data } : s
        ),
      }));
    } else {
      // Add new session
      const newSession: WorkoutSession = {
        id: `session-${Date.now()}`,
        ...data,
        exercises: [], // New sessions start with no exercises
      };
      setEditedPlan(prev => ({
        ...prev,
        sessions: [...prev.sessions, newSession],
      }));
    }
    setIsSessionFormOpen(false);
    setSessionToEdit(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    // Add confirmation dialog here in a real app
    setEditedPlan(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId),
    }));
  };
  
  const handleSaveChanges = () => {
    onUpdatePlan(editedPlan);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <Button variant="ghost" onClick={onClose} className="mb-2 text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Plans
          </Button>
          <h1 className="text-3xl font-bold text-primary">{initialPlan.name}</h1>
          <p className="text-muted-foreground">{initialPlan.description || "Edit plan details and manage sessions below."}</p>
        </div>
        <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
          <Save className="mr-2 h-5 w-5" /> Save Plan Changes
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>Modify the name and description of your workout plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="planName">Plan Name</Label>
            <Input 
              id="planName" 
              name="name" 
              value={editedPlan.name} 
              onChange={handlePlanDetailsChange} 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="planDescription">Description (Optional)</Label>
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
            <CardTitle>Workout Sessions</CardTitle>
            <CardDescription>Organize the sessions within this plan.</CardDescription>
          </div>
          <Dialog open={isSessionFormOpen} onOpenChange={(isOpen) => {
            setIsSessionFormOpen(isOpen);
            if (!isOpen) setSessionToEdit(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">
                  {sessionToEdit ? 'Edit Workout Session' : 'Add New Workout Session'}
                </DialogTitle>
                <DialogDescription>
                  {sessionToEdit ? 'Modify the details of this session.' : 'Define a new session for your plan.'}
                </DialogDescription>
              </DialogHeader>
              <SessionForm
                onSubmit={handleSessionSubmit}
                onCancel={() => {
                  setIsSessionFormOpen(false);
                  setSessionToEdit(null);
                }}
                session={sessionToEdit || undefined} 
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {editedPlan.sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No sessions added to this plan yet. Click &quot;Add Session&quot; to get started.
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-3"> {/* Added ScrollArea */}
              <div className="space-y-4">
                {editedPlan.sessions.map(session => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onEdit={() => openSessionForm(session)}
                    onDelete={() => handleDeleteSession(session.id)}
                    // onManageExercises will be implemented later
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
