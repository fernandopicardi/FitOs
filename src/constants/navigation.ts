import type { NavigationItem } from '@/types';
import { Dumbbell, LayoutList, CalendarDays, TrendingUp, Sparkles } from 'lucide-react';

export const NAV_ITEMS: NavigationItem[] = [
  { href: '/', label: 'Dashboard', icon: Sparkles },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
  { href: '/plans', label: 'Plans', icon: LayoutList },
  { href: '/log', label: 'Log Workout', icon: TrendingUp },
  { href: '/history', label: 'History', icon: CalendarDays },
];
