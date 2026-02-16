import { useState, useEffect, useRef } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, HighlightItem, TheoryBlock } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Send, CheckCircle2, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { SammonsMappingVis } from '@/components/lab/SammonsMappingVis';
import { Sparkles } from 'lucide-react';

const CHAT_CODE = `# server.py (Python + Flask + SocketIO)
import google.generativeai as genai
from flask import Flask, request
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Gemini with API Key from Environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use the 1.5-flash model as requested
model = genai.GenerativeModel('gemini-1.5-flash')

@socketio.on('message')
def handle_message(data):
    # 1. Receive Payload
    print(f"Received JSON: {data}")
    user_prompt = data.get('text', '')
    
    try:
        # 2. Call Gemini API
        response = model.generate_content(user_prompt)
        ai_text = response.text
    except Exception as e:
        ai_text = f"Error processing request: {str(e)}"

    # 3. Broadcast Response
    emit('system_broadcast', {'response': ai_text}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
`;

const ALGORITHM_STEPS = `Algorithm: Secure API Key Integration

1. ENVIRONMENT SETUP:
   a. Create a .env file in the project root.
   b. Add GEMINI_API_KEY=<YOUR_API_KEY> variable.
   c. Add .env to .gitignore to prevent committing secrets.

2. SERVER INITIALIZATION:
   a. Load 'dotenv' library.
   b. Configure Gemini with os.getenv('GEMINI_API_KEY').
   c. Start Flask-SocketIO server.

3. REQUEST HANDLING:
   a. Client sends message via WebSocket.
   b. Server receives message.
   c. Server Authenticates with Gemini API using the loaded Key.
   d. Server returns AI response to Client.

4. SECURITY BEST PRACTICES:
   - NEVER expose API keys in client-side code (HTML/JS).
   - ALWAYS proxy requests through your own backend server.
   - USE rate limiting to prevent abuse.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Algorithm: Sammon's Mapping for Chat Embeddings

1. COMPUTE DISTANCE MATRIX:
   a. For N chat messages, extract embedding vectors
      from the LLM's internal representation.
   b. Compute pairwise Euclidean distances d*ij
      in the original high-D embedding space.

2. INITIALIZE LOW-DIMENSIONAL POINTS:
   a. Randomly initialize N points Y in 2D space.
   b. Compute normalization constant c = Σ d*ij.

3. ITERATIVE OPTIMIZATION (Gradient Descent):
   FOR each iteration t = 1 to T:
     a. Compute pairwise distances dij in current 2D space.
     b. Compute Sammon's stress:
        E = (1/c) × Σ (d*ij - dij)² / d*ij
     c. Compute gradient: ∂E/∂Y for each point.
     d. Update: Y(t+1) = Y(t) - α × ∂E/∂Y

4. CONVERGENCE:
   - Stop when stress change < threshold or max_iter reached.
   - Final Y gives 2D coordinates preserving inter-point
     distances — semantically similar messages cluster together.

5. RELATION TO CHATBOT:
   - Chatbots use embeddings to "understand" meaning.
   - This algorithm visualizes that understanding.
   - We see how the AI groups "Hello" with "Hi" but separates
     "Code" from "Poetry".
`;

const SAMMON_CODE = `# sammon_mapping.py — Sammon's Projection
import numpy as np
from scipy.spatial.distance import pdist, squareform

def sammon_mapping(X, n_components=2, max_iter=500, lr=0.3):
    """
    Sammon's Mapping: Project high-D data X to 2D.
    X: (N, D) array — N samples, D dimensions
    Returns: Y (N, 2) projected coordinates, stress value
    """
    N = X.shape[0]
    
    # Step 1: Compute high-D pairwise distances
    D_high = squareform(pdist(X, 'euclidean'))
    D_high[D_high == 0] = 1e-10  # Avoid div-by-zero
    
    # Step 2: Initialize random 2D positions
    Y = np.random.randn(N, n_components) * 0.01
    
    # Normalization constant
    c = np.sum(D_high) / 2.0
    
    for iteration in range(max_iter):
        # Step 3a: Compute 2D pairwise distances
        D_low = squareform(pdist(Y, 'euclidean'))
        D_low[D_low == 0] = 1e-10
        
        # Step 3b: Compute Sammon's stress
        stress = (1/c) * np.sum(
            (D_high - D_low)**2 / D_high
        ) / 2.0
        
        # Step 3c-d: Gradient descent update
        for i in range(N):
            grad = np.zeros(n_components)
            for j in range(N):
                if i != j:
                    delta = (D_high[i,j] - D_low[i,j])
                    grad += (delta / (D_high[i,j] * D_low[i,j])) * (Y[i] - Y[j])
            grad *= (-2.0 / c)
            Y[i] -= lr * grad
    
    return Y, stress

# === Usage with Chat Embeddings ===
# from sentence_transformers import SentenceTransformer
# model = SentenceTransformer('all-MiniLM-L6-v2')
# 
# messages = ["Hello!", "Hi there", "Write Python code",
#             "Generate a function", "Write a haiku",
#             "Compose a poem"]
# embeddings = model.encode(messages)  # (6, 384)
# 
# Y_2d, stress = sammon_mapping(embeddings)
# print(f"Final stress: {stress:.4f}")
# # Similar messages cluster together in 2D!
`;

// Pre-computed Sammon projection data for demo visualization
const SAMMON_DEMO_DATA = [
  // General greetings cluster
  { x: -2.1, y: 1.3, label: 'Hello!', category: 'general', color: '#3b82f6' },
  { x: -1.8, y: 1.5, label: 'Hi there', category: 'general', color: '#3b82f6' },
  { x: -2.4, y: 0.9, label: 'How are you?', category: 'general', color: '#3b82f6' },
  { x: -1.6, y: 1.1, label: 'Good morning', category: 'general', color: '#3b82f6' },
  // Coding cluster
  { x: 1.5, y: -1.2, label: 'Write Python code', category: 'code', color: '#a855f7' },
  { x: 1.8, y: -0.9, label: 'Generate a function', category: 'code', color: '#a855f7' },
  { x: 1.3, y: -1.5, label: 'Debug this error', category: 'code', color: '#a855f7' },
  { x: 2.0, y: -1.0, label: 'Explain this algorithm', category: 'code', color: '#a855f7' },
  // Creative cluster
  { x: 0.5, y: 2.2, label: 'Write a haiku', category: 'creative', color: '#f59e0b' },
  { x: 0.8, y: 2.5, label: 'Compose a poem', category: 'creative', color: '#f59e0b' },
  { x: 0.2, y: 2.0, label: 'Tell a story', category: 'creative', color: '#f59e0b' },
  { x: 1.0, y: 2.8, label: 'Create a song', category: 'creative', color: '#f59e0b' },
];

interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: 'local' | 'remote';
}

interface DualClientDemoProps {
  onActivate?: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}



function DualClientDemo({ onActivate, messages, setMessages }: DualClientDemoProps) {
  // Demo Step State for Guided Tour
  const [demoStep, setDemoStep] = useState<number>(0); // 0=Idle, 1=Input, 2=Sending, 3=Processing, 4=Received

  // Constants for Step Descriptions
  const STEP_INFO = {
    0: { title: "Ready", desc: "Select a scenario. Press ▶ Play or use ▶| Next to step through." },
    1: { title: "Step 1: User Input", desc: "The prompt is pre-filled. Press Send or Next to transmit." },
    2: { title: "Step 2: Transmission", desc: "Socket.IO emits the message to the server." },
    3: { title: "Step 3: Server Processing", desc: "Server authenticates and calls Gemini API." },
    4: { title: "Step 4: AI Response", desc: "AI response is broadcast back to the client." }
  };


  const [inputText, setInputText] = useState('');


  // Pipeline State
  type PipelineState = 'idle' | 'sending' | 'processing' | 'receiving';
  const [pipelineState, setPipelineState] = useState<PipelineState>('idle');
  const [serverLog, setServerLog] = useState<string>('// System listening on port 5000...');

  // Hardcoded Scenarios for Demo
  const DEMO_SCENARIOS = [
    {
      id: 'intro',
      label: '1. Introduction',
      prompt: "Hello Gemini, how does this work?",
      response: "**I am a Large Language Model.** I process your text input, break it down into tokens, and predict the most likely next tokens to generate a response. \n\n*   **Input:** Users provide text prompts.\n*   **Processing:** I analyze patterns in vast datasets.\n*   **Output:** I generate human-like text."
    },
    {
      id: 'code',
      label: '2. Coding Task',
      prompt: "Write a Python function to add two numbers.",
      response: "Here is a simple Python function:\n```python\ndef add_numbers(a, b):\n    return a + b\n```\n\n**Usage:**\n`result = add_numbers(5, 3)`\n`print(result) # Output: 8`"
    },
    {
      id: 'creative',
      label: '3. Creative Writing',
      prompt: "Write a haiku about artificial intelligence.",
      response: "Silicon thoughts race,\nLearning from the world of man,\nFuture now awake."
    }
  ];

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEMO_SCENARIOS[0].id);

  // --- Scenario-Specific Bubble Explanations ---
  const BUBBLE_CONTENT: Record<string, { step1: { desc: string; code: string }; step2: { desc: string; code: string }; step3: { desc: string; code: string }; step4: { desc: string; code: string } }> = {
    intro: {
      step1: {
        desc: 'User types a general question about how LLMs work. React captures typed text via controlled state and prepares it for transmission.', code: `const [inputText, setInputText] =
  useState('');
// Controlled component pattern
// Value syncs with React state
<Input value={inputText}
  onChange={e => setInputText(
    e.target.value
  )} />` },
      step2: {
        desc: 'Socket.IO establishes a persistent WebSocket connection (unlike HTTP polling). The message is packaged as a JSON payload with auth headers and emitted as a real-time event.', code: `// WebSocket (persistent connection)
socket.emit('message', {
  text: "Hello Gemini, how does
    this work?",
  auth: sessionToken,
  timestamp: Date.now()
});` },
      step3: {
        desc: 'Flask-SocketIO receives the event on the backend. The server validates the session token against the auth middleware, then forwards the sanitized prompt to the Gemini 1.5 Flash API.', code: `# 1. Validate auth token
verify_session(data['auth'])
# 2. Sanitize input
prompt = sanitize(data['text'])
# 3. Call Gemini API
response = model.generate_content(
  prompt
)  # gemini-1.5-flash` },
      step4: {
        desc: 'Gemini processes the prompt through its transformer architecture and returns a structured explanatory response. The server broadcasts it to all connected clients via Socket.IO rooms.', code: `// Server broadcasts to room
socketio.emit('broadcast', {
  response: ai_text,
  type: 'general_explanation',
  tokens: response.usage
})
// Client receives & renders
displayMessage(data.response)` }
    },
    code: {
      step1: {
        desc: 'User enters a coding request. The prompt specifically asks Gemini to generate a Python function — the model will detect code intent and format its response with syntax highlighting.', code: `const [inputText, setInputText] =
  useState('');
// Code generation prompt
// Gemini auto-detects language
<Input value={inputText}
  onChange={e => setInputText(
    e.target.value
  )} />` },
      step2: {
        desc: 'The coding prompt is transmitted over the WebSocket channel. Socket.IO ensures reliable delivery with automatic reconnection and acknowledgment callbacks if the connection drops.', code: `// Reliable delivery via WebSocket
socket.emit('message', {
  text: "Write a Python function
    to add two numbers.",
  auth: sessionToken,
  timestamp: Date.now()
});` },
      step3: {
        desc: 'Server receives the code generation request. Gemini\'s model understands programming languages and returns properly formatted code blocks with markdown syntax.', code: `# 1. Validate auth token
verify_session(data['auth'])
# 2. Forward to Gemini
response = model.generate_content(
  "Write a Python function to
    add two numbers."
)  # Returns markdown code block` },
      step4: {
        desc: 'Gemini generates clean Python code with usage examples. The response includes markdown-formatted code blocks (```python) which the client renders with syntax highlighting.', code: `// Server broadcasts code response
socketio.emit('broadcast', {
  response: ai_text,
  type: 'code_generation',
  language: 'python'
})
// Client renders with highlighting
renderMarkdown(data.response)` }
    },
    creative: {
      step1: {
        desc: 'User enters a creative writing prompt — requesting a haiku about AI. Creative prompts leverage Gemini\'s natural language generation capabilities for artistic text output.', code: `const [inputText, setInputText] =
  useState('');
// Creative writing prompt
// Haiku = 5-7-5 syllables
<Input value={inputText}
  onChange={e => setInputText(
    e.target.value
  )} />` },
      step2: {
        desc: 'Socket.IO transmits the creative prompt to the server. The WebSocket protocol adds minimal overhead (~2 bytes per frame) compared to HTTP\'s headers, making it ideal for real-time chat.', code: `// Low-latency WebSocket frame
socket.emit('message', {
  text: "Write a haiku about
    artificial intelligence.",
  auth: sessionToken,
  timestamp: Date.now()
});` },
      step3: {
        desc: 'Server forwards the creative prompt to Gemini. The model uses its training on poetry and literary forms to compose text matching the haiku structure (5-7-5 syllable pattern).', code: `# 1. Validate auth token
verify_session(data['auth'])
# 2. Creative generation
response = model.generate_content(
  "Write a haiku about
    artificial intelligence."
)  # Poetry-aware generation` },
      step4: {
        desc: 'Gemini composes a haiku following the 5-7-5 syllable structure and returns it as plain text. The server broadcasts the creative output to the client for display.', code: `// Server broadcasts haiku
socketio.emit('broadcast', {
  response: ai_text,
  type: 'creative_writing',
  format: 'plain_text'
})
// Client displays the haiku
displayMessage(data.response)` }
    }
  };

  // --- Manual Control State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current scenario helper
  const getScenario = () => DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];

  // --- Step Execution Logic (called when entering a step) ---
  const executeStep = (step: number) => {
    if (step === 1) {
      // Pre-fill the prompt
      setInputText(getScenario().prompt);
    }
    if (step === 2) {
      // Send message + set pipeline
      const sc = getScenario();
      setMessages(prev => [...prev, { id: Date.now().toString(), text: sc.prompt, timestamp: Date.now(), sender: 'local' }]);
      setPipelineState('sending');
      setServerLog(prev => prev + `\n\n[SOCKET_IN] { "payload": "${sc.prompt}", "auth": "SIMULATED_VALID" }`);
    }
    if (step === 3) {
      setPipelineState('processing');
      setServerLog(prev => prev + `\n[API_REQ] POST /v1/models/gemini-1.5-flash:generateContent\nStatus: Pending...`);
    }
    if (step === 4) {
      setPipelineState('receiving');
      const sc = getScenario();
      setTimeout(() => {
        setPipelineState('idle');
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: sc.response, timestamp: Date.now(), sender: 'remote' }]);
        setServerLog(prev => prev + `\n[API_RES] HTTP 200 OK\nPayload: { ... }\n// System listening on port 5000...`);
        // Mark simulation complete after a short delay so the step-4 bubble pops briefly then hides
        setTimeout(() => setSimulationComplete(true), 2000);
      }, 800);
    }
  };

  // --- Control Handlers ---
  const goToStep = (step: number) => {
    setDemoStep(step);
    executeStep(step);
  };

  const handleNext = () => {
    if (demoStep >= 4) return;
    const next = demoStep + 1;
    if (next === 1) {
      // Fresh start
      setMessages([]);
      setServerLog('// System listening on port 5000...');
      setPipelineState('idle');
    }
    goToStep(next);
  };

  const handlePrev = () => {
    if (demoStep <= 0) return;
    // For simplicity, going back resets to step 0
    resetSimulation();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    } else {
      // Play
      setIsPlaying(true);
      if (demoStep === 0) {
        // Reset then start from step 1
        setMessages([]);
        setServerLog('// System listening on port 5000...');
        setPipelineState('idle');
        goToStep(1);
      }
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setSimulationComplete(false);
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = null;
    setDemoStep(0);
    setMessages([]);
    setInputText('');
    setServerLog('// System listening on port 5000...');
    setPipelineState('idle');
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && demoStep > 0 && demoStep < 4) {
      autoTimerRef.current = setTimeout(() => {
        const next = demoStep + 1;
        goToStep(next);
      }, 3000);
    }
    if (isPlaying && demoStep === 4) {
      // Auto-stop after step 4 completes
      autoTimerRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 4000);
    }
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, [isPlaying, demoStep]);

  // Send button handler (only active at step 1)
  const handleSendClick = () => {
    if (demoStep === 1) {
      handleNext(); // advance to step 2
    }
  };

  // --- Markdown Renderer ---
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        return (
          <div key={index} className="flex gap-2 ml-2 mb-1">
            <span className="text-slate-400 mt-1.5 h-1.5 w-1.5 bg-current rounded-full shrink-0" />
            <span>{parseInline(content)}</span>
          </div>
        );
      }
      if (!line.trim()) return <div key={index} className="h-2" />;
      return <div key={index} className="mb-1">{parseInline(line)}</div>;
    });
  };

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-inherit">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* CONTROL BAR */}
      {/* CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-50">

        {/* Left Side: Controls */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* Scenario Selector */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedScenarioId}
              onChange={(e) => { setSelectedScenarioId(e.target.value); resetSimulation(); }}
              disabled={demoStep !== 0}
              className="w-full bg-background/80 backdrop-blur-sm border border-border/50 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 appearance-none cursor-pointer hover:bg-background/90 transition-colors"
            >
              {DEMO_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

          {/* Floating Control Pill */}
          <div className="bg-background/80 backdrop-blur-md p-1.5 rounded-full border border-border/50 shadow-xl flex items-center gap-1 w-fit mx-auto md:mx-0">

            {/* Prev Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={demoStep === 0}
              title="Previous Step"
              className="h-10 w-10 index-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Play/Pause Main Button */}
            <Button
              size="lg"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Start Simulation'}
              className={`h-10 px-6 rounded-full font-bold shadow-lg transition-all duration-300 ${isPlaying
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                  : 'gradient-primary text-white hover:opacity-90 shadow-primary/25'
                }`}
            >
              {isPlaying ? (
                <div className="flex items-center gap-2">
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  <span className="tracking-wide">Start</span>
                </div>
              )}
            </Button>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={demoStep >= 4}
              title="Next Step"
              className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={resetSimulation}
              title="Reset Simulation"
              className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* STEP INDICATOR CARD (Right Side) */}
        <div className={`flex-1 w-full md:w-auto transition-all duration-500 ${demoStep > 0 ? 'opacity-100 translate-y-0' : 'opacity-80'}`}>
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex items-center gap-5 shadow-sm relative overflow-hidden h-full min-h-[90px]">
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${(demoStep / 4) * 100}%` }}
              />
            </div>

            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xl border transition-all duration-500 shadow-inner ${demoStep === 0 ? 'bg-muted text-muted-foreground border-transparent' :
                'bg-primary text-primary-foreground border-primary shadow-primary/20'
              }`}>
              {demoStep}
            </div>

            <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                {STEP_INFO[demoStep as keyof typeof STEP_INFO]?.title}
                {demoStep === 4 && <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in" />}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-lg">
                {STEP_INFO[demoStep as keyof typeof STEP_INFO]?.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-0 gap-y-4 md:gap-4 h-auto p-2 relative overflow-visible">

        {/* OVERLAY FOR FOCUS MODE */}
        {demoStep > 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-0 rounded-xl transition-all duration-500 pointer-events-none" />
        )}

        {/* 1. LEFT PANEL: SERVER DASHBOARD */}
        <Card className={`col-span-12 md:col-span-5 bg-[#0f172a] border-slate-800 text-green-400 font-mono shadow-xl flex flex-col relative overflow-visible h-[450px] md:h-[65vh] transition-all duration-500 ${demoStep === 3 ? 'z-20 scale-[1.02] ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/20' : 'z-10 opacity-40 grayscale-[0.5]'
          } ${demoStep === 0 ? '!opacity-100 !grayscale-0 !z-10' : ''}`}>

          {/* Helper Badge 3 */}
          <div className={`absolute top-4 right-4 z-[60] transition-all duration-300 ${demoStep === 3 ? 'scale-125' : ''} group`}>
            <Badge className={`${demoStep === 3 ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'} text-white font-bold h-6 w-6 rounded-full p-0 flex items-center justify-center cursor-help`}>3</Badge>
            {/* SPEECH BUBBLE 3 */}
            <div className={`absolute top-full right-0 mt-2 w-56 z-50 transition-all duration-300 ${demoStep === 3 && !simulationComplete ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto'}`}>
              <div className="bg-white text-slate-800 p-2 rounded-lg shadow-2xl border-2 border-orange-200 relative ring-2 ring-orange-100">
                <div className="absolute -top-2 right-2 w-3 h-3 bg-white border-t-2 border-l-2 border-orange-200 transform rotate-45"></div>
                <h5 className="font-bold text-[10px] text-orange-600 mb-0.5">Step 3: Server Processing</h5>
                <p className="text-[8px] leading-snug text-slate-600 mb-1">{BUBBLE_CONTENT[selectedScenarioId]?.step3.desc}</p>
                <pre className="bg-slate-900 text-green-400 p-1.5 rounded text-[8px] overflow-x-auto leading-tight">
                  <code>{BUBBLE_CONTENT[selectedScenarioId]?.step3.code}</code>
                </pre>
              </div>
            </div>
          </div>

          <CardHeader className="py-3 border-b border-slate-800 bg-slate-900/50 flex flex-row items-center justify-between shrink-0 rounded-t-xl overflow-hidden">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full shrink-0 ${pipelineState !== 'idle' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold uppercase tracking-wider truncate">Client A (Server)</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500">Status:</span>
              <span className="text-[10px] text-green-500 font-bold">ONLINE</span>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col gap-4 font-mono text-[10px] md:text-xs overflow-hidden relative">
            {/* API Status Indicator */}
            <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800 shrink-0">
              <span className="text-slate-400">Gemini API Status:</span>
              {pipelineState === 'processing' ? (
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full shrink-0" />
                  <span className="font-bold">PROCESSING...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <div className="h-2 w-2 bg-current rounded-full shrink-0" />
                  <span>STANDBY</span>
                </div>
              )}
            </div>

            {/* Raw Data Log (Terminal Window) */}
            <div className="flex-1 bg-black/50 rounded border border-slate-800 p-3 overflow-y-auto whitespace-pre-wrap relative group min-h-0">

              <div className="sticky top-0 right-0 float-right opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-500 bg-slate-900/80 backdrop-blur">TERMINAL</Badge>
              </div>
              {serverLog}
            </div>
          </CardContent>

          <div className="bg-slate-900 p-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-800 shrink-0 rounded-b-xl overflow-hidden">
            <span>PORT: 5000</span>
            <span>FLASK SESS: ACTIVE</span>
          </div>
        </Card>

        {/* 2. CENTRAL: DATA STREAM HIGHWAY (THE BRIDGE) */}
        <div className={`col-span-12 md:col-span-2 flex flex-col items-center justify-center relative py-4 min-h-[150px] min-w-[120px] transition-all duration-500 ${demoStep === 2 ? 'z-[50] scale-110' : 'z-[40] opacity-60'
          } ${demoStep === 0 ? '!opacity-100 !z-[40] !scale-100' : ''}`}>

          {/* Top: Gemini Logo (Node) */}
          <div className={`relative mb-8 md:mb-12 transition-all duration-500 flex-shrink-0 ${pipelineState === 'processing' ? 'scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'opacity-100'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 shrink-0 shadow-xl transition-all duration-300 ${demoStep === 3 ? 'bg-primary text-primary-foreground scale-110 shadow-primary/25' : 'bg-card border border-border text-muted-foreground'}`}>
              <div className={`${demoStep === 3 ? 'animate-spin-slow' : ''} shrink-0`}>
                <Sparkles className={`w-8 h-8 ${demoStep === 3 ? 'text-white fill-white' : 'text-primary fill-primary/20'}`} />
              </div>
            </div>

            {/* Vertical Connection Line to Horizontal Pipe */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-300/30 -z-10 mt-[-2px]">
              {/* Particle traveling UP (Request) */}
              {pipelineState === 'processing' && (
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-purple-500 animate-[slideBottomToTop_0.5s_linear_infinite]" />
              )}
              {/* Particle traveling DOWN (Response) */}
              {pipelineState === 'receiving' && (
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-green-500 animate-[slideTopToBottom_0.5s_linear_infinite]" />
              )}
            </div>
          </div>

          {/* Helper Badge 2 */}
          <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] transition-all duration-300 ${demoStep === 2 ? 'scale-125' : ''} group`}>
            <Badge className={`${demoStep === 2 ? 'bg-purple-500 animate-bounce' : 'bg-slate-400'} text-white font-bold h-6 w-6 rounded-full p-0 flex items-center justify-center shadow-lg border border-white/10 cursor-help`}>2</Badge>
            {/* SPEECH BUBBLE 2 */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 z-[100] transition-all duration-300 ${demoStep === 2 && !simulationComplete ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
              <div className="bg-white text-slate-800 p-2 rounded-lg shadow-2xl border-2 border-purple-200 relative ring-2 ring-purple-100">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t-2 border-l-2 border-purple-200 transform rotate-45"></div>
                <h5 className="font-bold text-[10px] text-purple-600 mb-0.5">Step 2: Transmission</h5>
                <p className="text-[8px] leading-snug text-slate-600 mb-1">{BUBBLE_CONTENT[selectedScenarioId]?.step2.desc}</p>
                <pre className="bg-slate-900 text-purple-400 p-1.5 rounded text-[8px] overflow-x-auto leading-tight">
                  <code>{BUBBLE_CONTENT[selectedScenarioId]?.step2.code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* The Pipe (Horizontal Connection visual) */}
          <div className="w-full flex items-center justify-center relative mt-4 px-2">
            <div className={`h-1.5 w-full bg-slate-200/80 rounded-full relative overflow-visible ring-1 ring-slate-300 transition-all ${demoStep === 2 ? 'ring-purple-400 ring-2' : ''}`}>
              {/* Pipeline Animation: Sending (Right -> Left for visual, logic is B->A) */}
              {pipelineState === 'sending' && (
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-[slideRightToLeft_1s_linear_infinite]" />
              )}
              {/* Pipeline Animation: Receiving (Left -> Right) */}
              {pipelineState === 'receiving' && (
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-[slideLeftToRight_1s_linear_infinite]" />
              )}
            </div>

            {/* Connection Nodes */}
            <div className="absolute left-0 w-3 h-3 bg-slate-400 rounded-full ring-2 ring-white" />
            <div className="absolute right-0 w-3 h-3 bg-slate-400 rounded-full ring-2 ring-white" />
          </div>
        </div>

        {/* 3. RIGHT PANEL: CLIENT CHAT */}
        <Card className={`col-span-12 md:col-span-5 border-primary/20 shadow-lg flex flex-col relative bg-white h-[450px] md:h-[65vh] overflow-visible transition-all duration-500 ${(demoStep === 1 || demoStep === 4) ? 'z-20 ring-4 ring-blue-500/30' : demoStep === 2 ? 'z-[5] opacity-40 grayscale-[0.5]' : 'z-10 opacity-40 grayscale-[0.5]'
          } ${demoStep === 0 ? '!opacity-100 !grayscale-0 !z-10 !ring-0' : ''}`}>

          <CardHeader className="bg-primary/5 py-4 border-b flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 shrink-0">
                <User className="h-5 w-5 text-purple-700 shrink-0" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">Client B (You)</CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground font-medium">Online</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col relative bg-slate-50/50 overflow-visible">

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((m, idx) => (
                <div key={m.id} className={`flex gap-3 ${m.sender === 'local' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-5 duration-500`}>
                  <div className={`p-2.5 rounded-2xl max-w-[90%] text-xs leading-relaxed shadow-sm ${m.sender === 'local'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white border text-slate-700 rounded-bl-none'
                    }`}>
                    {/* Markdown Rendering */}
                    {renderMarkdown(m.text)}
                  </div>

                </div>
              ))}

              {/* Typing Indicator Bubble */}
              {(pipelineState === 'sending' || pipelineState === 'processing') && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white border p-3 rounded-2xl rounded-bl-none flex items-center gap-1 shadow-sm h-10 w-auto justify-center px-4">
                    <span className="text-xs text-slate-400 mr-2 shrink-0">Gemini is typing...</span>
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}


            </div>

            {/* Helper Badge 4 - positioned at LEFT edge, TOPMOST z-index */}
            {messages.some(m => m.sender === 'remote') && (
              <div className={`absolute top-1/3 -left-4 -translate-y-1/2 z-[999] transition-all duration-300 ${demoStep === 4 ? 'scale-125' : ''} group`}>
                <Badge className={`${demoStep === 4 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'} text-white font-bold h-5 w-5 rounded-full p-0 flex items-center justify-center text-[9px] cursor-help shadow-lg`}>4</Badge>
                {/* SPEECH BUBBLE 4 */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 z-[1000] transition-all duration-300 ${demoStep === 4 && !simulationComplete ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                  <div className="bg-white text-slate-800 p-2 rounded-lg shadow-2xl border-2 border-green-200 relative ring-2 ring-green-100">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t-2 border-l-2 border-green-200 transform rotate-45"></div>
                    <h5 className="font-bold text-[10px] text-green-600 mb-0.5">Step 4: AI Response</h5>
                    <p className="text-[8px] leading-snug text-slate-600 mb-1">{BUBBLE_CONTENT[selectedScenarioId]?.step4.desc}</p>
                    <pre className="bg-slate-900 text-green-400 p-1.5 rounded text-[8px] overflow-x-auto leading-tight">
                      <code>{BUBBLE_CONTENT[selectedScenarioId]?.step4.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className={`p-4 border-t bg-card relative shrink-0 transition-colors duration-300 rounded-b-xl ${demoStep === 1 ? 'bg-muted/30' : ''}`}>
              {/* Helper Badge 1 */}
              <div className={`absolute -top-3 left-6 z-20 transition-transform ${demoStep === 1 ? 'scale-125' : ''} group`}>
                <Badge className={`${demoStep === 1 ? 'bg-blue-500 animate-bounce' : 'bg-slate-400'} text-white font-bold h-6 w-6 rounded-full p-0 flex items-center justify-center cursor-help shadow-sm`}>1</Badge>
                {/* SPEECH BUBBLE 1 */}
                <div className={`absolute bottom-full left-0 mb-2 w-56 z-50 transition-all duration-300 ${demoStep === 1 && !simulationComplete ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                  <div className="bg-white text-slate-800 p-2 rounded-lg shadow-2xl border-2 border-blue-200 relative ring-2 ring-blue-100">
                    <div className="absolute -bottom-2 left-2 w-3 h-3 bg-white border-b-2 border-r-2 border-blue-200 transform rotate-45"></div>
                    <h5 className="font-bold text-[10px] text-blue-600 mb-0.5">Step 1: User Input</h5>
                    <p className="text-[8px] leading-snug text-slate-600 mb-1">{BUBBLE_CONTENT[selectedScenarioId]?.step1.desc}</p>
                    <pre className="bg-slate-900 text-blue-400 p-1.5 rounded text-[8px] overflow-x-auto leading-tight">
                      <code>{BUBBLE_CONTENT[selectedScenarioId]?.step1.code}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">

                <Input
                  placeholder="Prompt will auto-fill when simulation starts..."
                  value={inputText}
                  readOnly
                  className={`rounded-full border-none focus-visible:ring-0 transition-colors cursor-default ${demoStep === 1 ? 'bg-white ring-2 ring-blue-400' : 'bg-slate-100 text-slate-500'}`}
                />
                <Button
                  onClick={handleSendClick}
                  disabled={demoStep !== 1}
                  size="icon"
                  className={`rounded-full shadow-lg transition-all duration-300 ${demoStep === 1
                    ? 'bg-green-500 hover:bg-green-600 ring-2 ring-green-300 animate-pulse shadow-green-200'
                    : 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                    }`}
                >
                  <Send className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
          @keyframes slideRightToLeft {
              0% { right: 0; opacity: 0; }
              100% { right: 100%; opacity: 0; }
          }
          @keyframes slideLeftToRight {
              0% { left: 0; opacity: 0; }
              100% { left: 100%; opacity: 0; }
          }
          @keyframes slideBottomToTop {
              0% { bottom: 0; opacity: 0; }
              100% { bottom: 100%; opacity: 0; }
          }
          @keyframes slideTopToBottom {
              0% { top: 0; opacity: 0; }
              100% { top: 100%; opacity: 0; }
          }
        `}</style>
    </div >
  );
}

export function ChatApplicationLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={5}
      title="Voice and Text Chat Application"
      subtitle="Build voice and text communication system"
      icon="MessageCircle"
      duration="~45 minutes"
      difficulty="Advanced"
      tags={['WebSockets', 'Node.js', 'Voice API', 'API Security']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To develop a <strong className="text-primary">Multimodal AI Assistant</strong> interface that integrates
          secure API authentication, real-time data synchronization, and device-level voice interaction.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="🔑" text="Secure API Keys" />
          <HighlightItem icon="⚡" text="Real-time Sockets" />
          <HighlightItem icon="🎤" text="Multimodal IO" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="API Security Best Practices">
          <p className="mb-4">
            When connecting to cloud services (like OpenAI, Google Cloud), you must authenticate requests using
            <strong>API Keys</strong>. Security is critical:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li><strong>Environment Variables:</strong> Store secrets in \`.env\` files, never in code.</li>
            <li><strong>Server-Side Proxy:</strong> Never expose keys in the frontend (browser). Send requests to your own backend (Node.js), which then attaches the key and calls the API.</li>
          </ul>
        </TheoryBlock>

        <TheoryBlock title="WebSocket Architecture">
          <p className="text-sm text-muted-foreground">
            Maintains a persistent full-duplex connection allowing the server to push responses asynchronously without polling.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Sammon's Mapping for Embedding Visualization">
          <p className="mb-4">
            Large Language Models like Gemini represent every chat message as a <strong>high-dimensional embedding vector</strong> (typically 384–768 dimensions).
            Semantically similar messages have nearby vectors. <strong>Sammon's Mapping</strong> projects these embeddings to 2D while preserving inter-point distances:
          </p>
          <div className="bg-muted/40 rounded-lg p-4 mb-4 font-mono text-sm text-center">
            E = (1/Σd*<sub>ij</sub>) × Σ (d*<sub>ij</sub> − d<sub>ij</sub>)² / d*<sub>ij</sub>
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li><strong>The "Brain" of the Chatbot:</strong> Inside the AI, your text isn't words—it's numbers. A greeting like "Hello" might be vector <code className="text-xs bg-slate-100 px-1 rounded">[0.1, -0.5, 0.8, ...]</code>.</li>
            <li><strong>High-Dimensional Space:</strong> These vectors exist in 384+ dimensions. We can't see that.</li>
            <li><strong>Sammon's Mapping as a Lens:</strong> This algorithm squashes those 384 dimensions down to 2 (X and Y) for your screen.</li>
            <li><strong>Crucial Property:</strong> Unlike other methods, Sammon's Mapping fights hard to keep <em>small distances accurate</em>. If "Hello" and "Hi" are close in the AI's mind, they will be close on your screen.</li>
          </ul>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The flow includes a dedicated step for Environment Setup and Key Validation.
        </p>
        <div className="bg-muted/30 rounded-xl p-6 overflow-x-auto">
          <pre className="font-mono text-sm text-muted-foreground leading-relaxed">{ALGORITHM_STEPS}</pre>
        </div>
      </SectionCard>

      {/* PROGRAM SECTION */}
      <SectionCard id="program" title="Program" icon="Code">
        <p className="text-muted-foreground mb-6">
          Updated implementation showing secure \`.env\` usage for API Keys in Node.js.
        </p>
        <CodeBlock code={CHAT_CODE} language="javascript" title="server.js & .env" />
        <div className="mt-6">
          <CodeBlock code={SAMMON_CODE} language="python" title="sammon_mapping.py — Dimensionality Reduction" />
        </div>
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo: Secure Echo-Chat" icon="Play">
        <DualClientDemo onActivate={() => setActiveSection('demo')} messages={messages} setMessages={setMessages} />

        {/* Sammon's Mapping Embedding Visualization */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">S</span>
            Sammon's Mapping — Chat Embedding Visualization
          </h3>
          <div className="bg-slate-50 border border-indigo-100 rounded-lg p-4 mb-6 transition-all hover:shadow-md">
            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live Integration Active
            </h4>
            <ul className="text-sm text-slate-600 space-y-2 mb-3">
              <li className="flex gap-2">
                <span className="font-bold text-indigo-600">1. Type Above:</span>
                <span>Send a message in the Chat Demo (try <code className="bg-slate-200 px-1 rounded text-xs">write python code</code> or <code className="bg-slate-200 px-1 rounded text-xs">haiku about ai</code>).</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-600">2. Watch Below:</span>
                <span>Your message will <strong>automatically appear</strong> as a new point in this map.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-600">3. Semantic Logic:</span>
                <span>The system detects keywords to place your point in the correct "Code" or "Creative" cluster, simulating vector similarity.</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground italic border-t border-indigo-100 pt-2">
              Use the <strong>Next Step</strong> button below to watch the algorithm optimize the layout in real-time.
            </p>
          </div>
          <SammonsMappingVis liveMessages={messages} />
        </div>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice Challenges" icon="Pencil">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Challenge 1</Badge>
                <Badge variant="outline">Security</Badge>
              </div>
              <h4 className="font-semibold mb-2">Rate Limiting</h4>
              <p className="text-sm text-muted-foreground">
                Implement \`express - rate - limit\` on your Node.js server to prevent API Key abuse by limiting requests per IP.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Challenge 2</Badge>
                <Badge variant="outline">Auth</Badge>
              </div>
              <h4 className="font-semibold mb-2">OAuth Integration</h4>
              <p className="text-sm text-muted-foreground">
                Replace simple API Keys with OAuth 2.0 flow to allow users to sign in with their own accounts securely.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
