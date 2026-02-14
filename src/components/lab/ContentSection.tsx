import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

interface ContentSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function ContentSection({ title, icon, children, className = '' }: ContentSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon && <DynamicIcon name={icon} className="h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert">
        {children}
      </CardContent>
    </Card>
  );
}
