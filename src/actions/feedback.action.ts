"use server"

import { auth } from "@/auth"
import prisma from "@/config/prisma.config"
import { InterviewSession, Question, Response, Feedback, InterviewFeedback } from "@prisma/client"

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
        userId: session.user.id
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

    const transformedSession: ExtendedInterviewSession = {
      ...interviewSession,
      questions: interviewSession.questions.map(q => ({
        ...q,
        followUps: []
      })),
      responses: interviewSession.responses.map(r => ({
        ...r,
        feedback: r.feedback
      })),
      interviewFeedback: interviewSession.interviewFeedback
    }

    return { session: transformedSession }
  } catch (error) {
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
