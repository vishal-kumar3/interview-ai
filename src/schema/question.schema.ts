import { z } from "zod"
import { SchemaUnion, Type } from "@google/genai"
import { InterviewType, Difficulty } from "@prisma/client"

export const GeminiQuestionUnionSchema: SchemaUnion = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The interview question text"
    },
    isFollowUp: {
      type: Type.BOOLEAN,
      description: "Is this question followup to previous one?"
    },
    type: {
      type: Type.STRING,
      enum: ["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"],
      description: "Type of interview question"
    },
    difficulty: {
      type: Type.STRING,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      description: "Difficulty level of the question"
    },
    topic: {
      type: Type.STRING,
      description: "Main topic or skill area being assessed"
    },
    estimatedDuration: {
      type: Type.NUMBER,
      description: "Estimated time to answer in seconds"
    },
    keywordsExpected: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Keywords expected in a good response"
    },
    evaluationCriteria: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Criteria for evaluating the response"
    },
    followUpTriggers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          condition: {
            type: Type.STRING,
            enum: ["incomplete_answer", "mentions_keyword", "demonstrates_knowledge", "needs_clarification", "excellent_response"]
          },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          followUpType: {
            type: Type.STRING,
            enum: ["clarification", "deep_dive", "challenge", "practical_example"]
          }
        },
        required: ["condition", "followUpType"]
      },
      description: "Conditions that would trigger follow-up questions"
    },
    aiContext: {
      type: Type.OBJECT,
      properties: {
        reasoning: {
          type: Type.STRING,
          description: "Why this question was generated"
        },
        expectedAnswerDepth: {
          type: Type.STRING,
          enum: ["basic", "intermediate", "advanced"]
        },
        relatedTopics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        priorQuestionConnection: {
          type: Type.STRING,
          description: "How this connects to previous questions"
        }
      },
      required: ["reasoning", "expectedAnswerDepth", "relatedTopics"]
    }
  },
  required: ["question", "isFollowUp", "type", "estimatedDuration", "keywordsExpected", "evaluationCriteria", "followUpTriggers", "aiContext", "topic"]
}

export const aiQuestionSchema = z.object({
  question: z.string(),
  isFollowUp: z.boolean().default(false),
  type: z.nativeEnum(InterviewType),
  difficulty: z.nativeEnum(Difficulty).optional(),
  topic: z.string().optional(),
  estimatedDuration: z.number().min(30).max(1800), // 30 seconds to 30 minutes
  keywordsExpected: z.array(z.string()),
  evaluationCriteria: z.array(z.string()),
  followUpTriggers: z.array(z.object({
    condition: z.enum(["incomplete_answer", "mentions_keyword", "demonstrates_knowledge", "needs_clarification", "excellent_response"]),
    keywords: z.array(z.string()).optional(),
    followUpType: z.enum(["clarification", "deep_dive", "challenge", "practical_example"]),
  })),
  aiContext: z.object({
    reasoning: z.string(),
    expectedAnswerDepth: z.enum(["basic", "intermediate", "advanced"]),
    relatedTopics: z.array(z.string()),
    priorQuestionConnection: z.string().optional(),
  }),
})


// Zod schemas
export const questionGenerationInputSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  resumeData: z.any().optional().nullable(), // Accept any JSON structure
  jobDescriptionData: z.any().optional().nullable(), // Accept any JSON structure
  interviewType: z.nativeEnum(InterviewType),
  difficulty: z.nativeEnum(Difficulty),
  focusAreas: z.array(z.string()).optional(),
  avoidTopics: z.array(z.string()).optional(),
  conversationHistory: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    responseText: z.string(),
    responseQuality: z.enum(["poor", "average", "good", "excellent"]).optional(),
  })).optional(),
  currentPhase: z.enum(["introduction", "technical_basics", "technical_deep_dive", "behavioral", "situational", "wrap_up"]).optional(),
  questionCount: z.number().min(1).max(20).default(1),
})


export const questionGenerationResponseSchema = z.object({
  questions: z.array(aiQuestionSchema),
  conversationFlow: z.object({
    currentPhase: z.string(),
    suggestedNextPhase: z.string().optional(),
    phaseProgress: z.number().min(0).max(100),
    adaptiveReasoning: z.string(),
  }),
  sessionUpdates: z.object({
    focusAreasUpdated: z.array(z.string()).optional(),
    difficultyAdjustment: z.nativeEnum(Difficulty).optional(),
    estimatedRemainingTime: z.number().optional(),
  }),
})

export const followUpQuestionInputSchema = z.object({
  parentQuestionId: z.string().min(1, "Parent question ID is required"),
  parentQuestionText: z.string().min(1, "Parent question text is required"),
  userResponse: z.string().min(1, "User response is required"),
  responseAnalysis: z.object({
    completeness: z.enum(["incomplete", "partial", "complete", "comprehensive"]),
    accuracy: z.enum(["incorrect", "partially_correct", "correct", "exceptional"]),
    depth: z.enum(["surface", "basic", "detailed", "expert"]),
    mentionedConcepts: z.array(z.string()),
    missingConcepts: z.array(z.string()),
  }),
  sessionContext: z.object({
    interviewType: z.nativeEnum(InterviewType),
    difficulty: z.nativeEnum(Difficulty),
    currentDepth: z.number().min(0).max(5),
    timeRemaining: z.number().optional(),
  }),
})

export const followUpQuestionResponseSchema = z.object({
  shouldGenerateFollowUp: z.boolean(),
  followUpQuestion: aiQuestionSchema.optional(),
  reasoning: z.string(),
  alternativeActions: z.array(z.enum(["move_to_next_topic", "increase_difficulty", "decrease_difficulty", "wrap_up_topic"])),
})

// Type exports
export type QuestionGenerationInput = z.infer<typeof questionGenerationInputSchema>
export type AIQuestionSchema = z.infer<typeof aiQuestionSchema>
export type QuestionGenerationResponse = z.infer<typeof questionGenerationResponseSchema>
export type FollowUpQuestionInput = z.infer<typeof followUpQuestionInputSchema>
export type FollowUpQuestionResponse = z.infer<typeof followUpQuestionResponseSchema>

// Gemini AI Schema Definitions
export const geminiQuestionGenerationSchema: SchemaUnion = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: GeminiQuestionUnionSchema,
      description: "Array of generated questions"
    },
    conversationFlow: {
      type: Type.OBJECT,
      properties: {
        currentPhase: {
          type: Type.STRING,
          description: "Current interview phase"
        },
        suggestedNextPhase: {
          type: Type.STRING,
          description: "Suggested next phase based on progress"
        },
        phaseProgress: {
          type: Type.NUMBER,
          description: "Progress percentage in current phase (0-100)"
        },
        adaptiveReasoning: {
          type: Type.STRING,
          description: "Reasoning for the conversation flow decisions"
        }
      },
      required: ["currentPhase", "phaseProgress", "adaptiveReasoning"]
    },
    sessionUpdates: {
      type: Type.OBJECT,
      properties: {
        focusAreasUpdated: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Updated focus areas based on responses"
        },
        difficultyAdjustment: {
          type: Type.STRING,
          enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
          description: "Suggested difficulty adjustment"
        },
        estimatedRemainingTime: {
          type: Type.NUMBER,
          description: "Estimated remaining interview time in minutes"
        }
      }
    }
  },
  required: ["questions", "conversationFlow"]
}

export const geminiFollowUpQuestionSchema: SchemaUnion = {
  type: Type.OBJECT,
  properties: {
    shouldGenerateFollowUp: {
      type: Type.BOOLEAN,
      description: "Whether a follow-up question should be generated"
    },
    followUpQuestion: geminiQuestionGenerationSchema,
    reasoning: {
      type: Type.STRING,
      description: "Reasoning for the follow-up decision"
    },
    alternativeActions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        enum: ["move_to_next_topic", "increase_difficulty", "decrease_difficulty", "wrap_up_topic"]
      },
      description: "Alternative actions if no follow-up is needed"
    }
  },
  required: ["shouldGenerateFollowUp", "reasoning", "alternativeActions"]
}
