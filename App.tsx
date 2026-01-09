import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { 
  FileUp, FileText, AlertCircle, ShieldAlert, Target, CheckCircle2, 
  Zap, X, Sparkles, Scan, Binary, FileDown, Loader2, TrendingUp, ClipboardCheck, 
  Linkedin, Mail, ArrowRight, ChevronRight, Lock,
  Eye, LogOut, User as UserIcon, Settings, BarChart3, 
  Users, DollarSign, ShieldCheck, Search, MoreVertical, Trash2, Ban,
  ChevronDown, LayoutDashboard, History, CreditCard as BillingIcon,
  Award, Briefcase, Compass, BrainCircuit, Rocket, Trophy,
  LineChart, Sparkle, ExternalLink, Fingerprint, Globe, BookOpen, MessageSquare, Send, Activity,
  Server, Key, Plus, Edit2, ShieldX, FileOutput, Info, AlertTriangle, Link as LinkIcon, Phone,
  Clock, RefreshCcw, Monitor, PieChart, Database, Cpu, Calendar, Download, ListFilter, Unlock,
  Layers, HardDrive, Cpu as CpuIcon, Gauge, Radio, Radar, Shield, Check, XCircle,
  Flag, Star, Gem, Medal, ListTodo, CircleDashed, Instagram, Table, Filter, DownloadCloud,
  TrendingDown, ArrowUpRight, ArrowDownRight, Terminal, Save
} from 'lucide-react';
import { Industry, AppState, AnalysisResult, Region, User, PaymentRecord, Plan, RiskLevel, InterviewQuestion } from './types';
import { analyzeResume, generateFullPrepDeck, chatWithAssistant } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

// @ts-ignore
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle, ExternalHyperlink, Footer as DocxFooter, Header } from 'https://esm.sh/docx';
// @ts-ignore
import { jsPDF } from 'https://esm.sh/jspdf';
// @ts-ignore
import html2canvas from 'https://esm.sh/html2canvas';

// --- CONSTANTS ---

const DEFAULT_PLANS: Plan[] = [
  { id: 'p1', name: 'Starter', priceINR: 499, tokens: 1, description: '1 Comprehensive AI Review' },
  { id: 'p2', name: 'Standard', priceINR: 1999, tokens: 5, description: '5 Comprehensive AI Reviews' },
  { id: 'p3', name: 'Pro Pack', priceINR: 3499, tokens: 10, description: '10 Comprehensive AI Reviews' }
];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// --- UI COMPONENTS ---

const AdvancedVisualizer = () => (
  <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
    <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-spin-slow" />
    <div className="absolute inset-4 border border-indigo-500/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '6s' }} />
    <div className="absolute inset-8 border-2 border-cyan-400/40 rounded-full border-t-cyan-400 animate-spin" style={{ animationDirection: '3s' }} />
    <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
    <div className="relative z-10 bg-slate-900 border border-white/20 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,211,238,0.3)]">
      <BrainCircuit className="w-12 h-12 text-cyan-400 animate-bounce" />
    </div>
  </div>
);

const GlassCard = ({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    className={`glass-panel rounded-2xl md:rounded-[2rem] p-5 md:p-6 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const ModuleHeader = ({ title, subtitle, icon: Icon, color = "border-cyan-500" }: { title: string, subtitle: string, icon?: any, color?: string }) => (
  <div className={`mb-4 border-l-2 ${color} pl-4 relative`}>
    <div className={`absolute -left-[5px] top-0 h-2 w-2 ${color.replace('border', 'bg')} rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]`} />
    <h2 className="text-base md:text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-inherit" />}
      {title}
    </h2>
    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{subtitle}</p>
  </div>
);

const GaugeScore = ({ score, label, color = "stroke-cyan-500", size = "w-20 h-20" }: { score: number, label: string, color?: string, size?: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${size}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} className="stroke-white/5 fill-none" strokeWidth="4" />
          <circle cx="48" cy="48" r={radius} className={`fill-none transition-all duration-1000 ease-out ${color}`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-white">{score.toFixed(0)}</span>
        </div>
      </div>
      <span className="mt-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
};

const ProtocolLock = ({ isUnlocked, onUnlockClick, title, header, children, benefits = [] }: any) => {
  return (
    <div className="relative">
      {header}
      <div className="relative">
        {!isUnlocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="absolute inset-0 z-10 backdrop-blur-[120px] bg-slate-950/45 rounded-3xl border border-white/10" />
            
            <div className="relative z-40 bg-slate-900/60 p-10 rounded-[2.5rem] border border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.15)] max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tighter mb-4">{title}</h4>
              
              {benefits.length > 0 && (
                <div className="space-y-3 mb-8 text-left">
                  {benefits.map((benefit: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[10px] text-slate-100 font-bold uppercase tracking-wider">{benefit}</span>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={onUnlockClick} 
                className="w-full py-4 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-95"
              >
                <Unlock className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Reveal Report
              </button>
            </div>
          </div>
        )}
        <div className={!isUnlocked ? 'opacity-20 pointer-events-none grayscale' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}

// --- IMPACT UTILS ---
const getImpactConfig = (impact: string) => {
  switch (impact) {
    case 'High':
      return { icon: <XCircle className="w-3 h-3" />, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
    case 'Moderate':
      return { icon: <AlertTriangle className="w-3 h-3" />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    case 'Low':
    default:
      return { icon: <CheckCircle2 className="w-3 h-3" />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' };
  }
};

// --- HEATMAP COMPONENT ---

const HeatmapVisualizer = ({ data }: { data: AnalysisResult['eyeTrackingHeatmap'] }) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const getHeatColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/30 border-red-500/60';
    if (score >= 60) return 'bg-orange-500/25 border-orange-500/50';
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/40';
    return 'bg-emerald-500/15 border-emerald-500/30';
  };

  const activeData = useMemo(() => 
    data.find(d => d.section.toLowerCase().includes((hoveredSection || "").toLowerCase())), 
    [data, hoveredSection]
  );

  const sections = [
    { id: 'Header', top: '5%', height: '10%' },
    { id: 'Summary', top: '16%', height: '12%' },
    { id: 'Experience', top: '30%', height: '35%' },
    { id: 'Education', top: '67%', height: '15%' },
    { id: 'Skills', top: '84%', height: '10%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
      <div className="md:col-span-7 relative group">
        <div className="w-full aspect-[1/1.4] bg-white rounded-lg p-8 flex flex-col gap-6 relative shadow-2xl overflow-hidden border border-white/10">
           {/* Section Overlays */}
           {sections.map(s => {
             const heat = data.find(d => d.section.toLowerCase().includes(s.id.toLowerCase())) || { attentionScore: 0 };
             return (
               <div 
                 key={s.id}
                 onMouseEnter={() => setHoveredSection(s.id)}
                 onMouseLeave={() => setHoveredSection(null)}
                 style={{ top: s.top, height: s.height }}
                 className={`absolute left-0 right-0 z-20 transition-all duration-300 cursor-crosshair border-y-2 border-transparent hover:z-30 ${getHeatColor(heat.attentionScore)} ${hoveredSection === s.id ? 'ring-4 ring-cyan-400 ring-inset border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : ''}`}
               >
                 {hoveredSection === s.id && (
                   <div className="absolute top-2 right-4 flex items-center gap-2 animate-in zoom-in duration-300">
                     <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase rounded-full">Telemetric Link</span>
                   </div>
                 )}
               </div>
             );
           })}

           {/* High-Fidelity Mock Content */}
           <div className="space-y-2">
             <div className="h-6 w-1/3 bg-slate-200 rounded" />
             <div className="h-2 w-1/2 bg-slate-100 rounded" />
           </div>
           
           <div className="space-y-1 mt-4">
             <div className="h-3 w-full bg-slate-100 rounded" />
             <div className="h-3 w-full bg-slate-100 rounded" />
             <div className="h-3 w-3/4 bg-slate-100 rounded" />
           </div>

           <div className="mt-8 space-y-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="space-y-3">
                 <div className="flex justify-between items-center">
                   <div className="h-4 w-1/4 bg-slate-200 rounded" />
                   <div className="h-3 w-1/6 bg-slate-100 rounded" />
                 </div>
                 <div className="space-y-1.5">
                   <div className="h-2 w-full bg-slate-50 rounded" />
                   <div className="h-2 w-full bg-slate-50 rounded" />
                   <div className="h-2 w-[90%] bg-slate-50 rounded" />
                 </div>
               </div>
             ))}
           </div>
           
           <div className="mt-auto py-4 border-t border-slate-100 flex justify-between items-center opacity-40">
             <div className="h-2 w-20 bg-slate-100 rounded" />
             <div className="h-2 w-20 bg-slate-100 rounded" />
           </div>
        </div>
        
        <div className="absolute inset-0 heatmap-scanner opacity-30 pointer-events-none z-40" />
      </div>

      <div className="md:col-span-5 flex flex-col">
        <GlassCard className="flex-1 !p-8 border-cyan-500/10 flex flex-col justify-center min-h-[450px]">
          {!hoveredSection ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
               <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative w-20 h-20 rounded-[2rem] bg-slate-950 border border-cyan-500/30 flex items-center justify-center">
                    <Fingerprint className="w-10 h-10 text-cyan-400" />
                  </div>
               </div>
               <div className="space-y-2">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest">Awaiting Telemetry</h4>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">Hover report zones to extract <br/>recruiter gaze analytics</p>
               </div>
            </div>
          ) : (
            <div className="flex-1 space-y-8 animate-in slide-in-from-right duration-400 text-left">
               <div className="flex justify-between items-start border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Protocol Node</p>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{hoveredSection}</h3>
                  </div>
                  <div className="px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl text-right shadow-inner">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Attention Score</p>
                    <p className={`text-2xl font-black ${activeData && activeData.attentionScore > 75 ? 'text-red-400' : 'text-cyan-400'}`}>
                      {activeData?.attentionScore || 0}%
                    </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <ModuleHeader title="Forensic Core Analysis" subtitle="AI Section Diagnosis" icon={Radar} color="border-cyan-500/40" />
                  <div className="p-6 bg-cyan-600/5 border border-cyan-500/20 rounded-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                        <Activity className="w-12 h-12 text-cyan-400" />
                     </div>
                     <p className="text-[11px] text-slate-200 leading-relaxed italic relative z-10">
                        "{activeData?.feedback || 'Telemetry lock successful. Section integrity verified by AI decision node.'}"
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-slate-700 pl-3">Recruiter Intelligence</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl hover:border-cyan-500/20 transition-colors">
                        <p className="text-[8px] font-bold text-slate-600 uppercase mb-2">Retention Risk</p>
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${activeData && activeData.attentionScore < 45 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                           <p className="text-xs font-black text-white uppercase tracking-tighter">{activeData && activeData.attentionScore < 45 ? 'CRITICAL' : 'NOMINAL'}</p>
                        </div>
                     </div>
                     <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl hover:border-cyan-500/20 transition-colors">
                        <p className="text-[8px] font-bold text-slate-600 uppercase mb-2">Impact Density</p>
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${activeData && activeData.attentionScore > 80 ? 'bg-cyan-400' : 'bg-orange-500'}`} />
                           <p className="text-xs font-black text-white uppercase tracking-tighter">{activeData && activeData.attentionScore > 80 ? 'SATURATED' : 'SPARSE'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [state, setState] = useState<AppState>({ 
    user: null, currentPage: 'home', file: null, industry: Industry.TECH, region: Region.INDIA, 
    jobDescription: '', isAnalyzing: false, analysisPhase: '', result: null, error: null, plans: DEFAULT_PLANS
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [fullPrepDeck, setFullPrepDeck] = useState<InterviewQuestion[] | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('resume_iq_v10');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.users) setUsers(p.users);
        if (p.history) setAnalysisHistory(p.history);
        if (p.plans) setState(prev => ({ ...prev, plans: p.plans }));
      } catch(e) {}
    }
    
    const handleMouseMove = (e: MouseEvent) => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem('resume_iq_v10', JSON.stringify({ users, history: analysisHistory, plans: state.plans }));
  }, [users, analysisHistory, state.plans]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  const handleLogin = (u: any) => {
    const existing = users.find(ex => ex.email === u.email);
    const userToSet: User = existing || {
      ...u,
      xp: 0,
      level: 1,
      badges: [],
      completedTasks: []
    };
    if (!existing) setUsers(prev => [...prev, userToSet]);
    setState(p => ({ ...p, user: userToSet, currentPage: 'home' }));
  };

  const onAdminAuth = (success: boolean) => {
    if (success) {
      const adminUser = users.find(u => u.role === 'admin') || {
        id: 'admin_root', name: 'Admin', email: 'admin@resumecore.ai', picture: '', role: 'admin' as const, isBlocked: false, suspiciousActivity: false, createdAt: Date.now(), tokenBalance: 999,
        xp: 9999, level: 99, badges: [], completedTasks: []
      };
      setState(p => ({ ...p, user: adminUser, currentPage: 'admin' }));
    } else {
      alert("Denied.");
    }
  };

  const updateUserXP = (amount: number) => {
    if (!state.user) return;
    const newXP = state.user.xp + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    const updatedUser = { ...state.user, xp: newXP, level: newLevel };
    setUsers(prev => prev.map(u => u.id === state.user!.id ? updatedUser : u));
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const toggleTask = (taskId: string) => {
    if (!state.user) return;
    const isCompleted = state.user.completedTasks.includes(taskId);
    const updatedTasks = isCompleted 
      ? state.user.completedTasks.filter(id => id !== taskId)
      : [...state.user.completedTasks, taskId];
    
    const xpChange = isCompleted ? -50 : 50;
    const updatedUser = { ...state.user, completedTasks: updatedTasks };
    
    setUsers(prev => prev.map(u => u.id === state.user!.id ? { ...updatedUser, xp: state.user!.xp + xpChange } : u));
    setState(prev => ({ ...prev, user: { ...updatedUser, xp: state.user!.xp + xpChange } }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState(p => ({ ...p, file, isAnalyzing: true, analysisPhase: 'Establishing Secure Protocol...', error: null }));
    setIsUnlocked(false);
    setFullPrepDeck(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeResume(
          base64, file.type, state.industry, state.region, state.jobDescription, 
          (phase) => setState(prev => ({ ...prev, analysisPhase: phase }))
        );
        
        const resultWithIds = {
          ...result,
          recruiterTips: (result.recruiterTips || []).map((t: any, idx: number) => ({ ...t, id: `task-${Date.now()}-${idx}` }))
        };
        
        const finalResult = { ...resultWithIds, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), userId: state.user?.id || 'guest' };
        
        await new Promise(r => setTimeout(r, 800));
        
        setState(prev => ({ ...prev, result: finalResult, isAnalyzing: false }));
        updateUserXP(100); 
      } catch (e) { 
        console.error(e);
        setState(p => ({ ...p, isAnalyzing: false, error: 'Analysis failed. Document too complex.' })); 
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmUnlock = () => {
    if (!state.user) {
      setState(p => ({ ...p, currentPage: 'login' }));
      setShowUnlockModal(false);
      return;
    }
    if (state.user.tokenBalance <= 0) {
      setShowUnlockModal(false);
      setShowPayModal(true);
      return;
    }
    const updatedUser = { ...state.user, tokenBalance: state.user.tokenBalance - 1 };
    setUsers(users.map(u => u.id === state.user!.id ? updatedUser : u));
    setState(prev => ({ ...prev, user: updatedUser }));
    setIsUnlocked(true);
    setShowUnlockModal(false);
    updateUserXP(250);
    if (state.result && !analysisHistory.find(h => h.id === state.result!.id)) {
      setAnalysisHistory(prev => [state.result!, ...prev]);
    }
  };

  const handleGenerateFullDeck = async () => {
    if (!state.result) return;
    setIsGeneratingDeck(true);
    try {
      const deck = await generateFullPrepDeck(state.result.idealResumeContent.summary, state.industry, state.jobDescription);
      setFullPrepDeck(deck);
      setShowDeckModal(true);
      updateUserXP(150);
    } catch (e) {
      alert("Prep deck failure.");
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const botResponse = await chatWithAssistant(userMsg, history);
      setChatMessages(prev => [...prev, { role: 'model', text: botResponse || "Issue rephrasing..." }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Service unavailable." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const downloadReportPDF = async () => {
    if (!state.result) return;
    const element = document.getElementById('analysis-report');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#020617' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Report_${state.result.extractedData.name}.pdf`);
  };

  const downloadImprovedDOCX = async () => {
    if (!state.result) return;
    const { idealResumeContent, extractedData } = state.result;
    const sections = [{
      children: [
        new Paragraph({ text: extractedData.name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: extractedData.contact || "", alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "SUMMARY", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: idealResumeContent.summary })] }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "WORK EXPERIENCE", heading: HeadingLevel.HEADING_2 }),
        ...idealResumeContent.experience.flatMap(exp => [
          new Paragraph({ children: [new TextRun({ text: `${exp.company} | ${exp.role}`, bold: true }), new TextRun({ text: `\t${exp.period}`, italic: true })], alignment: AlignmentType.LEFT }),
          ...exp.bullets.map(b => new Paragraph({ text: b, bullet: { level: 0 } })),
          new Paragraph({ text: "" }),
        ]),
        new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2 }),
        ...idealResumeContent.education.map(edu => new Paragraph({ children: [new TextRun({ text: `${edu.school} - ${edu.degree}`, bold: true }), new TextRun({ text: ` (${edu.year})`, italic: true })] })),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: idealResumeContent.skills.join(", ") }),
      ],
      footers: { default: new DocxFooter({ children: [new Paragraph({ children: [new TextRun({ text: "Optimized by Resume Core AI", color: "888888", size: 16 })], alignment: AlignmentType.CENTER })] }) },
    }];
    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Optimization_${extractedData.name}.docx`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200">
      <nav className="w-full h-16 md:h-20 flex items-center justify-between px-6 md:px-12 glass-panel sticky top-0 z-[100] backdrop-blur-[60px] border-b border-white/10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setState(p => ({ ...p, currentPage: 'home', result: null }))}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg md:text-xl uppercase tracking-tighter text-white">RESUME <span className="text-cyan-400">CORE</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {state.user ? (
            <>
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                 <Award className="w-4 h-4 text-yellow-500" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">LVL {state.user.level}</span>
                 <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${(state.user.xp % 500) / 5}%` }} />
                 </div>
              </div>
              <button onClick={() => setState(p => ({ ...p, currentPage: state.currentPage === 'dashboard' ? 'home' : 'dashboard' }))} className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${state.currentPage === 'dashboard' ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">My Stats</span>
              </button>
              <button onClick={() => setState(p => ({ ...p, user: null, currentPage: 'home', result: null }))} className="p-2.5 bg-white/5 border border-white/10 text-slate-500 hover:text-red-500 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => setState(p => ({ ...p, currentPage: 'login' }))} className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl">Login</button>
          )}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-6 md:py-10">
        {state.currentPage === 'admin-login' ? (
          <AdminLoginPage onAdminAuth={onAdminAuth} />
        ) : state.currentPage === 'admin' ? (
          <AdminDashboard users={users} analysisHistory={analysisHistory} plans={state.plans} onBack={() => setState(p => ({ ...p, currentPage: 'home' }))} onUpdatePlans={(newPlans: Plan[]) => setState(p => ({ ...p, plans: newPlans }))} />
        ) : state.currentPage === 'login' ? (
          <LoginPage onLogin={handleLogin} />
        ) : state.currentPage === 'dashboard' && state.user ? (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end text-left">
                <div className="lg:col-span-8">
                  <ModuleHeader title={`Welcome back, ${state.user.name}`} icon={UserIcon} subtitle="Your Career Intelligence Command Center" />
                </div>
                <div className="lg:col-span-4 flex justify-end gap-3">
                   <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                      <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{state.user.tokenBalance} Credits</span>
                   </div>
                   <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{state.user.xp} XP</span>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                <GlassCard className="p-6 border-cyan-500/10 group">
                  <Activity className="w-6 h-6 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Audits</p>
                  <p className="text-4xl font-black text-white">{analysisHistory.filter(h => h.userId === state.user!.id).length}</p>
                </GlassCard>
                <GlassCard className="p-6 border-indigo-500/10 group">
                  <Gauge className="w-6 h-6 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Rank</p>
                  <p className="text-4xl font-black text-white">#{Math.max(1, 100 - state.user.level * 2)}%</p>
                </GlassCard>
                <button onClick={() => setShowPayModal(true)} className="md:col-span-2 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between hover:bg-emerald-500/10 transition-all group overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Insufficient Credits?</p>
                        <p className="text-lg font-black text-white uppercase tracking-tight">Replenish Scan Tokens</p>
                      </div>
                   </div>
                   <ChevronRight className="w-6 h-6 text-emerald-500" />
                </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                <div className="lg:col-span-8 space-y-8">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <ListTodo className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Tactical Action checklist</h3>
                         </div>
                         <span className="text-[9px] font-bold text-slate-500 uppercase">+50 XP PER TASK</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisHistory.filter(h => h.userId === state.user!.id).length > 0 ? (
                           analysisHistory.filter(h => h.userId === state.user!.id)[0].recruiterTips.map((tip) => {
                             const isCompleted = state.user?.completedTasks.includes(tip.id);
                             const impactInfo = getImpactConfig(tip.impact);
                             return (
                               <div 
                                 key={tip.id} 
                                 onClick={() => toggleTask(tip.id)}
                                 className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                                   isCompleted 
                                   ? 'bg-emerald-500/10 border-emerald-500/20 opacity-60' 
                                   : 'bg-white/[0.03] border-white/5 hover:border-cyan-500/20'
                                 }`}
                               >
                                  <div className={`mt-1 rounded-full p-1 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                     {isCompleted ? <Check className="w-3 h-3 text-white" /> : <CircleDashed className="w-3 h-3 text-slate-500" />}
                                  </div>
                                  <div className="text-left space-y-2 flex-1">
                                     <div className="flex justify-between items-start gap-2">
                                        <p className={`text-xs font-bold ${isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>{tip.issue}</p>
                                        <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${impactInfo.color} ${impactInfo.bg} ${impactInfo.border}`}>
                                           {impactInfo.icon} {tip.impact}
                                        </div>
                                     </div>
                                     <p className="text-[10px] text-slate-500 italic leading-relaxed">Fix: {tip.rectification.slice(0, 80)}...</p>
                                  </div>
                               </div>
                             );
                           })
                        ) : (
                          <div className="col-span-2 p-12 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center">
                             <CircleDashed className="w-10 h-10 text-slate-700 mx-auto mb-4 animate-spin-slow" />
                             <p className="text-xs text-slate-500 uppercase font-bold">Complete your first scan to generate actions.</p>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
                
                <div className="lg:col-span-4 space-y-8">
                   <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/5">
                      <div className="flex flex-col items-center text-center">
                         <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative z-10 w-full h-full bg-slate-900 rounded-[2rem] border border-indigo-500/40 flex items-center justify-center">
                               <span className="text-4xl font-black text-white">{state.user.level}</span>
                            </div>
                         </div>
                         <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Career Mastery</h4>
                         <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-6">Level {state.user.level} Practitioner</p>
                         
                         <div className="w-full space-y-2">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                               <span>{state.user.xp % 500} XP</span>
                               <span>Next LVL: 500 XP</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${(state.user.xp % 500) / 5}%` }} />
                            </div>
                         </div>
                      </div>
                   </GlassCard>
                </div>
             </div>
          </div>
        ) : !state.result ? (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-12 md:space-y-16 py-8 md:py-16 text-center animate-in fade-in duration-700 relative text-left">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl animate-pulse mx-auto">
                <Sparkles className="w-4 h-4" /> Professional Resume Feedback
             </div>
             <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                  Fix Your <span className="text-cyan-400 italic">Resume</span>
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-lg font-light leading-relaxed px-6">
                  "Most resumes never reach a human. We help you fix your points so you can pass filters and get more interviews."
                </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full mt-8">
                <div className="md:col-span-5 text-left space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1"><Target className="w-4 h-4" /> Target Job Profile</label>
                  <textarea 
                    value={state.jobDescription} 
                    onChange={e => setState(p => ({ ...p, jobDescription: e.target.value }))} 
                    placeholder="Paste the Job Description (JD) here..." 
                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-6 text-sm text-white outline-none h-[300px] resize-none transition-all focus:border-cyan-500/40" 
                  />
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="md:col-span-7 p-10 border-2 border-dashed border-white/10 rounded-2xl bg-slate-900/30 flex flex-col items-center justify-center hover:border-cyan-500/40 cursor-pointer group transition-all relative overflow-hidden backdrop-blur-xl min-h-[300px]">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-105 transition-transform border border-white/5">
                     <FileUp className="w-8 h-8 md:w-12 md:h-12 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">Submit Resume</h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10 text-center">PDF or DOCX Formats Only</p>
                  <button className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Select File From Computer</button>
                </div>
             </div>
             {state.error && <p className="mt-8 text-red-400 font-bold text-sm uppercase tracking-widest animate-pulse mx-auto">{state.error}</p>}
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx" className="hidden" />
          </div>
        ) : (
          <div id="analysis-report" className="space-y-8 pb-24 animate-in fade-in duration-700 max-w-6xl mx-auto text-left">
             {/* Report Summary */}
             <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-[3rem] border border-cyan-500/20 shadow-2xl overflow-hidden relative">
               <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                  <div className="shrink-0 flex flex-col items-center gap-6">
                    <GaugeScore score={state.result.overallScore} label="OVERALL SCORE" size="w-32 h-32" color="stroke-cyan-500" />
                    <div className="flex gap-2">
                       <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-cyan-400">IQ</div>
                       <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400">V.10</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">{state.result.extractedData.name}</h1>
                        <div className="flex gap-3">
                          <span className="text-[9px] text-slate-500 font-bold uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">ID: 0x{state.result.id.toUpperCase()}</span>
                          <span className="text-[9px] text-cyan-400 font-bold uppercase bg-cyan-400/5 px-3 py-1.5 rounded-lg border border-cyan-400/20">Target: {state.industry}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        {!isUnlocked ? (
                          <button onClick={() => setShowUnlockModal(true)} className="px-8 py-4 bg-cyan-600 text-white font-black uppercase rounded-xl text-[10px] shadow-lg flex items-center justify-center gap-3 hover:bg-cyan-500 transition-all"><Unlock className="w-4 h-4" /> REVEAL FULL REPORT</button>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                             <button onClick={downloadReportPDF} className="px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black uppercase rounded-lg text-[9px] hover:bg-indigo-600 hover:text-white transition-all"><Download className="w-4 h-4" /> PDF REPORT</button>
                             <button onClick={downloadImprovedDOCX} className="px-4 py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-black uppercase rounded-lg text-[9px] hover:bg-emerald-600 hover:text-white transition-all"><FileDown className="w-4 h-4" /> WORD DOC</button>
                          </div>
                        )}
                        <button onClick={() => { setState(p => ({ ...p, result: null, file: null, error: null })); setIsUnlocked(false); }} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-500 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-2"><RefreshCcw className="w-3.5 h-3.5" /> START NEW SCAN</button>
                      </div>
                    </div>
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-10">
                   {/* Heatmap Section */}
                   <ProtocolLock 
                      isUnlocked={isUnlocked} 
                      onUnlockClick={() => setShowUnlockModal(true)} 
                      title="Attention Architecture"
                      header={<ModuleHeader title="Attention Heatmap" subtitle="Recruiter Eye-Tracking Simulation" icon={Eye} color="border-orange-500" />}
                      benefits={['Hover to extract gaze remarks', 'Heat distribution diagnostic', 'Telemetric attention scores']}
                   >
                     <HeatmapVisualizer data={state.result.eyeTrackingHeatmap} />
                   </ProtocolLock>

                   <ProtocolLock 
                      isUnlocked={isUnlocked} 
                      onUnlockClick={() => setShowUnlockModal(true)} 
                      title="ATS Tactical Diagnostic"
                      header={<ModuleHeader title="ATS Forensic Scan" subtitle="How bots perceive your experience" icon={Binary} color="border-cyan-500" />}
                      benefits={['Unlock specific keyword optimization map', 'Detect parsing obstacles', 'ATS visibility risk audit']}
                   >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <GlassCard className="md:col-span-4 p-8 flex flex-col items-center justify-center bg-slate-900/40 border-cyan-500/10">
                           <GaugeScore score={state.result.atsReadability} label="ATS Readability" size="w-24 h-24" color="stroke-cyan-500" />
                        </GlassCard>
                        <div className="md:col-span-8 space-y-4">
                           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Scan className="w-3 h-3 text-cyan-400" /> Formatting Anomalies</h4>
                              <div className="space-y-3">
                                 {state.result.formattingDiagnosis.map((item, i) => (
                                   <div key={i} className="flex gap-3 items-start group">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                      <p className="text-xs text-slate-400 italic">{item}</p>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </div>
                   </ProtocolLock>

                   <ProtocolLock 
                      isUnlocked={isUnlocked} 
                      onUnlockClick={() => setShowUnlockModal(true)} 
                      title="Recruiter Forensic Notes"
                      header={<ModuleHeader title="The Hiring Panel's View" subtitle="Deep critique from a recruiter perspective" icon={AlertTriangle} color="border-red-500" />}
                      benefits={['Brutal forensic audit of logic gaps', 'Executive branding risk assessment', 'High-impact bullet rewrites']}
                   >
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {state.result.recruiterTips?.map((t: any, i: number) => {
                                const impactInfo = getImpactConfig(t.impact);
                                return (
                                  <GlassCard key={i} className="!p-6 border-white/5 group hover:bg-white/[0.04]">
                                     <div className="flex items-center justify-between mb-6">
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${impactInfo.color} ${impactInfo.bg} ${impactInfo.border}`}>
                                          {impactInfo.icon} {t.impact} Impact
                                        </div>
                                     </div>
                                     <p className="text-sm text-slate-100 italic border-l-2 border-white/10 pl-5 mb-8">"{t.issue}"</p>
                                     <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-400">
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">AI RECTIFICATION</p>
                                        {t.rectification}
                                     </div>
                                  </GlassCard>
                                );
                             })}
                          </div>
                      </div>
                   </ProtocolLock>
                </div>

                <div className="lg:col-span-4 space-y-10">
                   <ProtocolLock 
                      isUnlocked={isUnlocked} 
                      onUnlockClick={() => setShowUnlockModal(true)} 
                      title="Interview Prep Matrix"
                      header={<ModuleHeader title="Scenario Training" icon={ShieldCheck} subtitle="Handling tough recruiter traps" color="border-indigo-500" />}
                      benefits={['Unlock STAR framework guides', 'Predicted recruiter trap questions', 'Behavioral strategy map']}
                   >
                     <div className="space-y-6">
                        <GlassCard className="!p-8 border-indigo-500/10 space-y-8 shadow-2xl">
                           <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-5">Your Tactical Response</p>
                              <p className="text-xs text-slate-300 italic">"{state.result.narrativeRisk.interviewResponse}"</p>
                           </div>
                           <button 
                             onClick={handleGenerateFullDeck}
                             disabled={isGeneratingDeck}
                             className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-4 group mt-6"
                           >
                             {isGeneratingDeck ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                             GENERATE FULL DECK
                           </button>
                        </GlassCard>
                     </div>
                   </ProtocolLock>
                </div>
             </div>
          </div>
        )}
      </main>

      <Footer onAdminClick={() => setState(prev => ({ ...prev, currentPage: 'admin-login' }))} />

      {/* Floating Chat Assistant */}
      <div className={`fixed bottom-8 right-8 z-[500] transition-all duration-500 ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <GlassCard className="w-[350px] md:w-[400px] h-[500px] flex flex-col border-cyan-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] !p-0 overflow-hidden text-left">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyan-950/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Core Assistant</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-1 hover:text-cyan-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <BrainCircuit className="w-10 h-10 text-slate-800" />
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                  Forensic AI active. Query any aspect of your career protocol.
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg' 
                  : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-2">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/10 bg-slate-950/60">
            <div className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Input query..." 
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white outline-none focus:border-cyan-500/40"
              />
              <button 
                onClick={handleSendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 z-[501] w-14 h-14 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(34,211,238,0.3)] hover:scale-110 active:scale-95 transition-all group"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#020617] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {/* Modals & Overlays */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/98 backdrop-blur-[120px]" onClick={() => setShowUnlockModal(false)} />
           <GlassCard className="max-w-md w-full relative z-[700] !p-12 text-center border-cyan-500/30 shadow-[0_0_100px_rgba(34,211,238,0.2)]">
              <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 text-center">Finalize Protocol</h3>
              <p className="text-xs text-slate-400 mb-10 text-center">This will consume 1 credit from your balance to unlock the full forensic report for this resume.</p>
              <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/5 flex justify-between items-center mb-10">
                 <div className="text-left">
                   <p className="text-[9px] font-bold text-slate-600 uppercase">Balance</p>
                   <p className="text-2xl font-black text-white">{state.user?.tokenBalance}</p>
                 </div>
                 <ArrowRight className="text-slate-700" />
                 <div className="text-right text-red-500">
                   <p className="text-[9px] font-bold uppercase">New Balance</p>
                   <p className="text-2xl font-black">{Math.max(0, (state.user?.tokenBalance || 0) - 1)}</p>
                 </div>
              </div>
              <button onClick={confirmUnlock} className="w-full py-6 bg-cyan-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 active:scale-95 transition-all">Confirm & Unlock</button>
           </GlassCard>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-[120px]" onClick={() => setShowPayModal(false)} />
          <GlassCard className="max-w-md w-full relative z-[700] !p-12 text-center border-cyan-500/30">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-12 text-center">Replenish <span className="text-cyan-400">Credits</span></h3>
            <div className="space-y-4 mb-12">
               {state.plans.map(p => (
                 <button key={p.id} onClick={() => {
                   if (!state.user) { setState(prev => ({...prev, currentPage: 'login'})); return; }
                   setState(prev => ({ ...prev, user: { ...prev.user!, tokenBalance: prev.user!.tokenBalance + p.tokens } }));
                   setShowPayModal(false);
                 }} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all shadow-inner text-left">
                   <div>
                     <p className="text-sm font-bold text-white uppercase italic">{p.name}</p>
                     <p className="text-[9px] text-slate-500 uppercase mt-1">{p.tokens} Scans</p>
                   </div>
                   <span className="text-2xl font-black text-white">₹{p.priceINR}</span>
                 </button>
               ))}
            </div>
          </GlassCard>
        </div>
      )}

      {showDeckModal && fullPrepDeck && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setShowDeckModal(false)} />
          <GlassCard className="max-w-4xl w-full h-[80vh] flex flex-col relative z-[1001] !p-0 border-indigo-500/30 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-indigo-950/20">
              <div className="flex items-center gap-4">
                <Trophy className="w-6 h-6 text-indigo-400" />
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">Elite Interview Deck</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Master Logic & Trap Handling</p>
                </div>
              </div>
              <button onClick={() => setShowDeckModal(false)} className="p-2 hover:text-indigo-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar text-left">
              {fullPrepDeck.map((q, i) => (
                <div key={i} className="space-y-4 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <span className="text-2xl font-black text-indigo-500/30">0{i+1}</span>
                      <h4 className="text-sm font-bold text-white italic">"{q.question}"</h4>
                    </div>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                      q.type === 'Trap' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>{q.type}</span>
                  </div>
                  <div className="ml-12 p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">STAR Answer Protocol</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{q.starAnswer}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Recruiter's Hidden Intent</p>
                      <p className="text-[10px] text-slate-500 italic leading-relaxed">{q.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {state.isAnalyzing && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-[160px] flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
          <AdvancedVisualizer />
          <div className="flex flex-col items-center gap-8 text-center">
            <p className="text-3xl font-black text-white uppercase tracking-[0.4em] italic shimmer-text">Forensic Audit Active</p>
            <div className="h-20 flex items-center justify-center w-full max-w-lg bg-slate-900/60 border border-white/20 rounded-[2rem] px-12 shadow-2xl backdrop-blur-3xl">
               <span key={state.analysisPhase} className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] animate-in scale-in duration-300 italic">
                 {state.analysisPhase || 'Scanning Experience Nodes...'}
               </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- FOOTER COMPONENT ---

const Footer = ({ onAdminClick }: { onAdminClick: () => void }) => {
  return (
    <footer className="w-full py-12 px-6 border-t border-white/5 bg-slate-950/40 backdrop-blur-md relative z-[200]">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Scan className="w-4 h-4 text-cyan-400" />
            <span className="font-black text-sm uppercase tracking-tighter text-white">RESUME <span className="text-cyan-400">CORE</span></span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
            Elite AI forensic auditing for modern career tracks. Fixed points. Guaranteed calls.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="space-y-2 text-center md:text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Foundation Protocol Founder</p>
            <p className="text-sm font-black text-white uppercase tracking-tighter">Lovish Singhal</p>
            <p className="text-[8px] text-cyan-500/60 font-bold uppercase tracking-widest">Resume Analyzer Founder</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com/in/calovishsinghal/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all hover:scale-110 active:scale-95">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="mailto:Lovishsinghal2003@gmail.com" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all hover:scale-110 active:scale-95">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/lovishsinghal0/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all hover:scale-110 active:scale-95">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em]">© 2025 Resume Core AI Systems. All Rights Reserved.</p>
        <button 
          onClick={onAdminClick}
          className="flex items-center gap-2 text-[8px] font-bold text-slate-800 uppercase tracking-[0.3em] hover:text-red-500/80 transition-colors group"
        >
          <Terminal className="w-3 h-3 group-hover:animate-pulse opacity-0 group-hover:opacity-100" /> System Terminal
        </button>
      </div>
    </footer>
  );
};

// --- ENHANCED ADMIN DASHBOARD COMPONENT ---

const AdminDashboard = ({ users, analysisHistory, plans, onBack, onUpdatePlans }: any) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'plans'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  const totalRevenue = useMemo(() => {
    return analysisHistory.length * 499;
  }, [analysisHistory]);

  const filteredUsers = useMemo(() => {
    return users.filter((u: User) => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportUsers = () => {
    const data = users.map((u: User) => ({
      ID: u.id, Name: u.name, Email: u.email, Role: u.role, Credits: u.tokenBalance, Level: u.level, XP: u.xp, Created: new Date(u.createdAt).toLocaleDateString()
    }));
    downloadCSV(data, 'User_Database_Export');
  };

  const exportHistory = () => {
    const data = analysisHistory.map((h: AnalysisResult) => ({
      ID: h.id, User_ID: h.userId, Score: h.overallScore, ATS_Readability: h.atsReadability, Timestamp: new Date(h.timestamp).toLocaleString()
    }));
    downloadCSV(data, 'Analysis_History_Export');
  };

  const handleSavePlan = (plan: Plan) => {
    let newPlans;
    if (plans.find((p: Plan) => p.id === plan.id)) {
      newPlans = plans.map((p: Plan) => p.id === plan.id ? plan : p);
    } else {
      newPlans = [...plans, plan];
    }
    onUpdatePlans(newPlans);
    setEditingPlan(null);
    setIsAddingPlan(false);
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm("Terminate plan protocol?")) {
      onUpdatePlans(plans.filter((p: Plan) => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <ModuleHeader title="Sovereign Control Hub" icon={ShieldAlert} subtitle="Administrative Forensic Access" color="border-red-600" />
           <div className="flex flex-wrap gap-1 mt-4">
              {['overview', 'users', 'revenue', 'plans'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-slate-500 hover:text-white'}`}>{tab}</button>
              ))}
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={exportUsers} className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-3 hover:bg-white/10 transition-all"><DownloadCloud className="w-4 h-4" /> Export Users</button>
          <button onClick={onBack} className="px-5 py-3 bg-red-600/10 border border-red-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all">Exit Hub</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="!p-8 border-red-500/10 group">
              <div className="flex justify-between items-start mb-4">
                <Users className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg"><ArrowUpRight className="w-3 h-3" /> +12%</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Operators</p>
              <p className="text-4xl font-black text-white">{users.length}</p>
            </GlassCard>
            <GlassCard className="!p-8 border-cyan-500/10 group">
              <div className="flex justify-between items-start mb-4">
                <Activity className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg"><ArrowUpRight className="w-3 h-3" /> +24%</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Platform Scans</p>
              <p className="text-4xl font-black text-white">{analysisHistory.length}</p>
            </GlassCard>
            <GlassCard className="!p-8 border-emerald-500/10 group">
              <div className="flex justify-between items-start mb-4">
                <DollarSign className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-lg"><ArrowDownRight className="w-3 h-3" /> -3%</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Revenue</p>
              <p className="text-4xl font-black text-emerald-500">{formatINR(totalRevenue)}</p>
            </GlassCard>
            <GlassCard className="!p-8 border-indigo-500/10 group">
              <div className="flex justify-between items-start mb-4"><PieChart className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" /></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Conv. Rate</p>
              <p className="text-4xl font-black text-white">4.2%</p>
            </GlassCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <GlassCard className="lg:col-span-8 !p-8">
               <div className="flex justify-between items-center mb-10"><h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3"><LineChart className="w-4 h-4 text-cyan-500" /> Frequency (24h)</h3></div>
               <div className="h-48 flex items-end justify-between gap-4">{[45, 67, 43, 89, 32, 56, 78, 90, 100, 45, 67, 88].map((h, i) => (<div key={i} className="flex-1 bg-gradient-to-t from-red-600/40 to-red-600 rounded-t-lg transition-all" style={{ height: `${h}%` }} />))}</div>
            </GlassCard>
            <GlassCard className="lg:col-span-4 !p-8">
               <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><Server className="w-4 h-4 text-slate-500" /> Infra Health</h3>
               <div className="space-y-6">
                  {[{label:'Gemini Engine', val:'98%'}, {label:'DB Node 1', val:'92%'}, {label:'Gateway', val:'45%'}].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                       <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>{item.label}</span><span className={idx === 2 ? 'text-yellow-500' : 'text-emerald-500'}>{idx === 2 ? 'Latency' : 'Nominal'}</span></div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${idx === 2 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: item.val }} /></div>
                    </div>
                  ))}
               </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search operators..." className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs text-white placeholder-slate-600 outline-none focus:border-red-500/40" />
              </div>
           </div>
           <GlassCard className="!p-0 border-white/5">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b border-white/5 bg-white/[0.02]">
                       <tr>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase">Operator</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase">Contact</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase">Rank</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase">Credits</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {filteredUsers.map((u: User) => (
                         <tr key={u.id} className="hover:bg-white/[0.02] group transition-colors">
                            <td className="px-6 py-5 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-400" /></div><div><p className="text-xs font-black text-white uppercase">{u.name}</p><p className="text-[9px] font-mono text-slate-600">ID: {u.id}</p></div></td>
                            <td className="px-6 py-5"><p className="text-xs text-slate-400">{u.email}</p></td>
                            <td className="px-6 py-5"><span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black uppercase">LVL {u.level}</span></td>
                            <td className="px-6 py-5"><div className="flex items-center gap-2"><Zap className="w-3 h-3 text-cyan-400" /><span className="text-xs font-black text-white">{u.tokenBalance}</span></div></td>
                            <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity"><div className="flex justify-end gap-2"><button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-500 hover:text-cyan-400"><Edit2 className="w-3.5 h-3.5" /></button><button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </GlassCard>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-cyan-500" /> Protocol Tiers</h3>
              <button onClick={() => { setIsAddingPlan(true); setEditingPlan({ id: `p-${Date.now()}`, name: '', priceINR: 0, tokens: 0, description: '' }); }} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-red-500">
                <Plus className="w-4 h-4" /> New Protocol
              </button>
           </div>
           {(editingPlan || isAddingPlan) && (
              <GlassCard className="!p-8 border-red-500/20 bg-red-500/5 max-w-2xl">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Plan Editor</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Identity</label><input type="text" value={editingPlan?.name} onChange={(e) => setEditingPlan({...editingPlan!, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-white" /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Price (INR)</label><input type="number" value={editingPlan?.priceINR} onChange={(e) => setEditingPlan({...editingPlan!, priceINR: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-white" /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Tokens</label><input type="number" value={editingPlan?.tokens} onChange={(e) => setEditingPlan({...editingPlan!, tokens: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-white" /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Description</label><input type="text" value={editingPlan?.description} onChange={(e) => setEditingPlan({...editingPlan!, description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-white" /></div>
                 </div>
                 <div className="flex gap-3"><button onClick={() => handleSavePlan(editingPlan!)} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"><Save className="w-4 h-4" /> Save</button><button onClick={() => { setEditingPlan(null); setIsAddingPlan(false); }} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button></div>
              </GlassCard>
           )}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: Plan) => (
                <GlassCard key={plan.id} className="!p-8 border-white/5 text-left">
                   <div className="flex justify-between items-start mb-6"><div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400"><Zap className="w-6 h-6" /></div><div className="flex gap-2"><button onClick={() => setEditingPlan(plan)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></div></div>
                   <h4 className="text-xl font-black text-white uppercase mb-1">{plan.name}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-6">{plan.tokens} Scans</p>
                   <div className="flex items-baseline gap-2 mb-6"><span className="text-3xl font-black text-white">₹{plan.priceINR}</span></div>
                   <p className="text-xs text-slate-400 italic mb-8 border-l-2 border-white/5 pl-4">{plan.description}</p>
                </GlassCard>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    onLogin({ id: Math.random().toString(36).substr(2, 9), name, email, picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, role: 'user', isBlocked: false, suspiciousActivity: false, createdAt: Date.now(), tokenBalance: 5, xp: 0, level: 1, badges: [], completedTasks: [] });
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-panel rounded-[2rem] border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="text-center mb-8"><div className="w-16 h-16 bg-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><UserIcon className="w-8 h-8 text-cyan-400" /></div><h2 className="text-2xl font-black text-white uppercase">Login</h2><p className="text-[10px] text-slate-500 font-bold uppercase">Forensic career intelligence</p></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white" /></div>
        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white" /></div>
        <button type="submit" className="w-full py-4 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">Establish Session</button>
      </form>
    </div>
  );
};

const AdminLoginPage = ({ onAdminAuth }: { onAdminAuth: (success: boolean) => void }) => {
  const [passkey, setPasskey] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdminAuth(passkey === 'admin123'); };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-panel rounded-[2rem] border border-red-500/20 animate-in fade-in text-left">
      <div className="text-center mb-8"><div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldAlert className="w-8 h-8 text-red-500" /></div><h2 className="text-2xl font-black text-white uppercase">Sovereign Login</h2><p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Authorized Only</p></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Passkey</label><input type="password" required value={passkey} onChange={e => setPasskey(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white" /></div>
        <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase">Verify Authority</button>
      </form>
    </div>
  );
};
