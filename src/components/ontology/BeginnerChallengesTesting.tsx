'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MCQ = {
  question: string;
  options: string[];
  correctIndex: number;
};

const QUESTIONS: MCQ[] = [
  {
    question: 'What does an ontology primarily represent?',
    options: [
      'A programming algorithm',
      'Structured knowledge and relationships',
      'A database table',
      'UI components',
    ],
    correctIndex: 1,
  },
  {
    question: 'Which RDF triple correctly represents an AI system having a test?',
    options: [
      'UnitTesting hasTest AISystem',
      'AISystem hasTest UnitTesting',
      'Accuracy hasMetric UnitTesting',
      'TestType rdf:type Metric',
    ],
    correctIndex: 1,
  },
  {
    question: 'Which class represents evaluation measures like Accuracy?',
    options: [
      'AISystem',
      'TestType',
      'Metric',
      'Ontology',
    ],
    correctIndex: 2,
  },
  {
    question: 'Why are ontologies useful in AI testing?',
    options: [
      'They increase model accuracy directly',
      'They provide structured and reusable knowledge',
      'They replace testing completely',
      'They generate datasets automatically',
    ],
    correctIndex: 1,
  },
];

export function BeginnerChallengesTesting() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Beginner Challenges (MCQs)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {QUESTIONS.map((q, i) => (
          <MCQItem key={i} index={i} data={q} />
        ))}
      </CardContent>
    </Card>
  );
}

/* ───────────────────────────────────────────── */

function MCQItem({
  index,
  data,
}: {
  index: number;
  data: MCQ;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="font-medium">
        {index + 1}. {data.question}
      </p>

      <div className="grid grid-cols-1 gap-2">
        {data.options.map((opt, idx) => {
          const isCorrect = idx === data.correctIndex;
          const isSelected = idx === selected;

          let variant: 'outline' | 'default' | 'destructive' = 'outline';

          if (selected !== null) {
            if (isSelected && isCorrect) variant = 'default';
            else if (isSelected && !isCorrect) variant = 'destructive';
          }

          return (
            <Button
              key={idx}
              variant={variant}
              className="justify-start"
              disabled={selected !== null}
              onClick={() => setSelected(idx)}
            >
              {opt}
              {selected !== null && isCorrect && (
                <Badge className="ml-2">Correct</Badge>
              )}
            </Button>
          );
        })}
      </div>

      {selected !== null && (
        <p className="text-sm">
          {selected === data.correctIndex ? (
            <span className="text-green-600">✔ Correct answer!</span>
          ) : (
            <span className="text-red-600">
              ❌ Incorrect. Correct answer:{" "}
              <strong>{data.options[data.correctIndex]}</strong>
            </span>
          )}
        </p>
      )}
    </div>
  );
}
