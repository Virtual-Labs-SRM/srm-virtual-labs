import { cn } from '@/lib/utils';
import { Target, BookOpen, Cog, Code, Play, Pencil, BookText } from 'lucide-react';

interface SectionNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections?: {
    id: string;
    label: string;
    icon: string;
  }[];
}

const DEFAULT_SECTIONS = [
  { id: 'aim', label: 'Aim', icon: 'Target' },
  { id: 'theory', label: 'Theory', icon: 'BookOpen' },
  { id: 'algorithm', label: 'Algorithm', icon: 'Cog' },
  { id: 'program', label: 'Program', icon: 'Code' },
  { id: 'demo', label: 'Demo', icon: 'Play' },
  { id: 'practice', label: 'Practice', icon: 'Pencil' },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  BookOpen,
  Cog,
  Code,
  Play,
  Pencil,
  BookText,
};

export function SectionNav({ 
  activeSection, 
  onSectionChange, 
  sections = DEFAULT_SECTIONS 
}: SectionNavProps) {
  return (
    <nav className="sticky top-14 z-20 glass border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = ICON_MAP[section.icon] || Target;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "gradient-primary text-white shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
