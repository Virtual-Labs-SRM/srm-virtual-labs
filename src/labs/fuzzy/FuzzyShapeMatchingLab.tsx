
import { useState } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, HighlightItem, TheoryBlock, TermCard } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Play, Target, BookOpen, Cog, Code, Pencil } from 'lucide-react';
import { FuzzyPlayground } from '@/components/fuzzy/playground/FuzzyPlayground';

const FUZZY_CODE = `# Simple Fuzzy Set Implementation in Python

class FuzzySet:
    def __init__(self, name, points):
        self.name = name
        self.points = points  # List of (x, membership) tuples
        
    def get_membership(self, x):
        # Linear interpolation between points
        for i in range(len(self.points) - 1):
            x1, y1 = self.points[i]
            x2, y2 = self.points[i+1]
            
            if x1 <= x <= x2:
                if x1 == x2: return y1
                slope = (y2 - y1) / (x2 - x1)
                return y1 + slope * (x - x1)
                
        return 0.0

# Define shapes as fuzzy sets based on 'Roundness'
# Roundness: 0=Square, 1=Circle
circle = FuzzySet("Circle", [(0.7, 0), (1.0, 1)])
square = FuzzySet("Square", [(0, 1), (0.3, 0)])

# Test a shape with roundness 0.85
shape_roundness = 0.85
print(f"Circle Membership: {circle.get_membership(shape_roundness)}")
# Output: Circle Membership: 0.5
`;

const ALGORITHM_PSEUDOCODE = `Algorithm: Fuzzy Pattern Matching

1. INPUT PREPROCESSING:
   a. Capture 28x28 pixel grid from canvas.
   b. Find bounding box of the drawn digit.
   c. Center the digit by center-of-mass.
   d. Scale to fit 20x20 box (preserving aspect ratio).

2. FUZZIFICATION:
   a. Convert pixel intensity (0-255) to fuzzy membership values [0, 1].
   b. Apply morphological dilation to thicken thin strokes.

3. INFERENCE (TEMPLATE MATCHING):
   For each Digit Template (0-9):
     a. Calculate Intersection (Min(Input, Template)).
     b. Calculate Union (Max(Input, Template)).
     c. Compute Jaccard Similarity = Intersection / Union.
     d. Store similarity score.

4. DEFUZZIFICATION:
   a. Select the digit with the highest similarity score.
   b. If score < Threshold, return "Unknown".
   c. Else, return Predicted Digit.
`;

export function FuzzyShapeMatchingLab() {
  const activeSection = 'demo'; // Default to demo for testing if needed, or stick to state

  const [currentSection, setCurrentSection] = useState('aim');

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={4}
      title="Fuzzy Logic Pattern Recognition"
      subtitle="Handwritten digit recognition using fuzzy set theory"
      icon="Scan"
      duration="~30 minutes"
      difficulty="Intermediate"
      tags={['Fuzzy Logic', 'Computer Vision', 'Pattern Recognition']}
      activeSection={currentSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To implement a <strong className="text-primary">Fuzzy Logic-based Pattern Recognition</strong> system
          capable of identifying handwritten digits (0-9) by comparing input shapes against fuzzy templates.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="✍️" text="Digit Recognition" />
          <HighlightItem icon="🧩" text="Template Matching" />
          <HighlightItem icon="🧠" text="Fuzzy Inference" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Fuzzy Pattern Matching">
          <p className="mb-4">
            Unlike classical pattern matching which looks for exact pixel matches, <strong>Fuzzy Pattern Matching</strong> allows for degrees of similarity.
            A handwritten '3' is never identical to the template, but it has a high "degree of membership" in the set of "Shapes that look like 3".
          </p>
        </TheoryBlock>

        <TheoryBlock title="Jaccard Similarity">
          <p className="text-sm text-muted-foreground mb-2">
            The similarity between the input set <span className="font-mono">A</span> and template set <span className="font-mono">B</span> is calculated as:
          </p>
          <div className="bg-muted p-3 rounded text-center font-mono text-sm">
            J(A, B) = |A ∩ B| / |A ∪ B|
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Where collision (intersection) adds to the score, and total area (union) normalizes it.
          </p>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The recognition pipeline consists of four distinct stages: Preprocessing, Fuzzification, Inference, and Defuzzification.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Preprocessing & Fuzzification</h4>
              <p className="text-muted-foreground">Capture canvas input, normalize size/position, and convert pixels to fuzzy membership values.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Template Comparison</h4>
              <p className="text-muted-foreground">Compare the normalized input against pre-defined ideal templates for digits 0-9.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Similarity Calculation</h4>
              <p className="text-muted-foreground">Compute Jaccard Similarity score for each template to determine the best match.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Defuzzification</h4>
              <p className="text-muted-foreground">Select the digit with the highest confidence score as the final prediction.</p>
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
          A simplified Python example showing how shapes can be represented as Fuzzy Sets.
        </p>
        <CodeBlock code={FUZZY_CODE} language="python" title="fuzzy_shapes.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <div className="mb-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            System Online: Neural-Fuzzy Hybrid
          </Badge>
        </div>
        <FuzzyPlayground />
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Challenge 1</Badge>
                <Badge variant="outline">Robustness</Badge>
              </div>
              <h4 className="font-semibold mb-2">Noise Tolerance</h4>
              <p className="text-sm text-muted-foreground">
                Modify the algorithm to ignore small stray marks or "salt-and-pepper" noise in the input grid.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Challenge 2</Badge>
                <Badge variant="outline">Optimization</Badge>
              </div>
              <h4 className="font-semibold mb-2">Adaptive Thresholding</h4>
              <p className="text-sm text-muted-foreground">
                Implement dynamic thresholding where the confidence required changes based on the ambiguity of the digit.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
