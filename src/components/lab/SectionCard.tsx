import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  Target, BookOpen, Cog, Code, Play, Pencil, BookText, 
  CheckCircle2, AlertCircle, Lightbulb, Info 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  BookOpen,
  Cog,
  Code,
  Play,
  Pencil,
  BookText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Info,
};

interface SectionCardProps {
  id: string;
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ id, title, icon, children, className }: SectionCardProps) {
  const Icon = ICON_MAP[icon] || BookOpen;
  
  return (
    <section id={id} className={cn("scroll-mt-32", className)}>
      <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden backdrop-blur-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-muted/50 border-b border-border">
          <div className="text-2xl">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        
        {/* Card Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </section>
  );
}

// Sub-components for common patterns
interface HighlightItemProps {
  icon: string;
  text: string;
}

export function HighlightItem({ icon, text }: HighlightItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-foreground">{text}</span>
    </div>
  );
}

interface TheoryBlockProps {
  title: string;
  children: ReactNode;
}

export function TheoryBlock({ title, children }: TheoryBlockProps) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-lg font-bold text-primary mb-3">{title}</h3>
      <div className="text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

interface ComparisonCardProps {
  variant: 'local' | 'global' | 'info';
  icon: string;
  title: string;
  description: string;
  example?: string;
}

export function ComparisonCard({ variant, icon, title, description, example }: ComparisonCardProps) {
  const variantStyles = {
    local: 'border-warning/50 bg-warning/5',
    global: 'border-success/50 bg-success/5',
    info: 'border-info/50 bg-info/5',
  };
  
  return (
    <div className={cn(
      "p-5 rounded-xl border-2 transition-all hover:-translate-y-1",
      variantStyles[variant]
    )}>
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-muted-foreground mb-3">{description}</p>
      {example && (
        <div className="p-2 bg-card rounded-md text-sm font-mono">
          {example}
        </div>
      )}
    </div>
  );
}

interface TermCardProps {
  term: string;
  definition: string;
}

export function TermCard({ term, definition }: TermCardProps) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
      <span className="font-bold text-primary">{term}</span>
      <span className="text-sm text-muted-foreground">{definition}</span>
    </div>
  );
}

interface FlowStepProps {
  number: number;
  title: string;
  description: string;
}

export function FlowStep({ number, title, description }: FlowStepProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl flex-1 min-w-[200px] max-w-[280px]">
      <div className="w-9 h-9 gradient-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface AlgorithmStepProps {
  number: number;
  title: string;
  description: string;
  code?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function AlgorithmStep({ 
  number, 
  title, 
  description, 
  code, 
  isActive = false,
  onClick 
}: AlgorithmStepProps) {
  return (
    <div 
      className={cn(
        "flex gap-4 p-4 rounded-xl bg-muted/30 border-2 transition-all cursor-pointer",
        isActive 
          ? "border-primary bg-primary/10 shadow-md" 
          : "border-transparent hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
          isActive 
            ? "gradient-primary text-white" 
            : "bg-card text-muted-foreground"
        )}>
          {number}
        </div>
        <div className="w-0.5 flex-1 bg-border mt-2" />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-muted-foreground mb-3">{description}</p>
        {code && (
          <div className="p-3 bg-card rounded-md font-mono text-sm overflow-x-auto">
            {code}
          </div>
        )}
      </div>
    </div>
  );
}
