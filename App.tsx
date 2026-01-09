
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { 
  FileUp, 
  FileText,
  AlertCircle, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  Info,
  Zap,
  X,
  Sparkles,
  Scan,
  Binary,
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
  ChevronRight,
  Lock,
  CreditCard,
  Eye
} from 'lucide-react';
import { Industry, AppState, AnalysisResult, Region } from './types';
import { 
  analyzeResume
} from './services/geminiService';

// @ts-ignore
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle } from 'https://esm.sh/docx';
// @ts-ignore
import { jsPDF } from 'https://esm.sh/jspdf';
// @ts-ignore
import html2canvas from 'https://esm.sh/html2canvas';

const GlassCard = ({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number }) => (
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

const LockedSectionWrapper = ({ isUnlocked, children, onLockClick, lockLabel = "Premium Feature" }: { isUnlocked: boolean, children?: React.ReactNode, onLockClick?: () => void, lockLabel?: string }) => {
  if (isUnlocked) return <div className="animate-in fade-in duration-700">{children}</div>;
  
  return (
    <div 
      className="relative group/locked cursor-pointer overflow-hidden rounded-2xl" 
      onClick={onLockClick}
    >
      <div className="blur-md grayscale select-none pointer-events-none opacity-30 transition-all duration-700 group-hover/locked:opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 group-hover/locked:scale-105 transition-transform duration-500">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 mb-4 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.15)]">
          <Lock className="w-6 h-6 text-cyan-400" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 drop-shadow-md">
          {lockLabel} Locked
        </span>
        <span className="mt-2 text-[8px] font-bold text-white/40 uppercase tracking-widest opacity-0 group-hover/locked:opacity-100 transition-opacity">Click to Unlock</span>
      </div>
    </div>
  );
};

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

const BulletCritiqueRow = ({ item, index, isUnlocked, onLockClick }: { item: any, index: number, isUnlocked: boolean, onLockClick: () => void }) => {
  const [showRewrites, setShowRewrites] = useState(false);
  
  return (
    <div className="border-b border-white/5 py-8 md:py-10 last:border-0 group relative animate-in fade-in slide-in-from-left-8 duration-700 fill-mode-both" style={{ animationDelay: `${index * 150}ms` }}>
      <div className="flex items-start gap-5 md:gap-10">
        <div className={`mt-2 h-4 w-4 rounded-sm rotate-45 shrink-0 border-2 transition-all duration-500 group-hover:rotate-[225deg] ${
          item.risk === 'Safe' ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : item.risk === 'Needs Evidence' ? 'border-yellow-500 bg-yellow-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
        }`} />
        <div className="flex-1">
          <p className="text-base md:text-lg text-gray-100 font-medium leading-relaxed italic mb-6 group-hover:text-white transition-colors">"{item.original}"</p>
          
          <LockedSectionWrapper isUnlocked={isUnlocked} lockLabel="Impact Audit" onLockClick={onLockClick}>
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
              onClick={(e) => { e.stopPropagation(); setShowRewrites(!showRewrites); }}
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
          </LockedSectionWrapper>
        </div>
      </div>
    </div>
  );
};

const RecruiterTipCard = ({ tip, index }: { tip: any, index: number }) => {
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
    
    sections.slice(0, 4).forEach((s, idx) => {
      const count = Math.min(Math.ceil(s.attentionScore / 3) + 1, 3);
      for (let i = 0; i < count; i++) {
        points.push({
          x: 20 + Math.random() * 60,
          y: (idx * 25) + 10 + Math.random() * 10,
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
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-md opacity-60 mix-blend-screen transition-opacity duration-1000">
      <div className="heatmap-scanner" />
      
      {gazePoints.map((p) => {
        const color = p.score > 7 ? 'rgba(239, 68, 68, 0.3)' : p.score > 4 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 211, 238, 0.15)';
        const size = 20 + (p.score * 6);
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
              background: `radial-gradient(circle, ${color} 0%, transparent 80%)`,
              boxShadow: `0 0 ${size/3}px ${color}`
            }}
          />
        );
      })}

      {showPath && (
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path 
            d={generateGazePath()} 
            fill="none" 
            stroke="rgba(34, 211, 238, 0.3)" 
            strokeWidth="1" 
            className="gaze-line"
          />
        </svg>
      )}
    </div>
  );
};

const ForensicDocumentView = ({ result, isUnlocked, onLockClick }: { result: AnalysisResult, isUnlocked: boolean, onLockClick: () => void }) => {
  const heatmapMap = useMemo(() => {
    return result.eyeTrackingHeatmap?.reduce((acc, curr) => {
      acc[curr.section.toLowerCase()] = curr.attentionScore;
      return acc;
    }, {} as Record<string, number>) || {};
  }, [result]);

  const getHeatIntensity = (section: string) => {
    const score = heatmapMap[section.toLowerCase()] || 0;
    if (score >= 8) return 'rgba(239, 68, 68, 0.12)';
    if (score >= 5) return 'rgba(245, 158, 11, 0.08)';
    return 'rgba(34, 211, 238, 0.04)';
  };

  return (
    <div className={`relative mx-auto w-full max-w-4xl bg-white text-black p-10 md:p-14 min-h-[700px] md:min-h-[1200px] shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-gray-100 rounded-[4px] font-serif group overflow-hidden animate-in fade-in zoom-in duration-1000`}>
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {isUnlocked && <AdvancedHeatmapOverlay result={result} />}

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
            
            {isUnlocked && (
              <div className={`absolute -top-4 right-6 px-3 py-1 rounded-xl bg-black text-white text-[9px] font-black flex items-center gap-3 shadow-md`}>
                <Scan className="w-3 h-3 text-cyan-400" /> BIOMETRIC FOCUS: {(heatmapMap[section.toLowerCase()] || 0) * 10}%
              </div>
            )}
            
            <h2 className="text-lg md:text-2xl font-bold border-b-[2px] border-black uppercase mb-6 pb-2 tracking-[0.05em]">{section}</h2>
            
            <LockedSectionWrapper isUnlocked={isUnlocked} lockLabel="Forensic Document Data" onLockClick={onLockClick}>
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
            </LockedSectionWrapper>
          </section>
        ))}
      </div>
    </div>
  );
};

/* Component to display processing status logs */
const ProcessLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logEntries = ["ANALYZING DOCUMENT STRUCTURE...", "EXTRACTING EXPERIENCE METRICS...", "SIMULATING RECRUITER SCAN...", "CHECKING ATS COMPLIANCE...", "MAPPING INDUSTRY KEYWORDS...", "AUDITING IMPACT...", "VALIDATING QUALIFICATIONS...", "SYNTHESIZING FEEDBACK...", "OPTIMIZING FLOW..."];
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => { setLogs(prev => [...prev.slice(-3), logEntries[i]]); i = (i + 1) % logEntries.length; }, 800);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-32 overflow-hidden flex flex-col justify-end items-center gap-3 px-6 w-full max-sm:max-w-xs">
      {logs.map((log, idx) => (
        <p key={idx} className={`text-[10px] md:text-[11px] font-mono uppercase tracking-[0.3em] transition-all duration-700 text-center ${idx === logs.length - 1 ? 'text-cyan-400 font-bold opacity-100 shimmer-text scale-110' : 'text-cyan-900 opacity-20'}`}>{log}</p>
      ))}
    </div>
  );
};

const AboutMeModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <GlassCard className="max-w-2xl w-full relative z-10 !p-12 border-cyan-500/30 overflow-hidden animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
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

const PremiumLockOverlay = ({ onUnlock, onBack }: { onUnlock: () => void, onBack: () => void }) => {
  const missingFeatures = [
    { 
      icon: Eye, 
      title: "Recruiter Heatmap", 
      desc: "Stop the guessing. See exactly where MDs drop off. Uncover 'Dead Zones' in your profile.",
      color: "text-red-400"
    },
    { 
      icon: Scan, 
      title: "ATS-Ready Word Doc", 
      desc: "Instant download. A perfectly formatted .docx file engineered to bypass modern filters.",
      color: "text-cyan-400"
    },
    { 
      icon: Zap, 
      title: "Bullet Refiner AI", 
      desc: "Line-by-line corporate logic critiques. Transform weak bullets into Elite KPI-driven wins.",
      color: "text-indigo-400"
    },
    { 
      icon: Target, 
      title: "Partner-Level Audit", 
      desc: "Brutally honest forensic analysis. Discover why you're really getting ghosted.",
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
      <div className="absolute inset-0 bg-[#020617] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.4)_0%,#020617_100%)]" />
      </div>

      <div className="relative w-full max-w-6xl h-full max-h-[90vh] glass-panel !bg-slate-950/40 rounded-[3rem] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in duration-500">
        <div className="overflow-y-auto flex-1 p-8 md:p-16 flex flex-col items-center">
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12">
              <Sparkles className="w-4 h-4 animate-pulse" /> Premium Unlock Required
          </div>
          
          <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight text-center mb-6 drop-shadow-2xl italic">
            Unlock Your <span className="text-cyan-400">Full Forensic Report</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-16">
            {missingFeatures.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-3xl flex flex-col items-center md:items-start text-center md:text-left group hover:bg-white/[0.07] transition-all duration-500 animate-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center ${f.color} mb-6 group-hover:scale-110 transition-all shadow-inner border border-white/5`}>
                  <f.icon className="w-7 h-7 animate-pulse" />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-3 italic">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="w-full max-w-xl bg-cyan-500/5 border border-cyan-500/20 p-10 rounded-[2.5rem] flex flex-col items-center gap-8 shadow-[0_0_80px_rgba(34,211,238,0.1)] mb-10">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-3">Instant Lifetime Access (Per Scan)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">$9.99</span>
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest line-through">$24.99</span>
              </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onUnlock(); }}
              className="w-full relative overflow-hidden bg-cyan-500 text-black px-12 py-6 rounded-2xl flex items-center justify-center gap-4 transition-all hover:bg-cyan-400 hover:scale-[1.02] shadow-[0_20px_60px_rgba(8,145,178,0.4)] active:scale-95 group/pay cursor-pointer z-[170]"
            >
              <CreditCard className="w-6 h-6 animate-pulse" />
              <div className="flex flex-col items-start text-left">
                <span className="text-[18px] font-black uppercase tracking-widest">Pay & Unlock Full Analysis</span>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Secure Stripe Payment</span>
              </div>
            </button>
            
            <button onClick={onBack} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer flex items-center gap-2 group">
              <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" /> Return to Summary View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({ file: null, industry: Industry.AUDIT, region: Region.US, jobDescription: '', isAnalyzing: false, analysisPhase: '', result: null, error: null });
  const [isExporting, setIsExporting] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

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
    
    // Updated supported types to include docx
    const supportedTypes = [
      'application/pdf', 
      'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!supportedTypes.includes(file.type)) { 
      setState(prev => ({ ...prev, error: 'File format not supported. Please use PDF, DOCX, or Text.' })); 
      return; 
    }
    
    setState(prev => ({ ...prev, file, isAnalyzing: true, error: null, analysisPhase: 'Reading document...' }));
    setIsUnlocked(false); 
    setShowPayModal(false);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const phases = ["Neural Deep-Scan Logic...", "Evaluating industry relevance...", "Checking ATS scoring factors...", "Generating insights...", "Finalizing analysis report..."];
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
      reader.readAsDataURL(file);
    } catch (err) { 
      setState(prev => ({ ...prev, isAnalyzing: false, error: 'System error. Please refresh.' })); 
    }
  };

  const simulatePayment = () => {
    setShowPayModal(false);
    setState(prev => ({ ...prev, isAnalyzing: true, analysisPhase: 'Securing Gateway...' }));
    
    setTimeout(() => {
      setState(prev => ({ ...prev, analysisPhase: 'Processing $9.99 Secure Payment...' }));
      setTimeout(() => {
        setIsUnlocked(true);
        setState(prev => ({ ...prev, isAnalyzing: false, analysisPhase: '' }));
        setTimeout(() => {
          dashboardRef.current?.querySelector('#premium-content-gate')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }, 1500);
    }, 800);
  };

  const handleDownloadPDF = async () => {
    if (!state.result) return;
    setIsExporting(true);
    
    try {
      const reportElement = document.getElementById('full-forensic-report-container');
      if (!reportElement) {
        throw new Error("Analysis container not found");
      }

      const canvas = await html2canvas(reportElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#020617',
        windowWidth: 1400,
        ignoreElements: (el) => el.classList.contains('no-print')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${state.result.extractedData.name.replace(/\s+/g, '_')}_Career_Intelligence_Dossier.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Failed to generate Full Intelligence PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!state.result) return;
    const { idealResumeContent, extractedData } = state.result;
    
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: extractedData.name, bold: true, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: extractedData.contact, size: 20 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: "auto", space: 1, value: BorderStyle.SINGLE, size: 6 } },
            children: [new TextRun({ text: "PROFESSIONAL SUMMARY", bold: true })],
          }),
          new Paragraph({
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: idealResumeContent.summary, size: 22 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: "auto", space: 1, value: BorderStyle.SINGLE, size: 6 } },
            children: [new TextRun({ text: "PROFESSIONAL EXPERIENCE", bold: true })],
          }),
          ...idealResumeContent.experience.flatMap(exp => [
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({ text: exp.company, bold: true, size: 24 }),
                new TextRun({ text: ` | ${exp.period}`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: exp.role, italic: true, bold: true, size: 22 })],
            }),
            ...exp.bullets.map(bullet => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 50 },
                children: [new TextRun({ text: bullet, size: 22 })],
              })
            )
          ]),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300 },
            border: { bottom: { color: "auto", space: 1, value: BorderStyle.SINGLE, size: 6 } },
            children: [new TextRun({ text: "EDUCATION", bold: true })],
          }),
          ...idealResumeContent.education.flatMap(edu => [
            new Paragraph({
              spacing: { before: 100 },
              children: [
                new TextRun({ text: edu.school, bold: true, size: 24 }),
                new TextRun({ text: ` | ${edu.year}`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, size: 22 }),
                edu.honors ? new TextRun({ text: ` (${edu.honors})`, italic: true, size: 22 }) : new TextRun({ text: "" }),
              ],
            }),
          ]),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300 },
            border: { bottom: { color: "auto", space: 1, value: BorderStyle.SINGLE, size: 6 } },
            children: [new TextRun({ text: "CORE SKILLS & TECHNOLOGIES", bold: true })],
          }),
          new Paragraph({
            spacing: { before: 100 },
            children: [new TextRun({ text: idealResumeContent.skills.join(" • "), size: 22 })],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${extractedData.name.replace(/\s+/g, '_')}_ATS_Optimized.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setState({ file: null, industry: Industry.AUDIT, region: Region.US, jobDescription: '', isAnalyzing: false, analysisPhase: '', result: null, error: null });
    setIsUnlocked(false);
    setShowPayModal(false);
  };

  const triggerPayModal = () => setShowPayModal(true);

  const ReportFooter = ({ className = "" }: { className?: string }) => (
    <footer className={`w-full py-16 border-t border-white/5 bg-slate-950/40 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start mb-12">
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic text-white">RESUME ANALYZER</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Using artificial intelligence to provide real, actionable feedback for professionals who want to level up their career game.
            </p>
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-6 text-center md:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-cyan-500 border-b border-white/5 pb-2">Creator Vision</h4>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-all">
              <p className="text-[12px] text-slate-300 italic leading-relaxed">"I want every professional to grow and reach their full potential. Career paths can be complex, and my mission is to build intelligent tools that level the field."</p>
              <button onClick={() => setIsAboutOpen(true)} className="mt-6 flex items-center justify-center md:justify-start gap-3 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 cursor-pointer transition-colors no-print">
                Meet the Creator <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="md:col-span-4 space-y-8 flex flex-col items-center md:items-end">
            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 border-b border-white/5 pb-2 w-full md:text-right">Connect</h4>
            <div className="flex items-center gap-6">
              <a href="https://www.linkedin.com/in/calovishsinghal/" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 transition-all hover:scale-110 shadow-lg">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:Lovishsinghal2003@gmail.com" className="p-4 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-cyan-600 transition-all hover:scale-110 shadow-lg">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            &copy; 2026 RESUME ANALYZER &bull; ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-8 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">Stripe Secure</span>
          </div>
        </div>
      </footer>
  );

  return (
    <div className="min-h-screen selection:bg-cyan-500/30 flex flex-col bg-[#020617] transition-all duration-700">
      <AboutMeModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {showPayModal && <PremiumLockOverlay onUnlock={simulatePayment} onBack={() => setShowPayModal(false)} />}
      
      {(isExporting || state.isAnalyzing) && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center space-y-12 p-10 text-center animate-in fade-in duration-500">
          <div className="relative">
            <Loader2 className="w-24 h-24 text-cyan-400 animate-spin opacity-40" />
            <Zap className="w-10 h-10 text-cyan-400 absolute inset-0 m-auto animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
          </div>
          <div className="space-y-6 flex flex-col items-center max-w-lg">
            <h3 className="text-3xl font-serif-premium italic text-white tracking-[0.2em] uppercase shimmer-text">
                {isExporting ? "Generating Report Dossier" : "Analyzing Your Resume"}
            </h3>
            <p className="text-[12px] font-black text-cyan-500 uppercase tracking-[0.8em] animate-pulse">
                {state.analysisPhase || "Finalizing..."}
            </p>
            <ProcessLog />
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
        {!state.result ? (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center space-y-12 md:space-y-16 animate-in fade-in duration-1000 mt-8">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[11px] font-black uppercase tracking-[0.4em] animate-float shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <Sparkles className="w-4 h-4 animate-pulse" /> Advanced AI Evaluation
            </div>

            <div className="text-center space-y-8">
                <h1 className="text-7xl md:text-9xl font-serif-premium font-bold tracking-tight text-white leading-tight animate-in slide-in-from-top-8 duration-1000">
                    AI <span className="text-cyan-400 italic shimmer-text">Career Partner</span>
                </h1>
                <p className="text-base md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                    Get an expert recruiter's perspective on your resume instantly. Upload your file to see what hiring managers really think.
                </p>
            </div>

            <div className="w-full max-w-4xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Target className="w-4 h-4 text-cyan-500" />
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest">
                      Target Job Description (Optional)
                    </label>
                  </div>
                  <textarea 
                    value={state.jobDescription}
                    onChange={(e) => setState(prev => ({ ...prev, jobDescription: e.target.value }))}
                    placeholder="Paste the job you're applying for here to get a tailored audit against specific requirements..."
                    className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-sm text-slate-200 focus:border-cyan-500/50 outline-none h-48 custom-scrollbar resize-none glass-panel"
                  />
                </div>

                <div className="relative group h-full">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[3rem]" />
                  <div 
                    onClick={() => !state.isAnalyzing && fileInputRef.current?.click()}
                    className="relative h-full p-8 md:p-12 bg-slate-950/50 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center transition-all group-hover:border-cyan-500/60 shadow-2xl backdrop-blur-3xl cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-cyan-950/40 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_60px_rgba(34,211,238,0.3)] transition-all duration-700">
                      <FileUp className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif-premium font-bold text-white mb-2 uppercase tracking-tight">
                      Drop Resume Here
                    </h2>
                    <p className="text-slate-500 text-[11px] font-medium mb-8 uppercase tracking-[0.2em]">
                      PDF, DOCX, or Text Files Supported
                    </p>
                    
                    <button 
                      className="group/btn relative overflow-hidden bg-[#0f172a] border border-white/20 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-cyan-600 hover:text-black transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Select File</span>
                    </button>
                  </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx" className="hidden" />
            </div>
          </div>
        ) : (
          <div className="w-full space-y-12 md:space-y-20 pb-24" id="full-forensic-report-container">
            {/* Dossier Header Info - Only visible in PDF */}
            <div className="hidden pdf-only flex justify-between items-center mb-10 border-b border-white/10 pb-6 px-10 pt-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                  <Scan className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-2xl uppercase italic text-white">RESUME ANALYZER</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Forensic Dossier ID: RA-{Date.now().toString().slice(-6)}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidential Intelligence Report</p>
              </div>
            </div>

            <div className="glass-panel p-10 rounded-[3rem] border border-cyan-500/20 grid grid-cols-1 xl:grid-cols-4 gap-12 animate-in fade-in slide-in-from-top-12 duration-1000">
               <div className="xl:col-span-1 flex flex-col items-center xl:border-r border-white/5 pr-4">
                  <ScoreRing score={state.result.resumeIQ} label="RESUME IQ" size="w-28 h-28 md:w-40 md:h-40" color="stroke-cyan-500" />
                  <div className="mt-6 text-center">
                    <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em]">Neural Audit Score</p>
                  </div>
               </div>
               <div className="xl:col-span-3 space-y-10">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                     <h1 className="text-4xl md:text-6xl font-black text-white italic">{state.result.extractedData.name}</h1>
                     <VerdictBadge status={state.result.verdict.status} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <ATSMeter score={state.result.atsReadability} />
                     <div className="p-6 glass-panel rounded-3xl flex flex-col items-center justify-center text-center">
                        <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em]">Market Relevance</p>
                        <p className="text-2xl font-black text-white italic">{state.result.skillsIntelligence.marketRelevance}</p>
                     </div>
                     <div className="p-6 glass-panel rounded-3xl flex flex-col items-center justify-center text-center">
                        <Scan className="w-8 h-8 text-cyan-400 mb-3" />
                        <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em]">Formatting Diagnosis</p>
                        <p className="text-sm font-bold text-white italic truncate max-w-full">{state.result.formattingDiagnosis[0] || 'Optimized'}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="relative" id="premium-content-gate">
              <div className="space-y-12 md:space-y-20">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                   <div className="lg:col-span-3">
                      <FuturisticHeader title="Recruiter Eye-Track" subtitle="Predicted Focus Areas" />
                      <ForensicDocumentView result={state.result} isUnlocked={isUnlocked} onLockClick={triggerPayModal} />
                   </div>
                   <div className="lg:col-span-2 space-y-8">
                      <FuturisticHeader title="Expert Insights" subtitle="Narrative Analysis" />
                      <LockedSectionWrapper isUnlocked={isUnlocked} lockLabel="Expert Analysis" onLockClick={triggerPayModal}>
                        {state.result.recruiterTips?.map((tip, i) => <RecruiterTipCard key={i} tip={tip} index={i} />)}
                      </LockedSectionWrapper>
                   </div>
                </div>

                <div className="relative">
                   <FuturisticHeader title="Impact Audit" subtitle="Line-by-Line Refinement" />
                   <GlassCard className="relative">
                      <div className="divide-y divide-white/5 space-y-6">
                         {state.result.bulletCritiques?.map((item, i) => (
                           <BulletCritiqueRow key={i} item={item} index={i} isUnlocked={isUnlocked} onLockClick={triggerPayModal} />
                         ))}
                      </div>
                   </GlassCard>
                </div>

                {!isUnlocked && (
                  <div className="mt-20 py-16 flex flex-col items-center justify-center bg-cyan-950/5 border-2 border-dashed border-cyan-500/10 rounded-[3rem] p-10 text-center animate-in fade-in duration-1000 no-print">
                    <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,211,238,0.2)] animate-bounce cursor-pointer" onClick={triggerPayModal}>
                      <Lock className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 shimmer-text">Forensic Intelligence Locked</h3>
                    <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed mb-8 italic">
                      Unlock partner-level forensics and ATS optimized profile generation.
                    </p>
                    <button 
                      onClick={triggerPayModal}
                      className="group relative bg-cyan-600 text-white px-10 py-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-cyan-500 hover:scale-105 shadow-xl font-black uppercase tracking-widest text-[11px] cursor-pointer"
                    >
                      Unlock Full Analysis Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* PDF Special Footer - replicating home page look */}
                <div className="hidden pdf-only px-10">
                   <ReportFooter className="bg-transparent border-t-white/10" />
                </div>

                <div className="pt-16 no-print">
                  <div className="w-full relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl opacity-20 rounded-[4rem]" />
                    <GlassCard className="relative border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-12 !p-16 md:!p-20 shadow-[0_0_100px_rgba(34,211,238,0.15)]">
                      <div className="space-y-6 text-center md:text-left">
                        <h2 className="text-5xl md:text-6xl font-serif-premium font-bold text-white tracking-tight uppercase italic">The <span className="text-cyan-400">Vault</span></h2>
                        <p className="text-slate-400 text-base md:text-lg max-w-lg font-medium leading-relaxed italic">
                          Download your full intelligence dossier or export your resume in a clean, ATS-optimized Word format.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-8 w-full md:w-auto">
                        <button onClick={isUnlocked ? handleDownloadPDF : triggerPayModal} className="group/btn relative bg-slate-900 border border-white/20 px-12 py-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-cyan-500/70 transition-all min-w-[240px] cursor-pointer">
                            <FileDown className="w-8 h-8 text-cyan-400" />
                            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">Full Dossier (PDF)</span>
                        </button>
                        <button onClick={isUnlocked ? handleDownloadDOCX : triggerPayModal} className="group/btn relative bg-cyan-600 px-12 py-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-cyan-400 transition-all min-w-[240px] cursor-pointer shadow-[0_30px_60px_rgba(8,145,178,0.5)]">
                            <ClipboardCheck className="w-8 h-8 text-white" />
                            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">ATS Optimized (DOCX)</span>
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-12 no-print">
               <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 hover:text-cyan-400 transition-all flex items-center gap-4 group cursor-pointer"
               >
                 Back to Summit <ChevronRight className="w-4 h-4 transition-transform group-hover:-translate-y-2 rotate-[-90deg]" />
               </button>
            </div>
          </div>
        )}
      </main>

      <ReportFooter className="no-print max-w-[1600px] mx-auto px-6 md:px-12" />
    </div>
  );
}
