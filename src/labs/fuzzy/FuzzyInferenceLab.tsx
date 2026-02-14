import { useState, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useFuzzyLogic } from '@/hooks/useFuzzyLogic';
import { MembershipFunctionCanvas } from '@/components/fuzzy/MembershipFunctionCanvas';
import { FuzzyInferenceDisplay } from '@/components/fuzzy/FuzzyInferenceDisplay';

const MAMDANI_CODE = `import numpy as np

def mamdani_inference(input_val, input_sets, output_sets, rules):
    """
    Mamdani Fuzzy Inference System.
    
    Args:
        input_val: Input value
        input_sets: List of input membership functions
        output_sets: List of output membership functions
        rules: List of (input_set_idx, output_set_idx) pairs
    
    Returns:
        Defuzzified output value
    """
    # Step 1: Fuzzification
    input_memberships = [mf(input_val) for mf in input_sets]
    
    # Step 2: Rule evaluation
    rule_strengths = []
    for input_idx, output_idx in rules:
        strength = input_memberships[input_idx]
        rule_strengths.append((output_idx, strength))
    
    # Step 3: Aggregation (maximum)
    x = np.linspace(0, 100, 100)
    aggregated = np.zeros_like(x)
    
    for output_idx, strength in rule_strengths:
        output_mf = output_sets[output_idx]
        clipped = np.minimum(strength, [output_mf(xi) for xi in x])
        aggregated = np.maximum(aggregated, clipped)
    
    # Step 4: Defuzzification (centroid)
    if np.sum(aggregated) == 0:
        return 50  # Default
    return np.sum(x * aggregated) / np.sum(aggregated)

# Example: Fan speed control
def triangular(a, b, c):
    return lambda x: max(0, min((x-a)/(b-a), (c-x)/(c-b))) if b != a and c != b else 0

# Temperature inputs
cold = triangular(0, 0, 40)
warm = triangular(20, 50, 80)
hot = triangular(60, 100, 100)

# Fan speed outputs
low = triangular(0, 0, 50)
medium = triangular(25, 50, 75)
high = triangular(50, 100, 100)

# Rules: IF Cold THEN Low, IF Warm THEN Medium, IF Hot THEN High
rules = [(0, 0), (1, 1), (2, 2)]

result = mamdani_inference(65, [cold, warm, hot], [low, medium, high], rules)
print(f"Temperature: 65°C -> Fan Speed: {result:.1f}%")`;

const ALGORITHM_PSEUDOCODE = `function MAMDANI_INFERENCE(input, rules):
    // 1. Fuzzification
    FOR each input_set:
        μ[set] = membership(input, set)
    
    // 2. Rule Evaluation
    FOR each rule "IF A THEN B":
        strength[rule] = μ[A]
        clipped_B = MIN(strength[rule], B)
    
    // 3. Aggregation
    aggregated = MAX(all clipped outputs)
    
    // 4. Defuzzification (Centroid)
    output = Σ(x · μ(x)) / Σ(μ(x))
    RETURN output`;

export function FuzzyInferenceLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const { inputSets, outputSets, rules, state, evaluate } = useFuzzyLogic();
  const [inputValue, setInputValue] = useState(50);

  useEffect(() => {
    evaluate(inputValue);
  }, [inputValue, evaluate]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={5}
      title="Fuzzy Inference Systems (Mamdani)"
      subtitle="Build and simulate Mamdani-type fuzzy inference systems"
      icon="Workflow"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Fuzzy Logic', 'Mamdani', 'Inference']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand and implement the <strong className="text-primary">Mamdani Fuzzy Inference System</strong>,
          the most common type of fuzzy inference used in control systems and decision making.
        </p>
        <div className="grid sm:grid-cols-4 gap-4">
          <HighlightItem icon="📥" text="Fuzzification process" />
          <HighlightItem icon="📜" text="Rule evaluation" />
          <HighlightItem icon="🔗" text="Output aggregation" />
          <HighlightItem icon="📤" text="Defuzzification methods" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Mamdani FIS Architecture">
          <p className="mb-4">
            The <strong>Mamdani Fuzzy Inference System</strong> is the most common type of FIS.
            It uses fuzzy rules of the form "IF input IS A THEN output IS B" where both A and B
            are fuzzy sets.
          </p>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-center font-mono">
              IF Temperature IS Hot THEN Fan_Speed IS High
            </p>
          </div>
        </TheoryBlock>

        <TheoryBlock title="The Four Steps">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">1. Fuzzification</h4>
                <p className="text-sm text-muted-foreground">
                  Convert crisp input values to fuzzy membership degrees
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">2. Rule Evaluation</h4>
                <p className="text-sm text-muted-foreground">
                  Apply fuzzy rules and calculate firing strengths
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">3. Aggregation</h4>
                <p className="text-sm text-muted-foreground">
                  Combine all rule outputs (typically using MAX)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">4. Defuzzification</h4>
                <p className="text-sm text-muted-foreground">
                  Convert fuzzy output to crisp value (centroid method)
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Defuzzification Methods">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Centroid (CoG)</h4>
                <p className="text-sm text-muted-foreground">
                  Center of gravity of the aggregated output. Most commonly used.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Mean of Maximum</h4>
                <p className="text-sm text-muted-foreground">
                  Average of all points with maximum membership.
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="Antecedent" definition="The IF part of a rule" />
            <TermCard term="Consequent" definition="The THEN part of a rule" />
            <TermCard term="Firing Strength" definition="Degree to which a rule is activated" />
            <TermCard term="Implication" definition="How rule strength affects output" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The Mamdani inference process follows these steps:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Fuzzification</h4>
              <p className="text-muted-foreground">Convert crisp input to fuzzy memberships using input membership functions</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Rule Evaluation</h4>
              <p className="text-muted-foreground">Apply fuzzy rules, clip outputs by firing strength</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Aggregation</h4>
              <p className="text-muted-foreground">Combine all clipped outputs using maximum operation</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Defuzzification</h4>
              <p className="text-muted-foreground">Convert fuzzy output to crisp value using centroid method</p>
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
          Python implementation of the Mamdani Fuzzy Inference System.
        </p>
        <CodeBlock code={MAMDANI_CODE} language="python" title="mamdani_fis.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Adjust the input temperature and watch how the fuzzy inference system calculates the output fan speed.
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <Label>Input: Temperature (°C)</Label>
                <Slider
                  value={[inputValue]}
                  onValueChange={([v]) => setInputValue(v)}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">{inputValue}</span>
                  <span className="text-muted-foreground ml-1">°C</span>
                </div>
              </div>
              <MembershipFunctionCanvas
                sets={inputSets}
                inputValue={inputValue}
                title="Input: Temperature"
                showInput={true}
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-center py-2">
                <span className="text-muted-foreground">Output: Fan Speed</span>
                <div className="text-3xl font-bold text-secondary mt-1">
                  {state.defuzzifiedValue.toFixed(1)}%
                </div>
              </div>
              <MembershipFunctionCanvas
                sets={outputSets}
                inputValue={state.defuzzifiedValue}
                title="Output: Fan Speed"
                showInput={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Inference Steps */}
        <FuzzyInferenceDisplay state={state} rules={rules} />

        <Card className="bg-muted/30 mt-6">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Mamdani Inference Process</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li><strong>Fuzzification</strong>: Convert crisp input to fuzzy memberships</li>
              <li><strong>Rule Evaluation</strong>: Apply fuzzy rules, clip outputs by firing strength</li>
              <li><strong>Aggregation</strong>: Combine all clipped outputs (maximum)</li>
              <li><strong>Defuzzification</strong>: Convert fuzzy output to crisp value (centroid)</li>
            </ol>
          </CardContent>
        </Card>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding with these exercises.
        </p>
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise: Boundary Behavior</h4>
              <p className="text-sm text-muted-foreground">
                Test extreme input values (0, 50, 100). How does the output change?
                What happens when only one rule fires?
              </p>
              <Badge variant="outline" className="mt-2">Beginner</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise: Rule Activation</h4>
              <p className="text-sm text-muted-foreground">
                Find an input value where all three rules fire. What is the resulting output?
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
