import { GoogleGenAI, Type } from "@google/genai";
import { Industry, Region } from "../types";

export const analyzeResume = async (
  base64File: string, 
  mimeType: string, 
  industry: Industry,
  region: Region,
  jobDescription: string,
  onProgress: (phase: string) => void
) => {
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
          4. Evaluate the 'resumeIQ' based on content quality, ATS safety, and narrative strength.
          5. Return the response in the specified JSON schema.`
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

export function encodePCM(data: Float32Array): string {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64Audio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
