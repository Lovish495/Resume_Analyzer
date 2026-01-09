
export enum Industry {
  AUDIT = 'Audit / Forensic',
  IB = 'Investment Banking / Finance',
  CONSULTING = 'Consulting',
  TECH = 'Tech / Data'
}

export enum Region {
  INDIA = 'India',
  US = 'US',
  UK = 'UK',
  MIDDLE_EAST = 'Middle East'
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface ScoreBreakdown {
  structure: number;
  impact: number;
  expertise: number;
  experience: number;
  presentation: number;
}

export interface BulletCritique {
  original: string;
  critique: string;
  weakness: string;
  missing: string;
  soWhatGap: string;
  rewrites: string[];
  risk: 'Safe' | 'Needs Evidence' | 'High Interview Risk';
}

export interface InterviewQuestion {
  question: string;
  type: 'Behavioral' | 'Technical' | 'Situational' | 'Trap';
  starAnswer: string;
  reason: string;
}

export interface AnalysisResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  atsReadability: number;
  atsRisk: RiskLevel;
  recruiterJustification: string;
  recruiterTips: {
    type: 'strength' | 'issue' | 'risk';
    content: string;
    impact: 'Low' | 'Moderate' | 'High';
  }[];
  extractedData: {
    name: string;
    contact: string;
    education: string[];
    experience: string[];
    skills: string[];
    certifications: string[];
    projects: string[];
    missingFields: string[];
    ambiguousData: string[];
  };
  bulletCritiques: BulletCritique[];
  skillsIntelligence: {
    strengths: string[];
    missing: string[];
    keywords: string[];
    marketRelevance: 'Trending' | 'Stable' | 'Declining';
  };
  narrativeRisk: {
    level: RiskLevel;
    justification: string;
    interviewResponse: string;
  };
  verdict: {
    status: 'Shortlist' | 'Borderline' | 'Reject';
    reason: string;
  };
  rejectionReasons: string[];
  brandingScore: number;
  resumeIQ: number;
  eyeTrackingHeatmap: {
    section: string;
    attentionScore: number;
    feedback: string;
  }[];
  interviewIntelligence: InterviewQuestion[];
  formattingDiagnosis: string[];
  freshnessAudit: {
    outdatedItems: string[];
    plan30Days: string;
    plan90Days: string;
  };
  objectionHandling: {
    redFlag: string;
    bestExplanation: string;
    worstToAvoid: string;
  }[];
  idealResumeContent: {
    summary: string;
    experience: {
      company: string;
      role: string;
      period: string;
      bullets: string[];
    }[];
    education: {
      school: string;
      degree: string;
      year: string;
      honors: string;
    }[];
    skills: string[];
  };
}

export interface AppState {
  file: File | null;
  industry: Industry;
  region: Region;
  jobDescription: string;
  isAnalyzing: boolean;
  analysisPhase: string;
  result: AnalysisResult | null;
  error: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingUrls?: { title: string; uri: string }[];
}
