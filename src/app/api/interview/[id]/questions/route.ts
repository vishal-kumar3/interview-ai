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
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check if questions already exist
    const existingQuestions = await prisma.question.findMany({
      where: { sessionId, isFollowUp: false },
      orderBy: { order: 'asc' }
    })

    if (existingQuestions.length > 0) {
      return NextResponse.json({ questions: existingQuestions })
    }

    // Generate initial questions
    const questionGenResponse = await InterviewService.generateInitialQuestions({
      sessionId,
      resumeData: session.resume?.parsedData,
      jobDescriptionData: session.jobDescription?.parsedData,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      focusAreas: session.sessionMetadata?.focusAreas || [],
      avoidTopics: session.sessionMetadata?.avoidTopics || [],
      questionCount: 5
    })

    // Save questions to database
    const savedQuestions = await InterviewService.saveQuestionToDB(sessionId, questionGenResponse)

    return NextResponse.json({
      questions: savedQuestions,
      conversationFlow: questionGenResponse.conversationFlow
    })

  } catch (error) {
    console.error("Question generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    )
  }
}
