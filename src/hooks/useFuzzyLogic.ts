import { useState, useCallback } from 'react';

export type MembershipType = 'triangular' | 'trapezoidal' | 'gaussian';

export interface FuzzySet {
  name: string;
  type: MembershipType;
  params: number[]; // triangular: [a, b, c], trapezoidal: [a, b, c, d], gaussian: [mean, sigma]
  color: string;
}

export interface FuzzyRule {
  id: string;
  antecedent: { variable: string; set: string };
  consequent: { variable: string; set: string };
  weight: number;
}

export interface FuzzyState {
  inputValue: number;
  memberships: { setName: string; degree: number }[];
  firedRules: { ruleId: string; firingStrength: number }[];
  aggregatedOutput: { x: number; y: number }[];
  defuzzifiedValue: number;
}

// Membership function calculations
export function triangularMembership(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export function trapezoidalMembership(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

export function gaussianMembership(x: number, mean: number, sigma: number): number {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * sigma * sigma));
}

export function getMembership(x: number, set: FuzzySet): number {
  switch (set.type) {
    case 'triangular':
      return triangularMembership(x, set.params[0], set.params[1], set.params[2]);
    case 'trapezoidal':
      return trapezoidalMembership(x, set.params[0], set.params[1], set.params[2], set.params[3]);
    case 'gaussian':
      return gaussianMembership(x, set.params[0], set.params[1]);
    default:
      return 0;
  }
}

// Default fuzzy sets for temperature example
export const defaultInputSets: FuzzySet[] = [
  { name: 'Cold', type: 'triangular', params: [0, 0, 40], color: 'hsl(200, 80%, 50%)' },
  { name: 'Warm', type: 'triangular', params: [20, 50, 80], color: 'hsl(45, 80%, 50%)' },
  { name: 'Hot', type: 'triangular', params: [60, 100, 100], color: 'hsl(0, 80%, 50%)' },
];

export const defaultOutputSets: FuzzySet[] = [
  { name: 'Low', type: 'triangular', params: [0, 0, 50], color: 'hsl(200, 80%, 50%)' },
  { name: 'Medium', type: 'triangular', params: [25, 50, 75], color: 'hsl(45, 80%, 50%)' },
  { name: 'High', type: 'triangular', params: [50, 100, 100], color: 'hsl(0, 80%, 50%)' },
];

export const defaultRules: FuzzyRule[] = [
  { id: 'r1', antecedent: { variable: 'temperature', set: 'Cold' }, consequent: { variable: 'fanSpeed', set: 'Low' }, weight: 1 },
  { id: 'r2', antecedent: { variable: 'temperature', set: 'Warm' }, consequent: { variable: 'fanSpeed', set: 'Medium' }, weight: 1 },
  { id: 'r3', antecedent: { variable: 'temperature', set: 'Hot' }, consequent: { variable: 'fanSpeed', set: 'High' }, weight: 1 },
];

export function useFuzzyLogic() {
  const [inputSets, setInputSets] = useState<FuzzySet[]>(defaultInputSets);
  const [outputSets, setOutputSets] = useState<FuzzySet[]>(defaultOutputSets);
  const [rules, setRules] = useState<FuzzyRule[]>(defaultRules);
  const [state, setState] = useState<FuzzyState>({
    inputValue: 50,
    memberships: [],
    firedRules: [],
    aggregatedOutput: [],
    defuzzifiedValue: 0,
  });

  const evaluate = useCallback((inputValue: number) => {
    // Step 1: Fuzzification - calculate membership degrees
    const memberships = inputSets.map(set => ({
      setName: set.name,
      degree: getMembership(inputValue, set),
    }));

    // Step 2: Rule evaluation
    const firedRules = rules.map(rule => {
      const inputMembership = memberships.find(m => m.setName === rule.antecedent.set);
      return {
        ruleId: rule.id,
        firingStrength: (inputMembership?.degree || 0) * rule.weight,
      };
    });

    // Step 3: Aggregation - create output membership function
    const aggregatedOutput: { x: number; y: number }[] = [];
    for (let x = 0; x <= 100; x += 1) {
      let maxY = 0;
      for (let i = 0; i < rules.length; i++) {
        const outputSet = outputSets.find(s => s.name === rules[i].consequent.set);
        if (outputSet) {
          const outputMembership = getMembership(x, outputSet);
          const clipped = Math.min(firedRules[i].firingStrength, outputMembership);
          maxY = Math.max(maxY, clipped);
        }
      }
      aggregatedOutput.push({ x, y: maxY });
    }

    // Step 4: Defuzzification (centroid method)
    let numerator = 0;
    let denominator = 0;
    for (const point of aggregatedOutput) {
      numerator += point.x * point.y;
      denominator += point.y;
    }
    const defuzzifiedValue = denominator > 0 ? numerator / denominator : 50;

    setState({
      inputValue,
      memberships,
      firedRules,
      aggregatedOutput,
      defuzzifiedValue,
    });
  }, [inputSets, outputSets, rules]);

  const updateInputSet = useCallback((index: number, set: FuzzySet) => {
    setInputSets(prev => {
      const newSets = [...prev];
      newSets[index] = set;
      return newSets;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setInputSets(defaultInputSets);
    setOutputSets(defaultOutputSets);
    setRules(defaultRules);
    setState({
      inputValue: 50,
      memberships: [],
      firedRules: [],
      aggregatedOutput: [],
      defuzzifiedValue: 0,
    });
  }, []);

  return {
    inputSets,
    outputSets,
    rules,
    state,
    evaluate,
    updateInputSet,
    setInputSets,
    setOutputSets,
    resetToDefaults,
  };
}
