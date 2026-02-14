import { useState, useEffect, useCallback } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useFuzzyLogic, MembershipType } from '@/hooks/useFuzzyLogic';
import { MembershipFunctionCanvas } from '@/components/fuzzy/MembershipFunctionCanvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FUZZY_CODE = `import numpy as np

def triangular_mf(x, a, b, c):
    """Triangular membership function."""
    if x <= a or x >= c:
        return 0
    elif x <= b:
        return (x - a) / (b - a)
    else:
        return (c - x) / (c - b)

def trapezoidal_mf(x, a, b, c, d):
    """Trapezoidal membership function."""
    if x <= a or x >= d:
        return 0
    elif x >= b and x <= c:
        return 1
    elif x < b:
        return (x - a) / (b - a)
    else:
        return (d - x) / (d - c)

def gaussian_mf(x, mean, sigma):
    """Gaussian membership function."""
    return np.exp(-((x - mean) ** 2) / (2 * sigma ** 2))

# Example: Temperature fuzzy sets
x = np.linspace(0, 100, 100)

# Cold: triangular(0, 0, 40)
cold = [triangular_mf(xi, 0, 0, 40) for xi in x]

# Warm: triangular(20, 50, 80)
warm = [triangular_mf(xi, 20, 50, 80) for xi in x]

# Hot: triangular(60, 100, 100)
hot = [triangular_mf(xi, 60, 100, 100) for xi in x]

# Get membership for input value
input_temp = 65
print(f"Temperature: {input_temp}°C")
print(f"Cold: {triangular_mf(input_temp, 0, 0, 40):.2f}")
print(f"Warm: {triangular_mf(input_temp, 20, 50, 80):.2f}")
print(f"Hot: {triangular_mf(input_temp, 60, 100, 100):.2f}")`;

const ALGORITHM_PSEUDOCODE = `function TRIANGULAR(x, a, b, c):
    IF x ≤ a OR x ≥ c: RETURN 0
    IF x ≤ b: RETURN (x - a) / (b - a)
    ELSE: RETURN (c - x) / (c - b)

function GAUSSIAN(x, mean, σ):
    RETURN e^(-((x - mean)² / (2σ²)))

function FUZZIFY(crisp_value, fuzzy_sets):
    memberships = {}
    FOR each set in fuzzy_sets:
        memberships[set.name] = set.mf(crisp_value)
    RETURN memberships`;

export function FuzzySetsLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const { inputSets, state, evaluate, setInputSets } = useFuzzyLogic();
  const [inputValue, setInputValue] = useState(50);
  const [selectedType, setSelectedType] = useState<MembershipType>('triangular');

  useEffect(() => {
    evaluate(inputValue);
  }, [inputValue, evaluate, inputSets]);

  const handleTypeChange = useCallback((type: MembershipType) => {
    setSelectedType(type);
    const newSets = inputSets.map((set, i) => {
      if (type === 'triangular') {
        const centers = [0, 50, 100];
        return { ...set, type, params: [centers[i] - 20, centers[i], centers[i] + 20] };
      } else if (type === 'trapezoidal') {
        const centers = [0, 50, 100];
        return { ...set, type, params: [centers[i] - 25, centers[i] - 10, centers[i] + 10, centers[i] + 25] };
      } else {
        const centers = [20, 50, 80];
        return { ...set, type, params: [centers[i], 15] };
      }
    });
    setInputSets(newSets);
  }, [inputSets, setInputSets]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={4}
      title="Fuzzy Sets & Membership Functions"
      subtitle="Define and visualize fuzzy sets with different membership functions"
      icon="Activity"
      duration="~30 minutes"
      difficulty="Beginner"
      tags={['Fuzzy Logic', 'Membership Functions', 'Fuzzification']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand <strong className="text-primary">fuzzy sets</strong> and <strong className="text-primary">membership functions</strong>,
          which form the foundation of fuzzy logic systems.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="📊" text="Learn fuzzy vs crisp sets" />
          <HighlightItem icon="📈" text="Explore membership functions" />
          <HighlightItem icon="🔢" text="Calculate membership degrees" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Fuzzy Sets vs Crisp Sets">
          <p className="mb-4">
            Unlike <strong>classical (crisp) sets</strong> where an element either belongs (1) or doesn't (0),
            <strong> fuzzy sets</strong> allow <strong>partial membership</strong> with degrees between 0 and 1.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Crisp Set</h4>
                <p className="text-sm text-muted-foreground">
                  "Is 25°C hot?" → Either YES (1) or NO (0)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Fuzzy Set</h4>
                <p className="text-sm text-muted-foreground">
                  "Is 25°C hot?" → Partially: 0.3 hot, 0.7 warm
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Membership Functions">
          <p className="mb-4">
            A <strong>membership function</strong> μ(x) defines how each point in the input space
            is mapped to a membership degree between 0 and 1.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Triangular</h4>
                <p className="text-sm text-muted-foreground">
                  Defined by three points (a, b, c). Peaks at b with value 1.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Trapezoidal</h4>
                <p className="text-sm text-muted-foreground">
                  Four points (a, b, c, d). Flat top between b and c.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Gaussian</h4>
                <p className="text-sm text-muted-foreground">
                  Bell curve defined by mean and standard deviation.
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="Universe" definition="Range of possible input values" />
            <TermCard term="Linguistic Variable" definition="Variable described by words (Cold, Warm, Hot)" />
            <TermCard term="Fuzzification" definition="Converting crisp input to fuzzy membership" />
            <TermCard term="Support" definition="Set of values with non-zero membership" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          Calculating membership degrees for different function types:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Define Fuzzy Sets</h4>
              <p className="text-muted-foreground">Choose membership function type and parameters for each linguistic term</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Input Crisp Value</h4>
              <p className="text-muted-foreground">Receive a precise numerical input value</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Calculate Membership</h4>
              <p className="text-muted-foreground">Apply membership function to get degree for each fuzzy set</p>
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
          Python implementation of common membership functions.
        </p>
        <CodeBlock code={FUZZY_CODE} language="python" title="membership_functions.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Explore how different input values result in different membership degrees across fuzzy sets.
        </p>

        {/* Graph at top - full width */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <MembershipFunctionCanvas
              sets={inputSets}
              inputValue={inputValue}
              title="Temperature Membership Functions"
              showInput={true}
            />
          </CardContent>
        </Card>

        {/* Controls and info below - horizontal layout */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                <Label>Input Value (Temperature)</Label>
                <Slider
                  value={[inputValue]}
                  onValueChange={([v]) => setInputValue(v)}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">{inputValue}</span>
                  <span className="text-muted-foreground ml-1">°C</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Membership Function Type</Label>
                <Select value={selectedType} onValueChange={(v) => handleTypeChange(v as MembershipType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triangular">Triangular</SelectItem>
                    <SelectItem value="trapezoidal">Trapezoidal</SelectItem>
                    <SelectItem value="gaussian">Gaussian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-medium">Membership Degrees</h4>
              {state.memberships.map(m => (
                <div key={m.setName} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <span className="font-medium">{m.setName}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${m.degree * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm w-12 text-right">{m.degree.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30 mt-6">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Understanding Fuzzy Sets</h4>
            <p className="text-sm text-muted-foreground">
              Unlike classical sets where an element either belongs (1) or doesn't (0), fuzzy sets
              allow <strong>partial membership</strong>. The membership degree ranges from 0 to 1,
              representing "how much" an element belongs to a set. Try different input values to
              see how a single temperature can partially belong to multiple categories!
            </p>
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
              <h4 className="font-semibold mb-2">Exercise: Overlapping Regions</h4>
              <p className="text-sm text-muted-foreground">
                Find input values where exactly two fuzzy sets have non-zero membership.
                What is the sum of their memberships?
              </p>
              <Badge variant="outline" className="mt-2">Beginner</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise: Compare Function Types</h4>
              <p className="text-sm text-muted-foreground">
                Switch between triangular, trapezoidal, and Gaussian functions.
                How do the membership values differ for the same input?
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
