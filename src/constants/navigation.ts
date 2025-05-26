
import type { NavigationItem } from '@/types';
import { Dumbbell, LayoutList, CalendarDays, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';

export const NAV_ITEMS: NavigationItem[] = [
  { href: '/', label: 'Painel', icon: Sparkles },
  { href: '/smart-trainer', label: 'Treino Inteligente', icon: BrainCircuit }, // Movido para segunda posição
  { href: '/exercises', label: 'Exercícios', icon: Dumbbell },
  { href: '/plans', label: 'Planos', icon: LayoutList },
  { href: '/log', label: 'Registrar Treino', icon: TrendingUp },
  { href: '/history', label: 'Histórico', icon: CalendarDays },
];
