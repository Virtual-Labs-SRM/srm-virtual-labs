import { useState } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Network, CheckCircle2 } from 'lucide-react';
import { ExpertMatchingDemo } from '@/components/ontology/ExpertMatchingDemo';
import { BeginnerChallenges } from '@/components/ontology/BeginnerChallenges';

const EXPERT_MATCHING_CODE = `"""
Ontology-Based Domain Expert Matching System
(Using RDF, OWL, and SPARQL)

This implementation represents expert knowledge using
Semantic Web standards and performs ontology-based
expert matching through SPARQL querying and reasoning.
"""

from rdflib import Graph, Namespace, RDF, OWL, Literal
from rdflib.namespace import RDFS, XSD

# -----------------------------
# Step 1: Create RDF Graph
# -----------------------------
graph = Graph()

EX = Namespace("http://example.org/ontology#")
graph.bind("ex", EX)
graph.bind("owl", OWL)

# -----------------------------
# Step 2: Define Ontology Classes
# -----------------------------
graph.add((EX.Expert, RDF.type, OWL.Class))
graph.add((EX.Skill, RDF.type, OWL.Class))

# -----------------------------
# Step 3: Define Properties
# -----------------------------
graph.add((EX.hasSkill, RDF.type, OWL.ObjectProperty))
graph.add((EX.hasExperience, RDF.type, OWL.DatatypeProperty))

graph.add((EX.hasSkill, RDFS.domain, EX.Expert))
graph.add((EX.hasSkill, RDFS.range, EX.Skill))
graph.add((EX.hasExperience, RDFS.domain, EX.Expert))
graph.add((EX.hasExperience, RDFS.range, XSD.integer))

# -----------------------------
# Step 4: Create Skill Hierarchy
# -----------------------------
graph.add((EX.MachineLearning, RDF.type, EX.Skill))
graph.add((EX.DeepLearning, RDF.type, EX.Skill))
graph.add((EX.DeepLearning, RDFS.subClassOf, EX.MachineLearning))

# -----------------------------
# Step 5: Add Expert Instances
# -----------------------------
experts = [
    ("Alice", EX.MachineLearning, 5),
    ("Bob", EX.DeepLearning, 7),
    ("Charlie", EX.MachineLearning, 3)
]

for name, skill, exp in experts:
    expert_uri = EX[name]
    graph.add((expert_uri, RDF.type, EX.Expert))
    graph.add((expert_uri, EX.hasSkill, skill))
    graph.add((expert_uri, EX.hasExperience, Literal(exp, datatype=XSD.integer)))

# -----------------------------
# Step 6: Domain Requirement
# -----------------------------
required_skill = EX.MachineLearning

# -----------------------------
# Step 7: SPARQL Query (Ontology-Based Matching)
# -----------------------------
query = f"""
PREFIX ex: <http://example.org/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?expert ?experience ?skill
WHERE {{
  ?expert a ex:Expert ;
          ex:hasSkill ?skill ;
          ex:hasExperience ?experience .
  
  ?skill rdfs:subClassOf* <{required_skill}> .
}}
"""

# -----------------------------
# Step 8: Execute Query
# -----------------------------
print("Domain Requirement: Machine Learning")
print("Matching Experts:")
print("-----------------------------")

for row in graph.query(query):
    name = row.expert.split("#")[-1]
    print(f"Expert Name: {name}, Experience: {row.experience} years")`;

const ALGORITHM_PSEUDOCODE = `Algorithm: Ontology-Based Expert Matching

Input: Query terms, Expert database, Domain ontology
Output: Ranked list of matching experts

1. QUERY EXPANSION:
   For each query term:
     a. Find concept in ontology
     b. Add parent concepts
     c. Add child concepts
     d. Add related concepts
     e. Add synonyms

2. EXPERT SCORING:
   For each expert:
     a. skill_match = |expert.skills abover expanded_query|
     b. skill_score = skill_match / |expanded_query|
     c. exp_score = min(experience / 10, 1.0)
     d. total = 0.6*skill + 0.4*exp

3. RANKING:
   Sort experts by total_score descending
   Filter experts with score > threshold

4. RETURN:
   Top-K matching experts with scores`;

export function ExpertMatchingLab() {
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
      experimentNumber={10}
      title="Domain Expert Matching"
      subtitle="Semantic Knowledge Representation and Retrieval"
      icon="Network"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Ontology', 'Semantic Web', 'Expert Systems', 'SPARQL']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To develop an <strong className="text-primary">ontology-based system</strong> that semantically matches domain
          queries with expert profiles using hierarchical knowledge representation and semantic similarity measures.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <HighlightItem icon="🎯" text="Implement knowledge representation" />
          <HighlightItem icon="🔍" text="Expert profile matching" />
          <HighlightItem icon="📈" text="Rank experts by relevance" />
          <HighlightItem icon="📂" text="Manage domain hierarchy" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is an Ontology?">
          <p className="mb-4">
            An <strong>ontology</strong> is a formal representation of knowledge as a set of concepts
            within a domain and the relationships between those concepts. It enables semantic
            reasoning and query expansion.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Semantic Matching">
          <p className="mb-4">
            Instead of exact keyword matching, semantic matching uses ontology relationships
            to find conceptually related terms:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <TermCard term="IS-A" definition="Hierarchical parent-child relationships" />
            <TermCard term="Related-To" definition="Associative relationships between concepts" />
            <TermCard term="Synonyms" definition="Alternative names for the same concept" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The expert matching process uses ontology traversal and weighted scoring:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Query Expansion</h4>
              <p className="text-muted-foreground">Enrich the search query by traversing the ontology to find parent concepts, child concepts, and synonyms.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Expert Scoring</h4>
              <p className="text-muted-foreground">Calculate the overlap between expert skills and the expanded query terms.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Weighting Strategy</h4>
              <p className="text-muted-foreground">Combine skill relevance (60%) and experience level (40%) into a final score.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Ranking & Filtering</h4>
              <p className="text-muted-foreground">Sort experts by their total score and filter out those below a minimum threshold.</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{ALGORITHM_PSEUDOCODE}</pre>
        </div>
      </SectionCard>

      {/* PROGRAM SECTION */}
      <SectionCard id="program" title="Program" icon="Code">
        <p className="text-muted-foreground mb-6">
          The following Python implementation demonstrates expert matching using rdflib and SPARQL:
        </p>
        <CodeBlock
          code={EXPERT_MATCHING_CODE}
          language="python"
          title="expert_matching.py"
        />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Enter domain keywords to visualize ontology traversal and expert ranking using
          semantic expansion.
        </p>
        <Card className="border border-muted shadow-sm">
          <CardContent className="p-6">
            <ExpertMatchingDemo />
          </CardContent>
        </Card>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <Badge variant="outline" className="mb-2">Beginner</Badge>
                <h4 className="font-semibold mb-2">Query Expansion</h4>
                <p className="text-sm text-muted-foreground">
                  Try different domain queries and observe how ontology expands them.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <Badge variant="outline" className="mb-2">Intermediate</Badge>
                <h4 className="font-semibold mb-2">Extend Ontology</h4>
                <p className="text-sm text-muted-foreground">
                  Add new domain concepts and relationships to the ontology.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <Badge variant="outline" className="mb-2">Advanced</Badge>
                <h4 className="font-semibold mb-2">OWL Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Use OWL format and reasoners for inference-based matching.
                </p>
              </CardContent>
            </Card>
          </div>
          <BeginnerChallenges />
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
