"use server"

import { InterviewService } from "@/lib/interview.service"
import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import type { ExtendedInterview, StandardQuestion } from "@/types/interview.types"

const prisma = new PrismaClient()

// Helper function to safely convert JsonValue
function safeJsonValue(value: JSON | null | undefined): any {
  if (!value) return null

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return value
}

export async function generateInitialQuestions(sessionId: string): Promise<{
  questions?: StandardQuestion[]
  reasoning?: string
  error?: string
}> {
  try {
    // Get session details
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        resume: true,
        jobDescription: true,
        sessionMetadata: true
      }
    })

    if (!session) {
      return { error: "Session not found" }
    }

    // Check if questions already exist
    const existingQuestions = await prisma.question.findMany({
      where: { sessionId, isFollowUp: false },
      orderBy: { order: 'asc' }
    })

    if (existingQuestions.length > 0) {
      const standardQuestions: StandardQuestion[] = existingQuestions.map(q => ({
        ...q,
        response: null
      }))
      return { questions: standardQuestions }
    }

    // Generate first question using AI decision with safe JsonValue conversion
    const continuationDecision = await InterviewService.decideInterviewContinuation(sessionId)

    if (continuationDecision.shouldContinue && continuationDecision.nextQuestion) {
      // Save the first question
      const savedQuestion = await InterviewService.saveQuestionToDB(sessionId, continuationDecision.nextQuestion)

      // Initialize session metadata
      await prisma.sessionMetadata.upsert({
        where: { sessionId },
        update: {
          conversationFlow: {
            currentPhase: "introduction",
            questionCount: 1,
            startedAt: new Date().toISOString()
          }
        },
        create: {
          sessionId,
          aiPromptContext: {
            initialGeneration: true,
            timestamp: new Date().toISOString()
          },
          focusAreas: [],
          avoidTopics: [],
          conversationFlow: {
            currentPhase: "introduction",
            questionCount: 1,
            startedAt: new Date().toISOString()
          }
        }
      })

      const standardQuestion: StandardQuestion = {
        ...savedQuestion,
        response: null
      }

      revalidatePath(`/interview/${sessionId}`)
      return { questions: [standardQuestion], reasoning: continuationDecision.reasoning }
    }

    return { error: "Failed to generate initial question" }

  } catch (error) {
    console.error("Question generation error:", error)
    return { error: "Failed to generate questions" }
  }
}

export async function submitResponseAndGetNext(
  sessionId: string,
  questionId: string,
  responseData: {
    content?: string
    responseType: string
    fileUrl?: string
    duration?: number
  }
): Promise<{
  response?: any
  feedback?: any
  nextQuestion?: StandardQuestion
  shouldEnd?: boolean
  reasoning?: string
  assessmentSummary?: any
  error?: string
}> {
  try {
    // Save response
    const savedResponse = await prisma.response.create({
      data: {
        questionId,
        sessionId,
        responseType: responseData.responseType,
        content: responseData.content,
        fileUrl: responseData.fileUrl,
        duration: responseData.duration,
        keyPoints: {},
        confidence: 0.8
      }
    })

    // TODO: Implement AI analysis of the response
    // Generate mock feedback
    const feedback = await prisma.feedback.create({
      data: {
        responseId: savedResponse.id,
        content: "Thank you for your response. Analyzing and moving forward...",
        score: Math.floor(Math.random() * 3) + 7
      }
    })

    // Decide on interview continuation using AI
    const continuationDecision = await InterviewService.decideInterviewContinuation(sessionId)

    let nextQuestion: StandardQuestion | undefined = undefined
    let shouldEnd = false

    if (continuationDecision.shouldContinue && continuationDecision.nextQuestion) {
      // Save next question
      const savedNextQuestion = await InterviewService.saveQuestionToDB(sessionId, continuationDecision.nextQuestion)

      nextQuestion = {
        ...savedNextQuestion,
        response: null
      }

      // Update conversation flow
      await prisma.sessionMetadata.update({
        where: { sessionId },
        data: {
          conversationFlow: {
            ...continuationDecision.assessmentSummary,
            questionCount: await prisma.question.count({ where: { sessionId } }),
            lastUpdated: new Date().toISOString()
          }
        }
      })
    } else {
      // End interview
      shouldEnd = true
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED" }
      })
    }

    revalidatePath(`/interview/${sessionId}`)

    return {
      response: savedResponse,
      feedback,
      nextQuestion,
      shouldEnd,
      reasoning: continuationDecision.reasoning,
      assessmentSummary: continuationDecision.assessmentSummary
    }

  } catch (error) {
    console.error("Response submission error:", error)
    return { error: "Failed to submit response" }
  }
}

export async function getInterviewSession(sessionId: string, userId: string): Promise<{ interview?: ExtendedInterview, error?: string }> {
  try {
    const interviewData = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId,
        userId: userId
      },
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

    if (!interviewData) {
      return { error: "Session not found" }
    }

    // Transform the data to match ExtendedSession type
    const interview: ExtendedInterview = {
      ...interviewData,
      questions: interviewData.questions.map(q => ({
        ...q,
        response: q.response ? {
          ...q.response,
          feedback: q.response.feedback
        } : null
      }))
    }

    return { interview }
  } catch (error) {
    console.error("Failed to get session:", error)
    return { error: "Failed to load session" }
  }
}

export async function endInterviewEarly(sessionId: string) {
  try {
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" }
    })

    revalidatePath(`/interview/${sessionId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to end interview:", error)
    return { error: "Failed to end interview" }
  }
}
