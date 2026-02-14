import { useState } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TestTube, BookOpen, Layers, Link2, Lightbulb, ListOrdered, Code, Terminal, Network, Target } from 'lucide-react';
import { TestingOntologyDemo } from '@/components/ontology/TestingOntologyDemo';
import { BeginnerChallengesTesting } from '@/components/ontology/BeginnerChallengesTesting';

const PYTHON_CODE = `# LAB 11: Software Testing Ontology for AI-Based Systems
# Unit-3: Ontology Learning for Semantic Web

from rdflib import Graph, Literal, RDF, RDFS, Namespace

# Step 1: Create RDF graph
g = Graph()

# Step 2: Define namespace
EX = Namespace("http://example.org/software-testing/")

# Step 3: Define ontology classes (USING RDFS.Class)
AISystem = EX.AISystem
TestType = EX.TestType
Metric = EX.Metric

g.add((AISystem, RDF.type, RDFS.Class))
g.add((TestType, RDF.type, RDFS.Class))
g.add((Metric, RDF.type, RDFS.Class))

# Step 4: Define properties
hasTest = EX.hasTest
hasMetric = EX.hasMetric
value = EX.value

# Step 5: Create instances
ai_system = EX.HeartDiseasePredictionAI
unit_test = EX.UnitTesting
accuracy_metric = EX.Accuracy

# Step 6: Add instance relationships
g.add((ai_system, RDF.type, AISystem))
g.add((unit_test, RDF.type, TestType))
g.add((accuracy_metric, RDF.type, Metric))

g.add((ai_system, hasTest, unit_test))
g.add((unit_test, hasMetric, accuracy_metric))
g.add((accuracy_metric, value, Literal("92%")))

# Step 7: Display ontology triples
print("Software Testing Ontology for AI-Based Systems\\n")
for subj, pred, obj in g:
    print(subj, pred, obj)`;

export function TestingOntologyLab() {
  const [activeSection, setActiveSection] = useState('aim');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={11}
      title="Software Testing Ontology"
      subtitle="Testing Ontology for AI-Based Systems"
      icon="Network"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Ontology', 'Software Testing', 'AI Systems', 'RDF']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To implement a <strong className="text-primary">Software Testing Ontology</strong> for AI-based systems using semantic web concepts,
          representing relationships between AI systems, test types, and evaluation metrics.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <HighlightItem icon="🎯" text="Ontology Implementation" />
          <HighlightItem icon="🧪" text="Represent Test Types" />
          <HighlightItem icon="📊" text="Map Evaluation Metrics" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is a Software Testing Ontology?">
          <p className="mb-4">
            A Software Testing Ontology is a formal representation of testing knowledge for AI systems,
            defining classes (AI Systems, Test Types, Metrics) and relationships (hasTest, hasMetric)
            using RDF (Resource Description Framework) triples.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Key Concepts">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <TermCard term="AI Systems" definition="ML models or AI applications requiring testing" />
            <TermCard term="Test Types" definition="Methods like Unit, Integration, or Performance testing" />
            <TermCard term="Metrics" definition="Evaluation measures like Accuracy, Precision, F1-Score" />
          </div>
        </TheoryBlock>

        <TheoryBlock title="RDF Triples Structure">
          <p className="mb-4">
            Knowledge is represented as Subject-Predicate-Object triples:
          </p>
          <div className="space-y-2 font-mono text-sm bg-muted/30 p-4 rounded-lg border">
            <div><span className="text-primary font-bold">HeartDiseaseAI</span> hasTest <span className="text-primary font-bold">UnitTesting</span></div>
            <div><span className="text-primary font-bold">UnitTesting</span> hasMetric <span className="text-primary font-bold">Accuracy</span></div>
            <div><span className="text-primary font-bold">Accuracy</span> value <span className="text-primary font-bold">"92%"</span></div>
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The ontology development process involves defining concepts, relationships, and instances:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Define Concepts</h4>
              <p className="text-muted-foreground">Identify and declare the core classes (e.g., AISystem, TestType, Metric) using RDFS.Class.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Create Relationships</h4>
              <p className="text-muted-foreground">Define semantic properties like 'hasTest' and 'hasMetric' to link the classes together.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Instantiate & Query</h4>
              <p className="text-muted-foreground">Populate the ontology with real-world instances and query the graph to retrieve testing knowledge.</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{`Algorithm: Build Testing Ontology

Input: Domain knowledge (AI Systems, Tests, Metrics)
Output: RDF Ontology Graph

1. INITIALIZE_GRAPH():
   g = Graph()
   Define Namespace (EX)

2. DEFINE_CLASSES():
   g.add(EX.AISystem, RDF.type, RDFS.Class)
   g.add(EX.TestType, RDF.type, RDFS.Class)
   g.add(EX.Metric, RDF.type, RDFS.Class)

3. DEFINE_PROPERTIES():
   hasTest = EX.hasTest
   hasMetric = EX.hasMetric

4. CREATE_INSTANCES():
   system = EX.HeartDiseaseAI
   test = EX.UnitTesting
   metric = EX.Accuracy

5. LINK_DATA():
   g.add(system, hasTest, test)
   g.add(test, hasMetric, metric)

6. SERIALIZE():
   Print all triples (Subject, Predicate, Object)`}</pre>
        </div>
      </SectionCard>

      {/* PROGRAM SECTION */}
      <SectionCard id="program" title="Program" icon="Code">
        <p className="text-muted-foreground mb-6">
          The following Python code implements the testing ontology using rdflib:
        </p>
        <CodeBlock code={PYTHON_CODE} language="python" title="testing_ontology.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Explore different AI systems and their testing configurations. Click nodes to see details
            and understand relationships.
          </p>
          <Card className="border border-muted shadow-sm">
            <CardContent className="p-6">
              <TestingOntologyDemo />
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <h4 className="font-semibold mb-2">Extend Ontology</h4>
                <p className="text-sm text-muted-foreground">
                  Try adding new test types like Performance Testing or Fairness Testing.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <h4 className="font-semibold mb-2">New Metrics</h4>
                <p className="text-sm text-muted-foreground">
                  Include more evaluation metrics like AUC-ROC or Precision@K.
                </p>
              </CardContent>
            </Card>
          </div>
          <BeginnerChallengesTesting />
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
