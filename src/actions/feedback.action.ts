"use server"

import { auth } from "@/auth"
import prisma from "@/config/prisma.config"
import { InterviewSession, Question, Response, Feedback, InterviewFeedback } from "@prisma/client"
import { createGenAIChat } from "@/config/gemini.config"
import {
  overallInterviewFeedbackSystemInstructions,
  overallInterviewFeedbackGeminiSchema,
  overallInterviewFeedbackSchema
} from "@/schema/feedback.schema"

// Extended types for feedback
export interface ExtendedInterviewSession extends InterviewSession {
  questions: ExtendedQuestion[]
  responses: ExtendedResponse[]
  resume?: { fileName: string } | null
  jobDescription?: { title: string; company: string | null } | null
  interviewFeedback?: InterviewFeedback | null
}

export interface ExtendedQuestion extends Question {
  followUps?: ExtendedQuestion[]
}

export interface ExtendedResponse extends Response {
  feedback?: Feedback | null
}

export async function getInterviewFeedback(sessionId: string): Promise<{
  session?: ExtendedInterviewSession
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized access" }
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id // Ensure user owns this session
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
        responses: {
          include: {
            feedback: true
          },
          orderBy: { createdAt: 'asc' }
        },
        resume: {
          select: {
            fileName: true
          }
        },
        jobDescription: {
          select: {
            title: true,
            company: true
          }
        },
        interviewFeedback: true
      }
    })

    if (!interviewSession) {
      return { error: "Interview session not found" }
    }

    // Transform the data to match our extended types
    const transformedSession: ExtendedInterviewSession = {
      ...interviewSession,
      questions: interviewSession.questions.map(q => ({
        ...q,
        followUps: [] // Could be populated if needed
      })),
      responses: interviewSession.responses.map(r => ({
        ...r,
        feedback: r.feedback
      })),
      interviewFeedback: interviewSession.interviewFeedback
    }

    return { session: transformedSession }

  } catch (error) {
    console.error("Failed to fetch interview feedback:", error)
    return { error: "Failed to load interview feedback" }
  }
}

export async function calculateSessionStats(responses: ExtendedResponse[]) {
  const scores = responses
    .map(r => r.feedback?.score)
    .filter((score): score is number => score !== undefined && score !== null)

  if (scores.length === 0) return { averageScore: 0, totalQuestions: 0, answeredQuestions: 0 }

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  return {
    averageScore,
    totalQuestions: responses.length,
    answeredQuestions: scores.length
  }
}

// export async function generateOverallInterviewFeedback(sessionId: string): Promise<{
//   feedback?: InterviewFeedback
//   error?: string
// }> {
//   try {
//     const session = await auth()
//     if (!session?.user?.id) {
//       return { error: "Unauthorized access" }
//     }

//     // Check if feedback already exists
//     const existingFeedback = await prisma.interviewFeedback.findUnique({
//       where: { sessionId }
//     })

//     if (existingFeedback) {
//       return { feedback: existingFeedback }
//     }

//     // Get interview session with all responses and feedback
//     const interviewSession = await prisma.interviewSession.findUnique({
//       where: {
//         id: sessionId,
//         userId: session.user.id
//       },
//       include: {
//         questions: {
//           include: {
//             response: {
//               include: {
//                 feedback: true
//               }
//             }
//           },
//           orderBy: { createdAt: 'asc' }
//         },
//         responses: {
//           include: {
//             feedback: true
//           }
//         }
//       }
//     })

//     if (!interviewSession) {
//       return { error: "Interview session not found" }
//     }

//     // Prepare data for AI analysis
//     const sessionData = {
//       title: interviewSession.title,
//       interviewType: interviewSession.interviewType,
//       difficulty: interviewSession.difficulty,
//       duration: formatDuration(interviewSession.createdAt, interviewSession.updatedAt),
//       questionsCount: interviewSession.questions.length,
//       answeredCount: interviewSession.responses.length
//     }

//     const questionsAndResponses = interviewSession.questions
//       .filter(q => q.response) // Only include answered questions
//       .map(q => ({
//         question: q.text,
//         response: q.response?.content || '',
//         feedback: q.response?.feedback?.content,
//         score: q.response?.feedback?.score,
//         type: q.type
//       }))

//     // Generate AI analysis prompt
//     const analysisPrompt = buildInterviewAnalysisPrompt(sessionData, questionsAndResponses)

//     // Create AI chat for overall feedback
//     const chat = await createGenAIChat(
//       [],
//       overallInterviewFeedbackSystemInstructions,
//       overallInterviewFeedbackGeminiSchema
//     )

//     const aiResponse = await chat.sendMessage(analysisPrompt)

//     // Parse AI response
//     const aiData = JSON.parse(aiResponse.parts[0].text || '{}')
//     const validatedData = overallInterviewFeedbackSchema.parse(aiData)

//     // Save overall feedback to database
//     const overallFeedback = await prisma.interviewFeedback.create({
//       data: {
//         sessionId,
//         overallScore: validatedData.overallScore,
//         feedback: validatedData.feedback,
//         hireRecommendation: validatedData.hireRecommendation,
//         strengths: validatedData.strengths,
//         weaknesses: validatedData.weaknesses,
//         improvementAreas: validatedData.improvementAreas
//       }
//     })

//     return { feedback: overallFeedback }

//   } catch (error) {
//     console.error("Failed to generate overall interview feedback:", error)
//     return { error: "Failed to generate overall feedback" }
//   }
// }

// function formatDuration(start: Date, end?: Date): string {
//   const duration = (end || new Date()).getTime() - start.getTime()
//   const minutes = Math.floor(duration / 60000)
//   const seconds = Math.floor((duration % 60000) / 1000)
//   return `${minutes}m ${seconds}s`
// }
