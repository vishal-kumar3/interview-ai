"use server"
import { getInterviewChatSession } from "@/actions/chat.action";
import { auth } from "@/auth";
import { createGenAIChat, GeminiHistoryType } from "@/config/gemini.config";
import prisma from "@/config/prisma.config";
import { createCacheKey, redisCache, RedisCachePrefix } from "@/config/redis.config";
import { interviewGuidePrompt } from "@/lib/prompt";
import { overallInterviewFeedbackGeminiSchema, overallInterviewFeedbackSchema, overallInterviewFeedbackSystemInstructions } from "@/schema/feedback.schema";
import { InterviewFormData } from "@/schema/interview.schema";
import { AIQuestionSchema, GeminiQuestionUnionSchema } from "@/schema/question.schema";
import { ExtendedInterview, StandardQuestion } from "@/types/interview.types";
import { Difficulty, InterviewStatus, InterviewType, SessionMetadata } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createInterviewSession = async (data: InterviewFormData) => {

  const session = await auth()
  if (!session) {
    return {
      error: "Unauthorized",
      message: "You must be logged in to create an interview session.",
    }
  }

  const jobDescription = await prisma.jobDescription.findUnique({
    where: {
      id: data.jobDescriptionId,
    },
  })

  if (!jobDescription) {
    return {
      error: "Job Description Not Found",
      message: "The specified job description does not exist.",
    }
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: data.resumeId,
      userId: session.user.id!,
    },
  })

  if (!resume) {
    return {
      error: "Resume Not Found",
      message: "The specified resume does not exist or does not belong to the user.",
    }
  }

  const prompt = interviewGuidePrompt(data, jobDescription, resume)
  const interview = await prisma.interviewSession.create({
    data: {
      jobDescriptionId: jobDescription.id,
      resumeId: data.resumeId,
      interviewType: data.interviewType as InterviewType,
      difficulty: data.difficulty as Difficulty,
      userId: session.user.id!,
      title: jobDescription.title,
      additionalNotes: data.notes || "",
      sessionMetadata: {
        create: {
          aiInstructions: prompt,
          aiPromptContext: [],
        }
      }
    }
  })

  return {
    success: true,
    messsage: "Interview session created successfully.",
    data: interview
  }
}

export const getInterviewSessions = async (userId: string) => {
  const interviews = await prisma.interviewSession.findMany({
    where: {
      userId: userId,
    },
    include: {
      jobDescription: true,
      resume: true,
    },
  })

  return {
    success: true,
    data: interviews,
  }
}

export const getExtendedInterviewById = async (interviewId: string, userId: string) => {

  const interviewData = await prisma.interviewSession.findUnique({
    where: {
      id: interviewId,
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
  }).catch(err => {
    return null
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

}

export const createInterviewChat = async (sessionMetadata: SessionMetadata) => {
  const interviewContext = sessionMetadata.aiPromptContext as GeminiHistoryType[]
  const aiInstructions = sessionMetadata.aiInstructions

  const chat = createGenAIChat(
    interviewContext,
    aiInstructions,
    GeminiQuestionUnionSchema
  )

  return chat
}

export const pushInterviewQuestion = async (interviewId: string, question: AIQuestionSchema) => {
  let lastQuestion = null

  if (question.isFollowUp) {
    lastQuestion = await prisma.question.findFirst({
      where: {
        sessionId: interviewId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  const createdQuestion: StandardQuestion | null = await prisma.question.create({
    data: {
      sessionId: interviewId,
      text: question.question,
      type: question.type,
      difficulty: question.difficulty,
      topic: question.topic,
      parentId: question.isFollowUp ? lastQuestion?.id : null,
      isFollowUp: question.isFollowUp || false,
      aiContext: question.aiContext,
      evaluationCriteria: question.evaluationCriteria,
      followUpTriggers: question.followUpTriggers,
    }
  }).catch(err => null)

  return createdQuestion
}

export const deleteInterviewSession = async (interviewId: string) => {
  console.log("Deleting interview session with ID:", interviewId)
  console.log("Interview", await prisma.interviewSession.findUnique({ where: { id: interviewId } }))

  const deletedSession = await prisma.interviewSession.delete({
    where: {
      id: interviewId,
    },
  }).catch(err => null)

  console.log("Deleted session:", deletedSession)
  if (!deletedSession) {
    return {
      error: "Session Not Found",
      message: "The specified interview session does not exist or does not belong to the user.",
    }
  }
  revalidatePath("/dashboard")
  return {
    success: true,
    message: "Interview session deleted successfully.",
  }
}

export const endInterviewSession = async (interviewId: string) => {

  const interview = await prisma.interviewSession.findUnique({
    where: {
      id: interviewId,
      status: { not: InterviewStatus.COMPLETED }
    },
    include: {
      interviewFeedback: true,
    }
  })

  if (!interview) {
    return {
      error: "Session Not Found",
      data: null
    }
  }

  const updatedSession: any = {
    status: "COMPLETED",
  }

  if (!interview.interviewFeedback) {
    const chat = await getInterviewChatSession(interviewId)

    const overallFeedback = await chat.sendMessage({
      message: "Please provide overall feedback for the interview session.",
      config: {
        systemInstruction: overallInterviewFeedbackSystemInstructions,
        responseMimeType: "application/json",
        responseSchema: overallInterviewFeedbackGeminiSchema
      }
    })

    const aiContext = chat.getHistory()

    // TODO: do this one in background job
    await prisma.sessionMetadata.update({
      where: { sessionId: interviewId },
      data: {
        aiPromptContext: aiContext
          .filter(content => content != null)
          .map(content => JSON.parse(JSON.stringify(content)))
      }
    }).catch(err => {
      console.error("Error updating session metadata:", err);
      return null;
    })

    redisCache.set(
      createCacheKey(RedisCachePrefix.INTERVIEW, interviewId),
      chat
    )

    const { data: overallFeedbackData, error: overallFeedbackError } = overallInterviewFeedbackSchema.safeParse(JSON.parse(overallFeedback.text ?? "{}"))

    if (overallFeedbackData) {
      updatedSession.interviewFeedback = {
        create: {
          ...overallFeedbackData
        }
      }
    }

  }

  const updatedInterview = await prisma.interviewSession.update({
    where: { id: interviewId },
    data: {
      ...updatedSession
    }
  }).catch(err => {
    console.error("Error updating interview session status:", err);
    return null;
  });

  return {
    error: null,
    data: updatedInterview,
  }
}
