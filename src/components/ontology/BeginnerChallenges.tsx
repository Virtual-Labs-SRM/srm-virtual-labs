'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Brain } from 'lucide-react';

type Question = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'In an ontology graph, what does a parent → child relationship represent?',
    options: [
      'Two unrelated concepts',
      'A synonym relationship',
      'A specialization (IS-A relationship)',
      'An expert recommendation',
    ],
    correctIndex: 2,
    explanation:
      'Parent → child represents an IS-A relationship, e.g., Machine Learning → Deep Learning.',
  },
  {
    id: 2,
    question: 'Why does the system visit child concepts after the starting concept?',
    options: [
      'To increase graph size',
      'Because DFS explores deeper semantic relationships',
      'To randomize traversal',
      'To prioritize experts',
    ],
    correctIndex: 1,
    explanation:
      'DFS explores deeper nodes first, allowing the system to discover related concepts semantically.',
  },
  {
    id: 3,
    question: 'An expert is ranked higher mainly because:',
    options: [
      'Their name matches the query',
      'They appear earlier in the graph',
      'Their skills match visited ontology concepts and they have higher experience',
      'They belong to the root concept',
    ],
    correctIndex: 2,
    explanation:
      'Expert ranking is based on semantic skill matches and experience, not position or name.',
  },
  {
    id: 4,
    question:
      'True or False: Ontology-based matching can find experts even without exact keyword matches.',
    options: ['True', 'False'],
    correctIndex: 0,
    explanation:
      'Ontology expansion allows matching through related and hierarchical concepts.',
  },
];

export function BeginnerChallenges() {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleSelect = (qid: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [qid]: optionIndex }));
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4" />
          Beginner Self-Check Challenges
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {QUESTIONS.map(q => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctIndex;

          return (
            <div key={q.id} className="border rounded-lg p-4 space-y-3">
              <p className="font-medium text-sm">
                {q.id}. {q.question}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const selected = userAnswer === idx;
                  const correct = idx === q.correctIndex;

                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      className={`w-full justify-start text-sm ${
                        selected
                          ? correct
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : ''
                      }`}
                      onClick={() => handleSelect(q.id, idx)}
                    >
                      <span className="mr-2">
                        {selected &&
                          (correct ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ))}
                      </span>
                      {opt}
                    </Button>
                  );
                })}
              </div>

              {userAnswer !== undefined && (
                <div className="text-xs mt-2">
                  <Badge variant={isCorrect ? 'default' : 'destructive'}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                  <p className="text-muted-foreground mt-1">
                    💡 {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
