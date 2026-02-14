import { useState, useMemo, useRef, useEffect } from 'react';
import { VectorSpaceExplorer } from './VectorSpaceExplorer';
import { ConfusionMatrixBuilder } from './ConfusionMatrixBuilder';
import { LearningCurve } from './LearningCurve';
import { AttentionHeatmap } from './AttentionHeatmap';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentSection } from '@/components/lab/ContentSection';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { FileSearch, CheckCircle2, AlertTriangle, ScanText, X, Upload, Workflow, Settings2, Search, Code2, SkipBack, SkipForward, Pause, Play, RotateCcw, StepForward, StepBack } from 'lucide-react';
import * as mammoth from 'mammoth';

const PLAGIARISM_CODE = `"""
Plagiarism Detector using Text Similarity Analysis

This implementation uses TF-IDF and Cosine Similarity
to identify text similarity and calculate plagiarism percentage.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from collections import Counter

class PlagiarismDetector:
    """
    Detect plagiarism by comparing text documents using
    various similarity metrics.
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            ngram_range=(1, 3),  # Unigrams to trigrams
            max_features=5000
        )
    
    def preprocess(self, text):
        """
        Clean and normalize text.
        """
        # Convert to lowercase
        # Calculate plagiarism percentage (weighted average)
        plagiarism_score = (0.7 * cosine_sim + 0.3 * jaccard_sim) * 100
        
        # Determine severity
        if plagiarism_score >= 80:
            severity = "HIGH"
        elif plagiarism_score >= 50:
            severity = "MEDIUM"
        elif plagiarism_score >= 20:
            severity = "LOW"
        else:
            severity = "MINIMAL"
        
        return {
            'plagiarism_percentage': plagiarism_score,
            'cosine_similarity': cosine_sim * 100,
            'jaccard_similarity': jaccard_sim * 100,
            'matching_sentences': len(matches),
            'matches': matches,
            'severity': severity
        }


# Example usage
if __name__ == "__main__":
    detector = PlagiarismDetector()
    
    original = """
    Machine learning is a subset of artificial intelligence that enables 
    systems to learn and improve from experience without being explicitly 
    programmed. It focuses on developing computer programs that can access 
    data and use it to learn for themselves.
    """
    
    submitted = """
    Machine learning is a branch of artificial intelligence that allows 
    systems to learn and improve from experience without explicit programming. 
    It focuses on creating computer programs that access data and learn 
    independently.
    """
    
    result = detector.detect_plagiarism(original, submitted)
    
    print(f"Plagiarism Percentage: {result['plagiarism_percentage']:.1f}%")
    print(f"Severity: {result['severity']}")
    print(f"Matching Sentences: {result['matching_sentences']}")`;

function calculateSimilarity(text1: string, text2: string): {
  cosineSim: number;
  jaccardSim: number;
  matchingWords: string[];
  uniqueWords1: string[];
  uniqueWords2: string[];
} {
  const preprocess = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);

  const words1 = new Set(preprocess(text1));
  const words2 = new Set(preprocess(text2));

  const intersection = [...words1].filter(w => words2.has(w));
  const union = new Set([...words1, ...words2]);

  const jaccardSim = intersection.length / union.size;

  // Simplified TF-IDF-like cosine similarity
  const allWords = [...union];
  const vec1 = allWords.map(w => words1.has(w) ? 1 : 0);
  const vec2 = allWords.map(w => words2.has(w) ? 1 : 0);

  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

  const cosineSim = mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;

  return {
    cosineSim,
    jaccardSim,
    matchingWords: intersection,
    uniqueWords1: [...words1].filter(w => !words2.has(w)),
    uniqueWords2: [...words2].filter(w => !words1.has(w)),
  };
}


// Re-implemented Algorithm Workflow Component
type AlgorithmType = 'cosine' | 'jaccard' | 'bert';

interface PlagiarismWorkflowProps {
  originalText?: string;
  submittedText?: string;
  onClose?: () => void;
  inline?: boolean;
}

// Step definitions per algorithm
const COSINE_STEPS = [
  { id: 'init', label: 'Initialize', description: 'Load documents for comparison' },
  { id: 'preprocess', label: 'Preprocessing', description: 'Clean and normalize text' },
  { id: 'tokenize', label: 'Tokenization', description: 'Split text into word tokens' },
  { id: 'vectorize', label: 'TF-IDF Vectorization', description: 'Convert tokens to numerical vectors' },
  { id: 'compute', label: 'Cosine Similarity', description: 'Calculate cos(θ) between vectors' },
  { id: 'result', label: 'Result', description: 'Final similarity score' },
];

const JACCARD_STEPS = [
  { id: 'init', label: 'Initialize', description: 'Load documents for comparison' },
  { id: 'preprocess', label: 'Preprocessing', description: 'Clean and normalize text' },
  { id: 'tokenize', label: 'Build Sets', description: 'Create unique word sets from each document' },
  { id: 'intersect', label: 'Intersection ∩', description: 'Find common words between sets' },
  { id: 'union', label: 'Union ∪', description: 'Combine all unique words' },
  { id: 'result', label: 'Result', description: 'Jaccard Index = |A∩B| / |A∪B|' },
];

const BERT_STEPS = [
  { id: 'init', label: 'Initialize', description: 'Load documents for comparison' },
  { id: 'preprocess', label: 'Preprocessing', description: 'Clean and normalize text' },
  { id: 'encode', label: 'BERT Encoding', description: 'Generate 768-dim embeddings via transformer' },
  { id: 'pool', label: 'Mean Pooling', description: 'Compress token embeddings to sentence vector' },
  { id: 'compute', label: 'Cosine on Embeddings', description: 'Compare sentence-level vectors' },
  { id: 'result', label: 'Result', description: 'Semantic similarity score' },
];

const ALGO_STEPS: Record<AlgorithmType, typeof COSINE_STEPS> = {
  cosine: COSINE_STEPS,
  jaccard: JACCARD_STEPS,
  bert: BERT_STEPS,
};

function PlagiarismAlgorithmWorkflow({ originalText = '', submittedText = '', onClose, inline = false }: PlagiarismWorkflowProps) {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('cosine');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const steps = ALGO_STEPS[algorithm];
  const effectiveOriginal = originalText || 'Machine learning is a subset of artificial intelligence that enables systems to learn.';
  const effectiveSubmitted = submittedText || 'Machine learning is a branch of artificial intelligence that allows systems to learn.';

  // Derived data based on current step
  const preprocess = (text: string) => text.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const tokenize = (text: string) => preprocess(text).split(/\s+/).filter(Boolean);

  const tokens1 = tokenize(effectiveOriginal);
  const tokens2 = tokenize(effectiveSubmitted);
  const set1 = [...new Set(tokens1)];
  const set2 = [...new Set(tokens2)];
  const intersection = set1.filter(w => set2.includes(w));
  const union = [...new Set([...set1, ...set2])];
  const simScore = calculateSimilarity(effectiveOriginal, effectiveSubmitted);

  const speedMs = Math.round(1500 / speed);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(interval);
  }, [isPlaying, speedMs, steps.length]);

  const handleAlgorithmChange = (algo: AlgorithmType) => {
    setAlgorithm(algo);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const algoLabel = algorithm === 'cosine' ? 'Cosine Similarity' : algorithm === 'jaccard' ? 'Jaccard Index' : 'BERT Embeddings';
  const finalScore = algorithm === 'cosine' ? simScore.cosineSim : algorithm === 'jaccard' ? simScore.jaccardSim : simScore.cosineSim * 0.95;

  return (
    <div className={inline ? 'w-full' : 'fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center'}>
      <div className={inline ? 'w-full space-y-4' : 'bg-background border shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl p-6 space-y-4'}>

        {/* Header with Algorithm Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{algoLabel} Workflow</h3>
            {!inline && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {(['cosine', 'jaccard', 'bert'] as AlgorithmType[]).map(algo => (
              <button
                key={algo}
                onClick={() => handleAlgorithmChange(algo)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${algorithm === algo
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {algo === 'cosine' ? 'Cosine (TF-IDF)' : algo === 'jaccard' ? 'Jaccard' : 'BERT'}
              </button>
            ))}
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < currentStep ? 'bg-primary text-primary-foreground' :
                  i === currentStep ? 'bg-primary/20 border-2 border-primary text-primary ring-2 ring-primary/20' :
                    'bg-muted text-muted-foreground'
                  }`}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-0.5 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
          <div className="ml-auto pl-4 shrink-0">
            <Badge variant="outline" className="text-xs">
              {steps[currentStep]?.label}
            </Badge>
          </div>
        </div>

        {/* Current Step Description */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Step {currentStep + 1}:</span>{' '}
            {steps[currentStep]?.description}
          </p>
        </div>

        {/* Visual Container Cards */}
        <div className="space-y-3">
          {/* Documents */}
          <div className="grid grid-cols-2 gap-3">
            <Card className={`transition-all ${currentStep >= 0 ? 'bg-primary/5 border-primary/20' : 'opacity-40'}`}>
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  <span>Document 1</span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentStep >= 1 ? 'Processed' : 'Raw'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-[60px]">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {currentStep >= 1 ? preprocess(effectiveOriginal) : effectiveOriginal}
                  </p>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className={`transition-all ${currentStep >= 0 ? 'bg-secondary/10 border-secondary/20' : 'opacity-40'}`}>
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  <span>Document 2</span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentStep >= 1 ? 'Processed' : 'Raw'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-[60px]">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {currentStep >= 1 ? preprocess(effectiveSubmitted) : effectiveSubmitted}
                  </p>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Algorithm-specific containers */}
          {algorithm === 'cosine' && (
            <>
              {/* Tokens */}
              <Card className={`transition-all ${currentStep >= 2 ? 'bg-card border-border' : 'opacity-30'}`}>
                <CardHeader className="pb-1 px-3 pt-3">
                  <CardTitle className="text-xs flex items-center justify-between">
                    <span>📝 Tokens</span>
                    <Badge variant="outline" className="text-[10px]">{currentStep >= 2 ? tokens1.length + tokens2.length : 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <ScrollArea className="h-[50px]">
                    <div className="flex flex-wrap gap-1">
                      {currentStep >= 2 ? tokens1.slice(0, 12).map((t, i) => (
                        <HoverCard key={i}>
                          <HoverCardTrigger asChild>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/15 text-primary cursor-help">{t}</span>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-auto p-2">
                            <p className="text-xs font-mono text-muted-foreground">tokens = nltk.word_tokenize(text)</p>
                          </HoverCardContent>
                        </HoverCard>
                      )) : <span className="text-[10px] text-muted-foreground italic">Waiting for tokenization...</span>}
                      {currentStep >= 2 && tokens1.length > 12 && <span className="text-[10px] text-muted-foreground">+{tokens1.length - 12} more</span>}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* TF-IDF Vectors */}
              <Card className={`transition-all ${currentStep >= 3 ? 'bg-card border-border' : 'opacity-30'}`}>
                <CardHeader className="pb-1 px-3 pt-3">
                  <CardTitle className="text-xs flex items-center justify-between">
                    <span>📊 TF-IDF Vectors</span>
                    <Badge variant="outline" className="text-[10px]">{currentStep >= 3 ? '2 vectors' : '—'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  {currentStep >= 3 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">Doc 1 Vector</p>
                        <div className="flex flex-wrap gap-1">
                          {[0.42, 0.18, 0.31, 0.09, 0.55].map((v, i) => (
                            <HoverCard key={i}>
                              <HoverCardTrigger asChild>
                                <span className="px-1 py-0.5 rounded text-[10px] font-mono bg-primary/20 text-primary cursor-help">{v.toFixed(2)}</span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-auto p-2">
                                <p className="text-xs font-mono text-muted-foreground">vector = tfidf.transform([text])</p>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                          <span className="text-[10px] text-muted-foreground">...</span>
                        </div>
                      </div>
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">Doc 2 Vector</p>
                        <div className="flex flex-wrap gap-1">
                          {[0.39, 0.21, 0.28, 0.11, 0.50].map((v, i) => (
                            <span key={i} className="px-1 py-0.5 rounded text-[10px] font-mono bg-secondary/20 text-secondary-foreground">{v.toFixed(2)}</span>
                          ))}
                          <span className="text-[10px] text-muted-foreground">...</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">Waiting for vectorization...</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {algorithm === 'jaccard' && (
            <>
              {/* Sets */}
              <div className="grid grid-cols-2 gap-3">
                <Card className={`transition-all ${currentStep >= 2 ? 'bg-primary/5' : 'opacity-30'}`}>
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="text-xs flex items-center justify-between">
                      <span>Set A</span>
                      <Badge variant="outline" className="text-[10px]">{currentStep >= 2 ? set1.length : 0}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <ScrollArea className="h-[50px]">
                      <div className="flex flex-wrap gap-1">
                        {currentStep >= 2 ? set1.slice(0, 10).map((w, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${intersection.includes(w) && currentStep >= 3 ? 'bg-green-500/20 text-green-700 ring-1 ring-green-500/30' : 'bg-primary/15 text-primary'}`}>{w}</span>
                        )) : <span className="text-[10px] text-muted-foreground italic">Waiting...</span>}
                        {currentStep >= 2 && set1.length > 10 && <span className="text-[10px] text-muted-foreground">+{set1.length - 10}</span>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className={`transition-all ${currentStep >= 2 ? 'bg-secondary/10' : 'opacity-30'}`}>
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="text-xs flex items-center justify-between">
                      <span>Set B</span>
                      <Badge variant="outline" className="text-[10px]">{currentStep >= 2 ? set2.length : 0}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <ScrollArea className="h-[50px]">
                      <div className="flex flex-wrap gap-1">
                        {currentStep >= 2 ? set2.slice(0, 10).map((w, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${intersection.includes(w) && currentStep >= 3 ? 'bg-green-500/20 text-green-700 ring-1 ring-green-500/30' : 'bg-secondary/20 text-secondary-foreground'}`}>{w}</span>
                        )) : <span className="text-[10px] text-muted-foreground italic">Waiting...</span>}
                        {currentStep >= 2 && set2.length > 10 && <span className="text-[10px] text-muted-foreground">+{set2.length - 10}</span>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Intersection & Union */}
              <div className="grid grid-cols-2 gap-3">
                <Card className={`transition-all ${currentStep >= 3 ? 'bg-green-500/5 border-green-500/20' : 'opacity-30'}`}>
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="text-xs flex items-center justify-between">
                      <span>A ∩ B (Intersection)</span>
                      <Badge variant="outline" className="text-[10px]">{currentStep >= 3 ? intersection.length : 0}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <ScrollArea className="h-[40px]">
                      <div className="flex flex-wrap gap-1">
                        {currentStep >= 3 ? intersection.slice(0, 8).map((w, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-green-500/20 text-green-700">{w}</span>
                        )) : <span className="text-[10px] text-muted-foreground italic">—</span>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className={`transition-all ${currentStep >= 4 ? 'bg-blue-500/5 border-blue-500/20' : 'opacity-30'}`}>
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="text-xs flex items-center justify-between">
                      <span>A ∪ B (Union)</span>
                      <Badge variant="outline" className="text-[10px]">{currentStep >= 4 ? union.length : 0}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <ScrollArea className="h-[40px]">
                      <div className="flex flex-wrap gap-1">
                        {currentStep >= 4 ? union.slice(0, 8).map((w, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-700">{w}</span>
                        )) : <span className="text-[10px] text-muted-foreground italic">—</span>}
                        {currentStep >= 4 && union.length > 8 && <span className="text-[10px] text-muted-foreground">+{union.length - 8}</span>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {algorithm === 'bert' && (
            <>
              {/* Embeddings */}
              <Card className={`transition-all ${currentStep >= 2 ? 'bg-card border-border' : 'opacity-30'}`}>
                <CardHeader className="pb-1 px-3 pt-3">
                  <CardTitle className="text-xs flex items-center justify-between">
                    <span>🧠 BERT Embeddings</span>
                    <Badge variant="outline" className="text-[10px]">{currentStep >= 2 ? '768-dim' : '—'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  {currentStep >= 2 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">Doc 1 Embedding</p>
                        <div className="flex flex-wrap gap-1">
                          {[0.023, -0.145, 0.812, 0.056, -0.391, 0.204].map((v, i) => (
                            <span key={i} className="px-1 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-700">{v.toFixed(3)}</span>
                          ))}
                          <span className="text-[10px] text-muted-foreground">...×768</span>
                        </div>
                      </div>
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">Doc 2 Embedding</p>
                        <div className="flex flex-wrap gap-1">
                          {[0.019, -0.138, 0.805, 0.061, -0.402, 0.198].map((v, i) => (
                            <span key={i} className="px-1 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-700">{v.toFixed(3)}</span>
                          ))}
                          <span className="text-[10px] text-muted-foreground">...×768</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">Waiting for BERT encoding...</p>
                  )}
                </CardContent>
              </Card>

              {/* Pooling */}
              <Card className={`transition-all ${currentStep >= 3 ? 'bg-card border-border' : 'opacity-30'}`}>
                <CardHeader className="pb-1 px-3 pt-3">
                  <CardTitle className="text-xs">🔄 Mean Pooling</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  {currentStep >= 3 ? (
                    <div className="p-2 bg-muted/30 rounded text-xs font-mono text-center">
                      sentence_vec = mean(token_embeddings, axis=0) → [1×768]
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">Waiting for pooling...</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Result Card */}
          <Card className={`transition-all ${currentStep >= steps.length - 1 ? 'bg-primary/5 border-primary/20' : 'opacity-30'}`}>
            <CardHeader className="pb-1 px-3 pt-3">
              <CardTitle className="text-xs flex items-center justify-between">
                <span>🎯 {algoLabel} Score</span>
                {currentStep >= steps.length - 1 && (
                  <Badge className={finalScore > 0.7 ? 'bg-destructive' : finalScore > 0.4 ? 'bg-warning' : 'bg-primary'}>
                    {(finalScore * 100).toFixed(1)}%
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {currentStep >= steps.length - 1 ? (
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded text-xs font-mono text-center">
                    {algorithm === 'cosine' && `cos(θ) = (A · B) / (||A|| × ||B||) = ${finalScore.toFixed(4)}`}
                    {algorithm === 'jaccard' && `J(A,B) = |A∩B| / |A∪B| = ${intersection.length}/${union.length} = ${finalScore.toFixed(4)}`}
                    {algorithm === 'bert' && `cosine(emb₁, emb₂) = ${finalScore.toFixed(4)}`}
                  </div>
                  <Progress value={finalScore * 100} className="h-2" />
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">Complete all steps to see the result</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* A*-style Control Panel */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Speed Slider */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Simulation Speed</label>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{speed.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={0.5}
                  max={3}
                  step={0.5}
                  className="py-1"
                  disabled={isPlaying}
                />
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                  disabled={isPlaying || currentStep <= 0}
                  className="h-9 w-9 p-0 hover:bg-primary/10"
                >
                  <StepBack className="h-4 w-4" />
                </Button>

                {!isPlaying ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (currentStep >= steps.length - 1) setCurrentStep(0);
                      setIsPlaying(true);
                    }}
                    className="gap-2 h-9 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 transform"
                  >
                    <Play className="h-4 w-4" />
                    {currentStep > 0 && currentStep < steps.length - 1 ? 'Resume' : 'Start'}
                  </Button>
                ) : (
                  <Button onClick={() => setIsPlaying(false)} size="sm" variant="secondary" className="gap-2 h-9 px-6">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
                  disabled={isPlaying || currentStep >= steps.length - 1}
                  className="h-9 w-9 p-0 hover:bg-primary/10"
                >
                  <StepForward className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
                  className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Completion indicator */}
              {currentStep >= steps.length - 1 && (
                <div className="p-3 rounded-md border bg-primary/10 border-primary/20">
                  <p className="text-sm font-medium text-center text-primary">
                    ✓ {algoLabel} workflow complete — Score: {(finalScore * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}



function PlagiarismDemo() {
  // Interactive feature selector state
  const [selectedFeature, setSelectedFeature] = useState('vector');

  const featureExplanations = {
    vector: (
      <>
        <div>
          <h3 className="text-lg font-semibold mb-1">Vector Space Explorer</h3>
          <p className="text-sm mb-2">Drag documents in 2D/3D space. Distances represent similarity. The closer two points are, the higher their similarity score. Useful for visualizing document embeddings and relationships.</p>
          <div className="mt-2 p-3 bg-blue-50 rounded">
            <h4 className="font-semibold mb-1">How Distance Represents Similarity</h4>
            <p className="text-sm mb-2">
              In the 2D space, each document is represented as a point. The <b>Euclidean distance</b> between two points shows how different the documents are: the closer the points, the more similar the documents.
            </p>
            <ul className="list-disc ml-6 text-sm mb-2">
              <li>
                <b>Distance (d):</b> Calculated using the Euclidean formula between two points.
              </li>
              <li>
                <b>Similarity:</b> Defined as <b>Similarity = 1 / (1 + distance)</b>. This means:
                <ul className="list-disc ml-6">
                  <li>If distance is 0 (points overlap), similarity is 1 (identical).</li>
                  <li>If distance increases, similarity decreases toward 0.</li>
                </ul>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              <b>Interpretation:</b> The closer two document points are, the higher their similarity score. This visualizes how document embeddings or features relate in space.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <div className="bg-white rounded shadow p-4">
            <VectorSpaceExplorer />
          </div>
        </div>
      </>
    ),
    confusion: (
      <>
        <div>
          <h3 className="text-lg font-semibold mb-1">Confusion Matrix Builder</h3>
          <p className="text-sm mb-2">Adjust thresholds to see how the confusion matrix and metrics (precision, recall, accuracy, F1) change. Helps you understand tradeoffs in classification performance.</p>
        </div>
        <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded shadow p-4">
              <ConfusionMatrixBuilder />
            </div>
          </div>
          <div className="flex-1 min-w-0 mt-4 md:mt-0">
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-bold mb-2">Confusion Matrix Builder: Explanation</h2>
              <p className="mb-3">
                The <b>Confusion Matrix Builder</b> helps you visualize how changing the decision threshold affects the performance of a classification model. The confusion matrix shows the counts of correct and incorrect predictions for each class:
              </p>
              <ul className="list-disc ml-6 mb-3 text-sm">
                <li><b>True Positives (TP):</b> Correctly predicted positives (top-left cell).</li>
                <li><b>False Positives (FP):</b> Incorrectly predicted positives (top-right cell).</li>
                <li><b>False Negatives (FN):</b> Incorrectly predicted negatives (bottom-left cell).</li>
                <li><b>True Negatives (TN):</b> Correctly predicted negatives (bottom-right cell).</li>
              </ul>
              <p className="mb-3 text-sm">
                <b>Metrics</b> such as <b>Precision</b>, <b>Recall</b>, <b>Accuracy</b>, and <b>F1 Score</b> are calculated from these values:
              </p>
              <ul className="list-disc ml-6 mb-3 text-sm">
                <li><b>Precision:</b> Of all predicted positives, how many are actually positive? (TP / (TP + FP))</li>
                <li><b>Recall:</b> Of all actual positives, how many did we correctly predict? (TP / (TP + FN))</li>
                <li><b>Accuracy:</b> Overall, how many predictions were correct? ((TP + TN) / Total)</li>
                <li><b>F1 Score:</b> Harmonic mean of precision and recall. Useful when classes are imbalanced.</li>
              </ul>
              <p className="mb-2 text-sm">
                <b>Tradeoff:</b> Increasing the threshold usually increases precision (fewer false positives) but may lower recall (more false negatives). Adjust the threshold to find the best balance for your application.
              </p>
            </div>
          </div>
        </div>
      </>
    ),
    learning: (
      <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
        <div className="flex-1 min-w-0 flex">
          <div className="bg-white rounded shadow p-4 w-full h-full flex flex-col">
            <LearningCurve />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex">
          <div className="bg-white rounded shadow p-4 w-full h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-1">What is a Learning Curve?</h3>
            <p className="text-sm mb-2">
              A <b>learning curve</b> shows how a model's performance (such as accuracy) improves as it is trained on more data. Initially, adding more data points can significantly boost accuracy, but after a certain point, the improvement slows down and the curve plateaus. This plateau indicates that the model has learned most of what it can from the data, and further increases in data size yield diminishing returns.
            </p>
            <ul className="list-disc ml-6 text-sm mb-2">
              <li><b>Steep rise:</b> Early data points greatly improve accuracy.</li>
              <li><b>Plateau:</b> Accuracy levels off as the model saturates its learning capacity.</li>
              <li><b>Interpretation:</b> A plateau suggests you may need a more complex model or better features to improve further.</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              In practice, analyzing the learning curve helps you decide whether collecting more data is worthwhile or if you should focus on improving the model itself.
            </p>
          </div>
        </div>
      </div>
    ),
    attention: (
      <>
        <div>
          <h3 className="text-lg font-semibold mb-1">Attention Heatmaps</h3>
          <p className="text-sm mb-2">For transformer models, see which words matter most in a sentence. Darker blue means higher attention weight. Useful for interpreting model focus.</p>
        </div>
        <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded shadow p-4">
              <AttentionHeatmap />
            </div>
          </div>
          <div className="flex-1 min-w-0 mt-4 md:mt-0">
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-semibold mb-1">What is an Attention Heatmap?</h3>
              <p className="text-sm mb-2">
                An <b>attention heatmap</b> visualizes which words a transformer model (like BERT or GPT) focuses on when processing a sentence. Each word is colored based on its attention weight: darker blue means the model pays more attention to that word.
              </p>
              <ul className="list-disc ml-6 text-sm mb-2">
                <li><b>Interpretability:</b> Helps you understand which words influence the model's predictions.</li>
                <li><b>Debugging:</b> Reveals if the model is focusing on the right parts of the input.</li>
                <li><b>Education:</b> Useful for learning how transformer models process language.</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Try entering different sentences to see how the attention weights change!
              </p>
            </div>
          </div>
        </div>
      </>
    ),
  };
  // State for scenario challenge (algorithm bias)
  const [scenarioAnswer, setScenarioAnswer] = useState("");
  // Challenge state hooks (must be at the top level)
  const [challenge1Attempt, setChallenge1Attempt] = useState("");
  const [challenge2Answer, setChallenge2Answer] = useState("");

  const [originalText, setOriginalText] = useState(
    "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves."
  );
  const [submittedText, setSubmittedText] = useState(
    "Machine learning is a branch of artificial intelligence that allows systems to learn and improve from experience without explicit programming. It focuses on creating computer programs that access data and learn independently."
  );
  const [algorithm, setAlgorithm] = useState<'cosine' | 'jaccard' | 'bert'>('cosine');
  const [threshold, setThreshold] = useState(0.5);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Mock AI detection logic


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc');
      const isText = file.name.endsWith('.txt') || file.name.endsWith('.md');

      if (!isDocx && !isText) {
        alert("Please upload Plain Text (.txt), Markdown (.md), or Word (.docx) files.");
        return;
      }

      const reader = new FileReader();

      if (isDocx) {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value;
            setSubmittedText(text);


          } catch (error) {
            console.error("Error reading .docx file:", error);
            alert("Could not extract text from this Word document. Please try a different file.");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setSubmittedText(text);

        };
        reader.readAsText(file);
      }
    }
  };

  // Explanations for each algorithm
  const HOW_IT_WORKS = {
    cosine: (
      <div>
        <div className="mb-2">Cosine similarity measures the angle between two text vectors. It considers word frequency and is good for direct copying.</div>
        <div className="font-mono text-xs bg-muted/30 rounded p-2 mb-1">Cosine(A, B) = (A · B) / (||A|| × ||B||)</div>
        <div className="text-xs text-muted-foreground">Example: <br />A = [1, 2, 0], B = [2, 1, 0] → Cosine = (1×2 + 2×1 + 0×0) / (√5 × √5) = 4/5 = 0.8</div>
      </div>
    ),
    jaccard: (
      <div>
        <div className="mb-2">Jaccard similarity measures the overlap between unique words in both texts. It is simple and fast, but ignores word frequency.</div>
        <div className="font-mono text-xs bg-muted/30 rounded p-2 mb-1">Jaccard(A, B) = |A ∩ B| / |A ∪ B|</div>
        <div className="text-xs text-muted-foreground">Example: <br />A = {'{"the", "cat", "sat"}'}, B = {'{"the", "dog", "sat"}'} → Jaccard = 2/4 = 0.5</div>
      </div>
    ),
    bert: (
      <div>
        <div className="mb-2">BERT similarity uses deep neural embeddings to capture semantic meaning and context, making it powerful for detecting paraphrasing and meaning-based similarity.</div>
        <div className="font-mono text-xs bg-muted/30 rounded p-2 mb-1">Cosine(BERT(A), BERT(B))</div>
        <div className="text-xs text-muted-foreground">Example: <br />A = "The cat sat on the mat."<br />B = "A feline rested on a rug."<br />BERT vectors are close, so similarity is high even though words differ.</div>
      </div>
    ),
  };
  const TRY_VARIATION = {
    cosine: "Try changing some words to synonyms or rephrasing sentences. Cosine will detect less similarity if you change word usage.",
    jaccard: "Try removing or adding unique words. Jaccard is sensitive to the presence or absence of words, not their frequency.",
    bert: "Try paraphrasing or changing sentence structure. BERT can still detect similarity even if the wording is different.",
  };

  // Calculate similarity based on selected algorithm
  // BERT similarity (mocked for demo)
  function mockBertSimilarity(text1: string, text2: string) {
    // If texts are very similar, return high; if paraphrased, return medium; else low
    if (text1 === text2) return 1.0;
    if (text1.toLowerCase().split(' ').length === text2.toLowerCase().split(' ').length) return 0.85;
    return 0.5;
  }

  const analysis = useMemo(() => {
    if (!originalText.trim() || !submittedText.trim()) {
      return null;
    }
    const similarity = calculateSimilarity(originalText, submittedText);
    let score = 0;
    if (algorithm === 'cosine') score = similarity.cosineSim;
    else if (algorithm === 'jaccard') score = similarity.jaccardSim;
    else if (algorithm === 'bert') score = mockBertSimilarity(originalText, submittedText);
    const plagiarismScore = score * 100;
    let severity: 'high' | 'medium' | 'low' | 'minimal';
    if (plagiarismScore >= 80) severity = 'high';
    else if (plagiarismScore >= 50) severity = 'medium';
    else if (plagiarismScore >= 20) severity = 'low';
    else severity = 'minimal';
    return {
      ...similarity,
      plagiarismScore,
      severity,
      score,
    };
  }, [originalText, submittedText, algorithm]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-yellow-500';
      default: return 'text-primary';
    }
  };

  return (
    <Tabs defaultValue="algorithm" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="algorithm"><Settings2 className="w-4 h-4 mr-2" />Detector</TabsTrigger>
        <TabsTrigger value="workflow"><Code2 className="w-4 h-4 mr-2" />Visualizer</TabsTrigger>
        <TabsTrigger value="simulator"><Play className="w-4 h-4 mr-2" />Simulator</TabsTrigger>
        <TabsTrigger value="explore"><Search className="w-4 h-4 mr-2" />Explore</TabsTrigger>
      </TabsList>

      <TabsContent value="workflow" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ContentSection title="Algorithm Workflow (Visualizer)" icon="Code2">
          <PlagiarismAlgorithmWorkflow
            inline={true}
            originalText={originalText}
            submittedText={submittedText}
          />
        </ContentSection>
      </TabsContent>

      <TabsContent value="simulator" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <AlgorithmSimulator />
      </TabsContent>

      <TabsContent value="algorithm" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Original Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Original Document</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Enter original text..."
                rows={8}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Submitted Text */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Submitted Document</CardTitle>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-2 text-xs"
                >
                  <Upload className="mr-1 h-3 w-3" /> Upload
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={submittedText}
                onChange={(e) => setSubmittedText(e.target.value)}
                placeholder="Enter text to check..."
                rows={8}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Algorithm selection and threshold slider */}
        <div className="flex flex-wrap gap-4 items-center mt-2">
          <span className="font-semibold text-sm">Settings:</span>
          <div className="flex bg-muted rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs rounded-md transition-all ${algorithm === 'cosine' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              onClick={() => setAlgorithm('cosine')}
            >
              Cosine
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-all ${algorithm === 'jaccard' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              onClick={() => setAlgorithm('jaccard')}
            >
              Jaccard
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-all ${algorithm === 'bert' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              onClick={() => setAlgorithm('bert')}
            >
              BERT
            </button>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Threshold: {Math.round(threshold * 100)}%</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {analysis && (
          <div className="space-y-4">
            {/* Results Summary */}
            <Card className={`border-2 ${analysis.severity === 'high' ? 'border-destructive/50 bg-destructive/5' :
              analysis.severity === 'medium' ? 'border-orange-500/50 bg-orange-500/5' :
                analysis.severity === 'low' ? 'border-yellow-500/50 bg-yellow-500/5' :
                  'border-primary/50 bg-primary/5'
              }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {analysis.severity === 'high' || analysis.severity === 'medium' ? (
                      <AlertTriangle className={`h-8 w-8 ${getSeverityColor(analysis.severity)}`} />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">Plagiarism Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Severity: <span className={`font-medium ${getSeverityColor(analysis.severity)}`}>
                          {analysis.severity.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getSeverityColor(analysis.severity)}`}>
                      {analysis.plagiarismScore.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Similarity</p>
                  </div>
                </div>
                <Progress
                  value={analysis.plagiarismScore}
                  className="h-3"
                />
                {/* Threshold feedback */}
                <div className="mt-2 text-lg font-bold">
                  {analysis.score >= threshold ? (
                    <span className="text-red-600">Plagiarism suspected (above threshold)</span>
                  ) : (
                    <span className="text-green-600">No plagiarism detected (below threshold)</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Matching Words */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-700">
                    {algorithm === 'bert' ? 'Top Semantically Matching Words' : 'Matching Words'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {(algorithm === 'bert'
                      ? analysis.matchingWords.slice(0, 10).map((word, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{word}*</Badge>
                      ))
                      : analysis.matchingWords.slice(0, 20).map((word, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">{word}</Badge>
                      ))
                    )}
                    {analysis.matchingWords.length > (algorithm === 'bert' ? 10 : 20) && (
                      <Badge variant="outline">+{analysis.matchingWords.length - (algorithm === 'bert' ? 10 : 20)} more</Badge>
                    )}
                  </div>
                  {algorithm === 'bert' && (
                    <div className="text-xs text-muted-foreground mt-1">*Semantic matches (not just exact words)</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Unique to Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {analysis.uniqueWords1.slice(0, 10).map((word, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{word}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Unique to Submitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {analysis.uniqueWords2.slice(0, 10).map((word, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{word}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* How it works and Try this variation */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="font-semibold text-blue-700 mb-1 text-sm">How it works</div>
                  <div className="text-xs text-gray-800">{HOW_IT_WORKS[algorithm]}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="font-semibold text-blue-700 mb-1 text-sm">Try this variation</div>
                  <div className="text-xs text-gray-800">{TRY_VARIATION[algorithm]}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="explore" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {(analysis?.cosineSim ? analysis.cosineSim * 100 : 0).toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cosine Sim</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {(analysis?.jaccardSim ? analysis.jaccardSim * 100 : 0).toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Jaccard Sim</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {(mockBertSimilarity(originalText, submittedText) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">BERT Sim</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-700">
                {analysis?.matchingWords.length || 0}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Matches</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Feature Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="font-semibold text-sm">Select Sub-module:</span>
            <button
              className={`px-3 py-1 text-sm rounded-full border transition-all ${selectedFeature === 'vector' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-muted-foreground hover:border-indigo-400'}`}
              onClick={() => setSelectedFeature('vector')}
            >
              Vector Space Explorer
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full border transition-all ${selectedFeature === 'confusion' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-muted-foreground hover:border-indigo-400'}`}
              onClick={() => setSelectedFeature('confusion')}
            >
              Confusion Matrix
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full border transition-all ${selectedFeature === 'learning' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-muted-foreground hover:border-indigo-400'}`}
              onClick={() => setSelectedFeature('learning')}
            >
              Learning Curve
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full border transition-all ${selectedFeature === 'attention' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-muted-foreground hover:border-indigo-400'}`}
              onClick={() => setSelectedFeature('attention')}
            >
              Attention Heatmaps
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-1 overflow-hidden">
            <div className="p-4">
              {featureExplanations[selectedFeature]}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function AlgorithmSimulator() {
  const [step, setStep] = useState(0); // 0: Intro, 1: Preprocess, 2: Vectorize, 3: Similarity, 5: Result
  const [simulatorAlgo, setSimulatorAlgo] = useState<'cosine' | 'jaccard' | 'bert'>('cosine');
  const [xp, setXp] = useState(0);
  const [tokens1, setTokens1] = useState<string[]>([]);
  const [tokens2, setTokens2] = useState<string[]>([]);

  // Simulation Data
  const demoText1 = "The cat sat on the mat.";
  const demoText2 = "The cat rested on the rug.";

  const nextStep = () => {
    setStep(s => s + 1);
    setXp(x => x + 25);
  };

  const reset = () => {
    setStep(0);
    setXp(0);
    setTokens1([]);
    setTokens2([]);
  };

  const preprocess = (text: string) => text.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const tokenize = (text: string) => preprocess(text).split(/\s+/);

  return (
    <ContentSection title="Workflow" icon="Gamepad2">
      <Card className="border-2 border-indigo-100 overflow-hidden">
        <div className="bg-indigo-50 p-4 flex justify-between items-center border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              {step > 4 ? '✓' : step + 1}
            </div>
            <span className="font-semibold text-indigo-900">
              {step === 0 && "Mission: Detect Plagiarism"}
              {step === 1 && "Step 1: Preprocessing"}
              {step === 2 && "Step 2: Vectorization"}
              {step === 3 && "Step 3: Similarity Math"}
              {step === 4 && "Mission Complete!"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase">Current XP</span>
            <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-3">
              {xp} XP
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {step === 0 && (
            <div className="text-center py-8">
              <div className="mb-6 text-6xl">🕵️‍♀️</div>
              <h3 className="text-xl font-bold mb-2">Ready to become an Algorithm Expert?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We have intercepted two suspicious messages. Your mission is to manually run the detection algorithm and determine if they are related.
              </p>
              <Button onClick={nextStep} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Start Analysis <ScanText className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Input A</div>
                  <div className="font-serif text-lg">"{demoText1}"</div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Input B</div>
                  <div className="font-serif text-lg">"{demoText2}"</div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-center">
                  <p className="mb-4 text-sm text-muted-foreground">Machines can't read capital letters or punctuation elegantly. We need to clean this up.</p>
                  <Button onClick={() => {
                    setTokens1(tokenize(demoText1));
                    setTokens2(tokenize(demoText2));
                    nextStep();
                  }} variant="outline" className="border-indigo-200 hover:bg-indigo-50">
                    Execute sanitize().toLowerCase()
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Tokens A</div>
                  <div className="flex flex-wrap gap-2">
                    {tokens1.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Tokens B</div>
                  <div className="flex flex-wrap gap-2">
                    {tokens2.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-center">
                  <p className="mb-4 text-sm text-muted-foreground">Now we turn words into math. Let's build vectors!</p>
                  <Button onClick={nextStep} variant="outline" className="border-indigo-200 hover:bg-indigo-50">
                    Execute build_vectors()
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex bg-muted rounded-lg p-1 w-fit mx-auto mb-4">
                <button
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${simulatorAlgo === 'cosine' ? 'bg-white shadow-sm text-indigo-600' : 'text-muted-foreground hover:bg-white/50'}`}
                  onClick={() => setSimulatorAlgo('cosine')}
                >
                  Cosine
                </button>
                <button
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${simulatorAlgo === 'jaccard' ? 'bg-white shadow-sm text-indigo-600' : 'text-muted-foreground hover:bg-white/50'}`}
                  onClick={() => setSimulatorAlgo('jaccard')}
                >
                  Jaccard
                </button>
                <button
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${simulatorAlgo === 'bert' ? 'bg-white shadow-sm text-indigo-600' : 'text-muted-foreground hover:bg-white/50'}`}
                  onClick={() => setSimulatorAlgo('bert')}
                >
                  BERT
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-sm leading-relaxed border border-slate-700 shadow-2xl overflow-x-auto min-h-[200px]">
                {simulatorAlgo === 'cosine' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="text-xs text-indigo-400 mb-2">// TF-IDF Coordinate Math</div>
                    <div>Vector A = [1, 1, 1, 1, 1, 1, 0, 0] <span className="text-slate-500"> // the, cat, sat, on, the, mat</span></div>
                    <div>Vector B = [1, 1, 0, 1, 1, 0, 1, 1] <span className="text-slate-500"> // the, cat, rested, on, the, rug</span></div>
                    <div className="my-4 border-t border-slate-700 opacity-30"></div>
                    <div>Dot Product = (1×1) + (1×1) + (1×0) + ... = 4</div>
                    <div>Magnitude A = √6 ≈ 2.45</div>
                    <div>Magnitude B = √7 ≈ 2.64</div>
                    <div className="text-green-400 font-bold mt-4 text-base">Cosine = 4 / (2.45 × 2.64) ≈ 0.61</div>
                  </div>
                )}

                {simulatorAlgo === 'jaccard' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="text-xs text-indigo-400 mb-2">// Set Theory Intersection / Union</div>
                    <div>Set A = {"{the, cat, sat, on, mat}"} <span className="text-slate-500"> // 5 unique tokens</span></div>
                    <div>Set B = {"{the, cat, rested, on, rug}"} <span className="text-slate-500"> // 5 unique tokens</span></div>
                    <div className="my-4 border-t border-slate-700 opacity-30"></div>
                    <div>Intersection (A ∩ B) = {"{the, cat, on}"} <span className="text-slate-500"> // 3 matches</span></div>
                    <div>Union (A ∪ B) = {"{the, cat, sat, on, mat, rested, rug}"} <span className="text-slate-500"> // 7 total</span></div>
                    <div className="text-green-400 font-bold mt-4 text-base">Jaccard = 3 / 7 ≈ 0.43</div>
                  </div>
                )}

                {simulatorAlgo === 'bert' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="text-xs text-indigo-400 mb-2">// Neural Transformer Embeddings (Attention)</div>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 p-2 bg-slate-800 rounded border border-slate-700">
                        "The cat <span className="text-indigo-400 underline decoration-indigo-500/50">sat</span> on the <span className="text-indigo-400 underline decoration-indigo-500/50">mat</span>."
                      </div>
                      <div className="text-slate-500">↔</div>
                      <div className="flex-1 p-2 bg-slate-800 rounded border border-slate-700">
                        "The cat <span className="text-indigo-400 underline decoration-indigo-500/50">rested</span> on the <span className="text-indigo-400 underline decoration-indigo-500/50">rug</span>."
                      </div>
                    </div>
                    <div className="my-4 border-t border-slate-700 opacity-30"></div>
                    <div className="text-xs text-slate-400 italic mb-2">Note: BERT understands that "rested" is semantically similar to "sat", and "rug" to "mat".</div>
                    <div className="text-green-400 font-bold text-base">BERT Embedding Similarity ≈ 0.85</div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div className="text-center">
                  <Button onClick={nextStep} variant="default" className="bg-indigo-600 hover:bg-indigo-700 px-8">
                    Finalize Report
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="inline-block p-4 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-indigo-900 tracking-tight">Analysis Complete!</h3>
              <div className="text-5xl font-black text-indigo-600 mb-4 drop-shadow-sm">
                {simulatorAlgo === 'cosine' ? '61%' : simulatorAlgo === 'jaccard' ? '43%' : '85%'} Match
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
                Algorithm Used: {simulatorAlgo.toUpperCase()}
              </div>
              <p className="max-w-md mx-auto text-muted-foreground mb-8 text-sm leading-relaxed">
                {simulatorAlgo === 'bert'
                  ? "BERT correctly identifies that while the words are different, the deep meaning (context) is almost identical. This is the most powerful method!"
                  : "You successfully detected that these sentences share significant structure and vocabulary. Notice how different mathematical models give different results!"}
              </p>

              <Button onClick={reset} variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                Run Another Simulation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Old static explanation for reference, collapsed or smaller if needed, but replacing it as requested */}
    </ContentSection>
  );
}

export function PlagiarismDetectorLab() {
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
      experimentNumber={7}
      title="Plagiarism Detector"
      subtitle="Detect text similarity using Cosine, Jaccard, and BERT algorithms"
      icon="FileSearch"
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand and implement <strong className="text-primary">Plagiarism Detection</strong> systems used to identify text similarity
          between documents and calculate plagiarism percentages using TF-IDF vectorization and Semantic Analysis.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <HighlightItem icon="📊" text="Implement TF-IDF Vectorization" />
          <HighlightItem icon="📐" text="Calculate Cosine Similarity" />
          <HighlightItem icon="🧠" text="Understand Jaccard & BERT metrics" />
          <HighlightItem icon="🔍" text="Visualize Document Embeddings" />
        </div>
      </SectionCard>

      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is Plagiarism Detection?">
          <p>
            Plagiarism detection is the process of locating instances of plagiarism or copyright infringement within a work or document.
            Computer-assisted plagiarism detection (CaPD) uses <strong>Natural Language Processing (NLP)</strong> to compare a document against
            a database of source texts to find matches.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Vector Space Model (TF-IDF)">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="mb-4">
                The <strong>Vector Space Model</strong> represents text documents as vectors of identifiers (like index terms).
                <strong>TF-IDF (Term Frequency-Inverse Document Frequency)</strong> is a numerical statistic that reflects how important a word is to a document in a collection.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li><strong>TF:</strong> Frequency of a word in the document.</li>
                <li><strong>IDF:</strong> Measure of how much information the word provides (rare words have high IDF).</li>
              </ul>
            </div>
            <div className="flex items-center justify-center bg-muted/30 p-4 rounded-lg">
              <div className="text-center font-mono text-sm">
                <div className="mb-2">Document A → [0.2, 0.8, 0.0, ...]</div>
                <div className="mb-2">Document B → [0.1, 0.9, 0.3, ...]</div>
                <div className="text-primary font-bold">Similarity = cos(θ)</div>
              </div>
            </div>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Similarity Metrics">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-4"><CardTitle className="text-base">Cosine Similarity</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                Measures the cosine of the angle between two non-zero vectors. Best for determining if two documents are "pointing" in the same direction.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4"><CardTitle className="text-base">Jaccard Index</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                Measures the similarity between finite sample sets. Defined as the size of the intersection divided by the size of the union.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4"><CardTitle className="text-base">Semantic (BERT)</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                Uses deep learning transformers to understand context. Can detect paraphrasing where words are different but meaning is the same.
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>
      </SectionCard>

      <SectionCard id="algorithm" title="Algorithm" icon="Settings">
        <p className="text-muted-foreground mb-6">
          The core process for computing Plagiarism Score using Cosine Similarity:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Preprocessing & Tokenization</h4>
              <p className="text-muted-foreground">Clean input texts by converting to lowercase and removing punctuation, then split into individual word tokens.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Vector Construction</h4>
              <p className="text-muted-foreground">Build a unique vocabulary from both texts and create TF-IDF vectors where each dimension represents a word's importance.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Similarity Calculation</h4>
              <p className="text-muted-foreground">Compute the cosine of the angle between the two vectors using the dot product formula: (A · B) / (||A|| × ||B||).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Scoring & Decision</h4>
              <p className="text-muted-foreground">Convert the similarity ratio (0 to 1) into a percentage score and classify the plagiarism severity level.</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">
            {`ALGORITHM PlagiarismDetector(text1, text2):

Input: Two text documents
Output: Percentage Similarity Score

1. PREPROCESS text1, text2 (lowercase, remove punctuation)
2. TOKENIZE text1, text2 into word lists
3. BUILD Vocabulary V from unique words in both texts
4. CREATE Vectors v1, v2 of length |V|
     FOR each word w in Vocabulary:
       v1[i] = TF-IDF(w, text1)
       v2[i] = TF-IDF(w, text2)
5. COMPUTE Dot Product: dot = Σ(v1[i] * v2[i])
6. COMPUTE Magnitudes: ||v1||, ||v2||
7. CALCULATE Cosine Similarity: 
     similarity = dot / (||v1|| * ||v2||)
8. RETURN similarity * 100`}
          </pre>
        </div>
      </SectionCard>

      <SectionCard id="program" title="Program" icon="Code">
        <CodeBlock code={PLAGIARISM_CODE} language="python" title="plagiarism_detector.py" />
      </SectionCard>

      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Analyze actual documents, visualize the algorithm steps, or simulate the logic.
        </p>
        <PlagiarismDemo />
      </SectionCard>

      <SectionCard id="practice" title="Practice" icon="Trophy">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Challenge 1: Paraphrasing Attack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Can you trick the <strong>Cosine Similarity</strong> algorithm? Try to rewrite a sentence so it has the same meaning but 0% cosine similarity (uses completely different words).
              </p>
              <div className="bg-muted/30 p-3 rounded mb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Target Sentence:</span>
                <p className="font-medium">"The quick brown fox jumps over the lazy dog."</p>
              </div>
              <div className="flex gap-2">
                <Textarea placeholder="Enter your paraphrase..." className="h-20" />
                <Button size="sm" variant="outline" className="h-auto">Check</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Challenge 2: Semantic Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Now try to trick the <strong>BERT Semantic</strong> model. It's much harder! Try to write a sentence with different words that BERT still recognizes as similar.
              </p>
              <div className="flex gap-2">
                <Textarea placeholder="Enter your semantic match..." className="h-20" />
                <Button size="sm" variant="outline" className="h-auto">Check</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}

export default PlagiarismDetectorLab;
