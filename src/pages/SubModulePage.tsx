import { useParams, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ModuleBreadcrumbs } from '@/components/layout/ModuleBreadcrumbs';
import { LabTabs } from '@/components/lab/LabTabs';
import { PlaceholderContent } from '@/components/lab/PlaceholderContent';
import { getSubModuleById } from '@/data/modules';
import { Badge } from '@/components/ui/badge';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

// Import lab components
import { DFSLab } from '@/labs/search/DFSLab';
import { BFSLab } from '@/labs/search/BFSLab';
import { AStarLab } from '@/labs/search/AStarLab';
import { HillClimbingLab } from '@/labs/optimization/HillClimbingLab';
import { FuzzyShapeMatchingLab } from '@/labs/fuzzy/FuzzyShapeMatchingLab';
import { CollegeSelectionLab } from '@/labs/fuzzy/CollegeSelectionLab';
import { ChatApplicationLab } from '@/labs/chat/ChatApplicationLab';
import { HousePriceLab } from '@/labs/ml/HousePriceLab';
import { PlagiarismDetectorLab } from '@/labs/nlp/PlagiarismDetectorLab';
import { PersonalityPredictionLab } from '@/labs/ml/PersonalityPredictionLab';
import { HeartDiseaseLab } from '@/labs/ml/HeartDiseaseLab';
import { ExpertMatchingLab } from '@/labs/ontology/ExpertMatchingLab';
import { TestingOntologyLab } from '@/labs/ontology/TestingOntologyLab';

const LAB_COMPONENTS: Record<string, React.ComponentType> = {
  'lab-1/dfs': DFSLab,
  'lab-1/bfs': BFSLab,
  'lab-2/hill-climbing': HillClimbingLab,
  'lab-3/astar': AStarLab,
  'lab-4/fuzzy-shape-matching': FuzzyShapeMatchingLab,
  'lab-5/chat-application': ChatApplicationLab,
  'lab-6/price-prediction': HousePriceLab,
  'lab-7/plagiarism-detection': PlagiarismDetectorLab,
  'lab-8/personality-prediction': PersonalityPredictionLab,
  'lab-9/heart-disease': HeartDiseaseLab,
  'lab-10/expert-matching': ExpertMatchingLab,
  'lab-11/testing-ontology': TestingOntologyLab,
  'lab-12/college-selection': CollegeSelectionLab,
};

export default function SubModulePage() {
  const { moduleId, subModuleId } = useParams<{ moduleId: string; subModuleId: string }>();

  if (!moduleId || !subModuleId) {
    return <Navigate to="/" replace />;
  }

  const result = getSubModuleById(moduleId, subModuleId);

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const { module, subModule } = result;
  const labKey = `${moduleId}/${subModuleId}`;
  const LabComponent = LAB_COMPONENTS[labKey];

  if (LabComponent) {
    return <LabComponent />;
  }

  return (
    <MainLayout
      breadcrumbs={
        <ModuleBreadcrumbs
          moduleId={module.id}
          moduleTitle={module.title}
          subModuleTitle={subModule.title}
        />
      }
    >
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <DynamicIcon name={subModule.icon} className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{subModule.title}</h1>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <p className="text-muted-foreground">{subModule.description}</p>
            </div>
          </div>

          <LabTabs
            aimContent={<PlaceholderContent section="Aim" subModuleTitle={subModule.title} />}
            theoryContent={<PlaceholderContent section="Theory" subModuleTitle={subModule.title} />}
            algorithmContent={<PlaceholderContent section="Algorithm" subModuleTitle={subModule.title} />}
            programContent={<PlaceholderContent section="Program" subModuleTitle={subModule.title} />}
            demoContent={<PlaceholderContent section="Demo" subModuleTitle={subModule.title} />}
            practiceContent={<PlaceholderContent section="Practice" subModuleTitle={subModule.title} />}
          />
        </div>
      </div>
    </MainLayout>
  );
}
