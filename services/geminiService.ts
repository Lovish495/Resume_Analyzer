
import { GoogleGenAI, Type } from "@google/genai";
import { Industry, Region } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeResume = async (
  base64File: string, 
  mimeType: string, 
  industry: Industry,
  region: Region,
  jobDescription: string,
  onProgress: (phase: string) => void
) => {
  onProgress("Initializing Forensic Audit Engine...");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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
          3. Generate an 'idealResumeContent' which is a full, ready-to-use version of the resume. DO NOT skip any sections. Include a summary, all experience items with optimized bullets, education, and skills.
          4. Evaluate the 'resumeIQ' based on content quality, ATS safety, and narrative strength.
          5. Ensure the verdict is professional and the tips are actionable.`
        }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 24000 },
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
                content: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          },
          extractedData: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              contact: { type: Type.STRING },
              education: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { type: Type.ARRAY, items: { type: Type.STRING } },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingFields: { type: Type.ARRAY, items: { type: Type.STRING } }
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
              justification: { type: Type.STRING }
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
              properties: {
                section: { type: Type.STRING },
                attentionScore: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              }
            }
          },
          interviewIntelligence: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                type: { type: Type.STRING },
                starAnswer: { type: Type.STRING }
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

  return JSON.parse(response.text);
};
