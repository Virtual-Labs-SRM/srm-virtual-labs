import { NLPState } from '@/hooks/useNLP';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface TokenizationDisplayProps {
  state: NLPState;
}

export function TokenizationDisplay({ state }: TokenizationDisplayProps) {
  const allSteps = [
    'Tokenization',
    'Lowercasing',
    'Punctuation Removal',
    'Stop Word Removal',
    'Stemming',
  ];

  return (
    <div className="space-y-4">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {allSteps.map((step, i) => {
          const isComplete = state.currentStep >= i;
          const isCurrent = state.currentStep === i;

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isComplete
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent && state.isProcessing ? 'animate-pulse' : ''}`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isCurrent && state.isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                <span className="whitespace-nowrap">{step}</span>
              </div>
              {i < allSteps.length - 1 && (
                <div className={`w-4 h-0.5 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Details */}
      {state.steps.length > 0 && state.currentStep >= 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">{state.steps[state.currentStep]?.step}</h4>
              <Badge variant="secondary" className="text-xs">
                Step {state.currentStep + 1} of 5
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {state.steps[state.currentStep]?.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.tokens.map((token, i) => (
                <span
                  key={`${token}-${i}`}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-mono animate-fade-in"
                >
                  {token}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Count */}
      {state.tokens.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total tokens:</span>
          <span className="font-mono font-medium">{state.tokens.length}</span>
        </div>
      )}

      {/* Completion */}
      {state.isComplete && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Preprocessing Complete!</p>
            <p className="text-sm text-muted-foreground">
              {state.originalText.split(/\s+/).length} words → {state.tokens.length} tokens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
