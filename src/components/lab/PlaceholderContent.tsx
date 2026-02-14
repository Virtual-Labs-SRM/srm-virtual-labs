import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderContentProps {
  section: string;
  subModuleTitle: string;
}

export function PlaceholderContent({ section, subModuleTitle }: PlaceholderContentProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Construction className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {section} - Coming Soon
        </h3>
        <p className="text-muted-foreground max-w-md">
          The {section.toLowerCase()} section for "{subModuleTitle}" is currently under development. 
          Check back soon for comprehensive content.
        </p>
      </CardContent>
    </Card>
  );
}
