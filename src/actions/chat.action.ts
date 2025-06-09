"use server"

import { pushInterviewQuestion } from "@/actions/interview.action";
import { createGenAIChat, transcriptFromAudio } from "@/config/gemini.config";
import prisma from "@/config/prisma.config";
import { createCacheKey, redisCache, RedisCachePrefix } from "@/config/redis.config";
import { feedbackGeminiResponseSchema, feedbackResponseSchema, feedbackSystemInstructions, overallInterviewFeedbackGeminiSchema, overallInterviewFeedbackSchema, overallInterviewFeedbackSystemInstructions } from "@/schema/feedback.schema";
import { aiQuestionSchema, GeminiQuestionUnionSchema } from "@/schema/question.schema";
import { EntityType } from "@/types/user.types";
import { fileToS3 } from "@/utils/upload";
import { GenerateContentConfig, Content } from "@google/genai";

interface RedisChat {
  config?: GenerateContentConfig
  history: Content[]
}

export const createChatFromConfig = async (redisChat: RedisChat) => {
  const chat = await createGenAIChat(
    redisChat.history,
    redisChat.config?.systemInstruction,
    redisChat.config?.responseSchema
  );

  return chat;
}


export const generateInitialQuestion = async (interviewId: string) => {
  const getCacheChat = await redisCache.get(createCacheKey(RedisCachePrefix.INTERVIEW, interviewId));
  const chat = await createChatFromConfig(getCacheChat as RedisChat);

  const initialQuestion = await chat.sendMessage({
    message: "Please start the interview by generating initial questions."
  })

  const { data, error, success } = aiQuestionSchema.safeParse(JSON.parse(initialQuestion.text ?? "{}"))
  if (!data || error || !success) {
    return { data: null, error: "Error while generating question, please try again." }
  }
  console.log("Generated initial question:", data)
  const question = await pushInterviewQuestion(interviewId, data)

  redisCache.set(
    createCacheKey(RedisCachePrefix.INTERVIEW, interviewId),
    chat
  )

  return { data: question, error: null }
}

export const submitInterviewResponse = async (
  interviewId: string,
  questionId: string,
  responseType: "text" | "audio",
  textResponse?: string,
  audioResponse?: {
    filePath: string
    fileType: string,
    duration: number
  }
) => {
  const getCacheChat = await redisCache.get(createCacheKey(RedisCachePrefix.INTERVIEW, interviewId));
  const chat = await createChatFromConfig(getCacheChat as RedisChat);
  let fileUrl = null;
  let responseMetadata = null;

  if (audioResponse) {
    // File storage logic and transcript generation
    // TODO: S3 upload logic:- maybe background job for this
    const { error: s3Error, data: s3Data } = await fileToS3(
      audioResponse.filePath,
      `audio-${interviewId}-${questionId}.wav`,
      EntityType.AUDIO
    )

    fileUrl = s3Data?.fileUrl || null;

    const { error: transcriptError, data: transcriptData } = await transcriptFromAudio(audioResponse.filePath, audioResponse.fileType);
    // TODO: if this fails, retry logic.

    if (transcriptError || !transcriptData) {
      return {
        error: transcriptError || "Failed to upload audio or generate transcript",
        question: null,
        feedback: null
      }
    }

    responseMetadata = transcriptData
    textResponse = transcriptData.transcript || textResponse;
  }

  //TODO: Ensure if the audio response is uploaded to s3 and transcripted before saving
  const savedResponse = await prisma.response.create({
    data: {
      questionId: questionId,
      sessionId: interviewId,
      content: textResponse,
      responseType: responseType,
      fileUrl: fileUrl || null,
      duration: audioResponse?.duration || null,
    }
  }).catch(err => null)

  if (!savedResponse) {
    return {
      error: "Failed to save response",
      question: null,
      feedback: null
    }
  }

  const feedbackPrompt = `
  ${feedbackSystemInstructions}
  Below is the audio response metadata:
  ${JSON.stringify(responseMetadata, null, 2)}
  `

  // Feedback generation using Gemini AI
  const feedbackGeminiData = await chat.sendMessage({
    message: textResponse || "No transcript available",
    config: {
      systemInstruction: feedbackPrompt,
      responseMimeType: "application/json",
      responseSchema: feedbackGeminiResponseSchema
    }
  })

  const { data: feedbackData, error: feedbackError } = feedbackResponseSchema.safeParse(JSON.parse(feedbackGeminiData.text ?? "{}"))

  //TODO: Implement AI analysis of the response, retry if there is error
  const feedback = await prisma.feedback.create({
    data: {
      responseId: savedResponse.id,
      content: feedbackData?.content || "No feedback provided",
      score: feedbackData?.score || 0,
    }
  }).catch(err => null)

  //TODO: Maybe retry this part.
  if (!feedback) {
    return {
      error: "Failed to generate feedback",
      question: null,
      feedback: null
    }
  }

  //TODO: prepare for interview end, follow-up question, next question.
  const nextQuestion = await chat.sendMessage({
    message: "Based on the response, please go ahead with either a follow-up if required or the next question for the interview. Or if you think the interview is complete, please end the interview.",
    config: {
      systemInstruction: "You are an AI interviewer. Based on the response, generate a follow-up question or the next question for the interview. If the interview is complete, end the interview.",
      responseMimeType: "application/json",
      responseSchema: GeminiQuestionUnionSchema
    }
  })

  const { data: nextQuestionData, error: nextQuestionError } = aiQuestionSchema.safeParse(JSON.parse(nextQuestion.text ?? "{}"))

  if (!nextQuestionData || nextQuestionError) {
    return {
      error: "Error while generating next question, please try again.",
      question: null,
      feedback: null
    }
  }

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

  if (nextQuestionData.endInterview) {
    const closingMessage = await chat.sendMessage({
      message: "Provide a closing message for the interview session based on overall performance.",
      config: {
        responseMimeType: "plain/text",
      }
    })

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

    const updatedSession: any = {
      status: "COMPLETED",
    }

    if (overallFeedbackData) {
      updatedSession.interviewFeedback = {
        create: {
          ...overallFeedbackData
        }
      }
    }

    await prisma.interviewSession.update({
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
      question: null,
      feedback: closingMessage.text || "Thanks for your responses. The interview is now complete."
    }
  }

  const question = await pushInterviewQuestion(interviewId, nextQuestionData)

  return {
    error: null,
    question: question,
    feedback: null
  }
}

export const nextQuestion = async (interviewId: string) => {
  const getCacheChat = await redisCache.get(createCacheKey(RedisCachePrefix.INTERVIEW, interviewId));
  const chat = await createChatFromConfig(getCacheChat as RedisChat);

  const nextQuestion = await chat.sendMessage({
    message: "please go ahead with either a follow-up if required or the next question for the interview."
  })

  const { data, error, success } = aiQuestionSchema.safeParse(JSON.parse(nextQuestion.text ?? "{}"))
  if (!data || error || !success) {
    return { data: null, error: "Error while generating next question, please try again." }
  }

  redisCache.set(
    createCacheKey(RedisCachePrefix.INTERVIEW, interviewId),
    chat
  )

  if (data.endInterview) {
    await prisma.interviewSession.update({
      where: { id: interviewId },
      data: { status: "COMPLETED" }
    }).catch(err => {
      return {
        data: null,
        error: null,
        end: true
      }
    });
  }

  const question = await pushInterviewQuestion(interviewId, data)


  return { data: question, error: null, end: false }
}


export const generateTranscript = async () => {

  // const uploadtedFile = await

}
