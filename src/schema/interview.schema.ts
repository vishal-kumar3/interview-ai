import { Difficulty, InterviewType } from "@prisma/client";
import { z } from "zod";


export const interviewFormSchema = z.object({
  jobDescriptionId: z.string().min(1, "Please select a job description"),
  resumeId: z.string().min(1, "Please select a resume"),
  interviewType: z.enum(Object.values(InterviewType) as [string, ...string[]]),
  difficulty: z.enum(Object.values(Difficulty) as [string, ...string[]]),
  notes: z.string().optional(),
})

export const createInterviewSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  jobDescriptionId: z.string().min(1, "Please select a job description").optional(),
  resumeId: z.string().min(1, "Please select a resume").optional(),
  interviewType: z.nativeEnum(InterviewType),
  difficulty: z.nativeEnum(Difficulty),
  additionalNotes: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  avoidTopics: z.array(z.string()).optional(),
  customSettings: z.object({
    timeLimit: z.number().min(10).max(180).optional(), // 10 minutes to 3 hours
    questionCount: z.number().min(1).max(50).optional(),
    enableFollowUps: z.boolean().default(true),
    adaptiveDifficulty: z.boolean().default(true),
  }).optional(),
})

export const submitResponseSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  responseType: z.enum(["text", "audio", "video"]),
  content: z.string().optional(),
  fileUrl: z.string().url().optional(),
  duration: z.number().min(0).optional(),
})

export type InterviewFormData = z.infer<typeof interviewFormSchema>
export type CreateInterviewSessionData = z.infer<typeof createInterviewSessionSchema>
export type SubmitResponseData = z.infer<typeof submitResponseSchema>
