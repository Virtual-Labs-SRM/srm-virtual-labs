import { useState, useCallback } from 'react';

export interface TokenizationStep {
  step: string;
  result: string[];
  description: string;
}

export interface NLPState {
  originalText: string;
  tokens: string[];
  steps: TokenizationStep[];
  currentStep: number;
  isProcessing: boolean;
  isComplete: boolean;
}

export interface TFIDFResult {
  term: string;
  tf: number;
  df: number;
  idf: number;
  tfidf: number;
}

export interface BowResult {
  term: string;
  count: number;
  frequency: number;
}

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
  'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
]);

// Simple stemming rules (Porter-like)
function simpleStem(word: string): string {
  let stem = word.toLowerCase();
  
  // Remove common suffixes
  if (stem.endsWith('ing')) {
    stem = stem.slice(0, -3);
    if (stem.endsWith('n')) stem = stem.slice(0, -1); // running -> run
  } else if (stem.endsWith('ed')) {
    stem = stem.slice(0, -2);
    if (stem.endsWith('i')) stem = stem.slice(0, -1) + 'y'; // tried -> try
  } else if (stem.endsWith('ly')) {
    stem = stem.slice(0, -2);
  } else if (stem.endsWith('ies')) {
    stem = stem.slice(0, -3) + 'y';
  } else if (stem.endsWith('es')) {
    stem = stem.slice(0, -2);
  } else if (stem.endsWith('s') && !stem.endsWith('ss')) {
    stem = stem.slice(0, -1);
  }
  
  return stem;
}

const initialState: NLPState = {
  originalText: '',
  tokens: [],
  steps: [],
  currentStep: -1,
  isProcessing: false,
  isComplete: false,
};

export function useNLP() {
  const [state, setState] = useState<NLPState>(initialState);
  const [bowResults, setBowResults] = useState<BowResult[]>([]);
  const [tfidfResults, setTfidfResults] = useState<TFIDFResult[][]>([]);
  const [documents, setDocuments] = useState<string[]>(['', '']);

  const reset = useCallback(() => {
    setState(initialState);
    setBowResults([]);
    setTfidfResults([]);
  }, []);

  const processText = useCallback((text: string, speed: number) => {
    reset();
    setState(prev => ({ ...prev, originalText: text, isProcessing: true }));

    const steps: TokenizationStep[] = [];
    
    // Step 1: Initial tokenization
    const rawTokens = text.split(/\s+/).filter(t => t.length > 0);
    steps.push({
      step: 'Tokenization',
      result: [...rawTokens],
      description: 'Split text into individual tokens based on whitespace',
    });

    // Step 2: Lowercase conversion
    const lowercased = rawTokens.map(t => t.toLowerCase());
    steps.push({
      step: 'Lowercasing',
      result: [...lowercased],
      description: 'Convert all tokens to lowercase for normalization',
    });

    // Step 3: Punctuation removal
    const noPunctuation = lowercased.map(t => t.replace(/[^\w]/g, '')).filter(t => t.length > 0);
    steps.push({
      step: 'Punctuation Removal',
      result: [...noPunctuation],
      description: 'Remove punctuation marks and special characters',
    });

    // Step 4: Stop word removal
    const noStopWords = noPunctuation.filter(t => !STOP_WORDS.has(t));
    steps.push({
      step: 'Stop Word Removal',
      result: [...noStopWords],
      description: 'Remove common words that carry little meaning',
    });

    // Step 5: Stemming
    const stemmed = noStopWords.map(t => simpleStem(t));
    steps.push({
      step: 'Stemming',
      result: [...stemmed],
      description: 'Reduce words to their root form',
    });

    let currentStep = 0;

    const showNextStep = () => {
      if (currentStep >= steps.length) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          isComplete: true,
          tokens: stemmed,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        currentStep,
        steps: steps.slice(0, currentStep + 1),
        tokens: steps[currentStep].result,
      }));

      currentStep++;
      setTimeout(showNextStep, 1200 / speed);
    };

    setTimeout(showNextStep, 500);
  }, [reset]);

  const calculateBow = useCallback((text: string) => {
    const tokens = text.toLowerCase()
      .split(/\s+/)
      .map(t => t.replace(/[^\w]/g, ''))
      .filter(t => t.length > 0 && !STOP_WORDS.has(t))
      .map(simpleStem);

    const counts: Record<string, number> = {};
    for (const token of tokens) {
      counts[token] = (counts[token] || 0) + 1;
    }

    const total = tokens.length;
    const results: BowResult[] = Object.entries(counts)
      .map(([term, count]) => ({
        term,
        count,
        frequency: total > 0 ? count / total : 0,
      }))
      .sort((a, b) => b.count - a.count);

    setBowResults(results);
    return results;
  }, []);

  const calculateTFIDF = useCallback((docs: string[]) => {
    const processedDocs = docs.map(doc => {
      return doc.toLowerCase()
        .split(/\s+/)
        .map(t => t.replace(/[^\w]/g, ''))
        .filter(t => t.length > 0 && !STOP_WORDS.has(t))
        .map(simpleStem);
    });

    // Get all unique terms
    const allTerms = new Set<string>();
    processedDocs.forEach(doc => doc.forEach(term => allTerms.add(term)));

    // Calculate DF for each term
    const df: Record<string, number> = {};
    for (const term of allTerms) {
      df[term] = processedDocs.filter(doc => doc.includes(term)).length;
    }

    // Calculate TF-IDF for each document
    const results: TFIDFResult[][] = processedDocs.map((doc, docIndex) => {
      const termCounts: Record<string, number> = {};
      for (const term of doc) {
        termCounts[term] = (termCounts[term] || 0) + 1;
      }

      const docResults: TFIDFResult[] = [];
      for (const term of allTerms) {
        const tf = (termCounts[term] || 0) / (doc.length || 1);
        const idf = Math.log((docs.length + 1) / (df[term] + 1)) + 1;
        docResults.push({
          term,
          tf,
          df: df[term],
          idf,
          tfidf: tf * idf,
        });
      }

      return docResults.sort((a, b) => b.tfidf - a.tfidf);
    });

    setTfidfResults(results);
    setDocuments(docs);
    return results;
  }, []);

  return {
    state,
    bowResults,
    tfidfResults,
    documents,
    processText,
    calculateBow,
    calculateTFIDF,
    reset,
    setDocuments,
  };
}
