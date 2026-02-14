import { useState, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNLP } from '@/hooks/useNLP';
import { TFIDFDisplay } from '@/components/nlp/TFIDFDisplay';
import { Calculator } from 'lucide-react';

const TFIDF_CODE = `import math
from collections import Counter

def compute_tf(document):
    """Compute Term Frequency for a document."""
    words = document.lower().split()
    word_count = Counter(words)
    total_words = len(words)
    return {word: count / total_words for word, count in word_count.items()}

def compute_idf(documents):
    """Compute Inverse Document Frequency across documents."""
    num_docs = len(documents)
    all_words = set()
    for doc in documents:
        all_words.update(doc.lower().split())
    
    idf = {}
    for word in all_words:
        docs_containing = sum(1 for doc in documents if word in doc.lower())
        idf[word] = math.log(num_docs / docs_containing) + 1
    return idf

def compute_tfidf(documents):
    """
    Compute TF-IDF for all documents.
    
    TF-IDF = TF(t,d) × IDF(t)
    
    Higher values indicate more important/unique terms.
    """
    idf = compute_idf(documents)
    tfidf_scores = []
    
    for doc in documents:
        tf = compute_tf(doc)
        doc_tfidf = {word: tf.get(word, 0) * idf.get(word, 0) 
                     for word in set(doc.lower().split())}
        tfidf_scores.append(doc_tfidf)
    
    return tfidf_scores

# Example
documents = [
    "The cat sat on the mat",
    "The dog chased the cat"
]

scores = compute_tfidf(documents)
for i, doc_scores in enumerate(scores):
    print(f"Document {i+1}:")
    for word, score in sorted(doc_scores.items(), key=lambda x: -x[1])[:5]:
        print(f"  {word}: {score:.4f}")`;

const SAMPLE_DOCS = [
  ["Machine learning is a subset of artificial intelligence.", "Deep learning uses neural networks for pattern recognition."],
  ["The cat sat on the mat.", "The dog chased the cat around the yard."],
  ["Python is a popular programming language.", "Python libraries like NumPy and Pandas are essential for data science."],
];

const ALGORITHM_PSEUDOCODE = `function TF-IDF(documents):
    // Compute IDF for all terms
    FOR each unique term t:
        df[t] = count of documents containing t
        idf[t] = log(N / df[t]) + 1
    
    // Compute TF-IDF for each document
    FOR each document d:
        FOR each term t in d:
            tf[t] = count(t in d) / len(d)
            tfidf[t,d] = tf[t] × idf[t]
    
    RETURN tfidf matrix`;

export function BowTfidfLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const [doc1, setDoc1] = useState(SAMPLE_DOCS[0][0]);
  const [doc2, setDoc2] = useState(SAMPLE_DOCS[0][1]);
  const { bowResults, tfidfResults, calculateBow, calculateTFIDF } = useNLP();

  const handleCalculate = () => {
    calculateBow(doc1 + ' ' + doc2);
    calculateTFIDF([doc1, doc2]);
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const loadSample = (index: number) => {
    setDoc1(SAMPLE_DOCS[index][0]);
    setDoc2(SAMPLE_DOCS[index][1]);
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
      experimentNumber={7}
      title="Bag of Words & TF-IDF"
      subtitle="Convert text to numerical vectors for analysis"
      icon="BarChart3"
      duration="~35 minutes"
      difficulty="Intermediate"
      tags={['NLP', 'Feature Extraction', 'TF-IDF']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand <strong className="text-primary">Bag of Words</strong> and <strong className="text-primary">TF-IDF</strong>
          representations for converting text documents into numerical feature vectors.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="📊" text="Bag of Words model" />
          <HighlightItem icon="⚖️" text="TF-IDF weighting" />
          <HighlightItem icon="📐" text="Document similarity" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Bag of Words (BoW)">
          <p className="mb-4">
            The <strong>Bag of Words</strong> model represents text as a multiset of words,
            ignoring grammar and word order. Each document becomes a vector of word counts.
          </p>
        </TheoryBlock>

        <TheoryBlock title="TF-IDF Formula">
          <div className="p-4 bg-card rounded-lg border text-center space-y-2 mb-4">
            <p className="text-lg font-mono">TF-IDF(t,d) = TF(t,d) × IDF(t)</p>
            <div className="text-sm text-muted-foreground">
              <p>TF(t,d) = (count of t in d) / (total terms in d)</p>
              <p>IDF(t) = log(N / df(t)) + 1</p>
            </div>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Why TF-IDF?">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Advantages</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Downweights common words</li>
                  <li>• Highlights distinctive terms</li>
                  <li>• Simple and interpretable</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Limitations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ignores word order</li>
                  <li>• No semantic understanding</li>
                  <li>• Sparse vectors for large vocabularies</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="TF" definition="Term Frequency in a document" />
            <TermCard term="IDF" definition="Inverse Document Frequency" />
            <TermCard term="Document" definition="Single text instance" />
            <TermCard term="Corpus" definition="Collection of documents" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          TF-IDF calculation process:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Build Vocabulary</h4>
              <p className="text-muted-foreground">Collect all unique terms across all documents</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Compute IDF</h4>
              <p className="text-muted-foreground">Calculate inverse document frequency for each term</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Compute TF per Document</h4>
              <p className="text-muted-foreground">Calculate term frequency for each term in each document</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Multiply TF × IDF</h4>
              <p className="text-muted-foreground">Combine to get final TF-IDF scores</p>
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
          Python implementation of TF-IDF calculation.
        </p>
        <CodeBlock code={TFIDF_CODE} language="python" title="tfidf.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Enter two documents and see the Bag of Words and TF-IDF representations.
        </p>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label>Document 1</Label>
              <Textarea
                value={doc1}
                onChange={(e) => setDoc1(e.target.value)}
                placeholder="Enter first document..."
                className="min-h-[100px] font-mono text-sm"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label>Document 2</Label>
              <Textarea
                value={doc2}
                onChange={(e) => setDoc2(e.target.value)}
                placeholder="Enter second document..."
                className="min-h-[100px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {SAMPLE_DOCS.map((_, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => loadSample(i)}>
              Sample {i + 1}
            </Button>
          ))}
          <Button onClick={handleCalculate} className="gap-2 ml-auto">
            <Calculator className="h-4 w-4" />
            Calculate TF-IDF
          </Button>
        </div>

        <TFIDFDisplay bowResults={bowResults} tfidfResults={tfidfResults} documents={[doc1, doc2]} />

        <Card className="bg-muted/30 mt-6">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Understanding TF-IDF</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>TF (Term Frequency)</strong>: How often a term appears in a document</li>
              <li>• <strong>IDF (Inverse Document Frequency)</strong>: How unique a term is across documents</li>
              <li>• <strong>TF-IDF</strong>: Higher for terms that are frequent in one document but rare overall</li>
            </ul>
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
              <h4 className="font-semibold mb-2">Exercise: Compare Documents</h4>
              <p className="text-sm text-muted-foreground">
                Enter two similar documents and two different documents.
                Observe how TF-IDF scores differ between shared and unique terms.
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise: Common Word Analysis</h4>
              <p className="text-sm text-muted-foreground">
                What happens to the TF-IDF score of a word that appears in both documents?
                Why does IDF affect this?
              </p>
              <Badge variant="outline" className="mt-2">Advanced</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
