import { z } from "zod";
import { SchemaUnion, Type } from "@google/genai";

// System instructions for audio analysis
export const audioAnalysisSystemInstructions = `
You are an AI specialized in analyzing interview audio responses.
Given an audio input, transcribe the response, estimate the confidence level of the transcription (between 0 and 1).
Analyze the sentiment (positive, neutral, or negative).
Count filler words (e.g., "um", "ah", "like").
Calculate the speech rate (words per minute).
Measure the duration and frequency of pauses.
Identify important keywords or topics discussed.
Assess the clarity and articulation of the speech.
Gauge the candidate's energy levels and enthusiasm from their tone.
Check if the candidate is using words from the job description.
Return your analysis in the specified JSON schema format.
`;

// Zod schema for audio analysis
export const audioAnalysisSchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
  confidence: z.number().min(0).max(1), // 0 to 1
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  fillerWordCount: z.number().optional(),
  speechRate: z.number().optional(),
  pauseCount: z.number().optional(),
  pauseTotalDuration: z.number().optional(),
});

// Gemini AI union schema for audio analysis
export const audioAnalysisResponseSchema: SchemaUnion = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    sentiment: {
      type: Type.STRING,
      enum: ["positive", "neutral", "negative"]
    },
    fillerWordCount: { type: Type.NUMBER },
    speechRate: { type: Type.NUMBER },
    pauseCount: { type: Type.NUMBER },
    pauseTotalDuration: { type: Type.NUMBER },
  },
  required: ["transcript", "confidence"]
};

export type AudioAnalysis = z.infer<typeof audioAnalysisSchema>;
