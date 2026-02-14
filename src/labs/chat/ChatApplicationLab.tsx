import { useState, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, HighlightItem, TheoryBlock, TermCard } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Play, Pause, RotateCcw, Send, User, Info, ChevronRight, ChevronLeft, Target, Calculator, Zap, MessageCircle } from 'lucide-react';

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

const ALGORITHM_PSEUDOCODE = `Algorithm: Secure API Key Integration

1. ENVIRONMENT SETUP:
   a. Create a .env file in the project root.
   b. Add GEMINI_API_KEY=AIza... variable.
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
`;

interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: 'local' | 'remote';
}

interface DualClientDemoProps {
  onActivate?: () => void;
}

function DualClientDemo({ onActivate }: DualClientDemoProps) {
  // Demo Step State for Guided Tour
  const [demoStep, setDemoStep] = useState<number>(0); // 0=Idle, 1=Input, 2=Sending, 3=Processing, 4=Received

  // Constants for Step Descriptions
  const STEP_INFO = {
    0: { title: "Ready", desc: "System is idle. Click 'Start Simulation' to see the flow." },
    1: { title: "Step 1: User Input", desc: "The user types a message in the client interface." },
    2: { title: "Step 2: Transmission", desc: "Socket.IO captures the 'message' event and emits it securely to the server." },
    3: { title: "Step 3: Server Processing", desc: "Flask Server receives the payload, authenticates with API Key, and calls Gemini." },
    4: { title: "Step 4: AI Response", desc: "The AI response is received and broadcast back to the client via WebSockets." }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  // Pipeline State
  type PipelineState = 'idle' | 'sending' | 'processing' | 'receiving';
  const [pipelineState, setPipelineState] = useState<PipelineState>('idle');
  const [serverLog, setServerLog] = useState<string>('// System listening on port 5000...');

  // API Key & System State
  const [apiKey] = useState('AIzaSyATdE7YHYvavuRkVfOPutu6qvbhsOKoKaA');
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const handleStartSystem = () => {
    setIsSystemActive(true);
    if (onActivate) onActivate();
    addMessage({
      id: 'init',
      text: "System: Gemini API Connected. Ready for queries.",
      timestamp: Date.now(),
      sender: 'remote'
    });
  };

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);

    if (msg.sender === 'local') {
      // Step 1 & 2: Emission (Client B -> Server A)
      setPipelineState('sending');
      setServerLog(prev => prev + `\n\n[SOCKET_IN] { "payload": "${msg.text}", "auth": "VALID" }`);

      setTimeout(() => {
        // Step 3: Processing (Server A <-> Gemini)
        setPipelineState('processing');
        setServerLog(prev => prev + `\n[API_REQ] POST /v1/models/gemini-1.5-flash:generateContent\nStatus: Pending...`);

        // Call Real API
        callGemini(msg.text);
      }, 1500);
    } else {
      // AI Response received
    }
  };

  const callGemini = async (userText: string) => {
    try {
      // Use gemini-2.5-flash as confirmed by model list
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userText + " (Please explain in step-by-step bullet points.)" }] }] })
      });

      const data = await response.json();
      let replyText = "I'm sorry, I couldn't process that.";

      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
        replyText = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        replyText = `API Error: ${data.error.message}`;
      }

      // Update Log with Response
      setServerLog(prev => prev + `\n[API_RES] HTTP 200 OK\nPayload: ${JSON.stringify(data).substring(0, 60)}...`);

      // Step 4: Return (Server A -> Client B)
      setPipelineState('receiving');

      setTimeout(() => {
        setPipelineState('idle');
        addMessage({
          id: Date.now().toString(),
          text: replyText,
          timestamp: Date.now(),
          sender: 'remote'
        });
        setServerLog(prev => prev + '\n// System listening on port 5000...');
      }, 1200);

    } catch (error) {
      setPipelineState('idle');
      setServerLog(prev => prev + `\n[API_ERR] Connection Failed: ${error}`);
      addMessage({
        id: Date.now().toString(),
        text: "Network Error: Could not connect to AI service.",
        timestamp: Date.now(),
        sender: 'remote'
      });
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    addMessage({ id: Date.now().toString(), text: inputText, timestamp: Date.now(), sender: 'local' });
    setInputText('');
  };

  // Robust Markdown Renderer
  const renderMarkdown = (text: string) => {
    // 1. Split by newlines to handle blocks
    const lines = text.split('\n');

    return lines.map((line, index) => {
      // 2. Handle List Items (Bullets)
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        return (
          <div key={index} className="flex gap-2 ml-2 mb-1">
            <span className="text-slate-400 mt-1.5 h-1.5 w-1.5 bg-current rounded-full shrink-0" />
            <span>{parseInline(content)}</span>
          </div>
        );
      }

      // 3. Handle Empty Lines (Paragraph Breaks)
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      // 4. Default: Paragraph
      return <div key={index} className="mb-1">{parseInline(line)}</div>;
    });
  };

  // Helper to parse **bold** and *italic* inside a line
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

  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-advance logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && demoStep < 4) {
      const duration = demoStep === 1 ? 2000 : demoStep === 2 ? 3000 : demoStep === 3 ? 3000 : 1000;
      timer = setTimeout(() => {
        setDemoStep(prev => prev + 1);
      }, duration);
    } else if (isPlaying && demoStep >= 4) {
      setIsPlaying(false);
      setSimulationComplete(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, demoStep]);

  // Sync State with demoStep
  useEffect(() => {
    if (demoStep === 0) {
      setMessages([]);
      setServerLog('// System listening on port 5000...');
      setPipelineState('idle');
      setInputText('');
    } else if (demoStep === 1) {
      setMessages([]);
      setInputText('');
      setPipelineState('idle');
      const t = setTimeout(() => setInputText("Hello Gemini, how does this work?"), 500);
      return () => clearTimeout(t);
    } else if (demoStep === 2) {
      if (!messages.find(m => m.id === 'user-msg')) {
        setMessages(prev => [...prev, { id: 'user-msg', text: "Hello Gemini, how does this work?", timestamp: Date.now(), sender: 'local' }]);
      }
      setPipelineState('sending');
      setServerLog(prev => prev.includes('Socket.IO') ? prev : prev + `\n\n[SOCKET_IN] { "payload": "...", "auth": "VALID" }`);
    } else if (demoStep === 3) {
      setPipelineState('processing');
      setServerLog(prev => prev.includes('POST /v1') ? prev : prev + `\n[API_REQ] POST /v1/models/gemini-1.5-flash:generateContent\nStatus: Pending...`);
    } else if (demoStep === 4) {
      setPipelineState('receiving');
      const t = setTimeout(() => {
        setPipelineState('idle');
        setServerLog(prev => prev.includes('API_RES') ? prev : prev + `\n[API_RES] HTTP 200 OK\nPayload: {...}`);
        if (!messages.find(m => m.sender === 'remote')) {
          setMessages(prev => [...prev, {
            id: 'ai-msg',
            text: "I am a large language model, trained by Google.",
            timestamp: Date.now(),
            sender: 'remote'
          }]);
        }
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [demoStep]);

  const togglePlay = () => {
    if (demoStep === 0) setDemoStep(1);
    setIsPlaying(!isPlaying);
  };

  const nextStep = () => {
    if (demoStep < 4) {
      setDemoStep(prev => prev + 1);
      setIsPlaying(false); // Pause on manual interaction
    }
  };

  const prevStep = () => {
    if (demoStep > 0) {
      setDemoStep(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setDemoStep(0);
    setSimulationComplete(false);
  };

  return (
    <div className="space-y-6">
      {/* CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-100 p-4 rounded-xl border border-slate-200 gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg border shadow-sm p-1 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetSimulation}
              title="Reset"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="w-px bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={prevStep}
              disabled={demoStep === 0}
              title="Previous Step"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              onClick={togglePlay}
              size="sm"
              className={`gap-2 min-w-[100px] transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform border-none'}`}
            >
              {isPlaying ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> {demoStep === 0 ? 'Start' : 'Resume'}</>}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextStep}
              disabled={demoStep === 4}
              title="Next Step"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* STEP INDICATOR CARD */}
        <div className={`flex-1 transition-all duration-500 ${demoStep > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 blur-[2px]'}`}>
          <div className="bg-white border-2 border-primary/20 rounded-lg p-3 flex items-center gap-4 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 transition-colors duration-300 ${demoStep === 0 ? 'bg-slate-300' :
              demoStep === 1 ? 'bg-blue-500' :
                demoStep === 2 ? 'bg-purple-500' :
                  demoStep === 3 ? 'bg-orange-500' :
                    'bg-green-500'
              }`} />

            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-lg text-slate-700 border border-slate-200">
              {demoStep}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                {STEP_INFO[demoStep as keyof typeof STEP_INFO]?.title}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-1">
                {STEP_INFO[demoStep as keyof typeof STEP_INFO]?.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-0 gap-y-4 md:gap-4 h-auto p-2 relative">

        {/* OVERLAY FOR FOCUS MODE */}
        {demoStep > 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-0 rounded-xl transition-all duration-500 pointer-events-none" />
        )}

        {/* 1. LEFT PANEL: SERVER DASHBOARD */}
        <Card className={`col-span-12 md:col-span-5 bg-[#0f172a] border-slate-800 text-green-400 font-mono shadow-xl flex flex-col relative overflow-visible h-[450px] md:h-[65vh] transition-all duration-500 ${demoStep === 3 ? 'z-20 scale-[1.02] ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/20' : 'z-10 opacity-40 grayscale-[0.5]'
          } ${demoStep === 0 ? '!opacity-100 !grayscale-0 !z-10' : ''}`}>

          {/* Helper Badge 3 */}
          <div className={`absolute top-4 right-4 z-[60] transition-all duration-300 ${demoStep === 3 ? 'scale-125' : ''} group`}>
            <Badge className={` ${demoStep === 3 ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'} text-white font-bold h-6 w-6 rounded-full p-0 flex items-center justify-center cursor-help`}>3</Badge>
            {/* SPEECH BUBBLE 3 */}
            <div className={`absolute top-full right-0 mt-3 w-80 z-50 transition-all duration-300 ${demoStep === 3 ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none'}`}>
              <div className="bg-white text-slate-800 p-4 rounded-xl shadow-2xl border-2 border-orange-200 relative ring-2 ring-orange-100">
                <div className="absolute -top-2 right-2 w-4 h-4 bg-white border-t-2 border-l-2 border-orange-200 transform rotate-45"></div>
                <h5 className="font-bold text-sm text-orange-600 mb-2">Step 3: Server Processing</h5>
                <p className="text-xs leading-relaxed text-slate-600 mb-2">Server authenticates with API Key and calls Gemini:</p>
                <pre className="bg-slate-900 text-green-400 p-3 rounded text-[10px] overflow-x-auto">
                  <code>{`response = model.generate_content(
  user_prompt
)`}</code>
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
        <div className={`col-span-12 md:col-span-2 flex flex-col items-center justify-center relative py-4 min-h-[150px] min-w-[120px] transition-all duration-500 ${demoStep === 2 ? 'z-[50] scale-110' : 'z-0 opacity-60'
          } ${demoStep === 0 ? '!opacity-100 !z-10 !scale-100' : ''}`}>

          {/* Top: Gemini Logo (Node) */}
          <div className={`relative mb-8 md:mb-12 transition-all duration-500 flex-shrink-0 ${pipelineState === 'processing' ? 'scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'opacity-70'}`}>
            <div className={`w-14 h-14 bg-slate-950 rounded-2xl border flex items-center justify-center relative z-10 shrink-0 shadow-xl transition-colors ${demoStep === 3 ? 'border-orange-500 bg-slate-900' : 'border-purple-500/50'}`}>
              <div className={`${demoStep === 3 ? 'text-orange-400 animate-pulse' : 'text-purple-400'} shrink-0`}>
                {/* Sparkle Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${pipelineState === 'processing' ? "animate-pulse" : ""}`}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" /></svg>
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
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${demoStep === 2 ? 'scale-125' : ''} group`}>
            <Badge className={` ${demoStep === 2 ? 'bg-purple-500 animate-bounce' : 'bg-slate-400'} text-white font-bold h-6 w-6 rounded-full p-0 flex items-center justify-center shadow-lg border border-white/10 cursor-help`}>2</Badge>
            {/* SPEECH BUBBLE 2 */}
            <div className={`absolute top-1/2 right-full mr-3 -translate-y-1/2 w-80 z-[100] transition-all duration-300 ${demoStep === 2 ? 'opacity-100 translate-x-0 scale-105' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'}`}>
              <div className="bg-white text-slate-800 p-4 rounded-xl shadow-2xl border-2 border-purple-200 relative ring-2 ring-purple-100">
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-t-2 border-r-2 border-purple-200 transform rotate-45"></div>
                <h5 className="font-bold text-sm text-purple-600 mb-2">Step 2: Transmission</h5>
                <p className="text-xs leading-relaxed text-slate-600 mb-2">Socket.IO sends message to server:</p>
                <pre className="bg-slate-900 text-purple-400 p-3 rounded text-[10px] overflow-x-auto">
                  <code>{`// Client emits
socketio.emit('message', {
  text: userInput
});

// Server receives
@socketio.on('message')
def handle_message(data):
  process(data['text'])`}</code>
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
        <Card className={`col-span-12 md:col-span-5 border-primary/20 shadow-lg flex flex-col relative bg-white h-[450px] md:h-[65vh] transition-all duration-500 ${(demoStep === 1 || demoStep === 4) ? 'z-20 ring-4 ring-blue-500/30' : demoStep === 2 ? 'z-[5] opacity-40 grayscale-[0.5]' : 'z-10 opacity-40 grayscale-[0.5]'
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

          <CardContent className="p-0 flex-1 flex flex-col relative bg-slate-50/50 overflow-hidden">

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((m, idx) => (
                <div key={m.id} className={`flex gap-3 ${m.sender === 'local' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-5 duration-500`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.sender === 'local'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white border text-slate-700 rounded-bl-none'
                    }`}>
                    {/* Markdown Rendering */}
                    {renderMarkdown(m.text)}
                  </div>

                  {/* Helper Badge 4 (Step 4) - Only on latest AI message */}
                  {m.sender === 'remote' && idx === messages.length - 1 && (
                    <div className={`group relative self-center shrink-0 ${demoStep === 4 ? 'scale-125 transition-transform' : ''}`}>
                      <Badge className={` ${demoStep === 4 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'} text-white font-bold h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] cursor-help`}>4</Badge>
                      {/* SPEECH BUBBLE 4 */}
                      <div className={`absolute top-1/2 right-full mr-3 -translate-y-1/2 w-80 z-50 transition-all duration-300 ${demoStep === 4 ? 'opacity-100 translate-x-0 scale-105' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'}`}>
                        <div className="bg-white text-slate-800 p-4 rounded-xl shadow-2xl border-2 border-green-200 relative ring-2 ring-green-100">
                          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-t-2 border-r-2 border-green-200 transform rotate-45"></div>
                          <h5 className="font-bold text-sm text-green-600 mb-2">Step 4: AI Response</h5>
                          <p className="text-xs leading-relaxed text-slate-600 mb-2">Response broadcast to client:</p>
                          <pre className="bg-slate-900 text-green-400 p-3 rounded text-[10px] overflow-x-auto">
                            <code>{`socketio.on('broadcast', 
  (data) => {
    displayMessage(data.response)
  }
)`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
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
            {/* Input Area */}
            <div className={`p-4 border-t bg-white relative shrink-0 transition-colors duration-300 ${demoStep === 1 ? 'bg-blue-50' : ''}`}>
              {/* Helper Badge 1 */}
              <div className={`absolute -top-3 left-6 z-20 transition-transform ${demoStep === 1 ? 'scale-125' : ''} group`}>
                <Badge className={` ${demoStep === 1 ? 'bg-blue-500 animate-bounce' : 'bg-slate-400'} text-white font-bold h-6 w-6 rounded-full p-0 flex items-center justify-center cursor-help`}>1</Badge>
                {/* SPEECH BUBBLE 1 */}
                <div className={`absolute bottom-full left-0 mb-3 w-80 z-50 transition-all duration-300 ${demoStep === 1 ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none'}`}>
                  <div className="bg-white text-slate-800 p-4 rounded-xl shadow-2xl border-2 border-blue-200 relative ring-2 ring-blue-100">
                    <div className="absolute -bottom-2 left-2 w-4 h-4 bg-white border-b-2 border-r-2 border-blue-200 transform rotate-45"></div>
                    <h5 className="font-bold text-sm text-blue-600 mb-2">Step 1: User Input</h5>
                    <p className="text-xs leading-relaxed text-slate-600 mb-2">React controlled input:</p>
                    <pre className="bg-slate-900 text-blue-400 p-3 rounded text-[10px] overflow-x-auto">
                      <code>{`const [inputText, setInputText] = 
  useState('');

<Input 
  value={inputText}
  onChange={(e) => 
    setInputText(e.target.value)
  }
/>`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">

                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className={`rounded-full border-none focus-visible:ring-1 focus-visible:ring-purple-500 transition-colors ${demoStep === 1 ? 'bg-white ring-2 ring-blue-400' : 'bg-slate-100'}`}
                />
                <Button onClick={handleSend} size="icon" className={`rounded-full shadow-lg transition-all duration-300 ${simulationComplete && demoStep === 0
                  ? 'bg-green-500 hover:bg-green-600 ring-4 ring-green-400 animate-pulse shadow-green-200'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                  }`}>
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
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The flow includes a dedicated step for Environment Setup and Key Validation.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Environment Setup</h4>
              <p className="text-muted-foreground">Create a .env file and configure your API keys securely.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Server Initialization</h4>
              <p className="text-muted-foreground">Initialize the Flask-SocketIO server and load environment variables.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Request Handling</h4>
              <p className="text-muted-foreground">Authenticate user requests and forward them to the Gemini API.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Secure Response</h4>
              <p className="text-muted-foreground">Receive the AI response and broadcast it back to the client via WebSockets.</p>
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
          Updated implementation showing secure \`.env\` usage for API Keys in Node.js.
        </p>
        <CodeBlock code={CHAT_CODE} language="javascript" title="server.js & .env" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <div className="mb-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            System Online: Gemini 2.5 Flash
          </Badge>
        </div>
        <DualClientDemo onActivate={() => setActiveSection('demo')} />
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
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
