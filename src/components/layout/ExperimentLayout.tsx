import { ReactNode } from 'react';
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ExperimentHeader } from '@/components/lab/ExperimentHeader';
import { SectionNav } from '@/components/lab/SectionNav';

interface ExperimentLayoutProps {
  experimentNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  sections?: Array<{ id: string; label: string; icon: string }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: ReactNode;
}

export function ExperimentLayout({
  experimentNumber,
  title,
  subtitle,
  icon,
  duration,
  difficulty,
  tags,
  sections,
  activeSection,
  onSectionChange,
  children,
}: ExperimentLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Top Bar */}
          <header className="flex h-14 items-center gap-4 bg-card/80 backdrop-blur-sm border-b border-border px-4 sticky top-0 z-30">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Experiments</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{title}</span>
            </div>
          </header>

          {/* Experiment Header */}
          <ExperimentHeader
            experimentNumber={experimentNumber}
            title={title}
            subtitle={subtitle}
            icon={icon}
            duration={duration}
            difficulty={difficulty}
            tags={tags}
          />

          {/* Section Navigation */}
          <SectionNav
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            sections={sections}
          />

          {/* Main Content — only the active section is rendered */}
          <main className="container mx-auto px-4 sm:px-6 py-8">
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
              if ((child.props as { id?: string }).id !== activeSection) return null;
              return (
                <div key={activeSection} className="animate-in fade-in duration-300">
                  {child}
                </div>
              );
            })}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
