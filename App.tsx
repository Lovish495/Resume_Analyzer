import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { 
  FileUp, 
  FileText,
  AlertCircle, 
  ShieldAlert, 
  Target, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle,
  Info,
  Zap,
  Terminal,
  X,
  Sparkles,
  Scan,
  Binary,
  Fingerprint,
  ThumbsUp,
  ThumbsDown,
  AlertOctagon,
  FileDown,
  Loader2,
  TrendingUp,
  ClipboardCheck,
  PlusCircle,
  Linkedin,
  Mail,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Industry, AppState, AnalysisResult, Region } from './types';
import { analyzeResume } from './services/geminiService';

// @ts-ignore
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'https://esm.sh/docx';
// @ts-ignore
import { jsPDF } from 'https://esm.sh/jspdf';
// @ts-ignore
import html2canvas from 'https://esm.sh/html2canvas';

const GlassCard = ({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number, key?: any }) => (
  <div 
    className={`glass-panel rounded-2xl md:rounded-3xl p-6 md:p-8 overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
    {children}
  </div>
);

const FuturisticHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-6 border-l-4 border-cyan-500 pl-6 relative">
    <div className="absolute -left-[5px] top-0 h-3 w-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#22d3ee] animate-pulse" />
    <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.1em] text-white flex items-center gap-3">
      {title}
    </h2>
    <p className="text-[10px] text-cyan-500/80 font-mono font-bold uppercase tracking-[0.3em] mt-1.5">{subtitle}</p>
  </div>
);

const ScoreRing = ({ score, label, color = "stroke-blue-500", size = "w-20 h-20 md:w-24 md:h-24" }: { score: number, label: string, color?: string, size?: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center group shrink-0 transition-transform duration-500 hover:scale-110">
      <div className={`relative ${size}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} className="stroke-white/5 fill-none" strokeWidth="4" />
          <circle 
            cx="48" cy="48" r={radius} 
            className={`fill-none transition-all duration-1000 ease-out ${color} group-hover:brightness-125`} 
            strokeWidth="6" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{score.toFixed(0)}</span>
        </div>
      </div>
      <span className="mt-3 text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.25em] text-center group-hover:text-cyan-400 transition-colors">{label}</span>
    </div>
  );
};

const ATSMeter = ({ score }: { score: number }) => (
  <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-3xl glow-border-cyan border-cyan-500/20 bg-cyan-950/10 w-full sm:w-auto min-w-[220px] group transition-all duration-500 hover:bg-cyan-900/10">
    <div className="flex items-center gap-3 mb-4">
      <Binary className="w-5 h-5 text-cyan-400 animate-pulse" />
      <span className="text-[10px] md:text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em]">ATS Reliability</span>
    </div>
    <div className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] group-hover:scale-110 transition-transform duration-500">
      {score.toFixed(0)}<span className="text-xl text-cyan-500/50">/100</span>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full mt-5 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-[2500ms] ease-out" 
        style={{ width: `${score}%` }} 
      />
    </div>
    <p className="text-[8px] text-gray-500 mt-4 uppercase font-bold tracking-[0.2em] text-center opacity-60 group-hover:opacity-100 transition-opacity">Neural Scan Simulation Complete</p>
  </div>
);

const BulletCritiqueRow = ({ item, index }: { item: any, index: number, key?: any }) => {
  const [showRewrites, setShowRewrites] = useState(false);
  
  return (
    <div className="border-b border-white/5 py-8 md:py-10 last:border-0 group relative animate-in fade-in slide-in-from-left-8 duration-700 fill-mode-both" style={{ animationDelay: `${index * 150}ms` }}>
      <div className="flex items-start gap-5 md:gap-10">
        <div className={`mt-2 h-4 w-4 rounded-sm rotate-45 shrink-0 border-2 transition-all duration-500 group-hover:rotate-[225deg] ${
          item.risk === 'Safe' ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : item.risk === 'Needs Evidence' ? 'border-yellow-500 bg-yellow-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
        }`} />
        <div className="flex-1">
          <p className="text-base md:text-lg text-gray-100 font-medium leading-relaxed italic mb-6 group-hover:text-white transition-colors">"{item.original}"</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="bg-white/5 p-5 md:p-6 rounded-3xl border border-white/5 relative overflow-hidden group/audit hover:border-cyan-500/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-3 text-cyan-400">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Critical Logic Audit</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic group-hover/audit:text-slate-300 transition-colors">{item.critique}</p>
            </div>
            <div className="space-y-4">
              <div className="bg-red-950/10 border border-red-500/10 px-5 py-3 rounded-2xl flex items-center justify-between hover:bg-red-900/10 transition-colors">
                <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Weakness</span>
                <span className="text-[11px] text-gray-300 font-bold truncate ml-3">{item.weakness}</span>
              </div>
              <div className="bg-indigo-950/10 border border-indigo-500/10 px-5 py-3 rounded-2xl flex items-center justify-between hover:bg-indigo-900/10 transition-colors">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Signal Gap</span>
                <span className="text-[11px] text-gray-300 font-bold truncate ml-3">{item.soWhatGap}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowRewrites(!showRewrites)}
            className={`flex items-center gap-4 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all relative overflow-hidden group/rev ${
              showRewrites ? 'bg-cyan-500 text-black shadow-2xl shadow-cyan-500/40' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className={`w-4 h-4 transition-transform duration-500 group-hover/rev:scale-125 ${showRewrites ? 'fill-black animate-pulse' : ''}`} />
            {showRewrites ? 'Hide Rewrites' : 'VIEW REWRITES'}
          </button>

          {showRewrites && (
            <div className="mt-6 space-y-5 animate-in slide-in-from-top-6 duration-700 stagger-children">
               {item.rewrites?.map((rw: string, i: number) => (
                <div key={i} className="bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-[2rem] relative group/rw hover:bg-cyan-500/10 transition-all duration-500">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> REWRITE OPTION 0{i+1}
                     </span>
                     <span className="text-[9px] px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full font-black italic tracking-tighter">ELITE KPI</span>
                   </div>
                   <p className="text-sm md:text-base text-gray-100 leading-relaxed italic font-medium">"{rw}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecruiterTipCard = ({ tip, index }: { tip: any, index: number, key?: any }) => {
  const getColors = () => {
    switch (tip.type) {
      case 'strength': return { border: 'border-emerald-500/10', bg: 'bg-emerald-500/5', text: 'text-emerald-400', icon: CheckCircle2 };
      case 'issue': return { border: 'border-yellow-500/10', bg: 'bg-yellow-500/5', text: 'text-yellow-400', icon: AlertCircle };
      case 'risk': return { border: 'border-red-500/10', bg: 'bg-red-500/5', text: 'text-red-400', icon: ShieldAlert };
      default: return { border: 'border-white/5', bg: 'bg-white/5', text: 'text-white', icon: Info };
    }
  };

  const getImpactColors = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const colors = getColors();
  const Icon = colors.icon;

  return (
    <div 
      className={`p-6 rounded-3xl border-2 ${colors.border} ${colors.bg} space-y-4 mb-5 last:mb-0 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl relative group animate-in slide-in-from-right-8 fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-3 ${colors.text}`}>
          <Icon className="w-5 h-5 group-hover:scale-125 transition-transform duration-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">{tip.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getImpactColors(tip.impact)}`}>
            {tip.impact}
          </span>
        </div>
      </div>
      <p className="text-[12px] md:text-sm text-gray-200 font-medium italic leading-relaxed group-hover:text-white transition-colors">"{tip.content}"</p>
    </div>
  );
};

const VerdictBadge = ({ status }: { status: AnalysisResult['verdict']['status'] }) => {
  const configMap: Record<string, any> = {
    Shortlist: { 
      icon: ThumbsUp, 
      color: 'bg-emerald-500 text-black', 
      border: 'border-emerald-500', 
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]',
      label: 'RECOMMENDED'
    },
    Borderline: { 
      icon: AlertOctagon, 
      color: 'bg-yellow-500 text-black', 
      border: 'border-yellow-500', 
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]',
      label: 'BORDERLINE'
    },
    Reject: { 
      icon: ThumbsDown, 
      color: 'bg-red-500 text-white', 
      border: 'border-red-500', 
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
      label: 'NOT RECOMMENDED'
    }
  };

  const currentStatus = status || 'Borderline';
  const config = configMap[currentStatus] || configMap.Borderline;
  const Icon = config.icon || Info;

  return (
    <div className={`flex items-center gap-4 px-8 py-4 rounded-3xl ${config.color} ${config.border} border-2 ${config.glow} font-black tracking-tighter animate-in zoom-in duration-700 hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7 shrink-0 animate-bounce" />
      <span className="text-2xl md:text-3xl uppercase tracking-tighter">{config.label}</span>
    </div>
  );
};

const AdvancedHeatmapOverlay = ({ result }: { result: AnalysisResult }) => {
  const [showPath, setShowPath] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowPath(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const gazePoints = useMemo(() => {
    const points: { x: number, y: number, score: number, id: string }[] = [];
    const sections = result.eyeTrackingHeatmap || [];
    
    sections.forEach((s, idx) => {
      const count = Math.ceil(s.attentionScore / 2) + 2;
      for (let i = 0; i < count; i++) {
        points.push({
          x: 10 + Math.random() * 80,
          y: (idx * 25) + 5 + Math.random() * 15,
          score: s.attentionScore,
          id: `${idx}-${i}`
        });
      }
    });
    return points;
  }, [result]);

  const generateGazePath = () => {
    if (gazePoints.length < 2) return "";
    return gazePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(" ");
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-md opacity-70 mix-blend-screen">
      <div className="heatmap-scanner" />
      
      {gazePoints.map((p) => {
        const color = p.score > 7 ? 'rgba(239, 68, 68, 0.4)' : p.score > 4 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 211, 238, 0.2)';
        const size = 30 + (p.score * 8);
        return (
          <div 
            key={p.id}
            className="absolute fixation-node rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${size}px`,
              height: `${size}px`,
              marginLeft: `-${size/2}px`,
              marginTop: `-${size/2}px`,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              boxShadow: `0 0 ${size/2}px ${color}`
            }}
          />
        );
      })}

      {showPath && (
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <path 
            d={generateGazePath()} 
            fill="none" 
            stroke="rgba(34, 211, 238, 0.4)" 
            strokeWidth="1" 
            className="gaze-line"
          />
        </svg>
      )}
    </div>
  );
};

const ForensicDocumentView = ({ result, isReport = false }: { result: AnalysisResult, isReport?: boolean }) => {
  const heatmapMap = useMemo(() => {
    return result.eyeTrackingHeatmap?.reduce((acc, curr) => {
      acc[curr.section.toLowerCase()] = curr.attentionScore;
      return acc;
    }, {} as Record<string, number>) || {};
  }, [result]);

  const getHeatIntensity = (section: string) => {
    const score = heatmapMap[section.toLowerCase()] || 0;
    if (score >= 8) return 'rgba(239, 68, 68, 0.15)';
    if (score >= 5) return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(34, 211, 238, 0.05)';
  };

  return (
    <div className={`relative mx-auto w-full max-w-4xl bg-white text-black p-10 md:p-14 min-h-[700px] md:min-h-[1200px] ${!isReport ? 'shadow-[0_0_120px_rgba(0,0,0,0.9)]' : ''} border border-gray-100 rounded-[4px] font-serif group overflow-hidden animate-in fade-in zoom-in duration-1000`}>
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {!isReport && <AdvancedHeatmapOverlay result={result} />}

      <header className="text-center mb-12 md:mb-16 border-b-[2px] border-black pb-8 relative z-20">
        <h1 className="text-3xl md:text-5xl font-bold uppercase mb-2 tracking-normal px-4">{result.extractedData.name}</h1>
        <div className="text-[10px] md:text-[11px] text-gray-500 flex justify-center gap-4 font-sans font-bold uppercase tracking-[0.1em] flex-wrap px-6">
           {result.extractedData.contact}
        </div>
      </header>
      
      <div className="space-y-10 md:space-y-14 relative z-20">
        {['Education', 'Experience', 'Skills', 'Projects'].map(section => (
          <section key={section} className="relative p-8 rounded-3xl transition-all duration-700">
            <div 
              className="absolute inset-0 rounded-3xl z-[-1]" 
              style={{ backgroundColor: getHeatIntensity(section), border: `1px solid ${getHeatIntensity(section).replace('0.15', '0.3').replace('0.1', '0.2').replace('0.05', '0.1')}` }} 
            />
            <div className={`absolute -top-4 right-6 px-3 py-1 rounded-xl ${isReport ? 'bg-black text-white' : 'bg-black text-white'} text-[9px] font-black flex items-center gap-3 shadow-md`}>
              <Scan className="w-3 h-3 text-cyan-400" /> BIOMETRIC FOCUS: {(heatmapMap[section.toLowerCase()] || 0) * 10}%
            </div>
            <h2 className="text-lg md:text-2xl font-bold border-b-[2px] border-black uppercase mb-6 pb-2 tracking-[0.05em]">{section}</h2>
            <div className="space-y-3 md:space-y-4">
               {section === 'Education' && result.extractedData.education?.map((edu, i) => <p key={i} className="text-xs md:text-sm font-semibold">{edu}</p>)}
               {section === 'Experience' && result.extractedData.experience?.map((exp, i) => (
                 <div key={i} className="text-xs md:text-sm">
                    <p className="font-bold mb-2 uppercase tracking-tight">{exp}</p>
                    <div className="w-full h-1.5 bg-black/[0.05] rounded-full mb-2" />
                    <div className="w-4/5 h-1.5 bg-black/[0.05] rounded-full" />
                 </div>
               ))}
               {section === 'Skills' && <div className="flex flex-wrap gap-3">{result.extractedData.skills?.map((skill, i) => <span key={i} className="text-xs md:text-sm font-bold border-b border-black/10">/ {skill}</span>)}</div>}
               {section === 'Projects' && (result.extractedData.projects?.length > 0 ? result.extractedData.projects.map((p, i) => <p key={i} className="text-xs md:text-sm italic">{p}</p>) : <p className="text-[11px] text-gray-400 italic">No specific projects detected.</p>)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

const ProcessLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logEntries = ["ANALYZING DOCUMENT STRUCTURE...", "EXTRACTING EXPERIENCE METRICS...", "SIMULATING RECRUITER SCAN...", "CHECKING ATS COMPLIANCE...", "MAPPING INDUSTRY KEYWORDS...", "AUDITING IMPACT...", "VALIDATING QUALIFICATIONS...", "SYNTHESIZING FEEDBACK...", "OPTIMIZING FLOW..."];
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => { setLogs(prev => [...prev.slice(-3), logEntries[i]]); i = (i + 1) % logEntries.length; }, 800);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-32 overflow-hidden flex flex-col justify-end items-center gap-3 px-6 w-full max-w-sm">
      {logs.map((log, idx) => (
        <p key={idx} className={`text-[10px] md:text-[11px] font-mono uppercase tracking-[0.3em] transition-all duration-700 text-center ${idx === logs.length - 1 ? 'text-cyan-400 font-bold opacity-100 shimmer-text scale-110' : 'text-cyan-900 opacity-20'}`}>{log}</p>
      ))}
    </div>
  );
};

const AboutMeModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <GlassCard className="max-w-2xl w-full relative z-10 !p-12 border-cyan-500/30 overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          {/* Circular Profile Image with Glowing Aura */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-cyan-500/40 relative z-10 shadow-[0_0_50px_rgba(34,211,238,0.25)] bg-slate-900">
              <img 
                src="https://media.licdn.com/dms/image/v2/D4D03AQE_E_X_O_L_V_A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1718224765620?e=1746662400&v=beta&t=k6O_7_4N_T_N_N_N_N_N_N_N_N_N_N_N_N" 
                alt="Lovish Singhal" 
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Lovish+Singhal&background=0891b2&color=fff&size=256";
                }}
              />
            </div>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">
                Lovish Singhal
              </h2>
              <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-3">
                <Sparkles className="w-3 h-3 animate-pulse" /> Creator & Visionary
              </p>
            </div>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed italic font-medium opacity-90 border-l-2 border-cyan-500/30 pl-4">
              "I want every professional to grow and reach their full potential. Career paths can be complex, 
              and my mission is to build intelligent tools that demystify recruitment, provide brutally honest 
              feedback, and level the playing field for global talent."
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <a 
                href="https://www.linkedin.com/in/calovishsinghal/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 px-6 py-3 bg-blue-600/10 border border-blue-600/30 rounded-xl text-[11px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:-translate-y-1"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn Profile
              </a>
              <a 
                href="mailto:Lovishsinghal2003@gmail.com" 
                className="flex items-center gap-3 px-6 py-3 bg-slate-800 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all shadow-lg hover:-translate-y-1"
              >
                <Mail className="w-4 h-4" /> Email Me
              </a>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({ file: null, industry: Industry.AUDIT, region: Region.US, jobDescription: '', isAnalyzing: false, analysisPhase: '', result: null, error: null });
  const [isExporting, setIsExporting] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') { 
      setState(prev => ({ ...prev, error: 'File format not supported. Please use PDF or Text.' })); 
      return; 
    }
    
    setState(prev => ({ ...prev, file, isAnalyzing: true, error: null, analysisPhase: 'Reading document...' }));
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const phases = ["Extracting resume sections...", "Evaluating industry relevance...", "Checking ATS scoring factors...", "Generating insights...", "Finalizing analysis report..."];
        let i = 0;
        const interval = setInterval(() => { 
          if (i < phases.length) { 
            setState(prev => ({ ...prev, analysisPhase: phases[i] })); 
            i++; 
          } 
        }, 1200);

        try {
          const result = await analyzeResume(base64, file.type, state.industry, state.region, state.jobDescription, (p) => {
            setState(prev => ({ ...prev, analysisPhase: p }));
          });
          clearInterval(interval);
          setState(prev => ({ ...prev, result, isAnalyzing: false, analysisPhase: '' }));
        } catch (e: any) { 
          clearInterval(interval); 
          setState(prev => ({ ...prev, isAnalyzing: false, error: e.message || 'Analysis encountered an error. Please try again.' })); 
        }
      };
      reader.onerror = () => {
        setState(prev => ({ ...prev, isAnalyzing: false, error: 'Could not process the uploaded file.' }));
      };
      reader.readAsDataURL(file);
    } catch (err) { 
      setState(prev => ({ ...prev, isAnalyzing: false, error: 'System error. Please refresh.' })); 
    }
  };

  const handleDownloadPDF = async () => {
    if (!state.result || !reportRef.current) return;
    setIsExporting(true);
    
    try {
      const reportElement = reportRef.current;
      reportElement.classList.remove('hidden'); 
      
      const canvas = await html2canvas(reportElement, {
        scale: 3, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight,
      });
      
      reportElement.classList.add('hidden'); 

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const finalImgHeight = imgHeight * ratio;

      let heightLeft = finalImgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - finalImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      pdf.save(`${state.result.extractedData.name.replace(/\s+/g, '_')}_Resume_Analysis.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF generation error. Resorting to print mode.");
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!state.result) return;
    const { idealResumeContent, extractedData } = state.result;
    try {
      const sections = [];
      sections.push(new Paragraph({ text: extractedData.name.toUpperCase(), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
      sections.push(new Paragraph({ text: extractedData.contact, alignment: AlignmentType.CENTER }));
      sections.push(new Paragraph({ text: "", spacing: { after: 300 } }));
      if (idealResumeContent.summary) {
        sections.push(new Paragraph({ text: "PROFESSIONAL SUMMARY", heading: HeadingLevel.HEADING_2 }));
        sections.push(new Paragraph({ text: idealResumeContent.summary, spacing: { after: 300 } }));
      }
      if (idealResumeContent.experience && idealResumeContent.experience.length > 0) {
        sections.push(new Paragraph({ text: "PROFESSIONAL EXPERIENCE", heading: HeadingLevel.HEADING_2 }));
        idealResumeContent.experience.forEach(exp => {
          sections.push(new Paragraph({ 
            children: [
              new TextRun({ text: `${exp.role.toUpperCase()} | ${exp.company.toUpperCase()}`, bold: true }), 
              new TextRun({ text: `\t${exp.period}`, bold: true })
            ],
            spacing: { before: 200 }
          }));
          (exp.bullets || []).forEach(b => {
            sections.push(new Paragraph({ text: b, bullet: { level: 0 } }));
          });
          sections.push(new Paragraph({ text: "" }));
        });
      }
      if (idealResumeContent.education && idealResumeContent.education.length > 0) {
        sections.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }));
        idealResumeContent.education.forEach(edu => {
          sections.push(new Paragraph({ 
            children: [
              new TextRun({ text: `${edu.degree}, ${edu.school}`, bold: true }),
              new TextRun({ text: `\t${edu.year}`, bold: true })
            ],
            spacing: { before: 100 }
          }));
          if (edu.honors) sections.push(new Paragraph({ text: edu.honors, italic: true }));
        });
      }
      if (idealResumeContent.skills && idealResumeContent.skills.length > 0) {
        sections.push(new Paragraph({ text: "SKILLS & EXPERTISE", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }));
        sections.push(new Paragraph({ text: idealResumeContent.skills.join(", ") }));
      }
      const doc = new Document({ sections: [{ children: sections }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${extractedData.name.replace(/\s+/g, '_')}_Optimized_Profile.docx`;
      link.click();
    } catch (err) { console.error(err); }
  };

  const handleReset = () => {
    setState({ file: null, industry: state.industry, region: state.region, jobDescription: '', isAnalyzing: false, analysisPhase: '', result: null, error: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen selection:bg-cyan-500/30 flex flex-col bg-[#020617] transition-all duration-700">
      
      <AboutMeModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {(isExporting || state.isAnalyzing) && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-12 p-10 text-center animate-in fade-in duration-500">
          <div className="relative">
            <Loader2 className="w-24 h-24 text-cyan-400 animate-spin opacity-40" />
            <Zap className="w-10 h-10 text-cyan-400 absolute inset-0 m-auto animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            <div className="absolute -inset-8 bg-cyan-500/10 blur-3xl animate-pulse rounded-full" />
          </div>
          <div className="space-y-6 flex flex-col items-center max-w-lg">
            <h3 className="text-3xl font-serif-premium italic text-white tracking-[0.2em] uppercase shimmer-text">
                {isExporting ? "Compiling Report..." : "Generating Analysis..."}
            </h3>
            <p className="text-[12px] font-black text-cyan-500 uppercase tracking-[0.8em] animate-pulse">
                {state.analysisPhase || "Finalizing..."}
            </p>
            {!isExporting && <ProcessLog />}
          </div>
        </div>
      )}

      <nav className="w-full max-w-[1600px] mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between shrink-0 glass-panel border-b border-white/5 z-[80] sticky top-0 no-print">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={handleReset}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(8,145,178,0.4)] shrink-0 transition-transform group-hover:rotate-[360deg] duration-1000">
            <Scan className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic text-white whitespace-nowrap group-hover:shimmer-text">RESUME <span className="text-cyan-500">ANALYZER</span></span>
        </div>

        {state.result && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-black transition-all hover:scale-105 active:scale-95 group"
          >
            <PlusCircle className="w-5 h-5 text-cyan-400 group-hover:text-black transition-colors" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        )}
      </nav>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-10 md:py-16 relative" ref={dashboardRef}>
        {state.error && (
            <div className="mb-12 p-6 rounded-3xl bg-red-950/20 border border-red-500/30 flex items-center gap-6 text-red-400 animate-in slide-in-from-top-6 duration-700 max-w-3xl mx-auto no-print shadow-2xl shadow-red-500/10">
                <AlertOctagon className="w-8 h-8 shrink-0 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-widest">{state.error}</p>
                <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="ml-auto p-3 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}

        {!state.result ? (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center space-y-12 md:space-y-16 animate-in fade-in duration-1000 mt-8">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[11px] font-black uppercase tracking-[0.4em] animate-float shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <Sparkles className="w-4 h-4 animate-pulse" /> AI-Driven Intelligence
            </div>

            <div className="text-center space-y-8">
                <h1 className="text-7xl md:text-9xl font-serif-premium font-bold tracking-tight text-white leading-tight animate-in slide-in-from-top-8 duration-1000">
                    Resume <span className="text-cyan-400 italic shimmer-text">Analyzer</span>
                </h1>
                <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
                    Built to empower professionals. Demystifying recruitment with intelligent auditing, 
                    impact assessment, and brutally honest recruiter-grade feedback.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
                {[
                    { icon: BrainCircuit, title: "Deep Scan", subtitle: "Forensic Logic" },
                    { icon: Target, title: "ATS Check", subtitle: "Scoring" },
                    { icon: ShieldAlert, title: "Risk Audit", subtitle: "Gap Detection" }
                ].map((feature, i) => (
                    <div key={i} className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4 hover:border-cyan-500/50 transition-all cursor-default group animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${500 + i * 150}ms` }}>
                        <div className="w-14 h-14 bg-cyan-950/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-inner">
                            <feature.icon className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-100 group-hover:text-cyan-400 transition-colors">{feature.title}</p>
                            {feature.subtitle && <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">{feature.subtitle}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full max-w-4xl relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[4rem]" />
                <div 
                    className="relative w-full p-20 bg-slate-950/50 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center transition-all group-hover:border-cyan-500/60 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-1000 delay-700"
                >
                    <div className="w-24 h-24 bg-cyan-950/40 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_80px_rgba(34,211,238,0.3)] transition-all duration-700">
                        <FileUp className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif-premium font-bold text-white mb-3 text-center uppercase tracking-tight">Upload Your Profile</h2>
                    <p className="text-slate-500 text-[13px] font-medium mb-12 uppercase tracking-[0.4em]">Optimal Analysis for PDF documents</p>
                    
                    <button 
                        disabled={state.isAnalyzing}
                        onClick={() => fileInputRef.current?.click()}
                        className="group/btn relative overflow-hidden bg-[#0f172a] border border-white/20 text-white px-12 py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.5em] hover:bg-cyan-600 hover:text-black transition-all flex items-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                        <FileText className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Select Resume</span>
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
            </div>
          </div>
        ) : (
          <div className="w-full space-y-12 md:space-y-20 pb-24">
            <div className="glass-panel p-10 md:p-14 rounded-[3rem] border border-cyan-500/20 grid grid-cols-1 xl:grid-cols-4 gap-12 animate-in fade-in slide-in-from-top-12 duration-1000">
               <div className="xl:col-span-1 flex flex-col items-center xl:border-r border-white/5 pr-4">
                  <ScoreRing score={state.result.resumeIQ} label="RESUME IQ" size="w-28 h-28 md:w-40 md:h-40" color="stroke-cyan-500" />
                  <div className="mt-6 text-center">
                    <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em]">Overall Performance</p>
                    <p className="text-[9px] text-slate-500 italic mt-2">Professional Standards Audit</p>
                  </div>
               </div>
               <div className="xl:col-span-3 space-y-10">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                     <h1 className="text-4xl md:text-6xl font-black tracking-normal text-white truncate max-w-full italic">
                        {state.result.extractedData.name}
                     </h1>
                     <VerdictBadge status={state.result.verdict.status} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <ATSMeter score={state.result.atsReadability} />
                     <GlassCard className="flex flex-col items-center justify-center text-center !p-6" delay={200}>
                        <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Market Fit</p>
                        <p className="text-2xl font-black text-white italic">{state.result.skillsIntelligence.marketRelevance}</p>
                     </GlassCard>
                     <GlassCard className="flex flex-col items-center justify-center text-center !p-6" delay={400}>
                        <Fingerprint className="w-8 h-8 text-cyan-400 mb-3" />
                        <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">Brand Score</p>
                        <p className="text-2xl font-black text-white italic">{state.result.brandingScore.toFixed(1)}/10</p>
                     </GlassCard>
                  </div>
               </div>
            </div>

            <GlassCard className="bg-gradient-to-br from-slate-950 to-indigo-950/30 !p-10 md:!p-16" delay={300}>
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                     <div className="flex items-center gap-5 text-cyan-400">
                        <Terminal className="w-8 h-8" />
                        <p className="text-sm font-black uppercase tracking-[0.5em]">Executive Summary</p>
                     </div>
                     <p className="text-3xl md:text-4xl font-bold leading-tight text-white tracking-tight bg-black/60 p-10 rounded-[2.5rem] border-l-[10px] border-cyan-500">
                        "{state.result.verdict.reason}"
                     </p>
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                     <h4 className="text-xl font-black italic text-red-500 uppercase tracking-[0.2em] flex items-center gap-3">
                       <AlertCircle className="w-6 h-6" /> Rejection Risk
                     </h4>
                     {state.result.rejectionReasons?.map((r, i) => (
                        <div key={i} className="flex items-start gap-5 text-[11px] text-slate-300 bg-red-950/20 p-5 rounded-2xl border border-red-500/20 font-semibold italic">
                           <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                           <span>{r}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
               <div className="lg:col-span-3">
                  <FuturisticHeader title="Biometric Focus" subtitle="Simulated Partner-Level Eye Tracking" />
                  <ForensicDocumentView result={state.result} />
               </div>
               <div className="lg:col-span-2 space-y-8">
                  <FuturisticHeader title="Career Insights" subtitle="Professional Standards Audit" />
                  {state.result.recruiterTips?.map((tip, i) => <RecruiterTipCard key={i} tip={tip} index={i} />)}
               </div>
            </div>

            <GlassCard delay={700}>
               <FuturisticHeader title="Impact Audit" subtitle="Bullet Optimization Logic" />
               <div className="divide-y divide-white/5 space-y-6">
                  {state.result.bulletCritiques?.map((item, i) => <BulletCritiqueRow key={i} item={item} index={i} />)}
               </div>
            </GlassCard>

            <div className="pt-16 no-print">
              <div className="w-full relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-1000 rounded-[4rem]" />
                <GlassCard className="relative border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-12 !p-16 md:!p-20 shadow-[0_0_100px_rgba(34,211,238,0.2)]" delay={1000}>
                  <div className="space-y-6 text-center md:text-left">
                    <h2 className="text-5xl md:text-6xl font-serif-premium font-bold text-white tracking-tight uppercase">Analysis <span className="text-cyan-400 italic">Vault</span></h2>
                    <p className="text-slate-400 text-base md:text-lg max-w-lg font-medium leading-relaxed italic">
                      Download your professional analysis or generate an optimized editable profile.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-8 w-full md:w-auto">
                    <button 
                      onClick={handleDownloadPDF} 
                      className="group/btn relative overflow-hidden bg-slate-900 border border-white/20 px-12 py-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:border-cyan-500/70 hover:scale-110 shadow-2xl min-w-[240px]"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover/btn:bg-cyan-500 group-hover/btn:text-black transition-all duration-500">
                        <FileDown className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">Download PDF</span>
                        <span className="text-[9px] font-black text-slate-500 group-hover/btn:text-cyan-400 mt-2">Full Report</span>
                      </div>
                    </button>

                    <button 
                      onClick={handleDownloadDOCX} 
                      className="group/btn relative overflow-hidden bg-cyan-600 px-12 py-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:bg-cyan-400 hover:scale-110 shadow-[0_30px_60px_rgba(8,145,178,0.5)] min-w-[240px]"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-black/20 flex items-center justify-center text-white transition-all duration-500">
                        <ClipboardCheck className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">Get Word File</span>
                        <span className="text-[9px] font-black text-cyan-200 mt-2">Optimized Version</span>
                      </div>
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>

            <div ref={reportRef} className="hidden bg-white p-12 text-black w-[210mm] font-serif overflow-hidden">
              <div className="border-b-[3px] border-black pb-8 mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Resume Analyzer Report</h1>
                <p className="text-xs uppercase tracking-[0.3em] font-sans text-gray-500">Decision Intelligence Platform Output</p>
              </div>
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                  <h2 className="text-sm font-black uppercase border-b border-black pb-2 font-sans tracking-widest">Candidate Profile</h2>
                  <div>
                    <p className="text-2xl font-bold leading-none">{state.result.extractedData.name}</p>
                    <p className="text-xs text-gray-600 mt-1 font-sans">{state.result.extractedData.contact}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2 className="text-sm font-black uppercase border-b border-black pb-2 font-sans tracking-widest w-full text-right">Resume IQ</h2>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-6xl font-black text-blue-700">{state.result.resumeIQ}</span>
                    <span className="text-xl font-bold text-gray-300">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="mb-12">
                <h2 className="text-sm font-black uppercase border-b border-black pb-2 font-sans tracking-widest mb-6">Recruiter Verdict</h2>
                <div className={`p-6 border-l-[8px] mb-6 ${state.result.verdict.status === 'Shortlist' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                  <p className="text-2xl font-black italic tracking-tight uppercase">{state.result.verdict.status}</p>
                </div>
                <p className="text-lg leading-relaxed italic font-medium px-4 border-l border-gray-100">"{state.result.verdict.reason}"</p>
              </div>
              <div className="mb-12">
                <h2 className="text-sm font-black uppercase border-b border-black pb-2 font-sans tracking-widest mb-8">Attention Heatmap Modeling</h2>
                <ForensicDocumentView result={state.result} isReport={true} />
              </div>
            </div>

            <div className="flex justify-center pt-12 no-print">
               <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 hover:text-cyan-400 transition-all flex items-center gap-4 group"
               >
                 Back to Summit <ChevronRight className="w-4 h-4 transition-transform group-hover:-translate-y-2 rotate-[-90deg]" />
               </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-16 border-t border-white/5 bg-slate-950/40 no-print">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={handleReset}>
              <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform group-hover:rotate-12">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic text-white whitespace-nowrap">RESUME <span className="text-cyan-500">ANALYZER</span></span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs italic">
              Empowering global professionals with industry-grade, brutally honest AI analysis.
            </p>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest pt-4">
              © 2026 RESUME ANALYZER • ALL RIGHTS RESERVED
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300 border-b border-white/5 pb-2">Creator Mission</h4>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
              <p className="text-[12px] text-slate-400 italic font-medium leading-relaxed group-hover:text-white transition-colors">
                "I want every professional to grow and reach their full potential. This platform is my contribution to global professional advancement."
              </p>
              <button 
                onClick={() => setIsAboutOpen(true)}
                className="mt-6 flex items-center gap-3 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
              >
                About Lovish Singhal <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="md:col-span-4 space-y-8 flex flex-col items-center md:items-end">
            <div className="flex items-center gap-6">
              <a href="https://www.linkedin.com/in/calovishsinghal/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 transition-all hover:scale-110 shadow-lg" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:Lovishsinghal2003@gmail.com" className="p-3 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-cyan-600 transition-all hover:scale-110 shadow-lg" title="Email Me">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-col items-center md:items-end">
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] mb-1 text-right">GLOBAL TALENT NETWORK</span>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live Performance Engine</span>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
