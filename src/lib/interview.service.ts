import { createGenAIText, createGenAIChat, GeminiHistoryType } from "@/config/gemini.config"
import {
  geminiQuestionGenerationSchema,
  geminiFollowUpQuestionSchema,
  questionGenerationInputSchema,
  followUpQuestionInputSchema
} from "@/schema/question.schema"
import { PrismaClient, JsonValue } from "@prisma/client"
import type {
  QuestionGenerationInput,
  QuestionGenerationResponse,
  FollowUpQuestionInput,
  FollowUpQuestionResponse
} from "@/schema/question.schema"

const prisma = new PrismaClient()

// Helper function to safely convert JsonValue to object
function jsonValueToObject(jsonValue: JsonValue | null | undefined): Record<string, any> | null {
  if (!jsonValue) return null

  // If it's already an object, return it
  if (typeof jsonValue === 'object' && jsonValue !== null && !Array.isArray(jsonValue)) {
    return jsonValue as Record<string, any>
  }

  // If it's a string, try to parse it
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue)
      return typeof parsed === 'object' && parsed !== null ? parsed : null
    } catch {
      return null
    }
  }

  return null
}

// Enhanced schema for interview continuation decision
export const geminiInterviewContinuationSchema = {
  type: "object" as const,
  properties: {
    shouldContinue: {
      type: "boolean" as const,
      description: "Whether the interview should continue or end"
    },
    reasoning: {
      type: "string" as const,
      description: "Reasoning for the continuation decision"
    },
    nextQuestion: {
      type: "object" as const,
      properties: {
        text: { type: "string" as const },
        type: { type: "string" as const, enum: ["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"] },
        difficulty: { type: "string" as const, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
        topic: { type: "string" as const },
        estimatedDuration: { type: "number" as const },
        keywordsExpected: { type: "array" as const, items: { type: "string" as const } },
        evaluationCriteria: { type: "array" as const, items: { type: "string" as const } },
        aiContext: {
          type: "object" as const,
          properties: {
            reasoning: { type: "string" as const },
            expectedAnswerDepth: { type: "string" as const, enum: ["basic", "intermediate", "advanced"] },
            relatedTopics: { type: "array" as const, items: { type: "string" as const } }
          },
          required: ["reasoning", "expectedAnswerDepth", "relatedTopics"]
        }
      },
      required: ["text", "type", "estimatedDuration", "keywordsExpected", "evaluationCriteria", "aiContext"]
    },
    assessmentSummary: {
      type: "object" as const,
      properties: {
        overallPerformance: { type: "string" as const, enum: ["poor", "below_average", "average", "good", "excellent"] },
        strengthAreas: { type: "array" as const, items: { type: "string" as const } },
        improvementAreas: { type: "array" as const, items: { type: "string" as const } },
        recommendedNext: { type: "string" as const }
      },
      required: ["overallPerformance", "strengthAreas", "improvementAreas"]
    }
  },
  required: ["shouldContinue", "reasoning"]
}

export class InterviewService {
  static async generateInitialQuestions(input: QuestionGenerationInput): Promise<QuestionGenerationResponse> {
    // Convert JsonValue to proper types for validation
    const safeInput = {
      ...input,
      resumeData: jsonValueToObject(input.resumeData as JsonValue),
      jobDescriptionData: jsonValueToObject(input.jobDescriptionData as JsonValue)
    }

    const validated = questionGenerationInputSchema.parse(safeInput)

    const systemInstruction = `
You are an expert AI interview conductor for ${validated.interviewType} interviews at ${validated.difficulty} level.

Generate relevant interview questions based on:
- Resume data: ${JSON.stringify(validated.resumeData || {})}
- Job description: ${JSON.stringify(validated.jobDescriptionData || {})}
- Focus areas: ${validated.focusAreas?.join(", ") || "General"}
- Avoid topics: ${validated.avoidTopics?.join(", ") || "None"}
- Current phase: ${validated.currentPhase || "introduction"}

Guidelines:
1. Generate ${validated.questionCount} questions
2. Questions should be progressive in difficulty
3. Include clear evaluation criteria
4. Set up follow-up triggers for adaptive questioning
5. Maintain conversation flow context
6. Consider candidate's background and target role
`

    const prompt = `Generate ${validated.questionCount} interview questions for a ${validated.interviewType} interview at ${validated.difficulty} level.`

    const response = await createGenAIText(prompt, systemInstruction, geminiQuestionGenerationSchema)

    return JSON.parse(response.parts[0].text) as QuestionGenerationResponse
  }

  static async decideInterviewContinuation(sessionId: string) {
    // Get session with all questions and responses
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: {
            response: {
              include: {
                feedback: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        resume: true,
        jobDescription: true,
        sessionMetadata: true
      }
    })

    if (!session) {
      throw new Error("Session not found")
    }

    // Build conversation history for AI
    const conversationHistory: GeminiHistoryType[] = []

    // Convert JsonValue to objects safely
    const resumeData = jsonValueToObject(session.resume?.parsedData)
    const jobData = jsonValueToObject(session.jobDescription?.parsedData)

    // Add initial context
    conversationHistory.push({
      role: "user",
      parts: [{
        text: `Interview Context:
- Position: ${session.jobDescription?.title || "General Position"}
- Interview Type: ${session.interviewType}
- Difficulty Level: ${session.difficulty}
- Total Questions Asked: ${session.questions.length}
- Resume Data: ${JSON.stringify(resumeData || {})}
- Job Requirements: ${JSON.stringify(jobData || {})}
- Focus Areas: ${session.sessionMetadata?.focusAreas?.join(", ") || "General"}
`
      }]
    })

    // Add Q&A pairs to conversation history
    session.questions.forEach((question, index) => {
      conversationHistory.push({
        role: "assistant",
        parts: [{
          text: `Question ${index + 1} (${question.type}${question.isFollowUp ? ' - Follow-up' : ''}): ${question.text}`
        }]
      })

      if (question.response) {
        conversationHistory.push({
          role: "user",
          parts: [{
            text: `Response: ${question.response.content || '[Audio/Video Response]'}`
          }]
        })

        if (question.response.feedback) {
          conversationHistory.push({
            role: "assistant",
            parts: [{
              text: `Feedback (Score: ${question.response.feedback.score}/10): ${question.response.feedback.content}`
            }]
          })
        }
      }
    })

    const systemInstruction = `
You are an expert AI interview conductor. Based on the conversation history, decide whether to continue the interview or conclude it.

Consider these factors:
1. Number of questions asked (current: ${session.questions.length})
2. Quality and depth of responses received
3. Coverage of key topics for the role
4. Candidate's performance progression
5. Time efficiency (aim for 5-15 questions total depending on role complexity)

Decision criteria:
- Continue if: More exploration needed, candidate showing potential, key areas uncovered
- End if: Sufficient assessment completed, clear performance level established, or reached 15+ questions

If continuing, generate the next most valuable question. If ending, provide assessment summary.
`

    const chat = await createGenAIChat(
      conversationHistory,
      systemInstruction,
      geminiInterviewContinuationSchema
    )

    const response = await chat.sendMessage("Based on the interview progress, should we continue with another question or conclude the interview? Provide your reasoning and next steps.")

    return JSON.parse(response.parts[0].text)
  }

  static async generateFollowUpQuestion(input: FollowUpQuestionInput): Promise<FollowUpQuestionResponse> {
    const validated = followUpQuestionInputSchema.parse(input)

    const systemInstruction = `
You are analyzing a candidate's response to determine if a follow-up question is needed.

Original question: "${validated.parentQuestionText}"
Candidate response: "${validated.userResponse}"

Response analysis:
- Completeness: ${validated.responseAnalysis.completeness}
- Accuracy: ${validated.responseAnalysis.accuracy}
- Depth: ${validated.responseAnalysis.depth}
- Mentioned concepts: ${validated.responseAnalysis.mentionedConcepts.join(", ")}
- Missing concepts: ${validated.responseAnalysis.missingConcepts.join(", ")}

Current context:
- Interview type: ${validated.sessionContext.interviewType}
- Difficulty: ${validated.sessionContext.difficulty}
- Current depth: ${validated.sessionContext.currentDepth}
- Time remaining: ${validated.sessionContext.timeRemaining || "Unknown"}

Decide if a follow-up is needed and generate one if appropriate.
`

    const prompt = `Based on the candidate's response, should I generate a follow-up question? If yes, generate an appropriate follow-up.`

    const response = await createGenAIText(prompt, systemInstruction, geminiFollowUpQuestionSchema)

    return JSON.parse(response.parts[0].text) as FollowUpQuestionResponse
  }

  static async saveQuestionToDB(sessionId: string, questionData: any, parentId?: string) {
    const question = await prisma.question.create({
      data: {
        sessionId,
        text: questionData.text,
        type: questionData.type,
        order: Date.now(), // Use timestamp for dynamic ordering
        parentId,
        difficulty: questionData.difficulty,
        topic: questionData.topic,
        isFollowUp: !!parentId,
        followUpDepth: parentId ? 1 : 0, // Could be calculated from parent
        aiContext: questionData.aiContext || {}
      }
    })

    return question
  }

  static async saveResponse(questionId: string, sessionId: string, responseData: {
    content?: string
    responseType: string
    fileUrl?: string
    duration?: number
  }) {
    return await prisma.response.create({
      data: {
        questionId,
        sessionId,
        responseType: responseData.responseType,
        content: responseData.content,
        fileUrl: responseData.fileUrl,
        duration: responseData.duration,
        keyPoints: {}, // Empty object instead of null
        confidence: 0.8
      }
    })
  }

  static async analyzeResponse(responseId: string, responseText: string, question: any) {
    // This would integrate with AI to analyze the response
    // For now, returning mock analysis
    return {
      completeness: "partial" as const,
      accuracy: "correct" as const,
      depth: "basic" as const,
      mentionedConcepts: ["basic understanding"],
      missingConcepts: ["advanced concepts"]
    }
  }
}
