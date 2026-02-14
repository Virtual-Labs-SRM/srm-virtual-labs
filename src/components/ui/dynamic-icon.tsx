import { icons, LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = icons[name as keyof typeof icons];

  if (!IconComponent) {
    return <icons.Circle {...props} />;
  }

  return <IconComponent {...props} />;
}
