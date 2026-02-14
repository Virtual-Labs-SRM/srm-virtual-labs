import { Badge } from '@/components/ui/badge';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Clock, BarChart3, Tag } from 'lucide-react';

interface ExperimentHeaderProps {
  experimentNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
}

export function ExperimentHeader({
  experimentNumber,
  title,
  subtitle,
  icon,
  duration = '~45 minutes',
  difficulty = 'Intermediate',
  tags = ['AI', 'Algorithm'],
}: ExperimentHeaderProps) {
  return (
    <header className="gradient-hero text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Experiment Title Section */}
        <div className="flex items-start gap-4 sm:gap-6 mb-6">
          <div className="text-4xl sm:text-5xl animate-float">
            <DynamicIcon name={icon} className="h-12 w-12 sm:h-16 sm:w-16" />
          </div>
          <div className="flex-1">
            <Badge
              variant="secondary"
              className="mb-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              Experiment {experimentNumber}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {title}
            </h1>
            <p className="text-white/90 text-base sm:text-lg">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 sm:gap-6">

          <div className="flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
            <span>{difficulty}</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
            <span>{tags.join(', ')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
