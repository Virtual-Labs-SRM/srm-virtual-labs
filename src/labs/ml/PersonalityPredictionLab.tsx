import React, { useState, useMemo, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, HighlightItem, TermCard } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { ContentSection } from '@/components/lab/ContentSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { UserSearch, CheckCircle2, Brain, Sparkles, Upload, FileText, ScanLine, Loader2, ArrowRight, RotateCcw, Play, Pause, SkipBack, SkipForward, StepBack, StepForward, X, Code2, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';

// We will load PDF.js dynamically from CDN to avoid build issues
const PDFJS_CDN = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/+esm";

const PERSONALITY_CODE = `"""
CV Analysis-based Personality Prediction System

This implementation analyzes CV/Resume text to predict
personality traits using NLP and machine learning.
"""

import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from collections import Counter

class PersonalityPredictor:
    """
    Predict personality traits from CV/Resume analysis.
    Based on Big Five (OCEAN) personality model.
    """
    
    def __init__(self):
        self.traits = [
            'Openness',
            'Conscientiousness', 
            'Extraversion',
            'Agreeableness',
            'Neuroticism'
        ]
        
        # Keywords associated with each trait
        self.trait_keywords = {
            'Openness': [
                'creative', 'innovative', 'artistic', 'curious',
                'imaginative', 'original', 'diverse', 'learning',
                'research', 'explore', 'design', 'novel'
            ],
            'Conscientiousness': [
                'organized', 'detail', 'systematic', 'efficient',
                'reliable', 'punctual', 'thorough', 'planning',
                'deadline', 'accurate', 'quality', 'consistent'
            ],
            'Extraversion': [
                'team', 'leadership', 'communication', 'present',
                'collaborate', 'social', 'network', 'public',
                'speaking', 'mentor', 'outgoing', 'energetic'
            ],
            'Agreeableness': [
                'support', 'help', 'volunteer', 'cooperative',
                'friendly', 'patient', 'empathy', 'assist',
                'kind', 'harmony', 'trust', 'flexible'
            ],
            'Neuroticism': [
                'stress', 'pressure', 'challenge', 'difficult',
                'anxious', 'worry', 'conflict', 'criticism',
                'sensitive', 'emotional', 'nervous', 'tense'
            ]
        }
        
        # Positive vs negative indicators for scoring
        self.positive_indicators = {
            'Openness': ['creative', 'innovative', 'research'],
            'Conscientiousness': ['organized', 'efficient', 'quality'],
            'Extraversion': ['leadership', 'team', 'communication'],
            'Agreeableness': ['cooperative', 'support', 'volunteer'],
            'Neuroticism': []  # Low score is positive here
        }
    
    def preprocess_cv(self, cv_text):
        """Clean and preprocess CV text."""
        # Convert to lowercase
        text = cv_text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z\\s]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def extract_keywords(self, cv_text):
        """Extract relevant keywords from CV."""
        processed = self.preprocess_cv(cv_text)
        words = processed.split()
        return Counter(words)
    
    def calculate_trait_score(self, cv_text, trait):
        """
        Calculate score for a specific personality trait.
        
        Args:
            cv_text: Preprocessed CV text
            trait: Personality trait name
        Returns:
            Score from 0 to 100
        """
        keywords = self.trait_keywords[trait]
        text_lower = cv_text.lower()
        
        # Count keyword matches
        matches = sum(1 for kw in keywords if kw in text_lower)
        
        # Weight by keyword importance
        weighted_score = 0
        for kw in keywords:
            if kw in text_lower:
                # Count occurrences
                count = text_lower.count(kw)
                weighted_score += min(count * 10, 30)  # Cap per keyword
        
        # Normalize to 0-100
        max_possible = len(keywords) * 30
        score = min(100, (weighted_score / max_possible) * 100 + 20)
        
        # Invert neuroticism (low is better)
        if trait == 'Neuroticism':
            score = max(0, 100 - score)
        
        return score
    
    def predict_personality(self, cv_text):
        """
        Predict full personality profile from CV.
        
        Args:
            cv_text: Raw CV/Resume text
        Returns:
            Dict with trait scores and analysis
        """
        processed = self.preprocess_cv(cv_text)
        
        scores = {}
        for trait in self.traits:
            scores[trait] = self.calculate_trait_score(processed, trait)
        
        # Determine dominant traits
        sorted_traits = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        dominant = sorted_traits[:2]
        
        # Generate insights
        insights = self._generate_insights(scores)
        
        # Suggest roles based on traits
        roles = self._suggest_roles(scores)
        
        return {
            'scores': scores,
            'dominant_traits': [t[0] for t in dominant],
            'insights': insights,
            'suggested_roles': roles
        }
    
    def _generate_insights(self, scores):
        """Generate personality insights."""
        insights = []
        
        if scores['Openness'] > 70:
            insights.append("Strong creative and innovative mindset")
        if scores['Conscientiousness'] > 70:
            insights.append("Highly organized and detail-oriented")
        if scores['Extraversion'] > 70:
            insights.append("Natural leader with strong communication skills")
        if scores['Agreeableness'] > 70:
            insights.append("Excellent team player and collaborator")
        if scores['Neuroticism'] < 30:
            insights.append("Handles stress and pressure effectively")
        
        return insights
    
    def _suggest_roles(self, scores):
        """Suggest suitable roles based on personality."""
        roles = []
        
        if scores['Openness'] > 60 and scores['Conscientiousness'] > 50:
            roles.append("Research Scientist")
            roles.append("Product Designer")
        
        if scores['Extraversion'] > 60 and scores['Agreeableness'] > 50:
            roles.append("Team Lead")
            roles.append("Sales Manager")
        
        if scores['Conscientiousness'] > 70:
            roles.append("Project Manager")
            roles.append("Quality Analyst")
        
        if scores['Openness'] > 70:
            roles.append("Creative Director")
            roles.append("UX Designer")
        
        return roles[:4]  # Top 4 suggestions


# Example usage
if __name__ == "__main__":
    predictor = PersonalityPredictor()
    
    sample_cv = """
    Experienced software engineer with 5 years of experience in
    developing innovative solutions. Strong leadership skills with
    experience managing cross-functional teams. Passionate about
    creative problem-solving and continuous learning.
    
    Skills: Team collaboration, project management, research,
    communication, organized planning, quality assurance.
    
    Volunteer experience: Mentored junior developers, organized
    community coding workshops.
    """
    
    result = predictor.predict_personality(sample_cv)
    
    print("Personality Analysis:")
    for trait, score in result['scores'].items():
        print(f"  {trait}: {score:.1f}%")
    
    print(f"\\nDominant Traits: {result['dominant_traits']}")
    print(f"Suggested Roles: {result['suggested_roles']}")`;

// Trait keywords for scoring
const TRAIT_KEYWORDS = {
  Openness: ['creative', 'innovative', 'artistic', 'curious', 'imaginative', 'original', 'learning', 'research', 'explore', 'design', 'novel', 'ideas'],
  Conscientiousness: ['organized', 'detail', 'systematic', 'efficient', 'reliable', 'punctual', 'thorough', 'planning', 'deadline', 'accurate', 'quality', 'consistent'],
  Extraversion: ['team', 'leadership', 'communication', 'present', 'collaborate', 'social', 'network', 'speaking', 'mentor', 'outgoing', 'energetic', 'lead'],
  Agreeableness: ['support', 'help', 'volunteer', 'cooperative', 'friendly', 'patient', 'empathy', 'assist', 'kind', 'harmony', 'trust', 'flexible'],
  Neuroticism: ['stress', 'pressure', 'challenge', 'difficult', 'anxious', 'worry', 'conflict', 'criticism', 'sensitive', 'emotional', 'nervous'],
};

const TRAIT_COLORS: Record<string, string> = {
  Openness: 'bg-purple-500',
  Conscientiousness: 'bg-blue-500',
  Extraversion: 'bg-orange-500',
  Agreeableness: 'bg-green-500',
  Neuroticism: 'bg-red-500',
};

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  'high-openness': ['Research Scientist', 'Creative Director', 'UX Designer', 'Innovation Lead'],
  'high-conscientiousness': ['Project Manager', 'Quality Analyst', 'Operations Manager', 'Auditor'],
  'high-extraversion': ['Team Lead', 'Sales Manager', 'Public Relations', 'Business Development'],
  'high-agreeableness': ['HR Manager', 'Customer Success', 'Social Worker', 'Counselor'],
};

function calculateTraitScore(text: string, trait: string): number {
  const keywords = TRAIT_KEYWORDS[trait as keyof typeof TRAIT_KEYWORDS];
  const textLower = text.toLowerCase();

  let score = 30; // Base score

  for (const keyword of keywords) {
    if (textLower.includes(keyword)) {
      score += 8;
    }
  }

  // Invert neuroticism (low mentions = emotionally stable)
  if (trait === 'Neuroticism') {
    score = Math.max(20, 100 - score);
  }

  return Math.min(100, score);
}

// Algorithm Workflow Visualization Component
interface AlgorithmWorkflowProps {
  cvText: string;
  onClose: () => void;
}

const ALGO_STEPS = [
  { id: 'init', label: 'Initialize', description: 'Load CV text for analysis' },
  { id: 'preprocess', label: 'Preprocessing', description: 'Clean text: lowercase, remove special chars' },
  { id: 'tokenize', label: 'Tokenization', description: 'Split text into individual words' },
  { id: 'analyze', label: 'Keyword Analysis', description: 'Match words against personality dictionaries' },
  { id: 'score', label: 'Scoring', description: 'Calculate weighted scores for OCEAN traits' },
  { id: 'result', label: 'Profile Generation', description: 'Determine dominant traits and roles' },
];

function AlgorithmWorkflow({ cvText, onClose }: AlgorithmWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const speedMs = Math.round(1500 / speed);

  // Derived data
  const preprocess = (text: string) => text.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokenize = (text: string) => preprocess(text).split(' ').filter(w => w.length > 2);

  const processedText = preprocess(cvText);
  const tokens = tokenize(cvText);

  // Analyze tokens against trait keywords (simplified logic for visualization)
  const traitKeywords = {
    'Openness': ['creative', 'innovative', 'design', 'research', 'learning'],
    'Conscientiousness': ['organized', 'efficient', 'plan', 'manage', 'quality'],
    'Extraversion': ['team', 'leadership', 'communication', 'public', 'social'],
    'Agreeableness': ['help', 'support', 'collaborate', 'volunteer', 'assist'],
    'Neuroticism': ['stress', 'pressure', 'deadline', 'urgent', 'critical']
  };

  const matchedKeywords: Record<string, string[]> = {
    'Openness': [], 'Conscientiousness': [], 'Extraversion': [], 'Agreeableness': [], 'Neuroticism': []
  };

  tokens.forEach(token => {
    for (const [trait, keywords] of Object.entries(traitKeywords)) {
      if (keywords.some(k => token.includes(k))) {
        if (!matchedKeywords[trait].includes(token)) matchedKeywords[trait].push(token);
      }
    }
  });

  const scores = {
    'Openness': Math.min(100, matchedKeywords['Openness'].length * 20 + 30),
    'Conscientiousness': Math.min(100, matchedKeywords['Conscientiousness'].length * 20 + 30),
    'Extraversion': Math.min(100, matchedKeywords['Extraversion'].length * 20 + 30),
    'Agreeableness': Math.min(100, matchedKeywords['Agreeableness'].length * 20 + 30),
    'Neuroticism': Math.max(0, 100 - (matchedKeywords['Neuroticism'].length * 20)),
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= ALGO_STEPS.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(interval);
  }, [isPlaying, speedMs]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg">Personality Analysis Workflow</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ALGO_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < currentStep ? 'bg-primary text-primary-foreground' :
                i === currentStep ? 'bg-primary/20 border-2 border-primary text-primary ring-2 ring-primary/20' :
                  'bg-muted text-muted-foreground'
                }`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              {i < ALGO_STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
          <div className="ml-auto pl-4 shrink-0">
            <Badge variant="outline" className="text-xs">
              {ALGO_STEPS[currentStep]?.label}
            </Badge>
          </div>
        </div>

        {/* Current Step Description */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Step {currentStep + 1}:</span>{' '}
            {ALGO_STEPS[currentStep]?.description}
          </p>
        </div>

        {/* Visual Container Cards */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CV Text Container */}
            <Card className={`transition-all ${currentStep >= 0 ? 'bg-card border-border' : 'opacity-40'}`}>
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  <span>📄 CV Content</span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentStep >= 1 ? 'Processed' : 'Raw'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-[100px]">
                  <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                    {currentStep >= 1 ? processedText : cvText}
                  </p>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Tokens Container */}
            <Card className={`transition-all ${currentStep >= 2 ? 'bg-card border-border' : 'opacity-40'}`}>
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  <span>🧩 Tokens</span>
                  <Badge variant="outline" className="text-[10px]">{currentStep >= 2 ? tokens.length : 0} words</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-[100px]">
                  <div className="flex flex-wrap gap-1.5">
                    {currentStep >= 2 ? tokens.slice(0, 30).map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">{t}</span>
                    )) : <span className="text-xs text-muted-foreground italic">Waiting for tokenization...</span>}
                    {currentStep >= 2 && tokens.length > 30 && <span className="text-[10px] text-muted-foreground">+{tokens.length - 30} more</span>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Keyword Analysis */}
            <Card className={`transition-all ${currentStep >= 3 ? 'bg-card border-border' : 'opacity-40'}`}>
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="text-xs">🔍 Keyword Matches</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-[140px]">
                  {currentStep >= 3 ? (
                    <div className="space-y-2">
                      {Object.entries(traitKeywords).map(([trait, kws]) => {
                        const matches = kws.filter(k => processedText.includes(k));
                        if (matches.length === 0) return null;
                        return (
                          <div key={trait} className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground">{trait}</span>
                            <div className="flex flex-wrap gap-1">
                              {matches.map(m => (
                                <span key={m} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-900">{m}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Waiting for analysis...</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Trait Scores Results */}
            <Card className={`transition-all ${currentStep >= 4 ? 'bg-primary/5 border-primary/20' : 'opacity-40'}`}>
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="text-xs">📈 Trait Scores</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-3 pt-1">
                  {Object.entries(scores).map(([trait, score]) => (
                    <div key={trait} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-medium">{trait}</span>
                        <span className="text-muted-foreground">{currentStep >= 4 ? `${score}%` : '—'}</span>
                      </div>
                      <Progress value={currentStep >= 4 ? score : 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Control Panel */}
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
                      if (currentStep >= ALGO_STEPS.length - 1) setCurrentStep(0);
                      setIsPlaying(true);
                    }}
                    className="gap-2 h-9 px-6"
                  >
                    <Play className="h-4 w-4" />
                    {currentStep > 0 && currentStep < ALGO_STEPS.length - 1 ? 'Resume' : 'Start'}
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
                  onClick={() => setCurrentStep(s => Math.min(ALGO_STEPS.length - 1, s + 1))}
                  disabled={isPlaying || currentStep >= ALGO_STEPS.length - 1}
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
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ============= ALGORITHM BUILDER COMPONENT =============
// Block definitions for the algorithm builder
const BLOCK_DEFINITIONS = {
  // Text Processing blocks
  lowercase: { id: 'lowercase', name: 'Lowercase', emoji: '🔤', category: 'text', color: 'bg-blue-500', description: 'Convert text to lowercase' },
  removeSymbols: { id: 'removeSymbols', name: 'Remove Symbols', emoji: '✂️', category: 'text', color: 'bg-blue-500', description: 'Remove special characters' },
  splitWords: { id: 'splitWords', name: 'Split Words', emoji: '📝', category: 'text', color: 'bg-blue-500', description: 'Split text into words' },

  // Dictionary blocks
  openness: { id: 'openness', name: 'Openness Dict', emoji: '🎨', category: 'dict', color: 'bg-purple-500', description: 'Creative, innovative keywords' },
  conscientiousness: { id: 'conscientiousness', name: 'Conscientious Dict', emoji: '📋', category: 'dict', color: 'bg-green-500', description: 'Organized, detail keywords' },
  extraversion: { id: 'extraversion', name: 'Extraversion Dict', emoji: '👥', category: 'dict', color: 'bg-yellow-500', description: 'Team, leadership keywords' },
  agreeableness: { id: 'agreeableness', name: 'Agreeableness Dict', emoji: '🤝', category: 'dict', color: 'bg-pink-500', description: 'Support, help keywords' },
  neuroticism: { id: 'neuroticism', name: 'Neuroticism Dict', emoji: '⚡', category: 'dict', color: 'bg-orange-500', description: 'Stress, challenge keywords' },

  // Math Operations blocks
  countMatches: { id: 'countMatches', name: 'Count Matches', emoji: '🔢', category: 'math', color: 'bg-emerald-500', description: 'Count keyword matches' },
  multiply: { id: 'multiply', name: 'Multiply ×10', emoji: '✖️', category: 'math', color: 'bg-emerald-500', description: 'Multiply score by 10' },
  addBase: { id: 'addBase', name: 'Add Base 30', emoji: '➕', category: 'math', color: 'bg-emerald-500', description: 'Add base score of 30' },
  normalize: { id: 'normalize', name: 'Normalize 0-100', emoji: '📏', category: 'math', color: 'bg-emerald-500', description: 'Clamp to 0-100 range' },

  // Output blocks
  showScore: { id: 'showScore', name: 'Show Score', emoji: '📊', category: 'output', color: 'bg-red-500', description: 'Display the score' },
  radarChart: { id: 'radarChart', name: 'Radar Chart', emoji: '🕸️', category: 'output', color: 'bg-red-500', description: 'Visualize all traits' },
  suggestions: { id: 'suggestions', name: 'Suggestions', emoji: '💡', category: 'output', color: 'bg-red-500', description: 'Show career suggestions' },

  // Simple Mode Super Blocks
  textProcessor: { id: 'textProcessor', name: 'Text Processor', emoji: '⚙️', category: 'simple', color: 'bg-blue-600', description: 'Cleans and prepares CV text automatically' },
  traitAnalyzer: { id: 'traitAnalyzer', name: 'Trait Analyzer', emoji: '🧠', category: 'simple', color: 'bg-purple-600', description: 'Finds personality keywords in the text' },
  scoreCalculator: { id: 'scoreCalculator', name: 'Score Calculator', emoji: '📈', category: 'simple', color: 'bg-emerald-600', description: 'Computes trait percentages (0-100%)' },
  resultDisplay: { id: 'resultDisplay', name: 'Show Results', emoji: '📊', category: 'simple', color: 'bg-red-600', description: 'Displays the final personality profile' },
};

// Educational explanations for each block
const BLOCK_EXPLANATIONS: Record<string, { why: string; how: string; example: string }> = {
  lowercase: {
    why: "Text comparison works better when everything is in the same case. 'Team' and 'team' should match!",
    how: "Converts all uppercase letters (A-Z) to lowercase (a-z) using .toLowerCase()",
    example: "'CREATIVE Team' → 'creative team'"
  },
  removeSymbols: {
    why: "Punctuation and special characters can interfere with word matching. We only care about actual words.",
    how: "Uses regex to remove non-alphanumeric characters: text.replace(/[^a-z0-9\\s]/gi, '')",
    example: "'Hello, World!' → 'Hello World'"
  },
  splitWords: {
    why: "To search for keywords, we need to break the text into individual tokens (words).",
    how: "Splits on whitespace using .split(/\\s+/) and filters empty strings",
    example: "'I am creative' → ['I', 'am', 'creative']"
  },
  openness: {
    why: "Openness indicates creativity, curiosity, and willingness to try new things - important for innovation roles.",
    how: "Searches for keywords like: creative, innovative, curious, artistic, imaginative",
    example: "CV with 'innovative solutions' → +1 Openness match"
  },
  conscientiousness: {
    why: "Conscientiousness shows organization, attention to detail, and reliability - valued in management.",
    how: "Searches for keywords like: organized, detail, efficient, systematic, planning",
    example: "CV with 'detail-oriented' → +1 Conscientiousness match"
  },
  extraversion: {
    why: "Extraversion indicates social skills and leadership - essential for team-facing roles.",
    how: "Searches for keywords like: team, leadership, communication, collaborative, mentor",
    example: "CV with 'team leadership' → +2 Extraversion matches"
  },
  agreeableness: {
    why: "Agreeableness shows cooperation and empathy - important for customer-facing and support roles.",
    how: "Searches for keywords like: support, help, volunteer, cooperative, flexible",
    example: "CV with 'volunteer work' → +1 Agreeableness match"
  },
  neuroticism: {
    why: "This trait indicates stress handling ability. Lower scores often mean better emotional stability.",
    how: "Searches for stress-related keywords: stress, pressure, challenge, deadline, difficult",
    example: "CV with 'thrives under pressure' → analyzed for stability"
  },
  countMatches: {
    why: "We need to quantify how strongly each trait appears in the CV text.",
    how: "Counts how many keywords from each trait dictionary were found in the text",
    example: "3 Openness keywords found → Openness count = 3"
  },
  multiply: {
    why: "Raw counts are too small. Multiplying amplifies differences between trait scores.",
    how: "Multiplies each trait count by 10 to create a meaningful score range",
    example: "Count of 3 → 3 × 10 = 30 points"
  },
  addBase: {
    why: "Everyone has some level of each trait. A base score ensures no trait is ever 0%.",
    how: "Adds a fixed value of 30 to each trait score as the baseline",
    example: "Score of 30 → 30 + 30 = 60 points"
  },
  normalize: {
    why: "Scores need to be on a 0-100% scale for easy interpretation and visualization.",
    how: "Clamps values: Math.min(100, Math.max(0, score)) ensures valid percentage",
    example: "Score of 120 → clamped to 100%"
  },
  showScore: {
    why: "The final step displays calculated personality trait percentages to the user.",
    how: "Formats and displays all trait scores in a readable format",
    example: "Output: Openness: 65%, Extraversion: 80%..."
  },
  radarChart: {
    why: "Visual representation helps users quickly understand their personality profile shape.",
    how: "Plots all 5 traits on a spider/radar chart for visual comparison",
    example: "Creates a pentagon shape showing trait balance"
  },
  suggestions: {
    why: "The ultimate goal: recommend careers that match the user's personality profile.",
    how: "Maps dominant traits to suitable career paths and job roles",
    example: "High Openness + Extraversion → Creative Director"
  },
  // Simple Mode Explanations
  textProcessor: {
    why: "Raw text is messy. This block automatically handles cleaning, lowercasing, and splitting text so the computer can understand it.",
    how: "Combines: .toLowerCase() + .replace() + .split() into one seamless step.",
    example: "'I am CREATIVE!' → ['i', 'am', 'creative']"
  },
  traitAnalyzer: {
    why: "This is the 'brain' of the system. It scans the processed words for specific keywords related to personality traits.",
    how: "Looks through 5 built-in dictionaries (Openness, etc.) and counts how many matches it finds.",
    example: "Found 'innovative' (Openness) and 'organized' (Conscientiousness)"
  },
  scoreCalculator: {
    why: "Raw counts aren't useful percentages. This math step turns keyword counts into a score from 0% to 100%.",
    how: "Uses the formula: (Count * 10) + 30 (Base score), then clamps it between 0 and 100.",
    example: "2 matches → (2*10) + 30 = 50%"
  },
  resultDisplay: {
    why: "Finally, we need to see what we built! This block creates the final visualization of the personality profile.",
    how: "Collects calculated scores and formats them into a readable summary.",
    example: "Openness: 65%, Conscientiousness: 80%..."
  },
};

// Tutorial steps for guided learning
const TUTORIAL_STEPS = [
  { step: 1, title: "Start with Text Processing", instruction: "Drag the 'Lowercase' block to the workspace. This is always the first step!", requiredBlocks: ['lowercase'], hint: "Find the blue 🔤 Lowercase block in the palette" },
  { step: 2, title: "Split into Words", instruction: "Add a 'Split Words' block. We need to break the text into searchable tokens.", requiredBlocks: ['lowercase', 'splitWords'], hint: "Look for 📝 Split Words in Text Processing" },
  { step: 3, title: "Add Trait Dictionaries", instruction: "Add at least 2 personality trait dictionaries to search for keywords.", requiredBlocks: ['lowercase', 'splitWords'], minDicts: 2, hint: "Try Openness 🎨 and Extraversion 👥" },
  { step: 4, title: "Calculate Scores", instruction: "Add math blocks: Multiply, Add Base, and Normalize to compute percentages.", requiredBlocks: ['multiply', 'addBase', 'normalize'], hint: "The order matters: Multiply → Add Base → Normalize" },
  { step: 5, title: "Display Results", instruction: "Add a 'Show Score' block to display the final personality analysis!", requiredBlocks: ['showScore'], hint: "Find 📊 Show Score in Output blocks" },
];

// Challenge definitions
const CHALLENGES = [
  { id: 'basic', name: '🌱 Basic Analysis', description: 'Build an algorithm with at least 3 traits and proper output', minBlocks: 6, requiredCategories: ['text', 'dict', 'output'], xpReward: 100 },
  { id: 'complete', name: '🎯 Complete Pipeline', description: 'Use all 5 processing stages: text → dict → math → output', minBlocks: 8, requiredCategories: ['text', 'dict', 'math', 'output'], xpReward: 200 },
  { id: 'master', name: '🏆 Master Builder', description: 'Build a full analyzer with all 5 traits and complete math pipeline', minBlocks: 12, allTraits: true, xpReward: 500 },
];

type BlockId = keyof typeof BLOCK_DEFINITIONS;

interface PlacedBlock {
  instanceId: string;
  blockId: BlockId;
  x: number;
  y: number;
}

interface AlgorithmBuilderProps {
  onClose: () => void;
}

function AlgorithmBuilder({ onClose }: AlgorithmBuilderProps) {
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BlockId | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [output, setOutput] = useState<string[]>([]);
  const [testText, setTestText] = useState('Creative team leader with innovative ideas and organized approach.');
  const [xp, setXp] = useState(0);
  const [completedAlgorithms, setCompletedAlgorithms] = useState(0);
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  // UI State
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['simple', 'text', 'dict', 'math', 'output']);
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Educational state
  const [activeTab, setActiveTab] = useState<'console' | 'learn' | 'dataflow'>('learn');
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<BlockId | null>(null);
  const [dataFlow, setDataFlow] = useState<{ text: string; words: string[]; scores: Record<string, number> }>({
    text: '',
    words: [],
    scores: {},
  });
  const [showLearnPanel, setShowLearnPanel] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  // Category organization
  const categories = isSimpleMode ? [
    { id: 'simple', name: '🚀 Super Blocks', blocks: ['textProcessor', 'traitAnalyzer', 'scoreCalculator', 'resultDisplay'] }
  ] : [
    { id: 'text', name: '🔤 Text Processing', blocks: ['lowercase', 'removeSymbols', 'splitWords'] },
    { id: 'dict', name: '📚 Dictionaries', blocks: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] },
    { id: 'math', name: '➕ Math Operations', blocks: ['countMatches', 'multiply', 'addBase', 'normalize'] },
    { id: 'output', name: '📊 Output', blocks: ['showScore', 'radarChart', 'suggestions'] },
  ];

  // Handle drag start from palette
  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId as any);
  };

  // Handle drop on workspace
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 200);
    const y = Math.floor((e.clientY - rect.top) / 110);

    const newBlock: PlacedBlock = {
      instanceId: `${draggedBlock}-${Date.now()}`,
      blockId: draggedBlock as any,
      x: Math.max(0, Math.min(x, 4)),
      y: Math.max(0, Math.min(y, 3)),
    };

    setPlacedBlocks(prev => [...prev, newBlock]);
    setXp(prev => prev + 10);
    setDraggedBlock(null);
  };

  // Check for tutorial challenge completion
  React.useEffect(() => {
    if (!tutorialMode || tutorialStep >= TUTORIAL_STEPS.length) return;

    const currentTutorial = TUTORIAL_STEPS[tutorialStep];
    const placedBlockTypes = new Set(placedBlocks.map(b => b.blockId));

    // Check if all required blocks are present
    const hasRequiredBlocks = currentTutorial.requiredBlocks?.every(b => placedBlockTypes.has(b as BlockId));
    // Check specific conditions
    const hasMinDicts = currentTutorial.minDicts ?
      placedBlocks.filter(b => (['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as string[]).includes(b.blockId)).length >= currentTutorial.minDicts
      : true;

    if (hasRequiredBlocks && hasMinDicts) {
      setTutorialStep(prev => prev + 1);
      setXp(prev => prev + 50);

      if (tutorialStep === TUTORIAL_STEPS.length - 1) {
        setOutput(['🎉 Tutorial Completed! You are now a certified Algorithm Builder!']);
      }
    }
  }, [placedBlocks, tutorialMode, tutorialStep]);

  // Remove block from workspace
  const handleRemoveBlock = (instanceId: string) => {
    setPlacedBlocks(prev => prev.filter(b => b.instanceId !== instanceId));
  };

  // Run the algorithm simulation
  const runAlgorithm = async () => {
    if (placedBlocks.length === 0) return;

    setIsRunning(true);
    setOutput([]);
    setCurrentStep(-1);
    setDataFlow({ text: testText, words: [], scores: {} });

    let text = testText;
    let wordsList: string[] = [];
    const results: string[] = [];
    const scores: Record<string, number> = {};

    // Sort blocks by position (left to right, top to bottom)
    const sortedBlocks = [...placedBlocks].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    for (let i = 0; i < sortedBlocks.length; i++) {
      setCurrentStep(i);
      const block = sortedBlocks[i];
      const def = BLOCK_DEFINITIONS[block.blockId];

      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (block.blockId) {
        case 'lowercase':
          text = text.toLowerCase();
          results.push(`✅ ${def.name}: "${text.slice(0, 40)}..."`);
          break;
        case 'removeSymbols':
          text = text.replace(/[^a-z0-9\s]/gi, '');
          results.push(`✅ ${def.name}: Cleaned → "${text.slice(0, 40)}..."`);
          break;
        case 'splitWords':
          wordsList = text.split(/\s+/).filter(Boolean);
          results.push(`✅ ${def.name}: [${wordsList.slice(0, 5).join(', ')}${wordsList.length > 5 ? '...' : ''}] (${wordsList.length} words)`);
          break;
        case 'openness':
        case 'conscientiousness':
        case 'extraversion':
        case 'agreeableness':
        case 'neuroticism':
          const traitShort = block.blockId.charAt(0).toUpperCase() + block.blockId.slice(1);
          const keywords = TRAIT_KEYWORDS[traitShort as keyof typeof TRAIT_KEYWORDS] || [];
          const matchedKws = keywords.filter(kw => text.includes(kw));
          scores[traitShort] = matchedKws.length;
          results.push(`✅ ${def.name}: Found [${matchedKws.join(', ') || 'none'}] → ${matchedKws.length} matches`);
          break;
        case 'countMatches':
          results.push(`✅ ${def.name}: Total counts = ${JSON.stringify(scores)}`);
          break;
        case 'multiply':
          Object.keys(scores).forEach(k => scores[k] *= 10);
          results.push(`✅ ${def.name}: ×10 → ${JSON.stringify(scores)}`);
          break;
        case 'addBase':
          Object.keys(scores).forEach(k => scores[k] += 30);
          results.push(`✅ ${def.name}: +30 → ${JSON.stringify(scores)}`);
          break;
        case 'normalize':
          Object.keys(scores).forEach(k => scores[k] = Math.min(100, Math.max(0, scores[k])));
          results.push(`✅ ${def.name}: Clamped to 0-100`);
          break;
        case 'showScore':
          const scoreStr = Object.entries(scores).map(([k, v]) => `${k}: ${v}%`).join(', ');
          results.push(`📊 FINAL: ${scoreStr || 'No traits!'}`);
          break;
        case 'radarChart':
          results.push(`🕸️ Chart: ${Object.keys(scores).length} traits plotted`);
          break;
        case 'suggestions':
          const topTrait = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
          results.push(`💡 Top trait: ${topTrait ? topTrait[0] : 'None'}`);
          break;

        // Simple Mode Super Blocks
        case 'textProcessor':
          text = text.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
          wordsList = text.split(/\s+/).filter(Boolean);
          results.push(`⚙️ Processed: ${wordsList.length} words ready for analysis`);
          break;
        case 'traitAnalyzer':
          Object.keys(TRAIT_KEYWORDS).forEach(trait => {
            const keywords = TRAIT_KEYWORDS[trait as keyof typeof TRAIT_KEYWORDS] || [];
            const matchedKws = keywords.filter(kw => text.includes(kw));
            scores[trait] = matchedKws.length;
          });
          results.push(`🧠 Analyzed: Keyword patterns found for all personality traits`);
          break;
        case 'scoreCalculator':
          Object.keys(scores).forEach(trait => {
            let score = (scores[trait] * 10) + 30;
            if (trait === 'Neuroticism') score = Math.max(20, 100 - score);
            scores[trait] = Math.min(100, Math.max(0, score));
          });
          results.push(`📈 Calculated: Counts converted to percentage scores (0-100%)`);
          break;
        case 'resultDisplay':
          const finalStr = Object.entries(scores).map(([k, v]) => `${k}: ${v}%`).join(' | ');
          results.push(`📊 PROFILE: ${finalStr || 'Analyzing...'}`);
          break;
      }

      // Update live data flow
      setDataFlow({ text, words: wordsList, scores: { ...scores } });
      setOutput([...results]);
    }

    setCurrentStep(-1);
    setIsRunning(false);
    setCompletedAlgorithms(prev => prev + 1);

    // Check challenge completion
    const blockCategories = new Set(placedBlocks.map(b => BLOCK_DEFINITIONS[b.blockId].category));
    const traitBlocks = placedBlocks.filter(b => ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].includes(b.blockId));

    let earnedXp = 50;
    CHALLENGES.forEach(challenge => {
      if (completedChallenges.includes(challenge.id)) return;
      const meetsBlocks = placedBlocks.length >= challenge.minBlocks;
      const meetsCategories = challenge.requiredCategories?.every(c => blockCategories.has(c)) ?? true;
      const meetsTraits = challenge.allTraits ? traitBlocks.length >= 5 : true;

      if (meetsBlocks && meetsCategories && meetsTraits) {
        setCompletedChallenges(prev => [...prev, challenge.id]);
        earnedXp += challenge.xpReward;
        results.push(`🏆 Challenge Complete: ${challenge.name} (+${challenge.xpReward} XP)`);
        setOutput([...results]);
      }
    });

    setXp(prev => prev + earnedXp);
  };

  // Clear workspace
  const clearWorkspace = () => {
    setPlacedBlocks([]);
    setOutput([]);
    setCurrentStep(-1);
  };

  // Load template algorithm
  // Load template algorithm - designed as a clear pipeline flow
  const loadTemplate = () => {
    if (isSimpleMode) {
      setPlacedBlocks([
        { instanceId: 'tmpl-s1', blockId: 'textProcessor', x: 0, y: 0 },
        { instanceId: 'tmpl-s2', blockId: 'traitAnalyzer', x: 1, y: 0 },
        { instanceId: 'tmpl-s3', blockId: 'scoreCalculator', x: 2, y: 0 },
        { instanceId: 'tmpl-s4', blockId: 'resultDisplay', x: 3, y: 0 },
      ]);
    } else {
      setPlacedBlocks([
        // Stage 1: Text Processing (Row 0)
        { instanceId: 'tmpl-1', blockId: 'lowercase', x: 0, y: 0 },
        { instanceId: 'tmpl-2', blockId: 'splitWords', x: 1, y: 0 },

        // Stage 2: Trait Dictionaries (Row 1) - 3 example traits
        { instanceId: 'tmpl-3', blockId: 'openness', x: 0, y: 1 },
        { instanceId: 'tmpl-4', blockId: 'conscientiousness', x: 1, y: 1 },
        { instanceId: 'tmpl-5', blockId: 'extraversion', x: 2, y: 1 },

        // Stage 3: Math Operations (Row 2)
        { instanceId: 'tmpl-6', blockId: 'countMatches', x: 0, y: 2 },
        { instanceId: 'tmpl-7', blockId: 'multiply', x: 1, y: 2 },
        { instanceId: 'tmpl-8', blockId: 'addBase', x: 2, y: 2 },
        { instanceId: 'tmpl-9', blockId: 'normalize', x: 3, y: 2 },

        // Stage 4: Output (Row 3)
        { instanceId: 'tmpl-10', blockId: 'showScore', x: 1, y: 3 },
      ]);
    }
    setXp(prev => prev + 25);
    setOutput(['📦 Template loaded! Click "Run" to execute the algorithm.']);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border shadow-2xl w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                {isSimpleMode ? '🚀' : '🧩'}
              </div>
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  Algorithm Builder
                  <Badge variant={isSimpleMode ? "default" : "secondary"} className="text-xs">
                    {isSimpleMode ? 'Simple Mode' : 'Advanced Mode'}
                  </Badge>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSimpleMode ? 'Learn the basics of personality prediction!' : 'Build a custom, high-precision analyzer!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
                <Button
                  variant={isSimpleMode ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setIsSimpleMode(true)}
                >
                  Simple
                </Button>
                <Button
                  variant={!isSimpleMode ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setIsSimpleMode(false)}
                >
                  Advanced
                </Button>
              </div>
              <Badge variant="outline">🏆 {completedAlgorithms} runs</Badge>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Block Palette */}
          <div className="w-64 border-r bg-muted/30 p-3 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">BLOCKS PALETTE</h3>
            {categories.map(category => (
              <div key={category.id} className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">{category.name}</p>
                <div className="space-y-1.5">
                  {category.blocks.map(blockId => {
                    const block = BLOCK_DEFINITIONS[blockId as BlockId];
                    return (
                      <div
                        key={blockId}
                        draggable
                        onDragStart={() => handleDragStart(blockId as BlockId)}
                        className={`
                          ${block.color} text-white px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing
                          flex items-center gap-2 text-sm font-medium shadow-sm
                          hover:scale-105 hover:shadow-md transition-all
                        `}
                      >
                        <span>{block.emoji}</span>
                        <span className="truncate">{block.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Center: Workspace */}
          <div className="flex-1 flex flex-col">
            {/* Test Input */}
            <div className="p-3 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Test CV:</span>
                <Input
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter test text..."
                  className="flex-1 text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={runAlgorithm}
                    disabled={isRunning || placedBlocks.length === 0}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 transform"
                  >
                    {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Run
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={loadTemplate} className="gap-2">
                    📦 Template
                  </Button>
                  <Button variant="outline" onClick={clearWorkspace} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Workspace Grid */}
            <div
              className="flex-1 p-4 bg-[radial-gradient(circle,#333_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#555_1px,transparent_1px)] bg-[length:20px_20px] overflow-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="min-h-[400px] relative">
                {/* Connection lines layer (bottom) */}
                <svg className="absolute inset-0 w-full h-full" style={{ minWidth: 800, minHeight: 400, zIndex: 0 }}>
                  {(() => {
                    // Sort blocks by y first, then by x for proper visual flow
                    const sortedBlocks = [...placedBlocks].sort((a, b) => {
                      if (a.y !== b.y) return a.y - b.y;
                      return a.x - b.x;
                    });

                    return sortedBlocks.map((block, index) => {
                      if (index === 0) return null;
                      const prev = sortedBlocks[index - 1];
                      const blockWidth = 200;
                      const x1 = prev.x * 240 + blockWidth;
                      const y1 = prev.y * 130 + 35;
                      const x2 = block.x * 240;
                      const y2 = block.y * 130 + 35;
                      const originalIndex = placedBlocks.findIndex(b => b.instanceId === block.instanceId);
                      const isActive = currentStep === originalIndex;

                      const midX = x1 + (x2 - x1) / 2;
                      const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                      return (
                        <g key={`line-${block.instanceId}`} className="group/arrow pointer-events-none">
                          <path d={pathD} fill="none" stroke="transparent" strokeWidth={20} />
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isActive ? '#22c55e' : '#94a3b8'}
                            strokeWidth={isActive ? 3 : 2}
                            strokeDasharray={isActive ? '0' : '8,4'}
                            className="transition-all duration-300 group-hover/arrow:stroke-indigo-500 group-hover/arrow:stroke-[3]"
                          />
                          <polygon
                            points={`${x2},${y2} ${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5}`}
                            fill={isActive ? '#22c55e' : '#94a3b8'}
                            className="transition-all duration-300 group-hover/arrow:fill-indigo-500"
                          />
                        </g>
                      );
                    });
                  })()}
                </svg>

                {/* Placed blocks layer (middle) */}
                <div style={{ zIndex: 10, position: 'relative' }}>
                  {placedBlocks.map((placedBlock, index) => {
                    const block = BLOCK_DEFINITIONS[placedBlock.blockId];
                    const isActive = currentStep === index;
                    return (
                      <div
                        key={placedBlock.instanceId}
                        className={`
                        absolute ${block.color} text-white px-4 py-3 rounded-2xl shadow-xl
                        flex items-center gap-3 min-w-[200px] border-2
                        ${isActive ? 'ring-4 ring-green-400 scale-105 border-white' : 'border-white/10'}
                        transition-all duration-300 group cursor-pointer
                      `}
                        onClick={() => setSelectedBlock(placedBlock.blockId)}
                        style={{
                          left: placedBlock.x * 240,
                          top: placedBlock.y * 130,
                          zIndex: 10
                        }}
                      >
                        <span className="text-2xl">{block.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs leading-tight">{block.name}</p>
                          <p className="text-[10px] opacity-70 truncate">{block.category.toUpperCase()}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBlock(placedBlock.instanceId);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {isActive && (
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white">
                            <Play className="h-3 w-3 fill-current" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tooltips layer (top) - Interactive and visible */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 800, minHeight: 400, zIndex: 20 }}>
                  {(() => {
                    const sortedBlocks = [...placedBlocks].sort((a, b) => {
                      if (a.y !== b.y) return a.y - b.y;
                      return a.x - b.x;
                    });

                    // Re-use connection explanation logic
                    const getConnectionExplanation = (fromId: string, toId: string) => {
                      const explanations: Record<string, Record<string, string>> = {
                        lowercase: { splitWords: "Lowercase text → Split into words", default: "Lowercase text flows to next step" },
                        splitWords: { openness: "Words → Search 'creative' keywords", conscientiousness: "Words → Search 'organized' keywords", extraversion: "Words → Search 'leadership' keywords", default: "Words passed to trait search" },
                        openness: { default: "Openness matches → Calculate score" },
                        conscientiousness: { default: "Conscientiousness → Calculate score" },
                        extraversion: { default: "Extraversion → Calculate score" },
                        countMatches: { default: "Match count → Multiply by weight" },
                        multiply: { default: "Weighted score → Add base 30" },
                        addBase: { default: "Raw score → Normalize to 0-100%" },
                        normalize: { default: "Normalized → Display results" },
                        showScore: { default: "Display final personality scores" }
                      };
                      const fromExplanations = explanations[fromId] || {};
                      return fromExplanations[toId] || fromExplanations.default || "Data flows to next step";
                    };

                    return sortedBlocks.map((block, index) => {
                      if (index === 0) return null;
                      const prev = sortedBlocks[index - 1];
                      const blockWidth = 160;
                      const x1 = prev.x * 200 + blockWidth;
                      const y1 = prev.y * 110 + 25;
                      const x2 = block.x * 200;
                      const y2 = block.y * 110 + 25;
                      const midX = (x1 + x2) / 2;
                      const midY = (y1 + y2) / 2;
                      const explanation = getConnectionExplanation(prev.blockId, block.blockId);

                      // Check allowing hover interaction on invisible line that matches connection line position
                      return (
                        <g key={`tooltip-${block.instanceId}`} className="group/tooltip pointer-events-auto">
                          {/* Invisible line matching the connection line to capture hover */}
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={24} className="cursor-help" />

                          {/* Tooltip box - Visible on hover */}
                          <g className="opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200">
                            <rect x={midX - 110} y={midY - 40} width={220} height={32} rx={8} fill="#0f172a" stroke="#818cf8" strokeWidth={1} className="shadow-xl" />
                            <text x={midX} y={midY - 20} textAnchor="middle" fill="#e2e8f0" fontSize={12} fontFamily="system-ui" fontWeight="500">{explanation}</text>
                            {/* Arrow pointer for tooltip */}
                            <polygon points={`${midX},${midY - 8} ${midX - 6},${midY - 18} ${midX + 6},${midY - 18}`} fill="#0f172a" stroke="#818cf8" strokeWidth={1} strokeDasharray="0,32,13" />
                          </g>
                        </g>
                      );
                    });
                  })()}
                </svg>

                {/* Empty state */}
                {placedBlocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">👆 Drag blocks here to build your algorithm</p>
                      <p className="text-sm">Or click "Template" to load an example</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Educational Panel with Tabs */}
          <div className="w-80 border-l bg-slate-900 text-slate-100 flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-700">
              {[
                { id: 'console', label: '📟 Console' },
                { id: 'learn', label: '📚 Learn' },
                { id: 'dataflow', label: '🔄 Data' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id !== 'learn') setSelectedBlock(null);
                  }}
                  className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-slate-800 text-white border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {/* Console Tab */}
              {activeTab === 'console' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    OUTPUT CONSOLE
                  </h3>
                  <div className="space-y-1 font-mono text-xs">
                    {output.length === 0 ? (
                      <p className="text-slate-500 italic">Click "Run" to execute...</p>
                    ) : (
                      output.map((line, i) => (
                        <div key={i} className="py-1 px-2 bg-slate-800 rounded animate-in slide-in-from-left">
                          {line}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Live Data Flow Preview */}
                  {(dataFlow.text || Object.keys(dataFlow.scores).length > 0) && (
                    <div className="mt-4 pt-3 border-t border-slate-700 space-y-2">
                      <h4 className="text-xs font-semibold text-indigo-400">📊 Live Data</h4>
                      {dataFlow.text && (
                        <div className="bg-slate-800/50 p-2 rounded text-[10px]">
                          <span className="text-slate-500">text:</span> "{dataFlow.text.slice(0, 50)}..."
                        </div>
                      )}
                      {dataFlow.words.length > 0 && (
                        <div className="bg-slate-800/50 p-2 rounded text-[10px]">
                          <span className="text-slate-500">words:</span> [{dataFlow.words.slice(0, 4).join(', ')}...]
                        </div>
                      )}
                      {Object.keys(dataFlow.scores).length > 0 && (
                        <div className="bg-slate-800/50 p-2 rounded text-[10px]">
                          <span className="text-slate-500">scores:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(dataFlow.scores).map(([trait, score]) => (
                              <div key={trait} className="flex items-center gap-2">
                                <span className="w-16 truncate">{trait}</span>
                                <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                    style={{ width: `${Math.min(100, score)}%` }}
                                  />
                                </div>
                                <span className="text-indigo-400 w-8">{score}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Learn Tab - Block Explanations */}
              {activeTab === 'learn' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    📚 Learn How It Works
                  </h3>

                  {selectedBlock && BLOCK_EXPLANATIONS[selectedBlock] ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                        <span className="text-2xl">{BLOCK_DEFINITIONS[selectedBlock].emoji}</span>
                        <div>
                          <h4 className="font-bold">{BLOCK_DEFINITIONS[selectedBlock].name}</h4>
                          <p className="text-xs text-slate-400">{BLOCK_DEFINITIONS[selectedBlock].description}</p>
                        </div>
                      </div>

                      <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                        <h5 className="text-xs font-bold text-blue-400 mb-1">💡 WHY?</h5>
                        <p className="text-xs text-slate-300">{BLOCK_EXPLANATIONS[selectedBlock].why}</p>
                      </div>

                      <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
                        <h5 className="text-xs font-bold text-green-400 mb-1">⚙️ HOW?</h5>
                        <p className="text-xs text-slate-300 font-mono">{BLOCK_EXPLANATIONS[selectedBlock].how}</p>
                      </div>

                      <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                        <h5 className="text-xs font-bold text-purple-400 mb-1">📝 EXAMPLE</h5>
                        <p className="text-xs text-slate-300">{BLOCK_EXPLANATIONS[selectedBlock].example}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-slate-600 text-slate-300"
                        onClick={() => setSelectedBlock(null)}
                      >
                        ← Back to Overview
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 mb-3">
                        Click any block below to learn what it does and why it's important!
                      </p>
                      {Object.entries(BLOCK_DEFINITIONS).map(([id, block]) => (
                        <button
                          key={id}
                          onClick={() => setSelectedBlock(id as BlockId)}
                          className={`w-full text-left p-2 rounded-lg ${block.color} hover:opacity-80 transition-opacity flex items-center gap-2`}
                        >
                          <span>{block.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{block.name}</p>
                            <p className="text-[10px] opacity-80 truncate">{block.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Data Flow Tab */}
              {activeTab === 'dataflow' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    DATA FLOW INSPECTOR
                  </h3>

                  {isRunning ? (
                    <div className="space-y-3">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Current processing step:</p>
                        <p className="text-sm font-mono text-green-400">
                          {currentStep >= 0
                            ? BLOCK_DEFINITIONS[placedBlocks[currentStep]?.blockId]?.name || 'Initializing...'
                            : 'Waiting to start...'}
                        </p>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Current Text Data:</p>
                        <p className="text-xs font-mono text-slate-300 break-words bg-slate-900 p-2 rounded">
                          {dataFlow.text || testText}
                        </p>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Extracted Words:</p>
                        <div className="flex flex-wrap gap-1">
                          {dataFlow.words.length > 0 ? dataFlow.words.map((w, i) => (
                            <Badge key={i} className="bg-slate-700 text-[10px]">{w}</Badge>
                          )) : <span className="text-xs text-slate-500 italic">No words split yet</span>}
                        </div>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Trait Scores:</p>
                        <div className="space-y-1">
                          {Object.entries(dataFlow.scores).map(([trait, score]) => (
                            <div key={trait} className="flex justify-between text-xs">
                              <span>{trait}:</span>
                              <span className="font-mono text-indigo-400">{score}</span>
                            </div>
                          ))}
                          {Object.keys(dataFlow.scores).length === 0 && <span className="text-xs text-slate-500 italic">No scores calculated yet</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Run the algorithm to see live data flow!</p>
                    </div>
                  )}
                </div>
              )}


            </div>





            {/* Quick stats footer */}
            <div className="p-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-lg font-bold text-indigo-400">{placedBlocks.length}</p>
                <p className="text-[10px] text-slate-400">Blocks</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-lg font-bold text-green-400">{output.length}</p>
                <p className="text-[10px] text-slate-400">Steps</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-lg font-bold text-yellow-400">{xp}</p>
                <p className="text-[10px] text-slate-400">XP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive Exercise 1 Component - CV Modifier with Real-time Trait Updates
interface Exercise1PracticeProps {
  onClose: () => void;
}

// Target job profiles for the challenge mode
const JOB_PROFILES = [
  {
    name: 'Creative Director',
    emoji: '🎨',
    targets: { Openness: 85, Conscientiousness: 60, Extraversion: 70, Agreeableness: 55, Neuroticism: 70 }
  },
  {
    name: 'Project Manager',
    emoji: '📊',
    targets: { Openness: 55, Conscientiousness: 90, Extraversion: 75, Agreeableness: 65, Neuroticism: 75 }
  },
  {
    name: 'Team Lead',
    emoji: '👥',
    targets: { Openness: 60, Conscientiousness: 70, Extraversion: 85, Agreeableness: 75, Neuroticism: 70 }
  },
  {
    name: 'Research Scientist',
    emoji: '🔬',
    targets: { Openness: 90, Conscientiousness: 80, Extraversion: 45, Agreeableness: 55, Neuroticism: 65 }
  },
];

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_word', name: 'First Steps', emoji: '👶', desc: 'Add your first keyword', condition: (stats: any) => stats.totalKeywords >= 1 },
  { id: 'five_words', name: 'Getting Started', emoji: '🚀', desc: 'Add 5 keywords', condition: (stats: any) => stats.totalKeywords >= 5 },
  { id: 'ten_words', name: 'Wordsmith', emoji: '✍️', desc: 'Add 10 keywords', condition: (stats: any) => stats.totalKeywords >= 10 },
  { id: 'all_traits', name: 'Well Rounded', emoji: '🎯', desc: 'Have keywords in all 5 traits', condition: (stats: any) => stats.traitsWithKeywords >= 5 },
  { id: 'high_score', name: 'Overachiever', emoji: '🏆', desc: 'Get any trait above 70%', condition: (stats: any) => stats.maxScore >= 70 },
  { id: 'combo_3', name: 'Combo Master', emoji: '🔥', desc: 'Get a 3x combo', condition: (stats: any) => stats.maxCombo >= 3 },
  { id: 'challenge', name: 'Challenge Accepted', emoji: '⭐', desc: 'Match a job profile (85%+)', condition: (stats: any) => stats.challengeMatch >= 85 },
];

function Exercise1Practice({ onClose }: Exercise1PracticeProps) {
  const [cvText, setCvText] = useState(`Software developer with 3 years of experience.`);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);
  const [selectedJob, setSelectedJob] = useState(JOB_PROFILES[0]);
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, color: string }>>([]);
  const [lastAddedTrait, setLastAddedTrait] = useState<string | null>(null);

  // Calculate level from XP
  const level = Math.floor(xp / 100) + 1;
  const xpToNextLevel = 100 - (xp % 100);

  // Calculate scores in real-time
  const scores = React.useMemo(() => {
    const result: Record<string, number> = {};
    for (const trait of Object.keys(TRAIT_KEYWORDS)) {
      result[trait] = calculateTraitScore(cvText, trait);
    }
    return result;
  }, [cvText]);

  // Find matched keywords
  const matchedKeywords = React.useMemo(() => {
    const result: Record<string, string[]> = {};
    const textLower = cvText.toLowerCase();
    for (const [trait, keywords] of Object.entries(TRAIT_KEYWORDS)) {
      result[trait] = keywords.filter(kw => textLower.includes(kw));
    }
    return result;
  }, [cvText]);

  // Calculate challenge match percentage
  const challengeMatch = React.useMemo(() => {
    let totalDiff = 0;
    const targets = selectedJob.targets;
    for (const trait of Object.keys(targets)) {
      const diff = Math.abs(scores[trait] - targets[trait as keyof typeof targets]);
      totalDiff += diff;
    }
    const avgDiff = totalDiff / 5;
    return Math.max(0, Math.round(100 - avgDiff));
  }, [scores, selectedJob]);

  // Stats for achievements
  const stats = React.useMemo(() => ({
    totalKeywords: Object.values(matchedKeywords).flat().length,
    traitsWithKeywords: Object.values(matchedKeywords).filter(arr => arr.length > 0).length,
    maxScore: Math.max(...Object.values(scores)),
    maxCombo,
    challengeMatch,
  }), [matchedKeywords, scores, maxCombo, challengeMatch]);

  // Check for new achievements
  React.useEffect(() => {
    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setShowAchievement(achievement);
        setXp(prev => prev + 50); // Bonus XP for achievements

        // Hide achievement notification after 3 seconds
        setTimeout(() => setShowAchievement(null), 3000);
      }
    }
  }, [stats, unlockedAchievements]);

  // Suggested words with XP values
  const traitSuggestions: Record<string, { word: string, xp: number }[]> = {
    Openness: [
      { word: 'creative', xp: 15 }, { word: 'innovative', xp: 20 }, { word: 'research', xp: 15 },
      { word: 'design', xp: 10 }, { word: 'curious', xp: 15 }, { word: 'explore', xp: 10 }
    ],
    Conscientiousness: [
      { word: 'organized', xp: 15 }, { word: 'detail', xp: 10 }, { word: 'efficient', xp: 15 },
      { word: 'quality', xp: 20 }, { word: 'planning', xp: 15 }, { word: 'systematic', xp: 15 }
    ],
    Extraversion: [
      { word: 'team', xp: 10 }, { word: 'leadership', xp: 25 }, { word: 'communication', xp: 20 },
      { word: 'mentor', xp: 20 }, { word: 'collaborate', xp: 15 }, { word: 'present', xp: 15 }
    ],
    Agreeableness: [
      { word: 'support', xp: 15 }, { word: 'help', xp: 10 }, { word: 'volunteer', xp: 20 },
      { word: 'cooperative', xp: 15 }, { word: 'flexible', xp: 15 }, { word: 'empathy', xp: 20 }
    ],
    Neuroticism: [
      { word: 'stress', xp: 10 }, { word: 'pressure', xp: 10 }, { word: 'challenge', xp: 15 },
      { word: 'conflict', xp: 10 }, { word: 'difficult', xp: 10 }, { word: 'deadline', xp: 15 }
    ],
  };

  // Handle adding a keyword
  const handleAddKeyword = (word: string, trait: string, baseXp: number) => {
    setCvText(prev => prev + ' ' + word);
    setLastAddedTrait(trait);

    // Update combo
    const newCombo = combo + 1;
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));

    // Calculate XP with combo multiplier
    const comboMultiplier = Math.min(newCombo, 5);
    const earnedXp = baseXp * comboMultiplier;
    setXp(prev => prev + earnedXp);

    // Create particle effect
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: TRAIT_COLORS[trait].replace('bg-', '').replace('-500', '')
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Clear particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);

    // Reset combo after 2 seconds of inactivity
    setTimeout(() => setCombo(0), 2000);
    setTimeout(() => setLastAddedTrait(null), 500);
  };

  // Get dominant trait
  const dominantTrait = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Particle effects */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full animate-ping pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: `var(--${p.color})`,
            animation: 'ping 1s ease-out forwards'
          }}
        />
      ))}

      {/* Achievement popup */}
      {showAchievement && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in">
          <div className="bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <span className="text-4xl">{showAchievement.emoji}</span>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-70">Achievement Unlocked!</p>
              <p className="font-bold text-lg">{showAchievement.name}</p>
              <p className="text-sm opacity-80">{showAchievement.desc} • +50 XP</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header with XP Bar */}
        <div className="p-4 border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {level}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] px-1.5 rounded-full font-bold">
                  LVL
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  🎮 CV Personality Builder
                  {combo >= 2 && (
                    <span className="text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      {combo}x COMBO!
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">Add keywords to earn XP and unlock achievements!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{xp} XP</p>
                <p className="text-xs text-muted-foreground">{xpToNextLevel} XP to next level</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${(xp % 100)}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Left: CV Editor */}
            <div className="space-y-4">
              <Card className="border-2 border-dashed border-primary/30">
                <CardHeader className="py-3 bg-primary/5">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Your CV
                    <Badge variant="outline" className="ml-auto">{cvText.split(/\s+/).filter(Boolean).length} words</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <Textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Type your CV content here..."
                    className="min-h-[150px] font-mono text-sm resize-none border-0 focus-visible:ring-0"
                  />
                </CardContent>
              </Card>

              {/* Keyword Shop */}
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
                <CardHeader className="py-3 border-b border-slate-700">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    Keyword Shop
                    <span className="text-xs text-slate-400 ml-auto">Click to add & earn XP!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
                  {Object.entries(traitSuggestions).map(([trait, suggestions]) => (
                    <div key={trait} className={`p-2 rounded-lg ${lastAddedTrait === trait ? 'ring-2 ring-yellow-400 scale-[1.02]' : ''} transition-all`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${TRAIT_COLORS[trait]}`} />
                        <span className="text-xs font-medium text-slate-300">{trait}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map(({ word, xp: baseXp }) => {
                          const isUsed = cvText.toLowerCase().includes(word);
                          return (
                            <button
                              key={word}
                              onClick={() => !isUsed && handleAddKeyword(word, trait, baseXp)}
                              disabled={isUsed}
                              className={`
                                group relative text-xs px-2 py-1 rounded-lg transition-all
                                ${isUsed
                                  ? 'bg-slate-700/50 text-slate-500 line-through'
                                  : 'bg-slate-700 hover:bg-slate-600 hover:scale-105 cursor-pointer'}
                              `}
                            >
                              {word}
                              {!isUsed && (
                                <span className="absolute -top-2 -right-2 text-[10px] bg-yellow-400 text-black px-1 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                  +{baseXp}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Middle: Personality Profile */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Your Personality
                    <Badge className={`ml-auto ${TRAIT_COLORS[dominantTrait]} text-white`}>
                      {dominantTrait}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(scores).map(([trait, score]) => {
                    const target = selectedJob.targets[trait as keyof typeof selectedJob.targets];
                    const isClose = Math.abs(score - target) <= 15;
                    return (
                      <div key={trait} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${TRAIT_COLORS[trait]}`} />
                            <span className="font-medium">{trait}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{score.toFixed(0)}%</span>
                            {isClose && <span className="text-emerald-500">✓</span>}
                          </div>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                          {/* Target marker */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-white/50 z-10"
                            style={{ left: `${target}%` }}
                          >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px]">🎯</div>
                          </div>
                          {/* Score bar */}
                          <div
                            className={`h-full transition-all duration-500 ease-out ${TRAIT_COLORS[trait]}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        {matchedKeywords[trait].length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {matchedKeywords[trait].slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-primary/10 rounded-full">
                                ✓ {kw}
                              </span>
                            ))}
                            {matchedKeywords[trait].length > 3 && (
                              <span className="text-[9px] text-muted-foreground">+{matchedKeywords[trait].length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Job Profile Challenge */}
              <Card className={`border-2 ${challengeMatch >= 85 ? 'border-emerald-500 bg-emerald-500/10' : 'border-primary/30'}`}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    🎯 Challenge: Match the Profile
                    <Badge variant={challengeMatch >= 85 ? "default" : "secondary"} className="ml-auto">
                      {challengeMatch}% Match
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {JOB_PROFILES.map(job => (
                      <button
                        key={job.name}
                        onClick={() => setSelectedJob(job)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all ${selectedJob.name === job.name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                          }`}
                      >
                        {job.emoji} {job.name}
                      </button>
                    ))}
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${challengeMatch >= 85 ? 'bg-emerald-500' : challengeMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${challengeMatch}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {challengeMatch >= 85
                      ? '🎉 Perfect match! You nailed it!'
                      : challengeMatch >= 60
                        ? '👍 Getting close! Adjust your keywords.'
                        : '💪 Keep adding relevant keywords!'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Achievements */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    🏆 Achievements
                    <Badge variant="outline" className="ml-auto">
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ACHIEVEMENTS.map(achievement => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isUnlocked ? 'bg-amber-500/20' : 'bg-muted/30 opacity-60'
                          }`}
                      >
                        <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                            {achievement.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {achievement.desc}
                          </p>
                        </div>
                        {isUnlocked && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="py-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{stats.totalKeywords}</p>
                      <p className="text-[10px] text-muted-foreground">Keywords Used</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-orange-500">{maxCombo}x</p>
                      <p className="text-[10px] text-muted-foreground">Max Combo</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-purple-500">{stats.traitsWithKeywords}/5</p>
                      <p className="text-[10px] text-muted-foreground">Traits Covered</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-500">{stats.maxScore.toFixed(0)}%</p>
                      <p className="text-[10px] text-muted-foreground">Highest Trait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCvText(`Software developer with 3 years of experience.`);
                  setXp(0);
                  setCombo(0);
                  setMaxCombo(0);
                  setUnlockedAchievements([]);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}


// Wrapper component for Practice Exercises with modal management
function PracticeExercises() {
  return (
    <div className="space-y-6">
      <ContentSection title="Practice Exercises" icon="Pencil">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <Badge variant="outline" className="mb-2">Beginner</Badge>
              <h4 className="font-semibold mb-2">Keyword Impact Analysis</h4>
              <p className="text-sm text-muted-foreground">
                How does the frequency of specific keywords (e.g., 'creative', 'organized', 'leader') influence the scoring of different personality traits in the Big Five model?
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <Badge variant="outline" className="mb-2">Intermediate</Badge>
              <h4 className="font-semibold mb-2">Limitations of Keyword Matching</h4>
              <p className="text-sm text-muted-foreground">
                Why might a simple keyword matching approach fail to accurately predict personality from complex sentences? Consider how context, negation, and sarcasm affect interpretation.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </div>
  );
}

function PersonalityDemo() {
  const { toast } = useToast();
  const [cvText, setCvText] = useState(`Experienced software engineer with 5 years of experience in developing innovative solutions. Strong leadership skills with experience managing cross-functional teams. Passionate about creative problem-solving and continuous learning.

Skills: Team collaboration, project management, research, communication, organized planning, quality assurance.

Volunteer experience: Mentored junior developers, organized community coding workshops. Detail-oriented approach to code review and documentation.`);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Interactive Analysis State
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [detectedKeywords, setDetectedKeywords] = useState<Record<string, string[]>>({});
  const [currentAlgoStep, setCurrentAlgoStep] = useState<number>(0);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showAlgorithmBuilder, setShowAlgorithmBuilder] = useState(false);

  const ALGORITHM_STEPS = [
    { id: 1, title: 'Preprocessing', desc: 'Clean, tokenize, remove stop words' },
    { id: 2, title: 'Keyword Extraction', desc: 'Identify trait-specific terms' },
    { id: 3, title: 'Trait Scoring', desc: 'Calculate weighted scores' },
    { id: 4, title: 'Special Handling', desc: 'Adjust for negative indicators' },
    { id: 5, title: 'Analysis', desc: 'Generate insights & roles' },
    { id: 6, title: 'Return', desc: 'Finalize output' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setCvText(text);
          setFileName(file.name);
          setShowResults(false);
          toast({
            title: "File uploaded",
            description: "CV text has been extracted successfully from .txt file.",
          });
        };
        reader.readAsText(file);
      }
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setCvText(result.value);
        setFileName(file.name);
        setShowResults(false);
        toast({
          title: "File uploaded",
          description: "CV text has been extracted successfully from .docx file.",
        });
      }
      else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();

        // Dynamically import PDF.js
        const pdfjsLib = await import(/* @vite-ignore */ PDFJS_CDN);
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        if (!fullText.trim()) {
          console.error('PDF Extraction Result: EMPTY STRING');
          toast({
            title: "No text found",
            description: "Could not extract text from this PDF. It might be an image-based scan.",
            variant: "destructive"
          });
          return;
        }

        console.log('PDF Extracted Text Length:', fullText.length);
        console.log('PDF Preview:', fullText.substring(0, 500));



        setCvText(fullText);
        setFileName(file.name);
        setShowResults(false);
        toast({
          title: "File uploaded",
          description: "CV text has been extracted successfully from .pdf file.",
        });
      }
      else {
        toast({
          title: "Unsupported file type",
          description: "Please upload a .txt, .docx, or .pdf file.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('File parsing error:', error);
      toast({
        title: "Error parsing file",
        description: "Could not extract text from the file. Please try converting to .txt.",
        variant: "destructive"
      });
    }
  };

  const handleScan = () => {
    if (!cvText.trim()) {
      toast({
        title: "No content",
        description: "Please enter CV text or upload a file first.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setShowResults(false);
    setScanProgress(0);
    setAnalysisLogs([]);
    setDetectedKeywords({});
    setAnalysisStep('Initializing...');
    setCurrentAlgoStep(0);
    // Start at step 1 immediately
    setTimeout(() => handleNextStep(1), 500);
  };

  const handleNextStep = (stepOverride?: number) => {
    const nextStep = stepOverride !== undefined ? stepOverride : currentAlgoStep + 1;
    setCurrentAlgoStep(nextStep);

    // Calculate progress based on step (1 to 6)
    const progress = Math.min(100, Math.round((nextStep / 6) * 100));
    setScanProgress(progress);

    if (nextStep === 1) {
      setAnalysisStep('Preprocessing Text');
      setAnalysisLogs(prev => [...prev, "Converting text to lowercase...", "Removing special characters...", "Tokenizing words..."]);
    } else if (nextStep === 2) {
      setAnalysisStep('Keyword Extraction');
      setAnalysisLogs(prev => [...prev, "Scanning for personality indicators..."]);

      // Simulate finding keywords based on actual text content
      const textLower = cvText.toLowerCase();
      const found: Record<string, string[]> = {};

      Object.entries(TRAIT_KEYWORDS).forEach(([trait, keywords]) => {
        const matches = keywords.filter(k => textLower.includes(k));
        if (matches.length > 0) {
          found[trait] = matches;
          setAnalysisLogs(prev => [...prev, `Found ${matches.length} keywords for ${trait}: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`]);
        }
      });
      setDetectedKeywords(found);
    } else if (nextStep === 3) {
      setAnalysisStep('Scoring Traits');
      setAnalysisLogs(prev => [...prev, "Calculating weighted scores...", "Normalizing values (0-100)..."]);
    } else if (nextStep === 4) {
      setAnalysisStep('Special Handling');
      setAnalysisLogs(prev => [...prev, "Applying Neuroticism inversion (low = stable)..."]);
    } else if (nextStep === 5) {
      setAnalysisStep('Generating Profile');
      setAnalysisLogs(prev => [...prev, "Identifying dominant traits...", "Matching with role database...", "Generating insights..."]);
    } else if (nextStep >= 6) {
      setAnalysisStep('Complete');
      setAnalysisLogs(prev => [...prev, "Analysis complete. Generating report..."]);
      setTimeout(() => {
        setIsScanning(false);
        setShowResults(true);
      }, 800);
    }
  };

  const analysis = useMemo(() => {
    if (!cvText.trim()) return null;

    // Only calculate if we have text. 
    // The display logic {showResults && analysis && ...} handles the visibility.

    const scores: Record<string, number> = {};
    for (const trait of Object.keys(TRAIT_KEYWORDS)) {
      scores[trait] = calculateTraitScore(cvText, trait);
    }

    const sortedTraits = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);

    const dominantTraits = sortedTraits.slice(0, 2).map(([t]) => t);

    // Generate insights based on dominant traits (always show something)
    const insights: string[] = [];

    // Add insights for top 2 traits regardless of absolute score
    dominantTraits.forEach(trait => {
      if (trait === 'Openness') insights.push("Strong creative and innovative mindset");
      if (trait === 'Conscientiousness') insights.push("Highly organized and detail-oriented");
      if (trait === 'Extraversion') insights.push("Natural leader with strong communication skills");
      if (trait === 'Agreeableness') insights.push("Excellent team player and collaborator");
      if (trait === 'Neuroticism') insights.push("Handles stress and pressure effectively");
    });

    // Add specific high-score insights if any
    if (scores.Openness > 75 && !dominantTraits.includes('Openness')) insights.push("Shows exceptional creativity");
    if (scores.Conscientiousness > 75 && !dominantTraits.includes('Conscientiousness')) insights.push("Very meticulous work approach");

    // Suggest roles based on dominant traits
    let roles: string[] = [];

    // Primary suggestions from top trait
    const primaryTrait = dominantTraits[0];
    if (primaryTrait === 'Openness') roles.push(...ROLE_SUGGESTIONS['high-openness']);
    else if (primaryTrait === 'Conscientiousness') roles.push(...ROLE_SUGGESTIONS['high-conscientiousness']);
    else if (primaryTrait === 'Extraversion') roles.push(...ROLE_SUGGESTIONS['high-extraversion']);
    else if (primaryTrait === 'Agreeableness') roles.push(...ROLE_SUGGESTIONS['high-agreeableness']);
    else if (primaryTrait === 'Neuroticism') roles.push('Crisis Manager', 'Mediator', 'Strategic Planner'); // Custom for stable neuroticism

    // Secondary suggestions from second trait
    if (dominantTraits.length > 1) {
      const secondaryTrait = dominantTraits[1];
      if (secondaryTrait === 'Openness') roles.push(...ROLE_SUGGESTIONS['high-openness'].slice(0, 2));
      else if (secondaryTrait === 'Conscientiousness') roles.push(...ROLE_SUGGESTIONS['high-conscientiousness'].slice(0, 2));
      else if (secondaryTrait === 'Extraversion') roles.push(...ROLE_SUGGESTIONS['high-extraversion'].slice(0, 2));
      else if (secondaryTrait === 'Agreeableness') roles.push(...ROLE_SUGGESTIONS['high-agreeableness'].slice(0, 2));
    }

    roles = [...new Set(roles)].slice(0, 4);

    return { scores, dominantTraits, insights, roles };
  }, [cvText]);

  return (
    <>
      {/* Algorithm Workflow Modal */}
      {showWorkflow && (
        <AlgorithmWorkflow
          cvText={cvText}
          onClose={() => setShowWorkflow(false)}
        />
      )}

      {/* Algorithm Builder Modal */}
      {showAlgorithmBuilder && (
        <AlgorithmBuilder
          onClose={() => setShowAlgorithmBuilder(false)}
        />
      )}

      <div className="space-y-6">
        {/* CV Input & Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserSearch className="h-5 w-5 text-primary" />
              CV Input & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Textarea
                  value={cvText}
                  onChange={(e) => {
                    setCvText(e.target.value);
                    setShowResults(false);
                  }}
                  placeholder="Paste your CV / resume text here..."
                  rows={8}
                  className="resize-none font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-4 min-w-[200px]">
                <div className="p-4 border border-dashed rounded-lg bg-muted/30 text-center space-y-2">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div className="text-sm text-muted-foreground">
                    {fileName ? (
                      <span className="text-primary font-medium">{fileName}</span>
                    ) : (
                      "Upload CV (.txt, .docx, .pdf)"
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".txt,.docx,.pdf"
                    className="hidden"
                    id="cv-upload"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </label>
                  </Button>
                </div>

                <Button
                  onClick={handleScan}
                  disabled={isScanning || !cvText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4 mr-2" />
                      Scan & Analyze
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setShowWorkflow(true)}
                  className="w-full"
                  size="sm"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Algorithm Workflow
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowAlgorithmBuilder(true)}
                  className="w-full border-indigo-500/50 hover:bg-indigo-500/10"
                  size="sm"
                >
                  🧩 Algorithm Builder
                </Button>
              </div>
            </div>

            {isScanning && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{analysisStep}</span>
                      {currentAlgoStep < 6 && (
                        <Badge variant="outline" className="text-xs">Step {currentAlgoStep}/6</Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="h-2" />
                </div>

                {/* Manual Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleNextStep()}
                    className="flex-1"
                    disabled={currentAlgoStep >= 6}
                  >
                    {currentAlgoStep >= 5 ? "Complete Analysis" : "Next Step"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsScanning(false);
                      setCurrentAlgoStep(0);
                      setAnalysisStep('');
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {/* Live Analysis Terminal */}
                <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded-md h-40 overflow-y-auto border border-green-900 shadow-inner">
                  {analysisLogs.map((log, i) => (
                    <div key={i} className="mb-1 animate-in fade-in slide-in-from-left-1">
                      <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                      {log}
                    </div>
                  ))}
                  <div className="animate-pulse">_</div>
                </div>

                {/* Algorithm Pipeline Visualization */}
                <div className="grid grid-cols-6 gap-2 mt-4">
                  {ALGORITHM_STEPS.map((step) => {
                    const isActive = currentAlgoStep === step.id;
                    const isCompleted = currentAlgoStep > step.id;

                    return (
                      <div
                        key={step.id}
                        className={`
                          relative p-2 rounded border text-center transition-all duration-300
                          ${isActive ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-md z-10' : ''}
                          ${isCompleted ? 'bg-muted text-muted-foreground border-transparent opacity-80' : 'bg-background border-muted'}
                        `}
                      >
                        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1">Step {step.id}</div>
                        <div className="text-xs font-medium leading-tight">{step.title}</div>

                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45 translate-y-1/2"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showResults && analysis && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Personality Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Big Five Personality Traits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.scores).map(([trait, score]) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{trait}</span>
                      <span className="font-mono">{score.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${TRAIT_COLORS[trait]}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    {detectedKeywords[trait] && detectedKeywords[trait].length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {detectedKeywords[trait].slice(0, 5).map((kw, k) => (
                          <span key={k} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                            {kw}
                          </span>
                        ))}
                        {detectedKeywords[trait].length > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                            +{detectedKeywords[trait].length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Insights & Roles */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Dominant Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {analysis.dominantTraits.map((trait) => (
                      <Badge key={trait} variant="default" className="text-sm">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personality Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.insights.length > 0 ? (
                      analysis.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{insight}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">
                        Add more details to your CV for better insights
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suggested Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.roles.length > 0 ? (
                      analysis.roles.map((role, i) => (
                        <Badge key={i} variant="secondary">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add more content for role suggestions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function PersonalityPredictionLab() {
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
      experimentNumber={8}
      title="CV-Based Personality Prediction"
      subtitle="Predict Personality Traits from CV Analysis using NLP"
      icon="BookOpen"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['NLP', 'Big Five', 'OCEAN', 'CV Analysis']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To develop an AI system that analyzes <strong className="text-primary">CV/Resume text</strong> to predict
          personality traits based on the Big Five (OCEAN) personality model
          using natural language processing techniques.
        </p>
        <div className="grid sm:grid-cols-4 gap-4">
          <HighlightItem icon="🧠" text="Big Five personality model" />
          <HighlightItem icon="📝" text="CV keyword extraction" />
          <HighlightItem icon="📊" text="Trait scoring" />
          <HighlightItem icon="🎯" text="Role suggestions" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Big Five Personality Model">
          <p className="mb-4">
            The <strong>OCEAN</strong> model describes personality across five dimensions:
          </p>
          <div className="grid gap-3">
            {[
              { trait: 'Openness', desc: 'Creativity, curiosity, willingness to try new things' },
              { trait: 'Conscientiousness', desc: 'Organization, dependability, self-discipline' },
              { trait: 'Extraversion', desc: 'Sociability, assertiveness, positive emotions' },
              { trait: 'Agreeableness', desc: 'Cooperation, trust, helpfulness' },
              { trait: 'Neuroticism', desc: 'Emotional stability, anxiety, moodiness' },
            ].map(({ trait, desc }) => (
              <div key={trait} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${TRAIT_COLORS[trait]}`} />
                <div>
                  <p className="font-medium">{trait}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </TheoryBlock>

        <TheoryBlock title="CV Analysis Approach">
          <p className="mb-4">
            The system analyzes word usage patterns in CVs to infer personality traits:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Leadership words suggest high Extraversion</li>
            <li>Detail-oriented language indicates Conscientiousness</li>
            <li>Creative/innovative terms show Openness</li>
            <li>Collaborative language reflects Agreeableness</li>
          </ul>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="OCEAN" definition="Big Five personality traits model" />
            <TermCard term="TF-IDF" definition="Text feature extraction method" />
            <TermCard term="Trait Score" definition="Weighted keyword frequency (0-100)" />
            <TermCard term="Role Matching" definition="Map traits to career roles" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The personality prediction algorithm uses keyword-based trait scoring:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Preprocessing</h4>
              <p className="text-muted-foreground">Clean the CV text by converting to lowercase, removing special characters, and tokenizing into individual words.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Keyword Extraction</h4>
              <p className="text-muted-foreground">Scan the tokenized text against predefined dictionaries for each Big Five personality trait (OCEAN).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Trait Scoring</h4>
              <p className="text-muted-foreground">Calculate scores based on keyword frequency and weights. Apply base scores and normalize to a 0-100 scale.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Special Handling</h4>
              <p className="text-muted-foreground">Apply special rules, such as inverting the Neuroticism score (lower is better/more stable).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">5</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Analysis & Output</h4>
              <p className="text-muted-foreground">Identify dominant traits, generate insights, and suggest suitable career roles based on the profile.</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{`Algorithm: CV-Based Personality Prediction

Input: CV/Resume text
Output: Personality trait scores and insights

1. PREPROCESSING:
   a. Convert text to lowercase
   b. Remove special characters
   c. Tokenize into words

2. KEYWORD EXTRACTION:
   For each personality trait:
     Define relevant keywords
     Count keyword occurrences in CV

3. TRAIT SCORING:
   For each trait:
     base_score = 30
     For each keyword match:
       score += weight (typically 5-10)
     Normalize to 0-100 range

4. SPECIAL HANDLING:
   Neuroticism: invert score (low = stable)

5. ANALYSIS:
   a. Identify top 2 dominant traits
   b. Generate personality insights
   c. Suggest suitable career roles

6. RETURN: Trait scores, insights, role suggestions`}</pre>
        </div>
      </SectionCard>

      {/* PROGRAM SECTION */}
      <SectionCard id="program" title="Program" icon="Code">
        <p className="text-muted-foreground mb-6">
          Here's the complete Python implementation of the personality predictor:
        </p>
        <CodeBlock code={PERSONALITY_CODE} language="python" title="personality_prediction.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Upload or paste your CV text, then scan to analyze personality traits in real-time.
        </p>
        <PersonalityDemo />
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding of personality prediction with these exercises:
        </p>
        <PracticeExercises />
      </SectionCard>
    </ExperimentLayout>
  );
}
