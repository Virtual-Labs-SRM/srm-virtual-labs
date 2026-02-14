import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TABS, TabType } from '@/types/lab';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

interface LabTabsProps {
  defaultTab?: TabType;
  aimContent: React.ReactNode;
  theoryContent: React.ReactNode;
  algorithmContent: React.ReactNode;
  programContent: React.ReactNode;
  demoContent: React.ReactNode;
  practiceContent: React.ReactNode;
}

export function LabTabs({
  defaultTab = 'aim',
  aimContent,
  theoryContent,
  algorithmContent,
  programContent,
  demoContent,
  practiceContent,
}: LabTabsProps) {
  const contentMap: Record<TabType, React.ReactNode> = {
    aim: aimContent,
    theory: theoryContent,
    algorithm: algorithmContent,
    program: programContent,
    demo: demoContent,
    practice: practiceContent,
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-lg">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <DynamicIcon name={tab.icon} className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {TABS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {contentMap[tab.id]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
