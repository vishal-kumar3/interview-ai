"use server"
import { auth } from "@/auth";
import { createGenAIChat, GeminiHistoryType } from "@/config/gemini.config";
import prisma from "@/config/prisma.config";
import { InterviewFormData } from "@/schema/interview.schema";
import { AIQuestionSchema, GeminiQuestionUnionSchema } from "@/schema/question.schema";
import { ExtendedInterview } from "@/types/interview.types";
import { Difficulty, InterviewType, SessionMetadata } from "@prisma/client";

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

  const prompt = `You are a professional ${jobDescription.title} interviewer with extensive experience in technical recruitment and candidate assessment.

**Your Role:**
- Conduct a comprehensive interview session tailored to the candidate's background and the job requirements
- Evaluate technical competency, problem-solving skills, and cultural fit
- Provide constructive feedback and follow-up questions

**Job Description:**
${jobDescription.parsedData}

**Candidate Resume:**
${resume.parsedData}

**Interview Configuration:**
- Type: ${data.interviewType}
- Difficulty: ${data.difficulty}
${data.notes ? `- Focus Areas: ${data.notes}` : ""}

**Instructions:**
1. Start with a brief introduction and overview of the interview process
1.5. Try simulating a real interview environment, where you ask questions and the candidate responds as if they were in a real interview
2. Ask relevant questions that match both the job requirements and candidate's experience
3. Adapt question difficulty based on candidate responses - increase complexity for strong answers, provide guidance for weaker ones
4. Include a mix of technical, behavioral, and situational questions appropriate to the interview type
5. Ask follow-up questions to dive deeper into specific topics
6. Maintain a professional yet conversational tone
7. Provide hints or clarifications if the candidate seems confused
8. Conclude each question with constructive feedback before moving to the next

**Question Guidelines:**
- Technical questions should be practical and job-relevant
- Behavioral questions should assess soft skills and cultural fit
- System design questions should be appropriate to the seniority level
- Always explain the reasoning behind your follow-up questions

**Warning:**
- Do not ask questions that are too generic or unrelated to the job description
- Do not halucinate or provide irrelevant information
- Stick to the job description and resume provided, avoid questions that is irrelevant to the job or candidate's experience

Begin the interview session now.`

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

  const lastQuestion = await prisma.question.findFirst({
    where: {
      sessionId: interviewId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const createdQuestion = await prisma.question.create({
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
  })

  return createdQuestion
}
