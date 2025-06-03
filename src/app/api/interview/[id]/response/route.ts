import { NextRequest, NextResponse } from "next/server"
import { InterviewService } from "@/lib/interview.service"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const body = await request.json()
    const { questionId, content, responseType, fileUrl, duration } = body

    // Get question details
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { session: true }
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Save response
    const savedResponse = await InterviewService.saveResponse(questionId, sessionId, {
      content,
      responseType,
      fileUrl,
      duration
    })

    // Use the new AI-driven continuation logic instead of follow-up logic
    const continuationDecision = await InterviewService.decideInterviewContinuation(sessionId)

    let nextQuestion = null
    if (continuationDecision.shouldContinue && continuationDecision.nextQuestion) {
      nextQuestion = await InterviewService.saveQuestionToDB(sessionId, continuationDecision.nextQuestion)
    }

    return NextResponse.json({
      response: savedResponse,
      nextQuestion,
      shouldContinue: continuationDecision.shouldContinue,
      reasoning: continuationDecision.reasoning,
      assessmentSummary: continuationDecision.assessmentSummary
    })

  } catch (error) {
    console.error("Response submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    )
  }
}
