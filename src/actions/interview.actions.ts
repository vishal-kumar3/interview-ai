"use server"

import { InterviewService } from "@/lib/interview.service"
import { revalidatePath } from "next/cache"
import type { StandardQuestion } from "@/types/interview.types"
import prisma from "@/config/prisma.config"

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
