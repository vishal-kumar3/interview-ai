import { z } from "zod";
import { SchemaUnion, Type } from "@google/genai";

export const feedbackSystemInstructions = `
You are an AI specialized in providing feedback on interview responses.
Given an interview response, provide constructive feedback, suggest areas for improvement,
and assign a score (if applicable). Focus on clarity, conciseness, relevance, and overall quality
of the response.
`;

export const feedbackResponseSchema = z.object({
  content: z.string().min(1, "Feedback content is required"),
  score: z.number().optional(),
});

export const feedbackGeminiResponseSchema: SchemaUnion = {
  type: Type.OBJECT,
  properties: {
    content: { type: Type.STRING },
    score: { type: Type.NUMBER },
  },
  required: ["content"],
};

export type FeedbackData = z.infer<typeof feedbackResponseSchema>;

// Overall Interview Feedback System Instructions
export const overallInterviewFeedbackSystemInstructions = `
You are an expert AI interviewer tasked with providing comprehensive feedback on a complete interview session.

Analyze the entire interview performance based on:
1. Technical competency (for technical roles)
2. Communication skills and clarity
3. Problem-solving approach and methodology
4. Behavioral responses and cultural fit
5. Overall professionalism and engagement
6. Depth of knowledge and experience
7. Ability to handle follow-up questions
8. Growth mindset and learning orientation

Provide:
- An overall score (1-100)
- Detailed feedback summary
- Clear hire recommendation
- 3-5 key strengths observed
- 3-5 areas for improvement
- Specific improvement suggestions with actionable steps

Consider the interview type, difficulty level, and role requirements when making your assessment.
Be constructive, specific, and balanced in your feedback.
`;

// Zod schema for overall interview feedback
export const overallInterviewFeedbackSchema = z.object({
  overallScore: z.number().min(1).max(100).describe("Overall interview score from 1-100"),
  feedback: z.string().min(50).describe("Comprehensive feedback summary (minimum 50 characters)"),
  hireRecommendation: z.enum([
    "STRONGLY_RECOMMEND",
    "RECOMMEND",
    "NEUTRAL",
    "DO_NOT_RECOMMEND"
  ]).describe("Final hiring recommendation"),
  strengths: z.array(z.string()).min(3).max(5).describe("3-5 key strengths observed"),
  weaknesses: z.array(z.string()).min(2).max(5).describe("2-5 areas needing improvement"),
  improvementAreas: z.array(z.string()).min(2).max(5).describe("2-5 specific actionable improvement suggestions")
});

// Gemini Union Schema for overall interview feedback
export const overallInterviewFeedbackGeminiSchema: SchemaUnion = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "Overall interview score from 1-100"
    },
    feedback: {
      type: Type.STRING,
      description: "Comprehensive feedback summary"
    },
    hireRecommendation: {
      type: Type.STRING,
      enum: ["STRONGLY_RECOMMEND", "RECOMMEND", "NEUTRAL", "DO_NOT_RECOMMEND"],
      description: "Final hiring recommendation"
    },
    strengths: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Key strengths observed during the interview"
    },
    weaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Areas that need improvement"
    },
    improvementAreas: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Specific actionable improvement suggestions"
    }
  },
  required: ["overallScore", "feedback", "hireRecommendation", "strengths", "weaknesses", "improvementAreas"]
};

// Type definitions
export type OverallInterviewFeedbackData = z.infer<typeof overallInterviewFeedbackSchema>;

