import { useState } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useNLP } from '@/hooks/useNLP';
import { TokenizationDisplay } from '@/components/nlp/TokenizationDisplay';
import { Play, RotateCcw } from 'lucide-react';

const TOKENIZATION_CODE = `import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

def preprocess_text(text):
    """
    Complete text preprocessing pipeline.
    
    Steps:
    1. Tokenization
    2. Lowercasing
    3. Punctuation removal
    4. Stop word removal
    5. Stemming
    """
    # Step 1: Tokenization
    tokens = text.split()
    print(f"After tokenization: {tokens}")
    
    # Step 2: Lowercasing
    tokens = [t.lower() for t in tokens]
    print(f"After lowercasing: {tokens}")
    
    # Step 3: Remove punctuation
    tokens = [re.sub(r'[^\\w]', '', t) for t in tokens]
    tokens = [t for t in tokens if t]
    print(f"After punctuation removal: {tokens}")
    
    # Step 4: Remove stop words
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    print(f"After stop word removal: {tokens}")
    
    # Step 5: Stemming
    stemmer = PorterStemmer()
    tokens = [stemmer.stem(t) for t in tokens]
    print(f"After stemming: {tokens}")
    
    return tokens

# Example
text = "The quick brown foxes are jumping over the lazy dogs!"
result = preprocess_text(text)
print(f"\\nFinal result: {result}")`;

const SAMPLE_TEXTS = [
  "The quick brown foxes are jumping over the lazy dogs!",
  "Natural Language Processing enables computers to understand human language.",
  "Machine learning algorithms can learn patterns from data automatically.",
];

const ALGORITHM_PSEUDOCODE = `function PREPROCESS(text):
    tokens = SPLIT(text, whitespace)
    tokens = LOWERCASE(tokens)
    tokens = REMOVE_PUNCTUATION(tokens)
    tokens = FILTER(tokens, NOT in STOP_WORDS)
    tokens = STEM(tokens)
    RETURN tokens`;

export function TextPreprocessingLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const [text, setText] = useState(SAMPLE_TEXTS[0]);
  const [speed, setSpeed] = useState(1);
  const { state, processText, reset } = useNLP();

  const handleProcess = () => {
    if (text.trim()) {
      processText(text, speed);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={6}
      title="Text Preprocessing & Tokenization"
      subtitle="Clean, normalize, and tokenize text data for NLP tasks"
      icon="FileText"
      duration="~30 minutes"
      difficulty="Beginner"
      tags={['NLP', 'Text Processing', 'Tokenization']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand and implement <strong className="text-primary">text preprocessing</strong> techniques
          including tokenization, normalization, stop word removal, and stemming.
        </p>
        <div className="grid sm:grid-cols-4 gap-4">
          <HighlightItem icon="✂️" text="Tokenization" />
          <HighlightItem icon="🔤" text="Normalization" />
          <HighlightItem icon="🚫" text="Stop word removal" />
          <HighlightItem icon="🌱" text="Stemming" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Why Preprocess Text?">
          <p className="mb-4">
            Raw text is noisy and inconsistent. <strong>Preprocessing</strong> transforms
            text into a clean, normalized format that machine learning models can process
            effectively.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Key Preprocessing Steps">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold">Tokenization</h4>
                <p className="text-sm text-muted-foreground">
                  Breaking text into individual units (words, sentences, or subwords).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold">Stop Word Removal</h4>
                <p className="text-sm text-muted-foreground">
                  Removing common words (the, is, at) that carry little meaning.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold">Stemming / Lemmatization</h4>
                <p className="text-sm text-muted-foreground">
                  Reducing words to their root form (running → run).
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="Token" definition="Individual unit of text (word, subword)" />
            <TermCard term="Stop Words" definition="Common words with little meaning" />
            <TermCard term="Stem" definition="Root form of a word" />
            <TermCard term="Lemma" definition="Dictionary form of a word" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The text preprocessing pipeline follows these sequential steps:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Tokenization</h4>
              <p className="text-muted-foreground">Split text into individual words/tokens</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Lowercasing</h4>
              <p className="text-muted-foreground">Convert all characters to lowercase</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Punctuation Removal</h4>
              <p className="text-muted-foreground">Remove special characters and punctuation</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Stop Word Removal</h4>
              <p className="text-muted-foreground">Filter out common words with little meaning</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">5</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Stemming</h4>
              <p className="text-muted-foreground">Reduce words to their root form</p>
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
          Python implementation of the text preprocessing pipeline.
        </p>
        <CodeBlock code={TOKENIZATION_CODE} language="python" title="text_preprocessing.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Enter text and watch the preprocessing pipeline transform it step by step.
        </p>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <Label>Input Text</Label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to preprocess..."
                  className="min-h-[120px] font-mono"
                  disabled={state.isProcessing}
                />
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEXTS.map((sample, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setText(sample)}
                      disabled={state.isProcessing}
                      className="text-xs"
                    >
                      Sample {i + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <TokenizationDisplay state={state} />
          </div>

          <Card>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Animation Speed</Label>
                  <span className="text-sm text-muted-foreground font-mono">{speed.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={0.5}
                  max={3}
                  step={0.5}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleProcess}
                  disabled={state.isProcessing || !text.trim()}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Process
                </Button>

                <Button onClick={reset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">Pipeline Steps</h4>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    <li>1. <strong>Tokenization</strong>: Split into words</li>
                    <li>2. <strong>Lowercasing</strong>: Normalize case</li>
                    <li>3. <strong>Punctuation</strong>: Remove symbols</li>
                    <li>4. <strong>Stop words</strong>: Remove common words</li>
                    <li>5. <strong>Stemming</strong>: Reduce to root form</li>
                  </ol>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding with these exercises.
        </p>
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise: Custom Text</h4>
              <p className="text-sm text-muted-foreground">
                Enter your own sentence and observe how each preprocessing step transforms it.
                Try text with punctuation, numbers, and mixed case.
              </p>
              <Badge variant="outline" className="mt-2">Beginner</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise: Stop Word Analysis</h4>
              <p className="text-sm text-muted-foreground">
                What percentage of words are removed as stop words?
                Does this vary by text type?
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
