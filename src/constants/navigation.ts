import type { NavigationItem } from '@/types';
import { Dumbbell, LayoutList, CalendarDays, TrendingUp, Sparkles } from 'lucide-react';

export const NAV_ITEMS: NavigationItem[] = [
  { href: '/', label: 'Painel', icon: Sparkles },
  { href: '/exercises', label: 'Exercícios', icon: Dumbbell },
  { href: '/plans', label: 'Planos', icon: LayoutList },
  { href: '/log', label: 'Registrar Treino', icon: TrendingUp },
  { href: '/history', label: 'Histórico', icon: CalendarDays },
];
