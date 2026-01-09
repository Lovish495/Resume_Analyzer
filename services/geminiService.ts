
import { GoogleGenAI, Type } from "@google/genai";
import { Industry, Region } from "../types";

/**
 * Service to handle resume analysis using Gemini 3 Flash.
 * Conducts a forensic audit of the resume against industry benchmarks or job descriptions.
 */
export const analyzeResume = async (
  base64File: string, 
  mimeType: string, 
  industry: Industry,
  region: Region,
  jobDescription: string,
  onProgress: (phase: string) => void
) => {
  // Always initialize GoogleGenAI with a named parameter using process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  onProgress("Initializing Forensic Audit Engine...");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64File,
            mimeType: mimeType
          }
        },
        {
          text: `Analyze this resume as a Senior Hiring Partner at a ${industry} firm in ${region}. 
          ${jobDescription ? `Compare it against this target Job Description: "${jobDescription}"` : "General industry benchmark analysis."}
          
          MANDATORY REQUIREMENTS:
          1. Be brutally honest. Sound like a corporate recruiter or managing director.
          2. Conduct a forensic audit of all experience bullets.
          3. Generate an 'idealResumeContent' which is a full, ready-to-use version of the resume. Include a summary, all experience items with optimized bullets, education, and skills. 
          4. IMPORTANT: In 'idealResumeContent', ensure 'contact' is detailed (Phone, Email, LinkedIn, Portfolio/Website if found).
          5. Evaluate the 'resumeIQ' based on content quality, ATS safety, and narrative strength.
          6. Generate 5 high-stakes interview questions with STAR-format answer guides in 'interviewIntelligence'.
          7. Identify SPECIFIC issues (formatting, logic, gaps) and provide 'recruiterTips'. 
             - EACH TIP MUST include: 'issue' (what is wrong), 'rectification' (how exactly to fix it), 'impact' (Low/Moderate/High).
          8. Return the response in the specified JSON schema.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          scoreBreakdown: {
            type: Type.OBJECT,
            properties: {
              structure: { type: Type.NUMBER },
              impact: { type: Type.NUMBER },
              expertise: { type: Type.NUMBER },
              experience: { type: Type.NUMBER },
              presentation: { type: Type.NUMBER }
            }
          },
          atsReadability: { type: Type.NUMBER },
          atsRisk: { type: Type.STRING },
          recruiterJustification: { type: Type.STRING },
          recruiterTips: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                issue: { type: Type.STRING },
                rectification: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          },
          extractedData: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              contact: { type: Type.STRING },
              phone: { type: Type.STRING },
              links: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { type: Type.ARRAY, items: { type: Type.STRING } },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingFields: { type: Type.ARRAY, items: { type: Type.STRING } },
              ambiguousData: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          bulletCritiques: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                critique: { type: Type.STRING },
                weakness: { type: Type.STRING },
                missing: { type: Type.STRING },
                soWhatGap: { type: Type.STRING },
                rewrites: { type: Type.ARRAY, items: { type: Type.STRING } },
                risk: { type: Type.STRING }
              }
            }
          },
          skillsIntelligence: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              missing: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              marketRelevance: { type: Type.STRING }
            }
          },
          narrativeRisk: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING },
              justification: { type: Type.STRING },
              interviewResponse: { type: Type.STRING }
            }
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          },
          rejectionReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
          brandingScore: { type: Type.NUMBER },
          resumeIQ: { type: Type.NUMBER },
          eyeTrackingHeatmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { section: { type: Type.STRING }, attentionScore: { type: Type.NUMBER }, feedback: { type: Type.STRING } }
            }
          },
          interviewIntelligence: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                type: { type: Type.STRING },
                starAnswer: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          formattingDiagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
          freshnessAudit: {
            type: Type.OBJECT,
            properties: {
              outdatedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
              plan30Days: { type: Type.STRING },
              plan90Days: { type: Type.STRING }
            }
          },
          objectionHandling: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                redFlag: { type: Type.STRING },
                bestExplanation: { type: Type.STRING },
                worstToAvoid: { type: Type.STRING }
              }
            }
          },
          idealResumeContent: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    period: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    school: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    year: { type: Type.STRING },
                    honors: { type: Type.STRING }
                  }
                }
              },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });

  // Extract text property directly, do not call as a method
  return JSON.parse(response.text || "{}");
};

/**
 * Generates a full interview preparation deck (15-20 questions).
 */
export const generateFullPrepDeck = async (
  resumeSummary: string,
  industry: Industry,
  jobDescription: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an elite Executive Interview Coach. 
    Based on the following candidate profile and target JD, generate a MASTER INTERVIEW PREP DECK.
    
    Candidate Summary: ${resumeSummary}
    Industry: ${industry}
    Target JD: ${jobDescription || "Standard Industry Level"}
    
    Generate exactly 15 high-impact questions categorized into:
    - Behavioral (testing leadership, teamwork, conflict)
    - Technical (testing specific industry skills and tools)
    - Situational (scenario-based challenges)
    - Trap (common recruiter tricks to test pressure or honesty)
    
    Each question must have a 'starAnswer' guide and a 'reason' for why this is asked.
    
    Return as JSON array of objects with keys: question, type, starAnswer, reason.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING },
            starAnswer: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["question", "type", "starAnswer", "reason"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Assistant to handle career-related chat queries.
 */
export const chatWithAssistant = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    // Always provide the full conversation history to maintain context
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are 'Core Assistant', a career AI designed to help users optimize their resumes and prepare for high-stakes interviews. Be professional, concise, and insightful.",
    },
  });

  // Access .text property directly
  return response.text || "I'm sorry, I couldn't process that request.";
};
