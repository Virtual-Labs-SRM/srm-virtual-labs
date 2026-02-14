// Lab platform types

export interface SubModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  implemented: boolean;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  subModules: SubModule[];
}

export type TabType = 'aim' | 'theory' | 'algorithm' | 'program' | 'demo' | 'practice';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

export const TABS: TabConfig[] = [
  { id: 'aim', label: 'Aim', icon: 'Target' },
  { id: 'theory', label: 'Theory', icon: 'BookOpen' },
  { id: 'algorithm', label: 'Algorithm', icon: 'ListOrdered' },
  { id: 'program', label: 'Program', icon: 'Code' },
  { id: 'demo', label: 'Demo', icon: 'Play' },
  { id: 'practice', label: 'Practice', icon: 'Pencil' },
];
